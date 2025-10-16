# Guess Word – Architecture (TypeScript, Config‑Driven)

> Canonical architecture aligned with the PRD in canvas, including **answer image** and **answer card** behavior.

---

## 1) Overview

- **Type:** Static web app (no backend)
- **Stack:** React + **TypeScript (Vite)**, ES Modules
- **Principles:** No hardcoded UI text; behavior/content via JSON configs
- **Flow:** Load configs → init engine → render UI → play loop → summary

```
[configs + images] → loader.ts → engine.ts → React components → effects & summary
```

---

## 2) Directory Structure

```text
project-root/
├─ public/
│  ├─ assets/images/            # Portrait images (tiers)
│  │  ├─ skole-320.webp
│  │  ├─ skole-480.webp
│  │  ├─ skoledag-320.webp      # answer image tiers
│  │  └─ skoledag-480.webp
│  └─ data/
│     ├─ app.config.json        # Modes, timers, selection, effects, answerCard, images
│     ├─ strings.nb.json        # UI text (Bokmål)
│     └─ puzzles.nb.json        # image1 + image2 + answerImage + answer
├─ src/
│  ├─ components/
│  │  ├─ HeaderBar.tsx          # Title, mode picker, timer, score
│  │  ├─ ImageCard.tsx          # Portrait card; flip hint; a11y
│  │  ├─ AnswerCard.tsx         # Shows answer image + full word; transition from config
│  │  ├─ InputDock.tsx          # Input + Submit/Exit; focuses input on image tap
│  │  ├─ SummaryModal.tsx       # End-of-round summary (Replay/Change Mode)
│  │  └─ EffectsLayer.tsx       # Confetti, shake, collide motion, sad-face overlay
│  ├─ core/
│  │  ├─ loader.ts              # Loads & validates app/strings/puzzles; typed outputs
│  │  ├─ engine.ts              # State machine: start/submit/next/tick
│  │  ├─ strings.ts             # i18n helper: getString(key, params)
│  │  └─ images.ts              # srcset builder for portrait tiers
│  ├─ types/
│  │  └─ config.ts              # AppConfig, Strings, Puzzle, AnswerImage interfaces
│  ├─ styles/
│  │  └─ styles.css             # Minimal CSS (or Tailwind)
│  ├─ app.tsx                   # Bootstrap: wires loader → engine → UI
│  └─ main.tsx                  # Vite entry; renders <App />
├─ tools/
│  └─ validate-config.ts        # JSON Schema + path checks + size budgets
├─ index.html
├─ tsconfig.json
├─ package.json
└─ README.md
```

---

## 3) Config Schemas (authoritative)

### `/public/data/app.config.json`

- `enabledModes`: `["timed","untimed"]`, `defaultMode`
- `timer`: `{ enabled, durations:[30,60,90], default }`
- `selection`: `{ strategy:"random|sequential|shuffled", seed?:number|null }`
- `input`: `{ normalizeCase:boolean, normalizeDiacritics?:boolean, autosubmitOnEnter:boolean, focusOnImageTap:boolean }`
- `effects`:
  - `correct.motion`: `"collide"|"bounce"|"flash"|"none"`
  - `incorrect`: `"shake"|"border"|"none"` | `{ type:'shake'|'border'|'none', overlaySizePct?: number }`
  - `roundComplete`: `"confetti"|"none"`
  - `durationMs`: number (e.g., 600–900)
- `answerCard`: `{ showImage: true|false, transition: "fade"|"slide"|"none", durationMs: number }`
- `images`: `{ preferFormats:["webp","avif"], tiers:[320,480,640], budgetKB:80 }`

### `/public/data/strings.nb.json`

- All UI text and a11y labels in Bokmål: `ui.title`, `ui.submit`, `ui.exit`, `ui.correctOfTotal`, `ui.timeLeft`, summary strings, errors, hints

### `/public/data/puzzles.nb.json`

- `puzzles[]`: `{ id, image1:{ srcBase, alt, wordPart }, image2:{ srcBase, alt, wordPart }, answerImage:{ srcBase, alt, word }, answer, tags?, childrenSafe? }`
- **All** `srcBase` values (including `answerImage.srcBase`) follow the configured tiers: e.g., `-320.webp`, `-480.webp`, `-640.webp`

