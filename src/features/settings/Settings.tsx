import { useEffect, useState } from "react";
import { loadVoices } from "../../lib/tts";
import { getSettings, saveSettings } from "../../lib/storage";

function getInitialSettings() {
  return getSettings();
}

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [initial] = useState(getInitialSettings);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(initial.voiceURI);
  const [normalRate, setNormalRate] = useState(initial.normalRate);
  const [slowRate, setSlowRate] = useState(initial.slowRate);

  useEffect(() => {
    loadVoices().then((v) => setVoices(v));
  }, []);

  const handleVoiceChange = (uri: string) => {
    setSelectedVoiceURI(uri || null);
    saveSettings({ voiceURI: uri || null });
  };

  const handleNormalRateChange = (val: number) => {
    setNormalRate(val);
    saveSettings({ normalRate: val });
  };

  const handleSlowRateChange = (val: number) => {
    setSlowRate(val);
    saveSettings({ slowRate: val });
  };

  return (
    <div className="screen settings">
      <h1>Settings</h1>

      <div className="settings-group">
        <label className="settings-label">Voice</label>
        <select
          className="settings-select"
          value={selectedVoiceURI || ""}
          onChange={(e) => handleVoiceChange(e.target.value)}
        >
          <option value="">System Default</option>
          {voices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
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
