# Guess Word

A Norwegian word-guessing game built with React + TypeScript + Vite. Players combine two images to guess compound Norwegian words.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Current Progress

### ✅ Segment 5: Game Engine (Answer Check)
The game engine is fully integrated with answer checking:
- Case-insensitive comparison with Norwegian character preservation (æ/ø/å)
- Auto-advance to next puzzle after submission
- Timer functionality for timed mode
- Config-driven normalization and puzzle selection

### ✅ Segment 6: AnswerCard with Answer Image
Answer card displays after each submission:
- Shows correct answer image with responsive srcset
- Green background for correct answers, red for incorrect
- Localized feedback messages ("Riktig svar!" / "Feil svar...")
- Configurable transitions (fade/slide/none) and duration
- Auto-hides and advances to next puzzle

## Testing

### Answer Checking (Segment 5):

1. **Correct Answer (Case Insensitive)**
   - Type: `skoledag` or `SKOLEDAG` or `Skoledag`
   - Expected: Green answer card appears, score increments (correct: 1, total: 1)

2. **Incorrect Answer**
   - Type: `wrong` or any other word
   - Expected: Red answer card appears with correct answer, score shows (correct: 0, total: 1)

3. **Timer Mode**
   - Switch to "timed" mode in the header
   - Timer counts down from default (60 seconds)
   - When timer reaches 0, game ends and shows summary

### Answer Card Display (Segment 6):

1. **Correct Answer Card**
   - Submit correct answer: `skoledag`
   - Expected: Green card with "Riktig svar!" and answer image
   - Displays for ~1.5 seconds, then auto-advances

2. **Incorrect Answer Card**
   - Submit wrong answer: `wrong`
   - Expected: Red card with "Feil svar. Riktig svar er skoledag" and answer image
   - Shows correct answer for learning

3. **Config Changes**
   - Edit `public/data/app.config.json`:
     - `answerCard.showImage: false` → Only text, no image
     - `answerCard.transition: "slide"` → Slide-up animation
     - `answerCard.transition: "none"` → No animation
     - `answerCard.durationMs: 1000` → Slower animation

## Configuration

All behavior controlled by `public/data/app.config.json`:

### Game Engine:
- `input.normalizeCase`: Case-insensitive comparison
- `input.normalizeDiacritics`: Preserve/remove diacritics (æ/ø/å)
- `selection.strategy`: random/sequential/shuffled puzzle order
- `timer`: Countdown functionality for timed mode

### Answer Card:
- `answerCard.showImage`: Display answer image
- `answerCard.transition`: fade/slide/none
- `answerCard.durationMs`: Animation duration (ms)

## Project Structure

```    extends: [

src/      // Other configs...

├── components/     # React components

├── core/          # Game engine and logic      // Remove tseslint.configs.recommended and replace with this

├── types/         # TypeScript type definitions      tseslint.configs.recommendedTypeChecked,

└── styles/        # CSS styles      // Alternatively, use this for stricter rules

      tseslint.configs.strictTypeChecked,

public/      // Optionally, add this for stylistic rules

├── assets/images/ # Game images      tseslint.configs.stylisticTypeChecked,

└── data/          # Configuration files

```      // Other configs...

    ],

## Tech Stack    languageOptions: {

      parserOptions: {

- React 19        project: ['./tsconfig.node.json', './tsconfig.app.json'],

- TypeScript        tsconfigRootDir: import.meta.dirname,

- Vite      },

- CSS      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
