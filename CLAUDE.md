# NoMercy Music Player

Headless music player with spectrum analyzer support.

## Tech Stack
- TypeScript (ES2020), plain `tsc` build, outputs CommonJS
- Testing: Jest + ts-jest
- Linting: ESLint 8 with @typescript-eslint

## Structure
```
src/
  index.ts              # Public API entry point
  audioNode.ts          # Core audio playback
  equalizer.ts          # Audio equalizer
  queue.ts              # Playlist queue management
  spectrumAnalyzer.ts   # Audio visualization
  state.ts              # Player state management
  helpers.ts            # Utility functions
  types.ts              # Type definitions
```

## Conventions
- Files: camelCase
- Classes/Types: PascalCase
- Functions/Variables: camelCase
- npm scope: `@nomercy-entertainment/nomercy-music-player`
- Module type: CommonJS (`"type": "commonjs"`)

## Rules
- This is a headless library. No UI, no DOM beyond audio elements.
- Public API is exported from `src/index.ts`.
- Run `npx jest` before committing changes.
