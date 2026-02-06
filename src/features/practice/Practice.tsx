import { useEffect, useState, useCallback, useRef } from "react";
import type { Level } from "../../types";
import { speak } from "../../lib/tts";
import { markAttempted, getAttemptedSet, getProgress, getSettings } from "../../lib/storage";
import { buildQueue, nextWord } from "../../lib/shuffle";
import type { WordQueue } from "../../lib/shuffle";

interface PracticeProps {
  level: Level;
  onBack: () => void;
}

export default function Practice({ level, onBack }: PracticeProps) {
  const allWords = useRef(level.words.map((w) => w.text));
  const [currentWord, setCurrentWord] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [slowMode, setSlowMode] = useState(false);
  const [progress, setProgress] = useState({ attempted: 0, total: 0, percentage: 0 });
  const queueRef = useRef<WordQueue | null>(null);

  const refreshProgress = useCallback(() => {
    setProgress(getProgress(level.id, allWords.current.length));
  }, [level.id]);

  const advanceToNext = useCallback(() => {
    const attempted = getAttemptedSet(level.id);
    if (!queueRef.current) {
      queueRef.current = buildQueue(allWords.current, attempted);
    }
    const { word, updatedQueue } = nextWord(queueRef.current, allWords.current, attempted);
    queueRef.current = updatedQueue;
    setCurrentWord(word);
    setRevealed(false);
    refreshProgress();
  }, [level.id, refreshProgress]);

  // Initialize
  useEffect(() => {
    advanceToNext();
  }, [advanceToNext]);

  const getVoice = useCallback((): SpeechSynthesisVoice | null => {
    const settings = getSettings();
    if (settings.voiceURI) {
      const voices = window.speechSynthesis.getVoices();
      return voices.find((v) => v.voiceURI === settings.voiceURI) || null;
    }
    return null;
  }, []);

  const getRate = useCallback(
    (slow: boolean): number => {
      const settings = getSettings();
      return slow ? settings.slowRate : settings.normalRate;
    },
    []
  );

  const handleSpeak = useCallback(() => {
    if (!currentWord) return;
    speak(currentWord, { rate: getRate(slowMode), voice: getVoice() });
  }, [currentWord, slowMode, getRate, getVoice]);

  const handleRepeat = useCallback(() => {
    handleSpeak();
  }, [handleSpeak]);

  const handleReveal = useCallback(() => {
    markAttempted(level.id, currentWord);
    setRevealed(true);
    refreshProgress();
  }, [level.id, currentWord, refreshProgress]);

  const handleNext = useCallback(() => {
    advanceToNext();
  }, [advanceToNext]);

  return (
    <div className="screen practice">
      <div className="practice-header">
        <button className="btn btn-small btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <div className="practice-info">
          <h2>{level.name} Words</h2>
          <div className="practice-progress">
            <div className="progress-bar progress-bar-small">
              <div
                className="progress-fill"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <span className="progress-text-small">
              {progress.percentage}% ({progress.attempted}/{progress.total})
            </span>
          </div>
        </div>
      </div>

      <div className="practice-main">
        {!revealed ? (
          <>
            <div className="practice-controls">
              <button className="btn btn-primary btn-huge" onClick={handleSpeak}>
                🔊 Speak
              </button>
              <button className="btn btn-primary btn-large" onClick={handleRepeat}>
                🔁 Repeat
              </button>
              <button
                className={`btn btn-toggle ${slowMode ? "btn-active" : ""}`}
                onClick={() => setSlowMode((s) => !s)}
              >
                🐢 Slow {slowMode ? "ON" : "OFF"}
              </button>
            </div>
            <div className="practice-reveal">
              <button className="btn btn-reveal" onClick={handleReveal}>
                Reveal
              </button>
            </div>
          </>
        ) : (
          <div className="practice-revealed">
            <div className="revealed-word">{currentWord}</div>
            <button className="btn btn-primary btn-huge" onClick={handleNext}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
