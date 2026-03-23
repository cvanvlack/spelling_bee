import type {
  FractionDifficulty,
  FractionOperation,
  FractionSelection,
} from "../../types";

interface FractionSelectProps {
  onSelect: (selection: FractionSelection) => void;
  onBack: () => void;
}

const OPERATIONS: Array<{
  operation: FractionOperation;
  title: string;
  description: string;
}> = [
  {
    operation: "addition",
    title: "Adding Fractions",
    description: "Build common denominator skills and reduce the final sum.",
  },
  {
    operation: "subtraction",
    title: "Subtracting Fractions",
    description: "Practice positive fraction differences and simplify the result.",
  },
  {
    operation: "multiplication",
    title: "Multiplying Fractions",
    description: "Multiply numerators and denominators, then reduce the answer.",
  },
  {
    operation: "division",
    title: "Dividing Fractions",
    description: "Invert and multiply with fraction quotients across three levels.",
  },
];

const DIFFICULTIES: Array<{
  difficulty: FractionDifficulty;
  title: string;
}> = [
  { difficulty: "easy", title: "Easy" },
  { difficulty: "medium", title: "Medium" },
  { difficulty: "hard", title: "Hard" },
];

function getDifficultyDescription(
  operation: FractionOperation,
  difficulty: FractionDifficulty
): string {
  if (difficulty === "easy") {
    return operation === "division"
      ? "Friendly fractions with matching denominators."
      : "Friendly denominators and simpler arithmetic.";
  }

  if (difficulty === "medium") {
    return operation === "multiplication"
      ? "Mixed denominators with a wider range of factors."
      : "More varied fraction pairs with friendly common factors.";
  }

  return operation === "addition" || operation === "subtraction"
    ? "Larger unlike denominators that still end in a reduced answer."
    : "Larger fractions that often need a bigger simplification step.";
}

export default function FractionSelect({ onSelect, onBack }: FractionSelectProps) {
  return (
    <div className="screen level-select">
      <h1>Choose Fraction Practice</h1>
      <div className="fraction-section-list">
        {OPERATIONS.map(({ operation, title, description }) => (
          <section key={operation} className="level-card fraction-section-card">
            <div className="fraction-section-header">
              <div className="math-option-title">{title}</div>
              <p className="math-card-description">{description}</p>
            </div>
            <div className="math-option-grid fraction-difficulty-grid">
              {DIFFICULTIES.map(({ difficulty, title: difficultyTitle }) => (
                <button
                  key={`${operation}-${difficulty}`}
                  className="level-card math-option-card fraction-difficulty-card"
                  onClick={() => onSelect({ operation, difficulty })}
                >
                  <div className="math-option-title">{difficultyTitle}</div>
                  <p className="math-card-description">
                    {getDifficultyDescription(operation, difficulty)}
                  </p>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <button className="btn btn-secondary back-btn" onClick={onBack}>
        Back
      </button>
    </div>
  );
}
