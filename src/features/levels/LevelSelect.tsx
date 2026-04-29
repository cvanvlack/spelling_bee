import { useEffect, useState } from "react";
import type { Level } from "../../types";
import { loadWordLists } from "../../lib/data";
import { getProgress } from "../../lib/storage";
import ScreenHeader from "../../components/ScreenHeader";

interface LevelSelectProps {
  onSelectLevel: (level: Level) => void;
  onBack: () => void;
}

export default function LevelSelect({ onSelectLevel, onBack }: LevelSelectProps) {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWordLists().then((data) => {
      setLevels(data.levels);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="screen loading">Loading...</div>;
  }

  const levelLabels: Record<string, string> = {
    level1: "Very Common",
    level2: "Common",
    level3: "School",
    level4: "Advanced",
    level5: "Rare",
  };

  return (
    <div className="screen level-select">
      <ScreenHeader title="Choose a Level" onBack={onBack} />
      <div className="level-list">
        {levels.map((level, i) => {
          const progress = getProgress(level.id, level.words.length);
          return (
            <button
              key={level.id}
              className="level-card"
              onClick={() => onSelectLevel(level)}
            >
              <div className="level-card-header">
                <span className="level-number">Level {i + 1}</span>
                <span className="level-name">{levelLabels[level.id] || level.name}</span>
              </div>
              <div className="level-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <span className="progress-text">
                  {progress.percentage}% mastered ({progress.correct} / {progress.total} words)
                  {progress.incorrect > 0 ? ` • ${progress.incorrect} to review` : ""}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
