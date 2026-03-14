import { useState } from "react";
import type { DivisionSelection, Level, MultiplicationSelection, Screen } from "./types";
import LevelSelect from "./features/levels/LevelSelect";
import Practice from "./features/practice/Practice";
import Settings from "./features/settings/Settings";
import MathCategorySelect from "./features/math/MathCategorySelect";
import MultiplicationSelect from "./features/math/MultiplicationSelect";
import DivisionSelect from "./features/math/DivisionSelect";
import MathPractice from "./features/math/MathPractice";
import GeoSearch from "./features/geoSearch/GeoSearch";

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedMultiplication, setSelectedMultiplication] =
    useState<MultiplicationSelection | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<DivisionSelection | null>(null);

  const handleSelectLevel = (level: Level) => {
    setSelectedLevel(level);
    setScreen("practice");
  };

  const handleSelectMultiplication = (selection: MultiplicationSelection) => {
    setSelectedMultiplication(selection);
    setSelectedDivision(null);
    setScreen("math-practice");
  };

  const handleSelectDivision = (selection: DivisionSelection) => {
    setSelectedDivision(selection);
    setSelectedMultiplication(null);
    setScreen("math-practice");
  };

  return (
    <div className={`app ${screen === "geo-search" ? "app-wide" : ""}`.trim()}>
      {screen === "home" && (
        <div className="screen home">
          <div className="home-content">
            <h1 className="app-title">Spelling & Math Trainer</h1>
            <p className="app-subtitle">
              Build spelling, multiplication, division fluency, and explore member geography
            </p>
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
              <button
                className="btn btn-secondary btn-large"
                onClick={() => setScreen("geo-search")}
              >
                Member Geo Search
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
          onSelectDivision={() => setScreen("math-division")}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "math-multiplication" && (
        <MultiplicationSelect
          onSelect={handleSelectMultiplication}
          onBack={() => setScreen("math-categories")}
        />
      )}

      {screen === "math-division" && (
        <DivisionSelect
          onSelect={handleSelectDivision}
          onBack={() => setScreen("math-categories")}
        />
      )}

      {screen === "math-practice" && selectedMultiplication && (
        <MathPractice
          key={`${selectedMultiplication.leftDigits}-${selectedMultiplication.rightDigits}`}
          mode="multiplication"
          selection={selectedMultiplication}
          onBack={() => setScreen("math-multiplication")}
        />
      )}

      {screen === "math-practice" && selectedDivision && (
        <MathPractice
          key={`${selectedDivision.denominatorDigits}-${selectedDivision.answerDigits}`}
          mode="division"
          selection={selectedDivision}
          onBack={() => setScreen("math-division")}
        />
      )}

      {screen === "settings" && (
        <Settings onBack={() => setScreen("home")} />
      )}

      {screen === "geo-search" && <GeoSearch onBack={() => setScreen("home")} />}
    </div>
  );
}

export default App;
