export interface Word {
  text: string;
  syllables?: string;
  hint?: string;
  sentence?: string;
}

export interface Level {
  id: string;
  name: string;
  words: Word[];
}

export interface WordListData {
  version: number;
  levels: Level[];
}

export type Screen = "home" | "levels" | "practice" | "settings";
