"""Pydantic models for wordlists, cache, judge output, and settings."""

from __future__ import annotations

from pathlib import Path
from typing import Annotated

from pydantic import BaseModel, Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

Score = Annotated[float, Field(ge=0.0, le=1.0)]


class WordEntry(BaseModel):
    text: str
    sentence: str | None = None


class Level(BaseModel):
    id: str
    name: str
    words: list[WordEntry]


class WordlistsFile(BaseModel):
    version: int
    levels: list[Level]


class CacheEntry(BaseModel):
    word: str
    sentence: str
    score: Score | None = None


class SentenceCache(BaseModel):
    version: int = 1
    entries: dict[str, CacheEntry] = Field(default_factory=dict)


class JudgeResult(BaseModel):
    score: Score
    feedback: str


class Settings(BaseSettings):
    """Runtime settings loaded from environment / `.env`."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    openrouter_api_key: SecretStr
    # Env: SENTENCE_TUNE_MODEL / SENTENCE_TUNE_JUDGE_MODEL
    sentence_tune_model: str = "openrouter/openai/gpt-4o-mini"
    sentence_tune_judge_model: str = "openrouter/openai/gpt-4o-mini"


def package_root() -> Path:
    return Path(__file__).resolve().parent.parent


def default_wordlists_path() -> Path:
    return package_root().parents[1] / "public" / "data" / "wordlists.json"


def artifacts_dir() -> Path:
    path = Path(__file__).resolve().parent / "artifacts"
    path.mkdir(parents=True, exist_ok=True)
    return path


def default_optimized_path() -> Path:
    return artifacts_dir() / "optimized_sentence_generator.json"


def default_cache_path() -> Path:
    return artifacts_dir() / ".sentence-cache.json"
