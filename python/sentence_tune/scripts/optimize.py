#!/usr/bin/env python3
"""Optimize the sentence-generation prompt with MIPROv2 + LLM judge."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import TYPE_CHECKING

import dspy
from dotenv import load_dotenv
from sentence_tune.data import load_wordlists, stratified_sample, to_examples
from sentence_tune.lm import configure_dspy, make_judge_lm
from sentence_tune.metric import example_field, make_metric
from sentence_tune.models import default_optimized_path, default_wordlists_path
from sentence_tune.modules import SentenceGenerator, SentenceJudge
from sentence_tune.settings import load_settings

if TYPE_CHECKING:
    from collections.abc import Callable

_ROOT = Path(__file__).resolve().parents[1]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input",
        type=Path,
        default=default_wordlists_path(),
        help="Path to wordlists.json",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=default_optimized_path(),
        help="Where to save the optimized program",
    )
    parser.add_argument("--train-size", type=int, default=100)
    parser.add_argument("--val-size", type=int, default=40)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--model", type=str, default=None, help="Override student LM")
    parser.add_argument("--judge-model", type=str, default=None, help="Override judge LM")
    parser.add_argument(
        "--auto",
        choices=("light", "medium", "heavy"),
        default="light",
        help="MIPROv2 auto preset",
    )
    return parser.parse_args()


def eval_mean(
    program: SentenceGenerator,
    examples: list[dspy.Example],
    metric: Callable[[dspy.Example, dspy.Prediction], float],
) -> float:
    if not examples:
        return 0.0
    scores: list[float] = []
    for ex in examples:
        pred = program(word=example_field(ex, "word"))
        scores.append(metric(ex, pred))
    return sum(scores) / len(scores)


def main() -> None:
    load_dotenv(_ROOT / ".env")
    args = parse_args()
    settings = load_settings()

    configure_dspy(settings, model=args.model)
    judge_lm = make_judge_lm(settings, model=args.judge_model)

    data = load_wordlists(args.input)
    sample = stratified_sample(
        data,
        n=args.train_size + args.val_size,
        seed=args.seed,
    )
    if len(sample) < 10:
        print(f"Need more words for training; got {len(sample)}", file=sys.stderr)
        sys.exit(1)

    train_words = sample[: args.train_size]
    val_words = sample[args.train_size :]
    trainset = to_examples(train_words)
    valset = to_examples(val_words)
    preview = valset[: min(10, len(valset))]

    print(f"Input:  {args.input}")
    print(f"Train:  {len(trainset)}  Val: {len(valset)}")
    print(f"Student LM: {args.model or settings.sentence_tune_model}")
    print(f"Judge LM:   {args.judge_model or settings.sentence_tune_judge_model}")

    judge = SentenceJudge()
    judge.set_lm(judge_lm)
    metric = make_metric(judge)

    baseline = SentenceGenerator()
    print("Scoring baseline on preview set...")
    baseline_score = eval_mean(baseline, preview, metric)
    print(f"Baseline mean judge score ({len(preview)}): {baseline_score:.3f}")

    optimizer = dspy.MIPROv2(
        metric=metric,
        auto=args.auto,
        num_threads=4,
    )
    optimized: SentenceGenerator = optimizer.compile(
        baseline,
        trainset=trainset,
        valset=valset or None,
        requires_permission_to_run=False,
    )

    print("Scoring optimized on preview set...")
    optimized_score = eval_mean(optimized, preview, metric)
    print(f"Optimized mean judge score ({len(preview)}): {optimized_score:.3f}")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    optimized.save(str(args.output))
    print(f"Saved optimized program -> {args.output}")


if __name__ == "__main__":
    main()
