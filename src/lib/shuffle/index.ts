// Fisher-Yates shuffle and queue management

import type { WordResults } from "../storage";

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface WordQueue {
  queue: string[];
  index: number;
}

/**
 * Build a queue that prioritizes words marked incorrect, then unseen words.
 * If every word is already marked correct, shuffle all words.
 */
export function buildQueue(allWords: string[], results: WordResults): WordQueue {
  const incorrect = allWords.filter((word) => results[word] === "incorrect");
  const unseen = allWords.filter((word) => !results[word]);

  if (incorrect.length > 0 || unseen.length > 0) {
    return { queue: [...shuffle(incorrect), ...shuffle(unseen)], index: 0 };
  }

  // All words are already marked correct — reshuffle everything.
  return { queue: shuffle(allWords), index: 0 };
}

/**
 * Get the next word from the queue.
 * If the queue is exhausted, rebuild it.
 */
export function nextWord(
  wordQueue: WordQueue,
  allWords: string[],
  results: WordResults
): { word: string; updatedQueue: WordQueue } {
  if (wordQueue.index >= wordQueue.queue.length) {
    const newQueue = buildQueue(allWords, results);
    return {
      word: newQueue.queue[0],
      updatedQueue: { ...newQueue, index: 1 },
    };
  }
  const word = wordQueue.queue[wordQueue.index];
  return {
    word,
    updatedQueue: { ...wordQueue, index: wordQueue.index + 1 },
  };
}
