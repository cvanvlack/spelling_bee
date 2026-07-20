#!/usr/bin/env python3
"""Apply (optimized) sentence generator to wordlists.json — sentences only."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from dotenv import load_dotenv
from sentence_tune.data import (
    apply_sentences,
    cache_put,
    iter_words,
    load_cache,
    load_wordlists,
    save_cache,
    save_wordlists,
    unique_words,
)
from sentence_tune.lm import configure_dspy
from sentence_tune.models import (
    default_cache_path,
    default_optimized_path,
    default_wordlists_path,
)
from sentence_tune.modules import SentenceGenerator
from sentence_tune.settings import load_settings

_ROOT = Path(__file__).resolve().parents[1]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=default_wordlists_path())
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Defaults to overwriting --input",
    )
    parser.add_argument("--level", type=str, default=None, help="e.g. level1")
    parser.add_argument("--limit", type=int, default=None, help="Max words per level")
    parser.add_argument("--model", type=str, default=None)
    parser.add_argument(
        "--program",
        type=Path,
        default=default_optimized_path(),
        help="Optimized program JSON from optimize.py",
    )
    parser.add_argument(
        "--no-optimized",
        action="store_true",
        help="Use unoptimized SentenceGenerator",
    )
    parser.add_argument("--cache", type=Path, default=default_cache_path())
    parser.add_argument("--reset-cache", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def load_program(*, program_path: Path, use_optimized: bool) -> SentenceGenerator:
    program = SentenceGenerator()
    if use_optimized:
        if not program_path.exists():
            print(
                f"Optimized program not found: {program_path}\n"
                "Run scripts/optimize.py first, or pass --no-optimized.",
                file=sys.stderr,
            )
            sys.exit(1)
        program.load(str(program_path))
    return program


def main() -> None:
    load_dotenv(_ROOT / ".env")
    args = parse_args()
    settings = load_settings()
    output = args.output or args.input

    configure_dspy(settings, model=args.model)
    program = load_program(
        program_path=args.program,
        use_optimized=not args.no_optimized,
    )

    data = load_wordlists(args.input)
    pairs = iter_words(data, level_id=args.level, limit=args.limit)
    targets = unique_words(pairs)

    if args.reset_cache and args.cache.exists():
        args.cache.unlink()
    cache = load_cache(args.cache)

    print(f"Input:  {args.input}")
    print(f"Output: {output}")
    print(f"Words in scope: {len(targets)}")
    print(f"Cache entries: {len(cache.entries)}")

    if args.dry_run:
        sample = [w.text for w in targets[:20]]
        print(f"Dry run - sample: {', '.join(sample)}")
        return

    sentences: dict[str, str] = {}
    generated = 0
    cached = 0
    errors = 0

    for i, word in enumerate(targets):
        key = word.text.casefold()
        if key in cache.entries:
            sentences[key] = cache.entries[key].sentence
            cached += 1
            continue

        try:
            pred = program(word=word.text)
            sentence = str(getattr(pred, "sentence", "") or "").strip()
            if not sentence:
                raise ValueError("empty sentence")
            sentences[key] = sentence
            cache_put(cache, word.text, sentence)
            generated += 1
        except Exception as exc:
            errors += 1
            print(f"  error on {word.text!r}: {exc}", file=sys.stderr)

        if (i + 1) % 25 == 0 or i + 1 == len(targets):
            save_cache(args.cache, cache)
            print(
                f"  {i + 1}/{len(targets)}  generated={generated} cached={cached} errors={errors}"
            )

    save_cache(args.cache, cache)
    updated = apply_sentences(data, sentences)
    save_wordlists(output, data)
    print(f"Updated {updated} word sentences -> {output}")


if __name__ == "__main__":
    main()
