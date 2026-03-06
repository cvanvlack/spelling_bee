interface MathCategorySelectProps {
  onSelectMultiplication: () => void;
  onBack: () => void;
}

export default function MathCategorySelect({
  onSelectMultiplication,
  onBack,
}: MathCategorySelectProps) {
  return (
    <div className="screen level-select">
      <h1>Choose a Math Category</h1>
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
      </div>
      <button className="btn btn-secondary back-btn" onClick={onBack}>
        Back
      </button>
    </div>
  );
}
