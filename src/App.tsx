import { useState } from "react";
import type { Level, Screen } from "./types";
import LevelSelect from "./features/levels/LevelSelect";
import Practice from "./features/practice/Practice";
import Settings from "./features/settings/Settings";

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const handleSelectLevel = (level: Level) => {
    setSelectedLevel(level);
    setScreen("practice");
  };

  return (
    <div className="app">
      {screen === "home" && (
        <div className="screen home">
          <div className="home-content">
            <h1 className="app-title">Spelling Trainer</h1>
            <p className="app-subtitle">Build your spelling fluency</p>
            <div className="home-buttons">
              <button
                className="btn btn-primary btn-huge"
                onClick={() => setScreen("levels")}
              >
                Start
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

      {screen === "settings" && (
        <Settings onBack={() => setScreen("home")} />
      )}
    </div>
  );
}

export default App;
