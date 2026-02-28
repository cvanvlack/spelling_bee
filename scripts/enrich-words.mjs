#!/usr/bin/env node
//
// enrich-words.mjs — Adds child-friendly definitions and example sentences to wordlists.json.
//
// Two-phase pipeline:
//   Phase 1  Free Dictionary API (dictionaryapi.dev) — free, no key required.
//            Fetches raw definitions & example sentences as grounding data.
//   Phase 2  OpenAI GPT-4o-mini — rewrites everything into child-friendly language,
//            fills gaps where the dictionary had no data.
//
// Usage:
//   node scripts/enrich-words.mjs [options]
//
// Run `node scripts/enrich-words.mjs --help` for all options.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── Constants ────────────────────────────────────────────────────────────────

const DICT_API = "https://api.dictionaryapi.dev/api/v2/entries/en";
const OPENAI_API = "https://api.openai.com/v1/chat/completions";
const CACHE_PATH = resolve(__dirname, ".enrichment-cache.json");
const INPUT_PATH = resolve(ROOT, "public/data/wordlists.json");
const OPENAI_MODEL = "gpt-4o-mini";
const DICT_DELAY_MS = 100;

// ── CLI ──────────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    level: null,
    limit: Infinity,
    skipDictionary: false,
    skipOpenai: false,
    dryRun: false,
    batchSize: 20,
    output: null,
    input: INPUT_PATH,
    resetCache: false,
    openaiModel: OPENAI_MODEL,
  };
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--level":
        opts.level = args[++i];
        break;
      case "--limit":
        opts.limit = parseInt(args[++i], 10);
        break;
      case "--openai-only":
        opts.skipDictionary = true;
        break;
      case "--dictionary-only":
        opts.skipOpenai = true;
        break;
      case "--dry-run":
        opts.dryRun = true;
        break;
      case "--batch-size":
        opts.batchSize = parseInt(args[++i], 10);
        break;
      case "--output":
        opts.output = resolve(args[++i]);
        break;
      case "--input":
        opts.input = resolve(args[++i]);
        break;
      case "--reset-cache":
        opts.resetCache = true;
        break;
      case "--model":
        opts.openaiModel = args[++i];
        break;
      case "--help":
        printHelp();
        process.exit(0);
        break;
      default:
        console.error(`Unknown option: ${args[i]}`);
        printHelp();
        process.exit(1);
    }
  }
  if (!opts.output) opts.output = opts.input;
  return opts;
}

function printHelp() {
  console.log(`
enrich-words.mjs — Add definitions & sentences to wordlists.json

USAGE
  node scripts/enrich-words.mjs [options]

OPTIONS
  --level <id>          Only process one level (level1 … level5)
  --limit <n>           Cap words processed per level
  --openai-only         Skip Free Dictionary API, use only OpenAI
  --dictionary-only     Skip OpenAI, use only Free Dictionary API
  --batch-size <n>      Words per OpenAI request (default: 20)
  --model <name>        OpenAI model (default: gpt-4o-mini)
  --input <path>        Input file  (default: public/data/wordlists.json)
  --output <path>       Output file (default: overwrites input)
  --reset-cache         Ignore previous cache, start fresh
  --dry-run             Preview plan without making API calls or writing files
  --help                Show this help

ENVIRONMENT
  OPENAI_API_KEY        Required unless --dictionary-only

EXAMPLES
  # Full run (dictionary + OpenAI)
  OPENAI_API_KEY=sk-... node scripts/enrich-words.mjs

  # Just Level 1 with a 5-word limit (good for testing)
  OPENAI_API_KEY=sk-... node scripts/enrich-words.mjs --level level1 --limit 5

  # Free dictionary data only (no cost)
  node scripts/enrich-words.mjs --dictionary-only

  # OpenAI only, output to a separate file
  OPENAI_API_KEY=sk-... node scripts/enrich-words.mjs --openai-only --output enriched.json
`.trim());
}

// ── Utilities ────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchRetry(url, options = {}, retries = 3, backoff = 1000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.status === 429) {
        const wait = backoff * 2 ** attempt;
        console.warn(`  ⏳ Rate-limited, backing off ${wait}ms…`);
        await sleep(wait);
        continue;
      }
      return res;
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(backoff * 2 ** attempt);
    }
  }
}

// ── Cache ────────────────────────────────────────────────────────────────────

