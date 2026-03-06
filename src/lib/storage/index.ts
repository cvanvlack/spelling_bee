// LocalStorage-based progress and settings persistence
import type { TtsEngineId } from "../tts/types";

const LEGACY_ATTEMPTED_PREFIX = "spelling_attempted_";
const RESULTS_PREFIX = "spelling_results_";
const SETTINGS_KEY = "spelling_settings";

export type WordResult = "correct" | "incorrect";
export type WordResults = Record<string, WordResult>;

export interface Settings {
  ttsEngine: TtsEngineId;
  nativeVoiceURI: string | null;
  piperVoiceId: string | null;
  kokoroVoiceId: string | null;
  normalRate: number;
  slowRate: number;
}

const DEFAULT_SETTINGS: Settings = {
  ttsEngine: "kokoro",
  nativeVoiceURI: null,
  piperVoiceId: "en_US-hfc_female-medium",
  kokoroVoiceId: "af_bella",
  normalRate: 1.0,
  slowRate: 0.7,
};

// --- Progress ---

function getLegacyAttemptedKey(levelId: string): string {
  return `${LEGACY_ATTEMPTED_PREFIX}${levelId}`;
}

function getResultsKey(levelId: string): string {
  return `${RESULTS_PREFIX}${levelId}`;
}

function getLegacyAttemptedSet(levelId: string): Set<string> {
  try {
    const raw = localStorage.getItem(getLegacyAttemptedKey(levelId));
    if (!raw) return new Set();
    const arr: string[] = JSON.parse(raw);
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveWordResults(levelId: string, results: WordResults): void {
  localStorage.setItem(getResultsKey(levelId), JSON.stringify(results));
}

export function getWordResults(levelId: string): WordResults {
  let parsedResults: WordResults = {};

  try {
    const raw = localStorage.getItem(getResultsKey(levelId));
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      parsedResults = Object.fromEntries(
        Object.entries(parsed).filter(
          (entry): entry is [string, WordResult] =>
            entry[1] === "correct" || entry[1] === "incorrect"
        )
      );
    }
  } catch {
    parsedResults = {};
  }

  const legacyAttempted = getLegacyAttemptedSet(levelId);
  let migrated = false;

  for (const word of legacyAttempted) {
    if (!parsedResults[word]) {
      parsedResults[word] = "correct";
      migrated = true;
    }
  }

  if (migrated) {
    saveWordResults(levelId, parsedResults);
  }

  return parsedResults;
}

export function markWordResult(levelId: string, word: string, result: WordResult): void {
  const results = getWordResults(levelId);
  results[word] = result;
  saveWordResults(levelId, results);
}

export function getProgress(
  levelId: string,
  totalWords: number
): { correct: number; incorrect: number; total: number; percentage: number } {
  const results = getWordResults(levelId);
  const values = Object.values(results);
  const correct = values.filter((value) => value === "correct").length;
  const incorrect = values.filter((value) => value === "incorrect").length;
  const percentage =
    totalWords === 0
      ? 0
      : correct === 0
        ? 0
        : correct === totalWords
          ? 100
          : Math.max(1, Math.round((correct / totalWords) * 100));
  return { correct, incorrect, total: totalWords, percentage };
}

// --- Settings ---

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<Settings> & { voiceURI?: string | null };
    const migratedVoice = parsed.nativeVoiceURI ?? parsed.voiceURI ?? null;
    return { ...DEFAULT_SETTINGS, ...parsed, nativeVoiceURI: migratedVoice };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Partial<Settings>): void {
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
}
