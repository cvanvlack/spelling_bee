import { useState } from "react";
import type { Level, MultiplicationSelection, Screen } from "./types";
import LevelSelect from "./features/levels/LevelSelect";
import Practice from "./features/practice/Practice";
import Settings from "./features/settings/Settings";
import MathCategorySelect from "./features/math/MathCategorySelect";
import MultiplicationSelect from "./features/math/MultiplicationSelect";
import MathPractice from "./features/math/MathPractice";

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedMultiplication, setSelectedMultiplication] =
    useState<MultiplicationSelection | null>(null);

  const handleSelectLevel = (level: Level) => {
    setSelectedLevel(level);
    setScreen("practice");
  };

  const handleSelectMultiplication = (selection: MultiplicationSelection) => {
    setSelectedMultiplication(selection);
    setScreen("math-practice");
  };

  return (
    <div className="app">
      {screen === "home" && (
        <div className="screen home">
          <div className="home-content">
            <h1 className="app-title">Spelling & Math Trainer</h1>
            <p className="app-subtitle">Build spelling and multiplication fluency</p>
            <div className="home-buttons">
              <button
                className="btn btn-primary btn-huge"
                onClick={() => setScreen("levels")}
              >
                Spelling
              </button>
              <button
                className="btn btn-primary btn-huge"
                onClick={() => setScreen("math-categories")}
              >
                Math
              </button>
              <button
                className="btn btn-secondary btn-large"
                onClick={() => setScreen("settings")}
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {screen === "levels" && (
        <LevelSelect
          onSelectLevel={handleSelectLevel}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "practice" && selectedLevel && (
        <Practice
          level={selectedLevel}
          onBack={() => setScreen("levels")}
        />
      )}

      {screen === "math-categories" && (
        <MathCategorySelect
          onSelectMultiplication={() => setScreen("math-multiplication")}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "math-multiplication" && (
        <MultiplicationSelect
          onSelect={handleSelectMultiplication}
          onBack={() => setScreen("math-categories")}
        />
      )}

      {screen === "math-practice" && selectedMultiplication && (
        <MathPractice
          key={`${selectedMultiplication.leftDigits}-${selectedMultiplication.rightDigits}`}
          selection={selectedMultiplication}
          onBack={() => setScreen("math-multiplication")}
        />
      )}

      {screen === "settings" && (
        <Settings onBack={() => setScreen("home")} />
      )}
    </div>
  );
}

export default App;
