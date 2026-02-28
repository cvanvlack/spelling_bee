import { kokoroTtsAdapter } from "./kokoro";
import { nativeTtsAdapter } from "./native";
import { piperTtsAdapter } from "./piper";
import type { SpeakOptions, TtsEngineAdapter, TtsEngineId, TtsVoiceOption } from "./types";

export type { TtsEngineId, TtsVoiceOption } from "./types";

const adapters: Record<TtsEngineId, TtsEngineAdapter> = {
  native: nativeTtsAdapter,
  piper: piperTtsAdapter,
  kokoro: kokoroTtsAdapter,
};

export interface SpeakWithEngineOptions extends SpeakOptions {
  preferredEngine: TtsEngineId;
  fallbackToNative?: boolean;
}

export interface SpeakResult {
  engineUsed: TtsEngineId;
  fallbackReason: string | null;
}

function resolveEngine(preferred: TtsEngineId): TtsEngineAdapter {
  const adapter = adapters[preferred];
  if (adapter.isAvailable()) {
    return adapter;
  }
  return nativeTtsAdapter;
}

export async function listVoices(engine: TtsEngineId): Promise<TtsVoiceOption[]> {
  const adapter = resolveEngine(engine);
  return adapter.listVoices();
}

export function getAvailableEngines(): Array<{ id: TtsEngineId; label: string; available: boolean }> {
  return [
    { id: "native", label: "Native Browser", available: adapters.native.isAvailable() },
    { id: "piper", label: "Piper (Local Model)", available: adapters.piper.isAvailable() },
    { id: "kokoro", label: "Kokoro (Local Model)", available: adapters.kokoro.isAvailable() },
  ];
}

export async function speak(text: string, options: SpeakWithEngineOptions): Promise<SpeakResult> {
  const preferredAdapter = resolveEngine(options.preferredEngine);

  try {
    cancel();
    await preferredAdapter.speak(text, options);
    return { engineUsed: preferredAdapter.id, fallbackReason: null };
  } catch (error) {
    if (options.fallbackToNative === false || preferredAdapter.id === "native") {
      throw error;
    }
    cancel();
    await nativeTtsAdapter.speak(text, options);
    return {
      engineUsed: "native",
      fallbackReason: `${preferredAdapter.id} engine unavailable, using native voice`,
    };
  }
}

export function cancel(): void {
  nativeTtsAdapter.cancel();
  piperTtsAdapter.cancel();
  kokoroTtsAdapter.cancel();
}

export function isSpeaking(engine: TtsEngineId): boolean {
  return resolveEngine(engine).isSpeaking();
}
