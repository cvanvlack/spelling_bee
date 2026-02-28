# scripts/

## enrich-words.mjs

Adds child-friendly **definitions** and **example sentences** to every word in `public/data/wordlists.json`.

### How it works

Two-phase pipeline:

| Phase | Source | Cost | What it does |
|-------|--------|------|--------------|
| 1 | [Free Dictionary API](https://dictionaryapi.dev) | Free | Fetches raw definitions & example sentences as grounding data |
| 2 | OpenAI GPT-4o-mini | ~$0.20 for all 5,286 words | Rewrites into child-friendly language; fills gaps the dictionary missed |

Phase 1 runs first and provides context to Phase 2. For example, when the dictionary says *"To renounce upon oath; to forswear; to disavow"* for "abjure", OpenAI receives that and simplifies it to something a child can understand.

Words the dictionary API doesn't cover (common function words like "the", "is", "for") are handled entirely by OpenAI.

### Quick start

```bash
# Full run — dictionary API + OpenAI (recommended)
OPENAI_API_KEY=sk-... node scripts/enrich-words.mjs

# Test with just 5 words from Level 1
OPENAI_API_KEY=sk-... node scripts/enrich-words.mjs --level level1 --limit 5

# Free dictionary data only (no API key needed, but definitions won't be child-friendly)
node scripts/enrich-words.mjs --dictionary-only

# OpenAI only (skips dictionary, slightly less grounded but still good)
OPENAI_API_KEY=sk-... node scripts/enrich-words.mjs --openai-only

# Write to a separate file instead of overwriting
OPENAI_API_KEY=sk-... node scripts/enrich-words.mjs --output enriched-wordlists.json
```

### Options

| Flag | Description |
|------|-------------|
| `--level <id>` | Only process one level (`level1` … `level5`) |
| `--limit <n>` | Cap words per level (great for testing) |
| `--openai-only` | Skip dictionary API |
| `--dictionary-only` | Skip OpenAI (free but lower quality) |
| `--batch-size <n>` | Words per OpenAI request (default: 20) |
| `--model <name>` | OpenAI model (default: `gpt-4o-mini`) |
| `--output <path>` | Write to different file (default: overwrites input) |
| `--reset-cache` | Clear cache and re-process everything |
| `--dry-run` | Preview without making API calls or writing files |

### Cache & resumability

Progress is saved to `scripts/.enrichment-cache.json` after every batch. If the script is interrupted (network error, rate limit, etc.), re-running it picks up where it left off — already-enriched words are skipped automatically.

To start fresh: `--reset-cache`.

### Output format

Each word gains two new fields:

```json
{
  "text": "banana",
  "definition": "A long, yellow fruit that is soft and sweet inside.",
  "sentence": "I packed a banana in my lunch box today."
}
```

The `definition` and `sentence` fields are new additions beyond the existing `Word` type. The TypeScript types in `src/types.ts` will need updating to include `definition?: string` (the existing `hint` and `sentence` fields may be repurposed or extended).

### Cost estimate

| Words | Dictionary API | OpenAI GPT-4o-mini |
|-------|---------------|-------------------|
| 5,286 | $0.00 | ~$0.15–0.25 |
| Per word | — | ~$0.00004 |

The dictionary API is completely free. OpenAI cost for the full word list is under $0.25.

### Dependencies

None — uses only Node.js built-in `fetch` (Node 18+). No `npm install` needed.
