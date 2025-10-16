# Guess Word (Norwegian) – Product Requirements Document (PRD)

## 1) Product Vision

A fun, mobile‑friendly Norwegian word‑guessing game that teaches compound word structure by combining two images into one word. The design should be quick, accessible, and educational.

## 2) Target Users & Personas

- **Primary:** Learners aged 8–18 who enjoy language games.
- **Secondary:** Parents or teachers encouraging vocabulary building.
- **Accessibility personas:** Screen reader users, keyboard‑only navigation, and those needing high contrast or dyslexia‑friendly fonts.

## 3) Platforms & Distribution

- **MVP:** **Static React + TypeScript (Vite)**, responsive for smartphones, tablets, and desktop.
- **Tooling:** TypeScript (strict), ESLint + Prettier, Vitest (unit tests), Playwright (optional E2E), Lighthouse/Axe for accessibility.
- **Module format:** ES Modules with optional path aliases in `tsconfig.json`.
- **Hosting:** Static hosting (GitHub Pages/Netlify/Vercel). No backend required.

## 4) Configuration & Internationalization

### File Naming Convention

For a **mid‑range project**, use `app.config.json` for consistency and scalability.

### Standard Structure

- **`app.config.json`** – modes, timers, effects, and gameplay flags.
- **`strings.{locale}.json`** – all localized UI text.
- **`puzzles.{locale}.json`** – image pairs and correct answers.

### Type Binding & Validation

- Shared type definitions: `/src/types/config.ts` defines `AppConfig`, `Strings`, and `Puzzle` interfaces.
- `/tools/validate-config.ts` validates all JSON files against JSON Schemas before build.

## 5) Core Game Loop (MVP)

**Overview**

- The player sees **two portrait images** that represent the two parts of a Norwegian compound word.
- The player types the **combined word** in the input field and submits.

**Submit → Evaluate → Respond**

- On submit, the game evaluates the answer using case‑insensitive comparison and preserves diacritics (æ/ø/å) for display.
- After evaluation, the **answer card** is shown (an image or styled card that displays the full correct compound word and its two parts).

**Correct answer (config‑driven effects)**

- The two input images **move toward each other and “collide”** (quick ease‑out motion). On collision, trigger a short **fireworks/confetti** burst.
- The **answer card** remains visible after the effect.
- Effect parameters are configurable in `/data/app.config.json`, e.g.:
  - `effects.correct.motion = "collide"` (choices: `collide|bounce|flash|none`)
  - `effects.roundComplete = "confetti"` (choices: `confetti|none`)
  - `effects.durationMs` (default 600–900ms)

**Incorrect answer (config‑driven effects)**

- The **answer card** is still shown so the player learns the correct compound.
- Additionally, render a **procedurally generated sad face** overlay in the **top‑right corner** of the image area.
  - Size is configurable as a **percentage of the image width** (e.g., `effects.incorrect.overlaySizePct = 22`).
  - The overlay should be vector/Canvas‑drawn (no external asset required) with a short fade‑in.
  - You may also add a subtle **shake** on the image pair: `effects.incorrect = "shake"`.

**Progress & Flow**

- Increment **total attempts** on each submission; increment **correct** only on correct answers.
- Auto‑advance to the **next puzzle** after a short delay (e.g., 500–800ms) or on button press; the delay is configurable: `flow.nextDelayMs`.
- The running result line shows **“correct / total attempts”** (localized via `strings.{locale}.json`).

**Timer & Modes (configurable)**

- **Timer mode:** controlled by `/data/app.config.json` (`timer.enabled`, `timer.durations`, `timer.default`). If enabled, show a countdown and **end the round** when it reaches zero.
- **Challenge modes:** defined in `/data/app.config.json.enabledModes` (e.g., `timed`, `untimed`, `practiceN`). Which modes appear and the default mode are **config‑driven**.
- When the timer ends or the configured number of puzzles is completed, show the **Summary** (score and localized actions like **Replay** / **Change Mode**).

**Accessibility notes**

- Announce correctness via an ARIA live region; ensure motion respects `prefers‑reduced‑motion` (reduce or disable animations).

## 6) Configurable Settings

All from `app.config.json`:

- **Timer:** on/off, durations, default.
- **Modes:** enabled list, default.
- **Selection:** sequential/random/shuffled.
- **Effects:** animation type, duration, overlay size.
- **Input:** autosubmit, focus on image tap.

## 7) Controls & UX

- React + TypeScript (`.tsx` components).
- On‑screen keyboard appears on input focus.
- Norwegian characters supported (æ, ø, å).
- Large touch targets; responsive layout.
- Accessibility: ARIA live regions, focus states, high contrast, reduced‑motion support.

## 8) Visual & Audio Feedback

- **Correct:** Collide + confetti.
- **Incorrect:** Sad face overlay + shake.
- **Round Complete:** Short confetti burst.
- **All animations configurable** in `effects` section of `app.config.json`.

## 9) Non‑Functional Requirements

- **Accessibility:** WCAG 2.2 AA compliance.
- **Performance:** LCP < 1.5s; JS bundle <100KB (gzipped).
- **Images:** Mobile‑first (portrait, 320–480px width). Use WebP/AVIF ≤80KB.
- **Type Safety:** Strict TypeScript mode; no `any` in production.
- **Validation:** JSON Schema checks on all configs.
- **Quality:** ESLint + Prettier; CI validation before deploy.

## 10) Data & Persistence

- No backend or user accounts.
- Game state (timer, score) stored in memory; resets on reload.

## 11) Admin & Content Ops

- Developer manually uploads images and JSON files.
- Validation script (`tools/validate-config.ts`) ensures schema and file integrity.
- Type definitions in `/src/types/config.ts` shared between app and tools.

## 12) Metrics & KPIs

- Engagement: avg session length, correct answers per round.
- Performance: load time, accessibility score (Lighthouse).

## 13) Constraints & Risks

- Handling æ/ø/å across input methods.
- Image clarity and cultural appropriateness.
- Translation accuracy for multilingual versions.

## 14) Out of Scope

- User accounts, leaderboards, ads, social sharing, multiplayer.

---

**Development Summary:**
React + TypeScript + Vite stack with config‑driven gameplay, strict typing, and minimal static hosting requirements. This ensures easy localization, portability, and educational value while remaining lightweight and maintainable.

