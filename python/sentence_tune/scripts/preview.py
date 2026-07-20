#!/usr/bin/env python3
"""Preview old vs new sentences with judge scores."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from dotenv import load_dotenv
from sentence_tune.data import load_wordlists, stratified_sample
from sentence_tune.lm import configure_dspy, make_judge_lm
from sentence_tune.metric import judge_sentence
from sentence_tune.models import default_optimized_path, default_wordlists_path
from sentence_tune.modules import SentenceGenerator, SentenceJudge
from sentence_tune.settings import load_settings

_ROOT = Path(__file__).resolve().parents[1]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=default_wordlists_path())
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--model", type=str, default=None)
    parser.add_argument("--judge-model", type=str, default=None)
    parser.add_argument("--program", type=Path, default=default_optimized_path())
    parser.add_argument("--no-optimized", action="store_true")
    parser.add_argument("--level", type=str, default=None)
    return parser.parse_args()


def main() -> None:
    load_dotenv(_ROOT / ".env")
    args = parse_args()
    settings = load_settings()

    configure_dspy(settings, model=args.model)
    judge_lm = make_judge_lm(settings, model=args.judge_model)

    data = load_wordlists(args.input)
    if args.level:
        level = next((lv for lv in data.levels if lv.id == args.level), None)
        if level is None:
            print(f"Unknown level: {args.level}", file=sys.stderr)
            sys.exit(1)
        words = [w for w in level.words if w.definition][: args.limit]
    else:
        words = stratified_sample(data, n=args.limit, seed=args.seed)

    program = SentenceGenerator()
    if not args.no_optimized:
        if not args.program.exists():
            print(
                f"No optimized program at {args.program}; using baseline "
                "(pass --no-optimized to silence).",
                file=sys.stderr,
            )
        else:
            program.load(str(args.program))

    judge = SentenceJudge()
    judge.set_lm(judge_lm)

    print(f"{'word':<16} {'score':>5}  old -> new")
    print("-" * 100)
    for word in words:
        definition = word.definition or ""
        pred = program(word=word.text, definition=definition)
        new_sentence = str(getattr(pred, "sentence", "") or "").strip()
        result = judge_sentence(
            judge,
            word=word.text,
            definition=definition,
            sentence=new_sentence,
        )
        old = (word.sentence or "").replace("\n", " ")
        print(f"{word.text:<16} {result.score:5.2f}  {old!r}")
        print(f"{'':16}       -> {new_sentence!r}")
        if result.feedback:
            print(f"{'':16}         ({result.feedback})")


if __name__ == "__main__":
    main()
