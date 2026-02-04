Perfect — that simplifies the product in a good way. What you’re really building is:

An offline, infinite spelling trainer with difficulty tiers and a long-term fluency metric.

Here is a cleaned, final spec you can hand directly to the agent. No stretch goals, no gamification creep, no subject categories — just a serious fluency engine.

⸻

Spelling Assistant (Kids) — Offline Fluency Trainer (PWA)

0) Product Intent

Build an offline-first Progressive Web App that trains spelling fluency over time using difficulty levels instead of subject categories.

This is not a game.
It is a tool for systematic exposure to increasingly difficult English words.

⸻

1) Core Concept

Instead of “Animals / Sports / Geography”, the app has:
	•	Level 1 – Very Common Words (e.g. “the”, “house”, “friend”)
	•	Level 2 – Common Words
	•	Level 3 – School-Level Words
	•	Level 4 – Advanced Words
	•	Level 5 – Rare / Challenging Words

Each level contains a large static word list.

The child:
	1.	Picks a Level
	2.	Taps Speak
	3.	Writes word on paper
	4.	Taps Reveal
	5.	Moves to next word
	6.	Keeps going forever

No sessions. No limits. Just fluency.

⸻

2) Hard Requirements

Offline First (non-negotiable)
	•	Works in Airplane Mode after install
	•	No runtime network calls
	•	No CDNs
	•	All words stored locally
	•	Service Worker caches everything

Platforms
	•	PWA installable on:
	•	iOS Safari
	•	Android Chrome

Text to Speech
	•	Uses device TTS via:
	•	window.speechSynthesis
	•	Controls:
	•	Speak
	•	Repeat
	•	Slow
	•	Must work offline using system voices

⸻

3) UX Flow

Home

Large buttons:
	•	Start
	•	Settings

Level Select

Simple vertical list:
	•	Level 1 (Very Common)
	•	Level 2 (Common)
	•	Level 3 (School)
	•	Level 4 (Advanced)
	•	Level 5 (Rare)

Each shows:
	•	Progress % (unique words attempted)

Example:

Level 2 – Common Words
Progress: 63% (312 / 496 words)


⸻

4) Practice Screen (Main Loop)

This is the entire product.

Top
	•	Level name
	•	Progress indicator

Middle (huge buttons)
	•	Speak
	•	Repeat
	•	Slow toggle

Bottom
	•	Reveal

After reveal:
	•	Word shown in very large text
	•	Optional syllables / hint if present

Then:
	•	Next

No timers. No scoring. No gamification.

⸻

5) Progress Model (Very Simple)

We only care about:

Has this child ever attempted this word?

Data stored locally:

attempted[wordKey] = true

That’s it.

Progress % for a level:

attemptedCount / totalWordsInLevel

No correctness tracking required for MVP.

This makes the metric:

“How many English words have you been exposed to?”

Which matches your actual goal.

⸻

6) Word Data Model

Single JSON file shipped with app:

/public/data/wordlists.json

{
  "version": 1,
  "levels": [
    {
      "id": "level1",
      "name": "Very Common",
      "words": [
        { "text": "the" },
        { "text": "house" },
        { "text": "friend" }
      ]
    },
    {
      "id": "level2",
      "name": "Common",
      "words": [ ... ]
    }
  ]
}

Optional fields (nice but not required):
	•	syllables
	•	hint
	•	sentence

But only text is mandatory.

⸻

7) Word Sources (What to seed with)

The agent should use:
	•	Word frequency lists (top 1k / 5k / 10k English words)
	•	School spelling lists (Dolch, Fry, etc.)
	•	Public domain corpora

But everything must be flattened into static JSON in the repo.

No dynamic fetching.

⸻

8) Randomization Logic

Inside a level:
	•	Default: shuffle
	•	Must not repeat words until all have been seen once
	•	After full pass, reshuffle and continue infinitely

Pseudo:

queue = shuffle(allWords - attempted)
if queue empty:
  queue = shuffle(allWords)


⸻

9) Offline Architecture

Required
	•	manifest.webmanifest
	•	Service Worker:
	•	Cache app shell
	•	Cache wordlist JSON
	•	Cache icons

Cache strategy
	•	App shell: cache-first
	•	Data: cache-first (versioned)

⸻

10) Settings

Minimal:
	•	Voice selector
	•	Normal rate (default 1.0)
	•	Slow rate (default 0.7)

Stored in local storage / IndexedDB.

⸻

11) Repo Structure

/public
  /icons
  /data/wordlists.json
  manifest.webmanifest
/src
  /features/levels
  /features/practice
  /lib/tts
  /lib/storage
  /lib/shuffle
  main.tsx
  sw.ts

Stack:
	•	Vite + React + TypeScript
	•	No external APIs
	•	No auth
	•	No analytics

⸻

12) Acceptance Tests

Offline
	1.	Install app
	2.	Turn on Airplane Mode
	3.	Kill browser
	4.	Relaunch from home screen
	5.	Pick level
	6.	Speak works
	7.	Reveal works
	8.	Progress % updates

Data integrity
	•	Progress persists across reload
	•	Progress persists across power cycle

⸻

13) Product Philosophy (to keep agent aligned)

This is:
	•	Not a game
	•	Not a quiz
	•	Not adaptive AI
	•	Not a platform

It is:

A spelling exposure machine.

The only KPI:

How many words has this child encountered?