---

## 4) Data & Control Flow

```
index.html → main.tsx → app.tsx
  app.tsx
   └─ loader.loadAll(locale?) → { app, strings, puzzles }
         │
         ├─ strings.getString() → UI components
         ├─ images.buildSrcset() → ImageCard & AnswerCard
         └─ new Engine(app, puzzles).start(mode, callbacks)
                 │
                 ├─ tick() → timer updates
                 ├─ submit(answer) → evaluate; fire effects; update score; show AnswerCard
                 └─ next() → advance; preload next images

SummaryModal opens on `timeup|completed|exit`.
```

---

## 5) TypeScript Interfaces

```ts
// src/types/config.ts
export interface AnswerImage { srcBase: string; alt: string; word: string }

export interface AppConfig {
  version?: number;
  defaultLocale: string;
  enabledModes: string[];
  defaultMode: string;
  timer: { enabled: boolean; durations: number[]; default: number };
  selection: { strategy: 'random'|'sequential'|'shuffled'; seed?: number|null };
  input: { normalizeCase: boolean; normalizeDiacritics?: boolean; autosubmitOnEnter: boolean; focusOnImageTap: boolean };
  effects: {
    correct?: { motion?: 'collide'|'bounce'|'flash'|'none' };
    incorrect?: 'shake'|'border'|'none' | { type:'shake'|'border'|'none', overlaySizePct?: number };
    roundComplete?: 'confetti'|'none';
    durationMs?: number;
  };
  answerCard: { showImage: boolean; transition: 'fade'|'slide'|'none'; durationMs: number };
  images: { preferFormats?: string[]; tiers: number[]; budgetKB: number };
}

export interface Strings { [k: string]: any }

export interface Puzzle {
  id: string;
  image1: { srcBase: string; alt: string; wordPart: string };
  image2: { srcBase: string; alt: string; wordPart: string };
  answerImage: AnswerImage;
  answer: string;
  tags?: string[];
  childrenSafe?: boolean;
}

export type GameState = { mode:string; index:number; correct:number; total:number; timeLeft?:number; current:Puzzle };
export type Summary = { correct:number; total:number; reason:'timeup'|'completed'|'exit' };
```

---

## 6) Components & Responsibilities

- **HeaderBar.tsx**: mode select, timer/score (localized)
- **ImageCard.tsx**: 3/4 portrait image; tap→focus input; optional flip hint
- **AnswerCard.tsx**: renders `answerImage` + full word; transition from `app.config.json.answerCard`
- **InputDock.tsx**: input + Submit + Exit; autosubmit on Enter; ARIA live region
- **EffectsLayer.tsx**: applies `effects.correct.motion`, `effects.incorrect` (shake/border) and draws **sad‑face** at `overlaySizePct`; confetti on `roundComplete`
- **SummaryModal.tsx**: opens on time up/completion/exit; shows score + **Replay / Change Mode**

---

## 7) Performance & Accessibility

- **Images:** portrait only; `srcset` from tiers; lazy‑load non‑current; enforce `budgetKB`
- **Perf:** LCP < 1.5s; Vite code‑split; tree‑shake
- **A11y:** WCAG 2.2 AA; focus rings, labels, live regions; respect `prefers-reduced-motion`

---

## 8) Tooling & Validation

- Dev scripts: `dev`, `build`, `preview`; tests with Vitest; lint/format with ESLint/Prettier
- **validate-config.ts** (CI/pre‑build):
  - Required keys in configs; parse into typed objects
  - All `srcBase` (including `answerImage.srcBase`) resolve for configured tiers
  - Per‑tier sizes ≤ `budgetKB`

---

## 9) Extensibility

- New language: add `strings.xx.json` + `puzzles.xx.json`; switch via `?lang=xx` or `defaultLocale`
- New mode: update `enabledModes` and strings; engine branches by `mode`
- Effects/themes: adjust `effects` and `answerCard` in config; no code changes

---

## 10) Acceptance Criteria

- All UI text from `strings.{locale}.json`
- Behavior controlled by `app.config.json` (modes, timers, effects, **answerCard**)
- Portrait images (including **answer image**) render via `srcset` tiers
- Summary appears with localized actions; missing config/asset → clear error and block deploy