function loadCache(reset) {
  if (reset || !existsSync(CACHE_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CACHE_PATH, "utf-8"));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

// ── Free Dictionary API ──────────────────────────────────────────────────────

async function lookupDictionary(word) {
  try {
    const res = await fetchRetry(
      `${DICT_API}/${encodeURIComponent(word)}`,
      {},
      2,
      500,
    );
    if (!res || !res.ok) return null;

    const data = await res.json();
    const entry = data?.[0];
    if (!entry?.meanings) return null;

    let definition = null;
    let sentence = null;

    for (const meaning of entry.meanings) {
      for (const def of meaning.definitions || []) {
        if (!definition && def.definition) definition = def.definition;
        if (!sentence && def.example) sentence = def.example;
        if (definition && sentence) break;
      }
      if (definition && sentence) break;
    }

    if (!definition) return null;
    return { definition, sentence: sentence || null };
  } catch {
    return null;
  }
}

// ── OpenAI ───────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a children's dictionary assistant writing for kids ages 6–11.

Rules for DEFINITIONS:
• Use simple, everyday words a young child already knows.
• 1–2 short sentences maximum.
• Never use the word itself in the definition.
• For function words (the, and, is, etc.) explain how the word is used.

Rules for SENTENCES:
• 6–15 words.
• Use relatable, everyday scenarios a child would understand.
• The target word MUST appear exactly once in the sentence.
• Prefer present tense.

Return ONLY a JSON array — no markdown fences, no commentary.
Each element: {"word": "<word>", "definition": "<def>", "sentence": "<sentence>"}`;

function buildUserPrompt(wordEntries) {
  const lines = wordEntries.map(({ word, dictDef }) => {
    if (dictDef) return `• "${word}" — dictionary says: "${dictDef}"`;
    return `• "${word}"`;
  });
  return `Provide a child-friendly definition and example sentence for each word.\n\n${lines.join("\n")}`;
}

async function enrichBatchOpenAI(wordEntries, apiKey, model) {
  const res = await fetchRetry(OPENAI_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(wordEntries) },
      ],
    }),
  });

  if (!res || !res.ok) {
    const body = res ? await res.text() : "no response";
    throw new Error(`OpenAI ${res?.status}: ${body}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content?.trim();

  let cleaned = raw;
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const results = JSON.parse(cleaned);
  const map = {};
  for (const item of results) {
    map[item.word.toLowerCase()] = {
      definition: item.definition,
      sentence: item.sentence,
    };
  }
  return map;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!opts.skipOpenai && !opts.dryRun && !apiKey) {
    console.error(
      "Error: OPENAI_API_KEY is required (set it or pass --dictionary-only)\n",
    );
    process.exit(1);
  }

  // Load data
  console.log(`\n📂 Input:  ${opts.input}`);
  console.log(`📂 Output: ${opts.output}`);
  const wordlists = JSON.parse(readFileSync(opts.input, "utf-8"));
  const cache = loadCache(opts.resetCache);

  // Collect words to process
  const wordsInScope = [];
  for (const level of wordlists.levels) {
    if (opts.level && level.id !== opts.level) continue;
    const subset = level.words.slice(0, opts.limit);
    for (const w of subset) {
      wordsInScope.push(w.text);
    }
  }

  const unique = [...new Set(wordsInScope.map((w) => w.toLowerCase()))];
  const alreadyCached = unique.filter(
    (w) => cache[w]?.definition && cache[w]?.sentence && cache[w]?.final,
  );
  const needWork = unique.filter(
    (w) => !(cache[w]?.definition && cache[w]?.sentence && cache[w]?.final),
  );

  console.log(
    `\n📊 ${unique.length} unique words in scope, ${alreadyCached.length} already cached, ${needWork.length} need enrichment`,
  );

  if (opts.dryRun) {
    console.log("\n🏜️  Dry run — no API calls, no files written.");
    console.log(`Sample words: ${needWork.slice(0, 20).join(", ")}`);
    return;
  }

  // ── Phase 1: Free Dictionary API ──────────────────────────────────────────

  if (!opts.skipDictionary && needWork.length > 0) {
    const needDict = needWork.filter((w) => !cache[w]?.dictRaw);
    console.log(
      `\n📖 Phase 1: Free Dictionary API — ${needDict.length} lookups`,
    );

    let found = 0;
    let missed = 0;
    for (let i = 0; i < needDict.length; i++) {
      const word = needDict[i];
      const result = await lookupDictionary(word);
      if (result) {
        cache[word] = {
          ...cache[word],
          dictRaw: result.definition,
          dictSentence: result.sentence,
        };
        found++;
      } else {
        cache[word] = { ...cache[word], dictRaw: null };
        missed++;
      }

      if ((i + 1) % 100 === 0 || i === needDict.length - 1) {
        const pct = (((i + 1) / needDict.length) * 100).toFixed(0);
        console.log(
          `  ${pct}% (${i + 1}/${needDict.length}) — found: ${found}, missed: ${missed}`,
        );
        saveCache(cache);
      }

      if (i < needDict.length - 1) await sleep(DICT_DELAY_MS);
    }
    saveCache(cache);
    console.log(`  ✓ Dictionary done: ${found} found, ${missed} not found`);
  }

  // ── Phase 2: OpenAI ───────────────────────────────────────────────────────

  if (!opts.skipOpenai) {
    const needAI = needWork.filter(
      (w) => !(cache[w]?.definition && cache[w]?.sentence && cache[w]?.final),
    );

    if (needAI.length > 0) {
      console.log(
        `\n🤖 Phase 2: OpenAI ${opts.openaiModel} — ${needAI.length} words (batch size ${opts.batchSize})`,
      );

      const batches = [];
      for (let i = 0; i < needAI.length; i += opts.batchSize) {
        batches.push(needAI.slice(i, i + opts.batchSize));
      }

      let done = 0;
      let errors = 0;
      for (let bi = 0; bi < batches.length; bi++) {
        const batch = batches[bi];
        const entries = batch.map((w) => ({
          word: w,
          dictDef: cache[w]?.dictRaw || null,
        }));

        try {
          const results = await enrichBatchOpenAI(
            entries,
            apiKey,
            opts.openaiModel,
          );

          for (const word of batch) {
            const ai = results[word.toLowerCase()];
            if (ai) {
              cache[word] = {
                ...cache[word],
                definition: ai.definition,
                sentence: ai.sentence,
                source: cache[word]?.dictRaw
                  ? "dictionary-api+openai"
                  : "openai",
                final: true,
              };
            }
          }
          done += batch.length;
        } catch (err) {
          console.error(`  ✗ Batch ${bi + 1} failed: ${err.message}`);
          errors += batch.length;
        }

        const pct = (((done + errors) / needAI.length) * 100).toFixed(0);
        console.log(`  ${pct}% (${done + errors}/${needAI.length})`);
        saveCache(cache);

        if (bi < batches.length - 1) await sleep(200);
      }

      console.log(
        `  ✓ OpenAI done: ${done} enriched${errors > 0 ? `, ${errors} errors (re-run to retry)` : ""}`,
      );
    } else {
      console.log("\n✅ All words already have final enrichment.");
    }
  }

  // For dictionary-only mode, promote dictionary results as final
  if (opts.skipOpenai) {
    for (const word of needWork) {
      const c = cache[word];
      if (c?.dictRaw && !c.final) {
        cache[word] = {
          ...c,
          definition: c.dictRaw,
          sentence: c.dictSentence || null,
          source: "dictionary-api",
          final: true,
        };
      }
    }
    saveCache(cache);
  }

  // ── Apply to wordlists ───────────────────────────────────────────────────

  console.log("\n📝 Writing enriched wordlists…");
  let enriched = 0;
  let partial = 0;
  let missing = 0;

  for (const level of wordlists.levels) {
    for (const word of level.words) {
      const key = word.text.toLowerCase();
      const c = cache[key];
      if (c?.definition && c?.sentence) {
        word.definition = c.definition;
        word.sentence = c.sentence;
        enriched++;
      } else if (c?.definition) {
        word.definition = c.definition;
        partial++;
      } else {
        missing++;
      }
    }
  }

  writeFileSync(opts.output, JSON.stringify(wordlists, null, 2));

  // ── Summary ───────────────────────────────────────────────────────────────

  const total = enriched + partial + missing;
  console.log(`
┌─────────────────────────────────────┐
│         Enrichment Summary          │
├─────────────────────────────────────┤
│  Total words:     ${String(total).padStart(6)}            │
│  Fully enriched:  ${String(enriched).padStart(6)}  ✅         │
│  Definition only: ${String(partial).padStart(6)}  ⚠️          │
│  Missing:         ${String(missing).padStart(6)}  ❌         │
├─────────────────────────────────────┤
│  Output: ${opts.output.replace(ROOT + "/", "").padEnd(25)} │
│  Cache:  ${CACHE_PATH.replace(ROOT + "/", "").padEnd(25)} │
└─────────────────────────────────────┘`);
}

main().catch((err) => {
  console.error("\nFatal:", err);
  process.exit(1);
});
