"""DSPy modules for kid-friendly sentence generation."""

from __future__ import annotations

import dspy

from sentence_tune.signatures import GenerateSentence, JudgeSentence


class SentenceGenerator(dspy.Module):
    """Generate one example sentence for a spelling-bee word."""

    def __init__(self) -> None:
        super().__init__()
        self.generate = dspy.Predict(GenerateSentence)

    def forward(self, word: str) -> dspy.Prediction:
        return self.generate(word=word)


class SentenceJudge(dspy.Module):
    """LLM-as-judge for example sentence quality."""

    def __init__(self) -> None:
        super().__init__()
        self.judge = dspy.Predict(JudgeSentence)

    def forward(self, word: str, sentence: str) -> dspy.Prediction:
        return self.judge(word=word, sentence=sentence)
