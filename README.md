# Stacks

A 3D word-building puzzle game built with Svelte 5, where you dig through layers of letter tiles to form valid English words.

## Game Rules

The game features a unique 3D board with three stacked layers:
- **Top Layer (4x4)**: Always visible and clickable
- **Middle Layer (3x3)**: Becomes visible when any parent tile above it is removed
- **Bottom Layer (2x2)**: Becomes visible when any parent tile above it is removed

Tiles become selectable only when ALL 4 parent tiles covering them are removed.

## How to Play

1. Click tiles to add letters to your current word
2. Click a selected tile again to deselect it
3. Use Backspace to remove the last letter
4. Use Clear to deselect all tiles
5. Press Enter or click "Submit Word" to validate your word
6. Form as many valid words as possible to achieve the highest score!

## Controls

- **Mouse**: Click tiles to select/deselect
- **Keyboard**:
  - `Enter`: Submit current word
  - `Escape`: Clear current selection
  - `Backspace`: Remove last letter

## Scoring

Uses Scrabble-style letter values:
- A, E, I, O, U, L, N, S, T, R = 1 point
- D, G = 2 points
- B, C, M, P = 3 points
- F, H, V, W, Y = 4 points
- K = 5 points
- J, X = 8 points
- Q, Z = 10 points
- * (wildcard) = 0 points

## Development

Built with:
- Svelte 5 with runes
- TypeScript
- Vite
- No external dependencies

### Running the Game

```bash
npm install
npm run dev
```

The game will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## License

This project is part of a collection of word games and puzzles.
