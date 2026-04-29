import ScreenHeader from "../../components/ScreenHeader";
import type { DigitCount, DivisionSelection } from "../../types";

interface DivisionSelectProps {
  onSelect: (selection: DivisionSelection) => void;
  onBack: () => void;
}

const DIGIT_OPTIONS: DigitCount[] = [1, 2, 3];

export default function DivisionSelect({ onSelect, onBack }: DivisionSelectProps) {
  return (
    <div className="screen level-select">
      <ScreenHeader title="Choose Division Digits" onBack={onBack} />
      <div className="math-option-grid">
        {DIGIT_OPTIONS.flatMap((denominatorDigits) =>
          DIGIT_OPTIONS.map((answerDigits) => (
            <button
              key={`${denominatorDigits}-${answerDigits}`}
              className="level-card math-option-card"
              onClick={() => onSelect({ denominatorDigits, answerDigits })}
            >
              <div className="math-option-title">
                {denominatorDigits}-digit denominator • {answerDigits}-digit answer
              </div>
              <p className="math-card-description">
                Practice whole-number division with a {denominatorDigits}-digit denominator
                and a {answerDigits}-digit answer.
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
