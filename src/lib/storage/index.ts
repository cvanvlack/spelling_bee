// LocalStorage-based progress and settings persistence

const ATTEMPTED_PREFIX = "spelling_attempted_";
const SETTINGS_KEY = "spelling_settings";

export interface Settings {
  voiceURI: string | null;
  normalRate: number;
  slowRate: number;
}

const DEFAULT_SETTINGS: Settings = {
  voiceURI: null,
  normalRate: 1.0,
  slowRate: 0.7,
};

// --- Progress ---

function getAttemptedKey(levelId: string): string {
  return `${ATTEMPTED_PREFIX}${levelId}`;
}

export function getAttemptedSet(levelId: string): Set<string> {
  try {
    const raw = localStorage.getItem(getAttemptedKey(levelId));
    if (!raw) return new Set();
    const arr: string[] = JSON.parse(raw);
    return new Set(arr);
  } catch {
    return new Set();
  }
}

export function markAttempted(levelId: string, word: string): void {
  const set = getAttemptedSet(levelId);
  set.add(word);
  localStorage.setItem(getAttemptedKey(levelId), JSON.stringify([...set]));
}

export function getProgress(
  levelId: string,
  totalWords: number
): { attempted: number; total: number; percentage: number } {
  const set = getAttemptedSet(levelId);
  const attempted = set.size;
  const percentage = totalWords > 0 ? Math.round((attempted / totalWords) * 100) : 0;
  return { attempted, total: totalWords, percentage };
}

// --- Settings ---

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Partial<Settings>): void {
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
}
