"""Load / sample / write spelling-bee wordlists."""

from __future__ import annotations

import json
import random
from typing import TYPE_CHECKING

import dspy

from sentence_tune.models import (
    CacheEntry,
    SentenceCache,
    WordEntry,
    WordlistsFile,
)

if TYPE_CHECKING:
    from collections.abc import Iterable
    from pathlib import Path


def load_wordlists(path: Path) -> WordlistsFile:
    raw = json.loads(path.read_text(encoding="utf-8"))
    return WordlistsFile.model_validate(raw)


def save_wordlists(path: Path, data: WordlistsFile) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        data.model_dump_json(indent=2) + "\n",
        encoding="utf-8",
    )


def load_cache(path: Path) -> SentenceCache:
    if not path.exists():
        return SentenceCache()
    return SentenceCache.model_validate_json(path.read_text(encoding="utf-8"))


def save_cache(path: Path, cache: SentenceCache) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(cache.model_dump_json(indent=2) + "\n", encoding="utf-8")


def iter_words(
    data: WordlistsFile,
    *,
    level_id: str | None = None,
    limit: int | None = None,
) -> list[tuple[str, WordEntry]]:
    """Return (level_id, word) pairs in scope."""
    out: list[tuple[str, WordEntry]] = []
    for level in data.levels:
        if level_id is not None and level.id != level_id:
            continue
        words = level.words if limit is None else level.words[:limit]
        for word in words:
            out.append((level.id, word))
    return out


def words_with_definitions(pairs: Iterable[tuple[str, WordEntry]]) -> list[WordEntry]:
    """Unique words that have a non-empty definition (needed for generation)."""
    seen: set[str] = set()
    result: list[WordEntry] = []
    for _, word in pairs:
        key = word.text.casefold()
        if key in seen:
            continue
        seen.add(key)
        result.append(word)
    return result


def stratified_sample(
    data: WordlistsFile,
    *,
    n: int,
    seed: int = 42,
) -> list[WordEntry]:
    """Sample up to `n` words evenly across levels (definitions required)."""
    rng = random.Random(seed)
    by_level: list[list[WordEntry]] = []
    for level in data.levels:
        eligible = [w for w in level.words if w.definition and w.definition.strip()]
        # Deduplicate within level by casefold.
        seen: set[str] = set()
        unique: list[WordEntry] = []
        for w in eligible:
            key = w.text.casefold()
            if key not in seen:
                seen.add(key)
                unique.append(w)
        by_level.append(unique)

    if not by_level or n <= 0:
        return []

    per = max(1, n // len(by_level))
    picked: list[WordEntry] = []
    leftover: list[WordEntry] = []

    for bucket in by_level:
        rng.shuffle(bucket)
        take = min(per, len(bucket))
        picked.extend(bucket[:take])
        leftover.extend(bucket[take:])

    if len(picked) < n:
        rng.shuffle(leftover)
        picked.extend(leftover[: n - len(picked)])

    rng.shuffle(picked)
    return picked[:n]


def to_examples(words: list[WordEntry]) -> list[dspy.Example]:
    """Convert word entries to DSPy examples (inputs only)."""
    examples: list[dspy.Example] = []
    for word in words:
        definition = word.definition or ""
        ex = dspy.Example(word=word.text, definition=definition).with_inputs("word", "definition")
        examples.append(ex)
    return examples


def apply_sentences(
    data: WordlistsFile,
    sentences: dict[str, str],
) -> int:
    """Write sentences back by case-insensitive word key. Returns update count."""
    updated = 0
    for level in data.levels:
        for word in level.words:
            key = word.text.casefold()
            if key in sentences:
                word.sentence = sentences[key]
                updated += 1
    return updated


def cache_put(cache: SentenceCache, word: str, sentence: str, score: float | None = None) -> None:
    key = word.casefold()
    cache.entries[key] = CacheEntry(word=word, sentence=sentence, score=score)
