
# Welcome to Stacks!

Stacks is a 3D word-building puzzle game where you dig through layers (or stacks!) of letter tiles to create words and score points.

## How to Play

### The Goal

Form as many valid English words as possible by selecting letter tiles from a stacked board.

### The Board

The game board has three layers stacked on top of each other:

- **Top layer (4×4)**: Always visible and ready to use
- **Middle layer (3×3)**: Hidden until you remove tiles above them
- **Bottom layer (2×2)**: Hidden until you remove tiles above them

## Basic Gameplay

### 1. Building Words

- Click tiles to add letters to your current word
- Click selected tiles again to remove them
- Click "Submit" when you're ready to submit your word

### 2. Tile States

- **Beige**: Selectable
- **Green**: Currently selected
- **Orange**: Visible but not yet selectable (need to clear covering tiles first)
- **Blue**: Temporarily selectable (see Advanced Rules below)

## Advanced Rules

### Layer Unlocking

- **Visibility**: Tiles become visible when ANY tile above them is removed
- **Selectability**: Tiles become selectable only when ALL 4 tiles covering them are removed

### Temporary Selection

Sometimes you'll see blue tiles that you can select even if they're not normally available. This happens when:

- The tile is visible but not yet selectable
- ALL tiles covering it are currently selected
- You must use ALL covering tiles in the same word

### Reordering Letters

After selecting tiles, you can drag them to rearrange their order in your word. This means you can use temporarily selectable tiles (blue) out of order. The order of the letters in your word doesn't matter - you can arrange the letters however you want!

### Tile Swapping

When you're stuck, use the Swap feature:

- Click the "Swap" button
- Click any available (beige) tile
- It gets replaced with a random new letter
- You have 3 swaps per game
- Cannot swap temporarily selectable (blue) tiles

## Scoring

### Word Points

Points are based on word length:

- 1 letters = 0 points
- 2 letters = 1 point
- 3 letters = 3 points
- 4 letters = 5 points
- 5 letters = 8 points
- 6 letters = 12 points
- 7 letters = 17 points
- 8 letters = 23 points
- 9 letters = 30 points
- 10 letters = 38 points
- 11 letters = 47 points
- 12 letters = 57 points
- 13 letters = 68 points
- 14 letters = 80 points
- 15 letters = 93 points
- 16 letters = 107 points

### Special Tiles

- **Wildcards (*)**: Can be any letter, but don't count towards the word length

### End Game

- **Final Score** = Total Word Score - Penalty
- **Penalty** = 3 points per leftover tile
- Game ends when the board is cleared or no more words can be formed

## Game Modes

### Free Play

- Random puzzle. Refresh the page anytime to start a new puzzle
- Perfect for practice! Play at your own pace without time limits

### Daily Puzzle

- Same puzzle for everyone. Resets each day
- Can be replayed multiple times. Play the same puzzle again to improve your score
- The board is deterministic (including tile swaps). Replaying the puzzle again means you'll get the same board and same tile swaps

## Strategy Tips

### Early Game

- Start with longer words to clear more tiles
- Don't be afraid to use wildcards strategically

### Mid Game

- Plan ahead. Which tiles do you need to clear to reach hidden layers?
- Use temporary selection wisely. Make sure you can form a valid word with all required tiles
- Save your swaps for when you really need them

### End Game

- Every unused tile costs you 3 points. Sometimes it's better to form a shorter word than leave tiles unused
- Look for short 2-3 letter words to clear remaining tiles

## Need Help?

- **Invalid word?** Check your spelling
- **Can't select a tile?** Make sure all tiles covering it are removed first
- **Stuck?** Use the swap feature or look for shorter words

