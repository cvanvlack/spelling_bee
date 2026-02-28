import { useEffect, useMemo, useState } from "react";
import { getAvailableEngines, listVoices, speak } from "../../lib/tts";
import { getSettings, saveSettings } from "../../lib/storage";
import type { TtsEngineId, TtsVoiceOption } from "../../lib/tts";

function getInitialSettings() {
  return getSettings();
}

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const [initial] = useState(getInitialSettings);
  const [ttsEngine, setTtsEngine] = useState<TtsEngineId>(initial.ttsEngine);
  const [voices, setVoices] = useState<TtsVoiceOption[]>([]);
  const [nativeVoiceURI, setNativeVoiceURI] = useState<string | null>(initial.nativeVoiceURI);
  const [piperVoiceId, setPiperVoiceId] = useState<string | null>(initial.piperVoiceId);
  const [kokoroVoiceId, setKokoroVoiceId] = useState<string | null>(initial.kokoroVoiceId);
  const [normalRate, setNormalRate] = useState(initial.normalRate);
  const [slowRate, setSlowRate] = useState(initial.slowRate);
  const [engineStatus, setEngineStatus] = useState<string | null>(null);

  useEffect(() => {
    listVoices(ttsEngine)
      .then((result) => setVoices(result))
      .catch(() => setVoices([]));
  }, [ttsEngine]);

  const selectedVoiceId = useMemo(() => {
    if (ttsEngine === "native") return nativeVoiceURI;
    if (ttsEngine === "piper") return piperVoiceId;
    return kokoroVoiceId;
  }, [ttsEngine, nativeVoiceURI, piperVoiceId, kokoroVoiceId]);

  const setSelectedVoice = (voiceId: string) => {
    const value = voiceId || null;
    if (ttsEngine === "native") {
      setNativeVoiceURI(value);
      saveSettings({ nativeVoiceURI: value });
    } else if (ttsEngine === "piper") {
      setPiperVoiceId(value);
      saveSettings({ piperVoiceId: value });
    } else {
      setKokoroVoiceId(value);
      saveSettings({ kokoroVoiceId: value });
    }
  };

  const handleEngineChange = (value: string) => {
    const engine = value as TtsEngineId;
    setTtsEngine(engine);
    setEngineStatus(null);
    saveSettings({ ttsEngine: engine });
  };

  const handleNormalRateChange = (val: number) => {
    setNormalRate(val);
    saveSettings({ normalRate: val });
  };

  const handleSlowRateChange = (val: number) => {
    setSlowRate(val);
    saveSettings({ slowRate: val });
  };

  const handleTestVoice = async () => {
    setEngineStatus("Testing selected voice...");
    try {
      const result = await speak("Spelling trainer voice test.", {
        preferredEngine: ttsEngine,
        voiceId: selectedVoiceId,
        rate: normalRate,
      });
      if (result.fallbackReason) {
        setEngineStatus(result.fallbackReason);
        return;
      }
      setEngineStatus(`Using ${result.engineUsed} voice playback.`);
    } catch (error) {
      console.error("TTS test failed:", error);
      setEngineStatus("Voice test failed. Check local model assets or use Native Browser engine.");
    }
  };

  const engines = getAvailableEngines();

  return (
    <div className="screen settings">
      <h1>Settings</h1>

      <div className="settings-group">
        <label className="settings-label">TTS Engine</label>
        <select
          className="settings-select"
          value={ttsEngine}
          onChange={(e) => handleEngineChange(e.target.value)}
        >
          {engines.map((engine) => (
            <option key={engine.id} value={engine.id} disabled={!engine.available}>
              {engine.label}
              {!engine.available ? " (Unavailable)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="settings-group">
        <label className="settings-label">Voice / Model</label>
        <select
          className="settings-select"
          value={selectedVoiceId || ""}
          onChange={(e) => setSelectedVoice(e.target.value)}
        >
          <option value="">Default</option>
          {voices.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      <div className="settings-group">
        <button className="btn btn-primary btn-large" onClick={() => void handleTestVoice()}>
          Test voice
        </button>
        {engineStatus ? <p className="settings-help">{engineStatus}</p> : null}
      </div>

      <div className="settings-group">
        <label className="settings-label">
          Normal Speed: {normalRate.toFixed(1)}x
        </label>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={normalRate}
          onChange={(e) => handleNormalRateChange(parseFloat(e.target.value))}
          className="settings-range"
        />
      </div>

      <div className="settings-group">
        <label className="settings-label">
          Slow Speed: {slowRate.toFixed(1)}x
        </label>
        <input
          type="range"
          min="0.3"
          max="1.0"
          step="0.1"
          value={slowRate}
          onChange={(e) => handleSlowRateChange(parseFloat(e.target.value))}
          className="settings-range"
        />
      </div>

      <button className="btn btn-secondary back-btn" onClick={onBack}>
        Back
      </button>
    </div>
  );
}
