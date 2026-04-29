import ScreenHeader from "../../components/ScreenHeader";
import type { FractionOperation } from "../../types";

interface FractionSelectProps {
  onSelect: (operation: FractionOperation) => void;
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

export default function FractionSelect({ onSelect, onBack }: FractionSelectProps) {
  return (
    <div className="screen level-select">
      <ScreenHeader title="Choose Fraction Practice" onBack={onBack} />
      <div className="fraction-operation-list">
        {OPERATIONS.map(({ operation, title, description }) => (
          <button
            key={operation}
            className="level-card math-category-card fraction-operation-card"
            onClick={() => onSelect(operation)}
          >
            <div className="level-card-header">
              <span className="level-number">Section</span>
              <span className="level-name">{title}</span>
            </div>
            <p className="math-card-description">{description}</p>
            <p className="fraction-tier-hint">Three tiers: easy, medium, and hard.</p>
          </button>
        ))}
      </div>
    </div>
  );
}
