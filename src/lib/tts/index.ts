// Text-to-Speech wrapper using window.speechSynthesis
// Works offline using system voices

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function getVoices(): SpeechSynthesisVoice[] {
  return window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
}

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(getVoices());
    };
    // Fallback timeout
    setTimeout(() => resolve(getVoices()), 1000);
  });
}

export function speak(
  word: string,
  options: {
    rate?: number;
    voice?: SpeechSynthesisVoice | null;
  } = {}
): void {
  cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = options.rate ?? 1.0;
  utterance.lang = "en-US";
  if (options.voice) {
    utterance.voice = options.voice;
  }
  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function cancel(): void {
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  return window.speechSynthesis.speaking;
}

export { currentUtterance };
