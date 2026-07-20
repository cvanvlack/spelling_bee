# sentence-tune

DSPy + OpenRouter toolkit that optimizes kid-friendly **example sentences** for
`public/data/wordlists.json`. Definitions are left untouched.

## Setup

```bash
cd spelling_bee/python/sentence_tune
cp .env.example .env   # set OPENROUTER_API_KEY
uv sync --group dev
```

Optional env overrides:
- `SENTENCE_TUNE_MODEL` (default `openrouter/openai/gpt-4o-mini`)
- `SENTENCE_TUNE_JUDGE_MODEL` (default `openrouter/openai/gpt-4o-mini`)

## Quality checks

```bash
./scripts/check.sh
# or:
uv run ruff check .
uv run ruff format --check .
uv run basedpyright
```

## Workflow

```bash
# 1) Tune the prompt (MIPROv2 light + LLM judge)
uv run python scripts/optimize.py

# 2) Eyeball old vs new sentences
uv run python scripts/preview.py --limit 20

# 3) Smoke-test generation
uv run python scripts/generate.py --limit 50

# 4) Full rewrite of sentences only
uv run python scripts/generate.py
```

Use `--no-optimized` to skip the optimized artifact and run the baseline
generator. Generation progress is cached in
`sentence_tune/artifacts/.sentence-cache.json` (pass `--reset-cache` to clear).

## Layout

| Path | Role |
|------|------|
| `sentence_tune/models.py` | Pydantic models + paths |
| `sentence_tune/signatures.py` | DSPy Generate / Judge signatures |
| `sentence_tune/modules.py` | `SentenceGenerator`, `SentenceJudge` |
| `sentence_tune/metric.py` | Hard gates + LLM judge metric |
| `sentence_tune/data.py` | Wordlist I/O, stratified sampling |
| `scripts/optimize.py` | MIPROv2 optimization |
| `scripts/generate.py` | Apply to wordlists (sentences only) |
| `scripts/preview.py` | Side-by-side quality check |
