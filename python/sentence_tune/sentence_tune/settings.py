"""Shared helpers for loading settings without scattershot env access."""

from __future__ import annotations

from sentence_tune.models import Settings


def load_settings() -> Settings:
    """Load Settings from environment / `.env`.

    Required: OPENROUTER_API_KEY
    Optional: SENTENCE_TUNE_MODEL, SENTENCE_TUNE_JUDGE_MODEL
    """
    # Pydantic Settings fills required fields from the environment at runtime.
    return Settings.model_validate({})
