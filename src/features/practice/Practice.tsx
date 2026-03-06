import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import type { Level, Word } from "../../types";
import { speak } from "../../lib/tts";
import {
  getProgress,
  getSettings,
  getWordResults,
  markWordResult,
  type WordResult,
} from "../../lib/storage";
import { buildQueue, nextWord } from "../../lib/shuffle";
import type { WordQueue } from "../../lib/shuffle";

interface PracticeProps {
  level: Level;
  onBack: () => void;
}

export default function Practice({ level, onBack }: PracticeProps) {
  const allWords = useMemo(() => level.words.map((w) => w.text), [level.words]);
  const wordsByText = useMemo(() => new Map(level.words.map((word) => [word.text, word])), [level.words]);
  const queueRef = useRef<WordQueue | null>(null);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showDefinition, setShowDefinition] = useState(false);
  const [slowMode, setSlowMode] = useState(false);
  const [progress, setProgress] = useState(() => getProgress(level.id, allWords.length));

  const refreshProgress = useCallback(() => {
    setProgress(getProgress(level.id, allWords.length));
  }, [level.id, allWords.length]);

  const advanceToNext = useCallback(() => {
    const results = getWordResults(level.id);
    if (!queueRef.current) {
      queueRef.current = buildQueue(allWords, results);
    }
    const { word, updatedQueue } = nextWord(queueRef.current, allWords, results);
    queueRef.current = updatedQueue;
    setCurrentWord(wordsByText.get(word) ?? { text: word });
    setRevealed(false);
    setShowDefinition(false);
    refreshProgress();
  }, [level.id, allWords, wordsByText, refreshProgress]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      advanceToNext();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [advanceToNext]);

  const getVoiceId = useCallback((): string | null => {
    const settings = getSettings();
    if (settings.ttsEngine === "native") return settings.nativeVoiceURI;
    if (settings.ttsEngine === "piper") return settings.piperVoiceId;
    return settings.kokoroVoiceId;
  }, []);

  const getRate = useCallback(
    (slow: boolean): number => {
      const settings = getSettings();
      return slow ? settings.slowRate : settings.normalRate;
    },
    []
  );

  const handleSpeak = useCallback(async () => {
    if (!currentWord?.text) return;
    const settings = getSettings();
    try {
      await speak(currentWord.text, {
        preferredEngine: settings.ttsEngine,
        rate: getRate(slowMode),
        voiceId: getVoiceId(),
      });
    } catch (error) {
      console.error("TTS failed:", error);
    }
  }, [currentWord, slowMode, getRate, getVoiceId]);

  const handleReadSentence = useCallback(async () => {
    if (!currentWord?.sentence) return;
    const settings = getSettings();
    try {
      await speak(currentWord.sentence, {
        preferredEngine: settings.ttsEngine,
        rate: getRate(slowMode),
        voiceId: getVoiceId(),
      });
    } catch (error) {
      console.error("TTS sentence playback failed:", error);
    }
  }, [currentWord, slowMode, getRate, getVoiceId]);

  const handleRepeat = useCallback(() => {
    void handleSpeak();
  }, [handleSpeak]);

  const handleReveal = useCallback(() => {
    if (!currentWord?.text) return;
    setRevealed(true);
    setShowDefinition(false);
  }, [currentWord]);

  const handleRecordResult = useCallback((result: WordResult) => {
    if (!currentWord?.text) return;
    markWordResult(level.id, currentWord.text, result);
    advanceToNext();
  }, [level.id, currentWord, advanceToNext]);

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
              {progress.percentage}% mastered ({progress.correct}/{progress.total})
              {progress.incorrect > 0 ? ` • ${progress.incorrect} to review` : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="practice-main">
        {!revealed ? (
          <>
            <div className="practice-controls">
              <button className="btn btn-primary btn-huge" onClick={() => void handleSpeak()}>
                🔊 Speak
              </button>
              {currentWord?.sentence ? (
                <button className="btn btn-primary btn-large" onClick={() => void handleReadSentence()}>
                  📖 Read sentence
                </button>
              ) : null}
              <button className="btn btn-primary btn-large" onClick={() => void handleRepeat()}>
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
            <div className="revealed-word">{currentWord?.text}</div>
            {currentWord?.definition ? (
              <>
                <button
                  className="btn btn-secondary btn-large"
                  onClick={() => setShowDefinition((show) => !show)}
                >
                  {showDefinition ? "Hide definition" : "Show definition"}
                </button>
                {showDefinition ? (
                  <div className="definition-card">
                    <p className="definition-text">{currentWord.definition}</p>
                  </div>
                ) : null}
              </>
            ) : null}
            <div className="outcome-prompt">How did you do?</div>
            <div className="outcome-actions">
              <button className="btn btn-success btn-large" onClick={() => handleRecordResult("correct")}>
                I got it right →
              </button>
              <button className="btn btn-danger btn-large" onClick={() => handleRecordResult("incorrect")}>
                I got it wrong →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
