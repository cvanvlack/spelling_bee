function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const pcm = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i += 1) {
    const value = Math.max(-1, Math.min(1, samples[i]));
    pcm[i] = value < 0 ? value * 0x8000 : value * 0x7fff;
  }

  const headerSize = 44;
  const dataSize = pcm.length * 2;
  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);

  view.setUint32(0, 0x46464952, true); // "RIFF"
  view.setUint32(4, 36 + dataSize, true);
  view.setUint32(8, 0x45564157, true); // "WAVE"
  view.setUint32(12, 0x20746d66, true); // "fmt "
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 0x61746164, true); // "data"
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < pcm.length; i += 1) {
    view.setInt16(offset, pcm[i], true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

export async function toPlayableBlob(value: unknown): Promise<Blob> {
  if (value instanceof Blob) {
    return value;
  }

  const maybe = value as {
    toBlob?: () => Blob | Promise<Blob>;
    toWav?: () => Uint8Array | ArrayBuffer;
    data?: Float32Array;
    sampling_rate?: number;
    audio?: Float32Array;
  };

  if (maybe?.toBlob) {
    const blob = await maybe.toBlob();
    if (blob instanceof Blob) {
      return blob;
    }
  }

  if (maybe?.toWav) {
    const wav = maybe.toWav();
    if (wav instanceof Uint8Array) {
      return new Blob([new Uint8Array(wav)], {
        type: "audio/wav",
      });
    }
    return new Blob([wav], { type: "audio/wav" });
  }

  const samples = maybe?.audio ?? maybe?.data;
  if (samples instanceof Float32Array && typeof maybe?.sampling_rate === "number") {
    return encodeWav(samples, maybe.sampling_rate);
  }

  throw new Error("Unsupported TTS audio output format.");
}

let activeAudio: HTMLAudioElement | null = null;

export function cancelAudioPlayback(): void {
  if (!activeAudio) return;
  activeAudio.pause();
  activeAudio.currentTime = 0;
  activeAudio = null;
}

export function isAudioPlaying(): boolean {
  return Boolean(activeAudio && !activeAudio.paused);
}

export async function playBlob(blob: Blob): Promise<void> {
  cancelAudioPlayback();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  activeAudio = audio;

  try {
    await audio.play();
  } finally {
    audio.onended = () => {
      URL.revokeObjectURL(url);
      if (activeAudio === audio) {
        activeAudio = null;
      }
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      if (activeAudio === audio) {
        activeAudio = null;
      }
    };
  }
}
