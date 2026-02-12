# Spelling Assistant (Kids) - Implementation Plan

An offline-first PWA that trains spelling fluency using difficulty levels and a large word dictionary.

---

## Step 1: Project Scaffolding

- Initialize Vite + React + TypeScript project
- Set up directory structure per spec:
  - `/public/icons/`, `/public/data/`
  - `/src/features/levels/`, `/src/features/practice/`
  - `/src/lib/tts/`, `/src/lib/storage/`, `/src/lib/shuffle/`
- Install zero external runtime dependencies (only dev tooling)

## Step 2: Word List Data

- Build `/public/data/wordlists.json` with 5 levels
- Target a large dictionary (~5,000+ unique words total):
  - **Level 1 - Very Common**: ~500 words (Dolch + Fry sight words, top frequency words)
  - **Level 2 - Common**: ~1,000 words (everyday English, top 2k frequency)
  - **Level 3 - School**: ~1,200 words (school-level vocabulary, grades 3-6)
  - **Level 4 - Advanced**: ~1,200 words (upper school / adult vocabulary)
  - **Level 5 - Rare**: ~1,100 words (challenging, uncommon, SAT-level words)
- All words static JSON, no dynamic fetching
- Each word object has at minimum `{ "text": "word" }`

## Step 3: Core Libraries

### TTS (`/src/lib/tts/`)
- Wrapper around `window.speechSynthesis`
- `speak(word, rate)` function
- Support for Speak, Repeat, and Slow toggle
- Uses device system voices (works offline)

### Storage (`/src/lib/storage/`)
- LocalStorage-based progress tracking
- `markAttempted(levelId, word)` - marks a word as seen
- `getAttemptedSet(levelId)` - returns set of attempted words
- `getProgress(levelId, totalWords)` - returns count and percentage
- Settings persistence (voice, rates)

### Shuffle (`/src/lib/shuffle/`)
- Fisher-Yates shuffle
- Queue logic: `shuffle(allWords - attempted)`, if empty `shuffle(allWords)`
- Returns next word from queue

## Step 4: UI Screens

### Home Screen
- Large "Start" button
- "Settings" button
- Clean, child-friendly layout

### Level Select Screen
- Vertical list of 5 levels
- Each shows: level name, word count, progress percentage
- Tap to enter practice

### Practice Screen (Main Loop)
- Top: level name + progress indicator
- Middle: large Speak / Repeat buttons, Slow toggle
- Bottom: Reveal button
- After reveal: word displayed in very large text, then Next button
- No timers, no scoring, no gamification

### Settings Screen
- Voice selector (lists available system voices)
- Normal speech rate slider (default 1.0)
- Slow speech rate slider (default 0.7)

## Step 5: PWA + Offline Support

- Create `manifest.webmanifest` with app name, icons, theme
- Create app icons (simple SVG-based)
- Implement Service Worker:
  - Cache app shell (HTML, JS, CSS)
  - Cache wordlist JSON
  - Cache icons
  - Strategy: cache-first for everything
- Register SW in main entry point

## Step 6: Final Polish & Verification

- Verify build produces correct output
- Ensure all assets cached by service worker
- Test that progress persists across reload
- Confirm TTS works with system voices
- Validate manifest for installability

---

## Tech Stack

- **Vite** - build tool
- **React 18** - UI
- **TypeScript** - type safety
- No external runtime APIs, no auth, no analytics
