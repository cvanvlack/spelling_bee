This folder holds bundled local TTS assets for offline playback.

The app is wired to load these paths:
- `tts/piper/runtime/piper_phonemize.wasm`
- `tts/piper/runtime/piper_phonemize.data`
- `tts/piper/models/*.onnx`
- `tts/piper/models/*.onnx.json`
- `tts/kokoro/models/onnx-community/Kokoro-82M-v1.0-ONNX/*`

To ship production-quality offline voices, replace placeholder files in this folder
with the real model/runtime artifacts and keep the same filenames.
