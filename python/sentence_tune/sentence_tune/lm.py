"""OpenRouter language-model helpers for DSPy."""

from __future__ import annotations

from typing import TYPE_CHECKING

import dspy

if TYPE_CHECKING:
    from sentence_tune.models import Settings

OPENROUTER_API_BASE = "https://openrouter.ai/api/v1"
OPENROUTER_HEADERS = {
    "HTTP-Referer": "https://github.com/spelling_bee",
    "X-Title": "spelling-bee-sentence-tune",
}


def make_lm(model: str, *, api_key: str, temperature: float = 0.7) -> dspy.LM:
    """Create a DSPy LM pointed at OpenRouter."""
    return dspy.LM(
        model=model,
        api_key=api_key,
        api_base=OPENROUTER_API_BASE,
        temperature=temperature,
        extra_headers=OPENROUTER_HEADERS,
    )


def configure_dspy(settings: Settings, *, model: str | None = None) -> dspy.LM:
    """Configure the global DSPy LM from settings."""
    lm = make_lm(
        model or settings.sentence_tune_model,
        api_key=settings.openrouter_api_key.get_secret_value(),
    )
    dspy.configure(lm=lm)
    return lm


def make_judge_lm(settings: Settings, *, model: str | None = None) -> dspy.LM:
    """Create a separate (often cheaper/deterministic) judge LM."""
    return make_lm(
        model or settings.sentence_tune_judge_model,
        api_key=settings.openrouter_api_key.get_secret_value(),
        temperature=0.0,
    )
