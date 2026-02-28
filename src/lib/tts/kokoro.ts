import { cancelAudioPlayback, isAudioPlaying, playBlob, toPlayableBlob } from "./audio";
import type { SpeakOptions, TtsEngineAdapter, TtsVoiceOption } from "./types";

const BASE = import.meta.env.BASE_URL;
const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";
const DEFAULT_KOKORO_VOICE = "af_bella";

const POPULAR_KOKORO_VOICES = [
  "af_bella",
  "af_heart",
  "bf_emma",
  "am_michael",
  "bm_george",
] as const;

type KokoroModule = typeof import("kokoro-js");
type KokoroModel = Awaited<ReturnType<KokoroModule["KokoroTTS"]["from_pretrained"]>>;

let kokoroModulePromise: Promise<KokoroModule> | null = null;
let kokoroModelPromise: Promise<KokoroModel> | null = null;

function getKokoroModule(): Promise<KokoroModule> {
  if (!kokoroModulePromise) {
    kokoroModulePromise = import("kokoro-js");
  }
  return kokoroModulePromise;
}

async function getKokoroModel(): Promise<KokoroModel> {
  if (!kokoroModelPromise) {
    kokoroModelPromise = (async () => {
      const [{ KokoroTTS }, { env }] = await Promise.all([
        getKokoroModule(),
        import("@huggingface/transformers"),
      ]);

      env.allowLocalModels = true;
      env.allowRemoteModels = false;
      env.useBrowserCache = true;
      env.localModelPath = `${location.origin}${BASE}tts/kokoro/models/`;
      if (env.backends?.onnx?.wasm) {
        env.backends.onnx.wasm.wasmPaths = `${BASE}tts/onnx/`;
      }

      const supportsWebGpu = typeof navigator !== "undefined" && "gpu" in navigator;
      return KokoroTTS.from_pretrained(MODEL_ID, {
        dtype: supportsWebGpu ? "fp32" : "q8",
        device: supportsWebGpu ? "webgpu" : "wasm",
      });
    })();
  }

  return kokoroModelPromise;
}

export const kokoroTtsAdapter: TtsEngineAdapter = {
  id: "kokoro",
  isAvailable(): boolean {
    return typeof Worker !== "undefined";
  },
  async listVoices(): Promise<TtsVoiceOption[]> {
    try {
      const model = await getKokoroModel();
      return Object.entries(model.voices)
        .filter(([, metadata]) => metadata.language === "en-us" || metadata.language === "en-gb")
        .map(([voiceId, metadata]) => ({
          id: voiceId,
          label: `${metadata.name} (${metadata.language.toUpperCase()})`,
          engine: "kokoro",
        }));
    } catch {
      return POPULAR_KOKORO_VOICES.map((voiceId) => ({
        id: voiceId,
        label: voiceId,
        engine: "kokoro",
      }));
    }
  },
  async speak(text: string, options: SpeakOptions = {}): Promise<void> {
    const model = await getKokoroModel();
    const voice = options.voiceId ?? DEFAULT_KOKORO_VOICE;
    const audio = await model.generate(text, {
      voice: voice as never,
      speed: options.rate ?? 1.0,
    });
    const playable = await toPlayableBlob(audio);
    await playBlob(playable);
  },
  cancel(): void {
    cancelAudioPlayback();
  },
  isSpeaking(): boolean {
    return isAudioPlaying();
  },
};
