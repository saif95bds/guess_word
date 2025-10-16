# Guess Word# React + TypeScript + Vite



A React + TypeScript word guessing game built with Vite.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



## DevelopmentCurrently, two official plugins are available:



```bash- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

# Install dependencies- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

npm install

## React Compiler

# Start development server

npm run devThe React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).



# Build for production## Expanding the ESLint configuration

npm run build

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

# Preview production build

npm run preview```js

```export default defineConfig([

  globalIgnores(['dist']),

## Project Structure  {

    files: ['**/*.{ts,tsx}'],

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
