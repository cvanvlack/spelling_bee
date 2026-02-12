// Fisher-Yates shuffle and queue management

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
 * Build a queue of words prioritizing unattempted words.
 * If all words have been attempted, shuffle all words.
 */
export function buildQueue(allWords: string[], attempted: Set<string>): WordQueue {
  const unattempted = allWords.filter((w) => !attempted.has(w));
  if (unattempted.length > 0) {
    return { queue: shuffle(unattempted), index: 0 };
  }
  // All words attempted — reshuffle everything
  return { queue: shuffle(allWords), index: 0 };
}

/**
 * Get the next word from the queue.
 * If the queue is exhausted, rebuild it.
 */
export function nextWord(
  wordQueue: WordQueue,
  allWords: string[],
  attempted: Set<string>
): { word: string; updatedQueue: WordQueue } {
  if (wordQueue.index >= wordQueue.queue.length) {
    // Rebuild queue
    const newQueue = buildQueue(allWords, attempted);
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
