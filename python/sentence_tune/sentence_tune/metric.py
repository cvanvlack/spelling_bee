"""Hard-gate validators and LLM-as-judge metric."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sentence_tune.models import JudgeResult

if TYPE_CHECKING:
    from collections.abc import Callable

    import dspy

    from sentence_tune.modules import SentenceJudge

def parse_judge_prediction(pred: dspy.Prediction) -> JudgeResult:
    """Validate judge LM output into a JudgeResult."""
    raw_score = getattr(pred, "score", 0.0)
    try:
        score = float(raw_score)
    except (TypeError, ValueError):
        score = 0.0
    score = max(0.0, min(1.0, score))
    feedback = str(getattr(pred, "feedback", "") or "")
    return JudgeResult(score=score, feedback=feedback)


def example_field(example: dspy.Example, key: str) -> str:
    """Read a string field from a DSPy Example."""
    return str(getattr(example, key, "") or "")


def judge_sentence(
    judge: SentenceJudge,
    *,
    word: str,
    sentence: str,
) -> JudgeResult:
    pred = judge(word=word, sentence=sentence)
    return parse_judge_prediction(pred)


def make_metric(judge: SentenceJudge) -> Callable[[dspy.Example, dspy.Prediction], float]:
    """Build a DSPy metric that returns judge score in [0, 1]."""

    def metric(example: dspy.Example, pred: dspy.Prediction, _trace: object | None = None) -> float:
        word = example_field(example, "word")
        sentence = str(getattr(pred, "sentence", "") or "")
        return judge_sentence(
            judge,
            word=word,
            sentence=sentence,
        ).score

    return metric
