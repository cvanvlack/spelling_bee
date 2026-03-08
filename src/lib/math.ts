import type {
  DigitCount,
  DivisionProblem,
  DivisionSelection,
  MultiplicationProblem,
  MultiplicationSelection,
} from "../types";

function getBoundsForDigits(digits: DigitCount): { min: number; max: number } {
  if (digits === 1) {
    return { min: 1, max: 9 };
  }

  const min = 10 ** (digits - 1);
  return { min, max: (10 ** digits) - 1 };
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

export function generateMultiplicationProblem(
  selection: MultiplicationSelection
): MultiplicationProblem {
  const leftBounds = getBoundsForDigits(selection.leftDigits);
  const rightBounds = getBoundsForDigits(selection.rightDigits);
  const left = randomInt(leftBounds.min, leftBounds.max);
  const right = randomInt(rightBounds.min, rightBounds.max);

  return {
    ...selection,
    left,
    right,
    answer: left * right,
  };
}

export function getMultiplicationLabel(selection: MultiplicationSelection): string {
  return `${selection.leftDigits}-digit x ${selection.rightDigits}-digit`;
}

export function generateDivisionProblem(selection: DivisionSelection): DivisionProblem {
  const denominatorBounds = getBoundsForDigits(selection.denominatorDigits);
  const answerBounds = getBoundsForDigits(selection.answerDigits);
  const denominator = randomInt(denominatorBounds.min, denominatorBounds.max);
  const answer = randomInt(answerBounds.min, answerBounds.max);

  return {
    ...selection,
    denominator,
    dividend: denominator * answer,
    answer,
  };
}

export function getDivisionLabel(selection: DivisionSelection): string {
  return `${selection.denominatorDigits}-digit denominator • ${selection.answerDigits}-digit answer`;
}
