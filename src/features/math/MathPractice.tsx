import { useCallback, useState } from "react";
import type { MultiplicationProblem, MultiplicationSelection } from "../../types";
import { generateMultiplicationProblem, getMultiplicationLabel } from "../../lib/math";

interface MathPracticeProps {
  selection: MultiplicationSelection;
  onBack: () => void;
}

export default function MathPractice({ selection, onBack }: MathPracticeProps) {
  const [problem, setProblem] = useState<MultiplicationProblem>(() =>
    generateMultiplicationProblem(selection)
  );
  const [revealed, setRevealed] = useState(false);
  const [problemCount, setProblemCount] = useState(1);

  const loadNextProblem = useCallback(() => {
    setProblem(generateMultiplicationProblem(selection));
    setRevealed(false);
    setProblemCount((count) => count + 1);
  }, [selection]);

  return (
    <div className="screen practice">
      <div className="practice-header">
        <button className="btn btn-small btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <div className="practice-info">
          <h2>Multiplication</h2>
          <p className="practice-subtitle">{getMultiplicationLabel(selection)}</p>
          <p className="progress-text-small">Problem {problemCount}</p>
        </div>
      </div>

      <div className="practice-main">
        {!revealed ? (
          <>
            <div className="math-problem-card">
              <p className="math-problem-label">Solve this problem</p>
              <div className="revealed-word math-problem">
                {problem.left} x {problem.right}
              </div>
            </div>
            <div className="practice-reveal">
              <button className="btn btn-reveal" onClick={() => setRevealed(true)}>
                Reveal Answer
              </button>
            </div>
          </>
        ) : (
          <div className="practice-revealed">
            <div className="math-problem-summary">
              {problem.left} x {problem.right}
            </div>
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
