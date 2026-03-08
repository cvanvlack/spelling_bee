import { useCallback, useState } from "react";
import type {
  DivisionProblem,
  DivisionSelection,
  FractionProblem,
  FractionSelection,
  MultiplicationProblem,
  MultiplicationSelection,
} from "../../types";
import {
  generateDivisionProblem,
  generateFractionProblem,
  generateMultiplicationProblem,
  getDivisionLabel,
  getFractionLabel,
  getFractionProblemText,
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
    }
  | {
      mode: "fractions";
      selection: FractionSelection;
      onBack: () => void;
    };

type MathProblem = MultiplicationProblem | DivisionProblem | FractionProblem;

function createProblem(props: MathPracticeProps): MathProblem {
  switch (props.mode) {
    case "multiplication":
      return generateMultiplicationProblem(props.selection);
    case "division":
      return generateDivisionProblem(props.selection);
    case "fractions":
      return generateFractionProblem(props.selection);
  }
}

function getHeading(mode: MathPracticeProps["mode"]): string {
  switch (mode) {
    case "multiplication":
      return "Multiplication";
    case "division":
      return "Whole Number Division";
    case "fractions":
      return "Fractions";
  }
}

function getSubtitle(props: MathPracticeProps): string {
  switch (props.mode) {
    case "multiplication":
      return getMultiplicationLabel(props.selection);
    case "division":
      return getDivisionLabel(props.selection);
    case "fractions":
      return getFractionLabel(props.selection);
  }
}

function getProblemText(mode: MathPracticeProps["mode"], problem: MathProblem): string {
  switch (mode) {
    case "multiplication":
      return `${(problem as MultiplicationProblem).left} x ${(problem as MultiplicationProblem).right}`;
    case "division":
      return `${(problem as DivisionProblem).dividend} ÷ ${(problem as DivisionProblem).denominator}`;
    case "fractions":
      return getFractionProblemText(problem as FractionProblem);
  }
}

function getAnswerText(mode: MathPracticeProps["mode"], problem: MathProblem): string {
  return mode === "fractions" ? (problem as FractionProblem).answer : `${problem.answer}`;
}

export default function MathPractice(props: MathPracticeProps) {
  const { mode, onBack } = props;
  const [problem, setProblem] = useState<MathProblem>(() => createProblem(props));
  const [revealed, setRevealed] = useState(false);
  const [problemCount, setProblemCount] = useState(1);

  const loadNextProblem = useCallback(() => {
    setProblem(createProblem(props));
    setRevealed(false);
    setProblemCount((count) => count + 1);
  }, [props]);

  const heading = getHeading(mode);
  const subtitle = getSubtitle(props);
  const problemText = getProblemText(mode, problem);
  const answerText = getAnswerText(mode, problem);

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
            <div className="revealed-word">{answerText}</div>
            <button className="btn btn-primary btn-huge" onClick={loadNextProblem}>
              Next Problem →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
