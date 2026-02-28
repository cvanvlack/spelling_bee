import type { SpeakOptions, TtsEngineAdapter, TtsVoiceOption } from "./types";

function listEnglishVoices(): SpeechSynthesisVoice[] {
  return window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
}

export const nativeTtsAdapter: TtsEngineAdapter = {
  id: "native",
  isAvailable() {
    return "speechSynthesis" in window;
  },
  async listVoices(): Promise<TtsVoiceOption[]> {
    return listEnglishVoices().map((voice) => ({
      id: voice.voiceURI,
      label: `${voice.name} (${voice.lang})`,
      engine: "native",
    }));
  },
  async speak(text: string, options: SpeakOptions = {}): Promise<void> {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 1.0;
    utterance.lang = "en-US";

    if (options.voiceId) {
      const selected = listEnglishVoices().find((voice) => voice.voiceURI === options.voiceId);
      if (selected) {
        utterance.voice = selected;
      }
    }

    window.speechSynthesis.speak(utterance);
  },
  cancel(): void {
    window.speechSynthesis.cancel();
  },
  isSpeaking(): boolean {
    return window.speechSynthesis.speaking;
  },
};
