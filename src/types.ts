export interface Word {
  text: string;
  definition?: string;
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

export type Screen =
  | "home"
  | "levels"
  | "practice"
  | "settings"
  | "math-categories"
  | "math-multiplication"
  | "math-division"
  | "math-practice";

export type DigitCount = 1 | 2 | 3;

export interface MultiplicationSelection {
  leftDigits: DigitCount;
  rightDigits: DigitCount;
}

export interface DivisionSelection {
  denominatorDigits: DigitCount;
  answerDigits: DigitCount;
}

export interface MultiplicationProblem extends MultiplicationSelection {
  left: number;
  right: number;
  answer: number;
}

export interface DivisionProblem extends DivisionSelection {
  dividend: number;
  denominator: number;
  answer: number;
}
