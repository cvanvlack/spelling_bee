export type TtsEngineId = "native" | "piper" | "kokoro";

export interface TtsVoiceOption {
  id: string;
  label: string;
  engine: TtsEngineId;
}

export interface SpeakOptions {
  rate?: number;
  voiceId?: string | null;
}

export interface TtsEngineAdapter {
  id: TtsEngineId;
  isAvailable(): boolean;
  listVoices(): Promise<TtsVoiceOption[]>;
  speak(text: string, options?: SpeakOptions): Promise<void>;
  cancel(): void;
  isSpeaking(): boolean;
}
