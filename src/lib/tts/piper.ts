import { cancelAudioPlayback, isAudioPlaying, playBlob } from "./audio";
import type { SpeakOptions, TtsEngineAdapter, TtsVoiceOption } from "./types";

const DEFAULT_PIPER_VOICE = "en_US-hfc_female-medium";
const BASE = import.meta.env.BASE_URL;

const ENGLISH_PIPER_VOICES = [
  "en_US-hfc_female-medium",
  "en_US-lessac-high",
  "en_US-ryan-high",
  "en_GB-cori-high",
  "en_US-amy-medium",
];

const OFFLINE_VOICE_ASSET_MAP: Record<string, { model: string; config: string }> = {
  "en_US-hfc_female-medium": {
    model: `${BASE}tts/piper/models/en_US-hfc_female-medium.onnx`,
    config: `${BASE}tts/piper/models/en_US-hfc_female-medium.onnx.json`,
  },
  "en_US-lessac-high": {
    model: `${BASE}tts/piper/models/en_US-lessac-high.onnx`,
    config: `${BASE}tts/piper/models/en_US-lessac-high.onnx.json`,
  },
};

type PiperModule = typeof import("@mintplex-labs/piper-tts-web");

let piperModulePromise: Promise<PiperModule> | null = null;
let currentVoiceId: string | null = null;

function getPiperModule(): Promise<PiperModule> {
  if (!piperModulePromise) {
    piperModulePromise = import("@mintplex-labs/piper-tts-web");
  }
  return piperModulePromise;
}

async function ensureFileInOpfs(fileName: string, sourcePath: string): Promise<void> {
  const root = await navigator.storage.getDirectory();
  const piperDir = await root.getDirectoryHandle("piper", { create: true });

  try {
    await piperDir.getFileHandle(fileName);
    return;
  } catch {
    // Missing file - continue to copy from bundled asset.
  }

  const response = await fetch(sourcePath);
  if (!response.ok) {
    throw new Error(`Missing bundled Piper asset: ${sourcePath}`);
  }

  const fileHandle = await piperDir.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(await response.blob());
  await writable.close();
}

async function ensureVoiceAssets(voiceId: string): Promise<void> {
  const local = OFFLINE_VOICE_ASSET_MAP[voiceId];
  if (!local) {
    throw new Error(`No bundled Piper assets for voice "${voiceId}"`);
  }

  await ensureFileInOpfs(`${voiceId}.onnx`, local.model);
  await ensureFileInOpfs(`${voiceId}.onnx.json`, local.config);
}

export const piperTtsAdapter: TtsEngineAdapter = {
  id: "piper",
  isAvailable(): boolean {
    return "storage" in navigator && "getDirectory" in navigator.storage;
  },
  async listVoices(): Promise<TtsVoiceOption[]> {
    return ENGLISH_PIPER_VOICES.map((voiceId) => ({
      id: voiceId,
      label: voiceId.replace(/_/g, " "),
      engine: "piper",
    }));
  },
  async speak(text: string, options: SpeakOptions = {}): Promise<void> {
    const piper = await getPiperModule();
    const voiceId = options.voiceId ?? DEFAULT_PIPER_VOICE;

    await ensureVoiceAssets(voiceId);

    if (currentVoiceId !== voiceId) {
      (piper.TtsSession as unknown as { _instance: unknown })._instance = null;
      currentVoiceId = voiceId;
    }

    const session = await piper.TtsSession.create({
      voiceId,
      wasmPaths: {
        onnxWasm: `${BASE}tts/onnx/`,
        piperData: `${BASE}tts/piper/runtime/piper_phonemize.data`,
        piperWasm: `${BASE}tts/piper/runtime/piper_phonemize.wasm`,
      },
    });

    const audio = await session.predict(text);
    await playBlob(audio);
  },
  cancel(): void {
    cancelAudioPlayback();
  },
  isSpeaking(): boolean {
    return isAudioPlaying();
  },
};
