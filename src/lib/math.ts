import type {
  DigitCount,
  DivisionProblem,
  DivisionSelection,
  FractionProblem,
  FractionSelection,
  FractionValue,
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

function gcd(left: number, right: number): number {
  let a = Math.abs(left);
  let b = Math.abs(right);

  while (b !== 0) {
    [a, b] = [b, a % b];
  }

  return a || 1;
}

function lcm(left: number, right: number): number {
  return Math.abs(left * right) / gcd(left, right);
}

function reduceFraction({ numerator, denominator }: FractionValue): FractionValue {
  if (numerator === 0) {
    return { numerator: 0, denominator: 1 };
  }

  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

function formatFraction({ numerator, denominator }: FractionValue): string {
  const reduced = reduceFraction({ numerator, denominator });

  if (reduced.denominator === 1) {
    return `${reduced.numerator}`;
  }

  return `${reduced.numerator}/${reduced.denominator}`;
}

function compareFractions(left: FractionValue, right: FractionValue): number {
  return (left.numerator * right.denominator) - (right.numerator * left.denominator);
}

function randomProperFraction(minDenominator: number, maxDenominator: number): FractionValue {
  const denominator = randomInt(minDenominator, maxDenominator);

  return {
    numerator: randomInt(1, denominator - 1),
    denominator,
  };
}

function getFractionOperationSymbol(selection: FractionSelection): string {
  switch (selection.operation) {
    case "addition":
      return "+";
    case "subtraction":
      return "-";
    case "multiplication":
      return "x";
    case "division":
      return "÷";
  }
}

function getFractionOperands(selection: FractionSelection): {
  left: FractionValue;
  right: FractionValue;
} {
  switch (selection.operation) {
    case "addition":
      return getAdditionOperands(selection.difficulty);
    case "subtraction":
      return getSubtractionOperands(selection.difficulty);
    case "multiplication":
      return getMultiplicationOperands(selection.difficulty);
    case "division":
      return getDivisionOperands(selection.difficulty);
  }
}

function getAdditionOperands(difficulty: FractionSelection["difficulty"]): {
  left: FractionValue;
  right: FractionValue;
} {
  if (difficulty === "easy") {
    const denominator = randomInt(2, 9);

    return {
      left: { numerator: randomInt(1, denominator - 1), denominator },
      right: { numerator: randomInt(1, denominator - 1), denominator },
    };
  }

  if (difficulty === "medium") {
    const baseDenominator = randomInt(2, 9);
    const leftDenominator = baseDenominator * randomInt(1, 2);
    const rightDenominator = baseDenominator * randomInt(1, 2);

    return {
      left: { numerator: randomInt(1, leftDenominator - 1), denominator: leftDenominator },
      right: { numerator: randomInt(1, rightDenominator - 1), denominator: rightDenominator },
    };
  }

  const left = randomProperFraction(4, 20);
  let right = randomProperFraction(4, 20);

  while (left.denominator === right.denominator) {
    right = randomProperFraction(4, 20);
  }

  return { left, right };
}

function getSubtractionOperands(difficulty: FractionSelection["difficulty"]): {
  left: FractionValue;
  right: FractionValue;
} {
  if (difficulty === "easy") {
    const denominator = randomInt(3, 9);
    const numerators = [randomInt(1, denominator - 1), randomInt(1, denominator - 1)].sort(
      (left, right) => right - left
    );

    if (numerators[0] === numerators[1]) {
      numerators[0] = Math.min(denominator - 1, numerators[0] + 1);
      numerators[1] = Math.max(1, numerators[1] - 1);
    }

    return {
      left: { numerator: numerators[0], denominator },
      right: { numerator: numerators[1], denominator },
    };
  }

  const minDenominator = difficulty === "medium" ? 3 : 4;
  const maxDenominator = difficulty === "medium" ? 12 : 20;
  const baseDenominator = difficulty === "medium" ? randomInt(2, 9) : null;
  const leftDenominator =
    difficulty === "medium" && baseDenominator
      ? baseDenominator * randomInt(1, 2)
      : null;
  const rightDenominator =
    difficulty === "medium" && baseDenominator
      ? baseDenominator * randomInt(1, 2)
      : null;
  let left =
    difficulty === "medium" && leftDenominator
      ? {
          numerator: randomInt(1, leftDenominator - 1),
          denominator: leftDenominator,
        }
      : randomProperFraction(minDenominator, maxDenominator);
  let right =
    difficulty === "medium" && rightDenominator
      ? {
          numerator: randomInt(1, rightDenominator - 1),
          denominator: rightDenominator,
        }
      : randomProperFraction(minDenominator, maxDenominator);

  while (compareFractions(left, right) === 0) {
    right =
      difficulty === "medium"
        ? {
            numerator: randomInt(1, (rightDenominator ?? 12) - 1),
            denominator: rightDenominator ?? 12,
          }
        : randomProperFraction(minDenominator, maxDenominator);
  }

  if (compareFractions(left, right) < 0) {
    [left, right] = [right, left];
  }

  return { left, right };
}

function getMultiplicationOperands(difficulty: FractionSelection["difficulty"]): {
  left: FractionValue;
  right: FractionValue;
} {
  if (difficulty === "easy") {
    return {
      left: randomProperFraction(2, 9),
      right: randomProperFraction(2, 9),
    };
  }

  if (difficulty === "medium") {
    return {
      left: randomProperFraction(3, 12),
      right: randomProperFraction(3, 12),
    };
  }

  return {
    left: randomProperFraction(4, 20),
    right: randomProperFraction(4, 20),
  };
}

function getDivisionOperands(difficulty: FractionSelection["difficulty"]): {
  left: FractionValue;
  right: FractionValue;
} {
  if (difficulty === "easy") {
    const denominator = randomInt(2, 9);

    return {
      left: { numerator: randomInt(1, denominator - 1), denominator },
      right: { numerator: randomInt(1, denominator - 1), denominator },
    };
  }

  if (difficulty === "medium") {
    return {
      left: randomProperFraction(3, 12),
      right: randomProperFraction(3, 12),
    };
  }

  return {
    left: randomProperFraction(4, 20),
    right: randomProperFraction(4, 20),
  };
}

function calculateFractionAnswer(
  selection: FractionSelection,
  left: FractionValue,
  right: FractionValue
): string {
  if (selection.operation === "addition" || selection.operation === "subtraction") {
    const commonDenominator = lcm(left.denominator, right.denominator);
    const leftScale = commonDenominator / left.denominator;
    const rightScale = commonDenominator / right.denominator;
    const numerator =
      selection.operation === "addition"
        ? (left.numerator * leftScale) + (right.numerator * rightScale)
        : (left.numerator * leftScale) - (right.numerator * rightScale);

    return formatFraction({ numerator, denominator: commonDenominator });
  }

  if (selection.operation === "multiplication") {
    return formatFraction({
      numerator: left.numerator * right.numerator,
      denominator: left.denominator * right.denominator,
    });
  }

  return formatFraction({
    numerator: left.numerator * right.denominator,
    denominator: left.denominator * right.numerator,
  });
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

export function generateFractionProblem(selection: FractionSelection): FractionProblem {
  const { left, right } = getFractionOperands(selection);

  return {
    ...selection,
    left,
    right,
    answer: calculateFractionAnswer(selection, left, right),
  };
}

export function getFractionLabel(selection: FractionSelection): string {
  const difficultyLabel =
    selection.difficulty.charAt(0).toUpperCase() + selection.difficulty.slice(1);

  switch (selection.operation) {
    case "addition":
      return `Adding Fractions • ${difficultyLabel}`;
    case "subtraction":
      return `Subtracting Fractions • ${difficultyLabel}`;
    case "multiplication":
      return `Multiplying Fractions • ${difficultyLabel}`;
    case "division":
      return `Dividing Fractions • ${difficultyLabel}`;
  }
}

export function getFractionProblemText(problem: FractionProblem): string {
  return `${problem.left.numerator}/${problem.left.denominator} ${getFractionOperationSymbol(problem)} ${problem.right.numerator}/${problem.right.denominator}`;
}
