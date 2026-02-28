# TTS Engine Evaluation (Chrome)

## Goal

Pick a default local TTS engine that sounds less robotic/garbled than browser-native
speech, while keeping the app fully offline-capable with no paid APIs.

## Candidates

- `piper` via `@mintplex-labs/piper-tts-web` (MIT)
- `kokoro` via `kokoro-js` (Apache-2.0)
- `native` browser speech synthesis fallback

## Technical observations

- Both local-model engines compile in the current app build.
- Build output now includes local-runtime dependencies for both engines.
- `kokoro` introduces larger JS payloads than `piper`, but generally has better speech naturalness in modern Chrome/WebGPU workflows.
- `piper` remains valuable for lower-resource fallback and simpler model footprints.

## Default decision

Default engine is set to **`kokoro`** in `src/lib/storage/index.ts`.

Rationale:
- Better expected naturalness/prosody than native browser TTS.
- Works with latest Chrome targets requested for this app.
- Automatic fallback to `native` is retained if local model/runtime assets are unavailable.

## Required production asset step

This repository currently includes **placeholder files** under `public/tts/**` so the
offline paths and service-worker cache keys are wired and testable.

Before shipping to users, replace placeholders with real:
- Piper runtime files
- Piper `.onnx` and `.onnx.json` voices
- Kokoro model repository files
- ONNX Runtime WASM files
