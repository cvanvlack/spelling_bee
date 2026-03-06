import type { DigitCount, MultiplicationSelection } from "../../types";

interface MultiplicationSelectProps {
  onSelect: (selection: MultiplicationSelection) => void;
  onBack: () => void;
}

const DIGIT_OPTIONS: DigitCount[] = [1, 2, 3];

export default function MultiplicationSelect({
  onSelect,
  onBack,
}: MultiplicationSelectProps) {
  return (
    <div className="screen level-select">
      <h1>Choose Multiplication Digits</h1>
      <div className="math-option-grid">
        {DIGIT_OPTIONS.flatMap((leftDigits) =>
          DIGIT_OPTIONS.map((rightDigits) => (
            <button
              key={`${leftDigits}-${rightDigits}`}
              className="level-card math-option-card"
              onClick={() => onSelect({ leftDigits, rightDigits })}
            >
              <div className="math-option-title">
                {leftDigits}-digit x {rightDigits}-digit
              </div>
              <p className="math-card-description">
                Practice random {leftDigits}-digit by {rightDigits}-digit multiplication problems.
              </p>
            </button>
          ))
        )}
      </div>
      <button className="btn btn-secondary back-btn" onClick={onBack}>
        Back
      </button>
    </div>
  );
}
