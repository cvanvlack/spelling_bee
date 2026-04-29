import type { FractionDifficulty, FractionOperation } from "../../types";
import ScreenHeader from "../../components/ScreenHeader";

interface FractionDifficultySelectProps {
  operation: FractionOperation;
  onSelect: (difficulty: FractionDifficulty) => void;
  onBack: () => void;
}

const DIFFICULTIES: Array<{
  difficulty: FractionDifficulty;
  title: string;
  tier: string;
}> = [
  { difficulty: "easy", title: "Easy", tier: "Tier 1" },
  { difficulty: "medium", title: "Medium", tier: "Tier 2" },
  { difficulty: "hard", title: "Hard", tier: "Tier 3" },
];

function getOperationTitle(operation: FractionOperation): string {
  switch (operation) {
    case "addition":
      return "Adding Fractions";
    case "subtraction":
      return "Subtracting Fractions";
    case "multiplication":
      return "Multiplying Fractions";
    case "division":
      return "Dividing Fractions";
  }
}

function getDifficultyDescription(
  operation: FractionOperation,
  difficulty: FractionDifficulty
): string {
  if (operation === "subtraction") {
    switch (difficulty) {
      case "easy":
        return "Same denominators and simple positive answers.";
      case "medium":
        return "Friendly unlike denominators with extra simplification.";
      case "hard":
        return "Larger unlike denominators and multi-step subtraction.";
    }
  }

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

  return operation === "addition"
    ? "Larger unlike denominators that still end in a reduced answer."
    : "Larger fractions that often need a bigger simplification step.";
}

export default function FractionDifficultySelect({
  operation,
  onSelect,
  onBack,
}: FractionDifficultySelectProps) {
  return (
    <div className="screen level-select">
      <ScreenHeader title={`${getOperationTitle(operation)} Tiers`} onBack={onBack} />
      <p className="screen-intro">
        Choose a tier that builds from simpler problems up to more complicated math.
      </p>
      <div className="level-list">
        {DIFFICULTIES.map(({ difficulty, title, tier }) => (
          <button
            key={difficulty}
            className="level-card math-category-card"
            onClick={() => onSelect(difficulty)}
          >
            <div className="level-card-header">
              <span className="level-number">{tier}</span>
              <span className="level-name">{title}</span>
            </div>
            <p className="math-card-description">
              {getDifficultyDescription(operation, difficulty)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
