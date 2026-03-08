import { useCallback, useState } from "react";
import type {
  DivisionProblem,
  DivisionSelection,
  MultiplicationProblem,
  MultiplicationSelection,
} from "../../types";
import {
  generateDivisionProblem,
  generateMultiplicationProblem,
  getDivisionLabel,
  getMultiplicationLabel,
} from "../../lib/math";

type MathPracticeProps =
  | {
      mode: "multiplication";
      selection: MultiplicationSelection;
      onBack: () => void;
    }
  | {
      mode: "division";
      selection: DivisionSelection;
      onBack: () => void;
    };

export default function MathPractice({ mode, selection, onBack }: MathPracticeProps) {
  const [problem, setProblem] = useState<MultiplicationProblem | DivisionProblem>(() =>
    mode === "multiplication"
      ? generateMultiplicationProblem(selection)
      : generateDivisionProblem(selection)
  );
  const [revealed, setRevealed] = useState(false);
  const [problemCount, setProblemCount] = useState(1);

  const loadNextProblem = useCallback(() => {
    setProblem(
      mode === "multiplication"
        ? generateMultiplicationProblem(selection)
        : generateDivisionProblem(selection)
    );
    setRevealed(false);
    setProblemCount((count) => count + 1);
  }, [mode, selection]);

  const heading = mode === "multiplication" ? "Multiplication" : "Whole Number Division";
  const subtitle =
    mode === "multiplication" ? getMultiplicationLabel(selection) : getDivisionLabel(selection);
  const problemText =
    mode === "multiplication"
      ? `${(problem as MultiplicationProblem).left} x ${(problem as MultiplicationProblem).right}`
      : `${(problem as DivisionProblem).dividend} ÷ ${(problem as DivisionProblem).denominator}`;

  return (
    <div className="screen practice">
      <div className="practice-header">
        <button className="btn btn-small btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <div className="practice-info">
          <h2>{heading}</h2>
          <p className="practice-subtitle">{subtitle}</p>
          <p className="progress-text-small">Problem {problemCount}</p>
        </div>
      </div>

      <div className="practice-main">
        {!revealed ? (
          <>
            <div className="math-problem-card">
              <p className="math-problem-label">Solve this problem</p>
              <div className="revealed-word math-problem">{problemText}</div>
            </div>
            <div className="practice-reveal">
              <button className="btn btn-reveal" onClick={() => setRevealed(true)}>
                Reveal Answer
              </button>
            </div>
          </>
        ) : (
          <div className="practice-revealed">
            <div className="math-problem-summary">{problemText}</div>
            <div className="revealed-word">{problem.answer}</div>
            <button className="btn btn-primary btn-huge" onClick={loadNextProblem}>
              Next Problem →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
