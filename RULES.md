# Stacks - Game Rules

## Overview
Stacks is a 3D word-building puzzle game where you dig through layers of letter tiles to form valid English words. The game features a unique 3D board with three stacked layers that you must navigate strategically.

## Board Structure

The game board consists of three layers stacked on top of each other:

```
Layer 3 (Top):    4x4 grid (16 tiles) - Always visible and clickable
Layer 2 (Middle): 3x3 grid (9 tiles)  - Hidden initially
Layer 1 (Bottom): 2x2 grid (4 tiles)  - Hidden initially
```

### Visual Representation

```
Initial State (Top Layer - 4x4):
┌──────────┐
│ AABBCCDD │ ← Always visible, always clickable
│ AABBCCDD │
│ EEFFGGHH │
│ EEFFGGHH │
│ IIJJKKLL │
│ IIJJKKLL │
│ MMNNOOPP │
│ MMNNOOPP │
└──────────┘

Middle Layer (3x3) - Hidden initially:
┌──────────┐
│          │
│  QQRRSS  │ ← Hidden until parent tiles removed
│  QQRRSS  │
│  TTUUVV  │
│  TTUUVV  │
│  WWXXYY  │
│  WWXXYY  │
│          │
└──────────┘

Bottom Layer (2x2) - Hidden initially:
┌──────────┐
│          │
│          │
│   ZZ**   │ ← Hidden until parent tiles removed
│   ZZ**   │
│   ++==   │
│   ++==   │
│          │
│          │
└──────────┘
```

## Game Rules

### 1. Tile Visibility
- **Top Layer (4x4)**: Always visible and clickable from the start
- **Middle Layer (3x3)**: Becomes visible when ANY parent tile above it is removed
- **Bottom Layer (2x2)**: Becomes visible when ANY parent tile above it is removed

### 2. Tile Selectability
- **Top Layer**: Always selectable when visible
- **Middle Layer**: Becomes selectable only when ALL 4 parent tiles covering it are removed
- **Bottom Layer**: Becomes selectable only when ALL 4 parent tiles covering it are removed

### 3. Parent-Child Relationships

Each tile has 4 coordinates that define its position:
- Top-left corner: (x, y, z)
- Top-right corner: (x+1, y, z)
- Bottom-left corner: (x, y+1, z)
- Bottom-right corner: (x+1, y+1, z)

A tile is "covered" by a parent tile if any of its 4 coordinates match any of the parent tile's 4 coordinates.

#### Example:
```
Middle layer tile at (1,1,1) has coordinates:
- (1,1,1), (2,1,1), (1,2,1), (2,2,1)

It is covered by top layer tile at (0,0,2) with coordinates:
- (0,0,2), (1,0,2), (0,1,2), (1,1,2)

The tile becomes visible when the parent tile is removed,
but only becomes selectable when ALL 4 parent tiles are removed.
```

### 4. Word Building
- Click tiles to add letters to your current word
- Click a selected tile again to deselect it
- Use Backspace to remove the last letter
- Use Clear to deselect all tiles
- Press Enter or click "Submit Word" to validate your word

### 5. Word Validation
- Words must be valid English words (checked against wordlist)
- Wildcard tiles (*) can represent any letter
- All possible wildcard combinations are checked for validity

### 6. Scoring
- Scrabble-style letter values:
  - A, E, I, O, U, L, N, S, T, R = 1 point
  - D, G = 2 points
  - B, C, M, P = 3 points
  - F, H, V, W, Y = 4 points
  - K = 5 points
  - J, X = 8 points
  - Q, Z = 10 points
  - * (wildcard) = 0 points

### 7. Game Flow
1. Start with only 4x4 top layer tiles available
2. Select tiles to form a word
3. Submit the word (if valid, get points and remove tiles)
4. As top tiles are removed, middle layer tiles become visible
5. As middle tiles are removed, bottom layer tiles become visible
6. Continue until all tiles are used or no more valid words can be formed

### Tile States
- **Available (Blue)**: Clickable tiles
- **Selected (Green)**: Currently selected tiles
- **Visible but Unselectable (Orange)**: Revealed but not yet clickable
- **Hidden**: Not yet revealed

## Controls
- **Mouse**: Click tiles to select/deselect
- **Keyboard**:
  - `Enter`: Submit current word
  - `Escape`: Clear current selection
  - `Backspace`: Remove last letter
  - `Space`: Select/deselect tile (when focused)

## Winning
The game continues until:
- All tiles are used, OR
- No more valid words can be formed with remaining tiles

Try to achieve the highest score possible by forming as many valid words as you can!
