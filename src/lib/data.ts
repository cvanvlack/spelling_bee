import type { WordListData } from "../types";

let cachedData: WordListData | null = null;

export async function loadWordLists(): Promise<WordListData> {
  if (cachedData) return cachedData;

  const response = await fetch(`${import.meta.env.BASE_URL}data/wordlists.json`);
  if (!response.ok) {
    throw new Error("Failed to load word lists");
  }
  cachedData = (await response.json()) as WordListData;
  return cachedData;
}
