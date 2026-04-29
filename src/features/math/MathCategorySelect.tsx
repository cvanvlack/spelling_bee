import ScreenHeader from "../../components/ScreenHeader";

interface MathCategorySelectProps {
  onSelectMultiplication: () => void;
  onSelectFractions: () => void;
  onSelectDivision: () => void;
  onBack: () => void;
}

export default function MathCategorySelect({
  onSelectMultiplication,
  onSelectFractions,
  onSelectDivision,
  onBack,
}: MathCategorySelectProps) {
  return (
    <div className="screen level-select">
      <ScreenHeader title="Choose a Math Category" onBack={onBack} />
      <div className="level-list">
        <button className="level-card math-category-card" onClick={onSelectMultiplication}>
          <div className="level-card-header">
            <span className="level-number">Category 1</span>
            <span className="level-name">Multiplication</span>
          </div>
          <p className="math-card-description">
            Reveal the answer after solving one-digit, two-digit, or three-digit multiplication
            problems.
          </p>
        </button>
        <button className="level-card math-category-card" onClick={onSelectFractions}>
          <div className="level-card-header">
            <span className="level-number">Category 2</span>
            <span className="level-name">Fractions</span>
          </div>
          <p className="math-card-description">
            Practice adding, subtracting, multiplying, and dividing fractions with simplified
            final answers.
          </p>
        </button>
        <button className="level-card math-category-card" onClick={onSelectDivision}>
          <div className="level-card-header">
            <span className="level-number">Category 3</span>
            <span className="level-name">Whole Number Division</span>
          </div>
          <p className="math-card-description">
            Practice long division with whole-number quotients by matching denominator digits
            and answer digits.
          </p>
        </button>
      </div>
    </div>
  );
}
