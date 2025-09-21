import type { GameState, Tile, Layer, Coordinate } from '../types/game'


// Generate tile bag with Scrabble distribution
const TILE_BAG = "AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ**".split('')

export const game = $state<GameState>({
  currentWord: '',
  selectedTiles: [],
  usedWords: [],
  totalScore: 0,
  wordList: new Set(),
  layers: [],
  feedback: '',
  feedbackColor: 'black',
  swapsRemaining: 3,
  swapMode: false,
  gameOver: false,
  finalScore: 0,
  penaltyScore: 0,
  showEndGameConfirmation: false
})

// Store the original tile bag and swap pool
let originalTileBag: string[] = []
let swapPool: string[] = []

// Initialize game
export function initializeGame() {
  // Load word list
  fetch('./wordlist.txt')
    .then(response => response.text())
    .then(data => {
      game.wordList = new Set(data.split('\n').map(word => word.trim().toUpperCase()))
      console.log('Wordlist loaded:', game.wordList.size, 'words')
    })
    .catch(err => console.error('Error loading wordlist:', err))

  // Generate layers and tiles
  game.layers = generateLayers()
}

function generateLayers(): Layer[] {
  const layers: Layer[] = [
    { size: 4, offset: 0, tiles: [] },
    { size: 3, offset: 1, tiles: [] },
    { size: 2, offset: 2, tiles: [] }
  ]

  const tileMap = new Map<string, string>()
  const remainingTiles = [...TILE_BAG]
  
  // Store the original tile bag for reference
  originalTileBag = [...TILE_BAG]

  // Generate tiles for each layer
  layers.forEach((layer, z) => {
    for (let y = layer.offset; y < (layer.size * 2) + layer.offset; y += 2) {
      for (let x = layer.offset; x < (layer.size * 2) + layer.offset; x += 2) {
        const letter = remainingTiles.length > 0
          ? remainingTiles.splice(Math.floor(Math.random() * remainingTiles.length), 1)[0]
          : '*'

        const coords: Coordinate[] = [
          [x, y, z],
          [x + 1, y, z],
          [x, y + 1, z],
          [x + 1, y + 1, z]
        ]

        // Store letter for all coordinates
        for (const coord of coords) {
          tileMap.set(JSON.stringify(coord), letter)
        }

        // Create tile (only for top-left coordinate)
        const tile: Tile = {
          id: `${x}-${y}-${z}`,
          letter,
          coords,
          parentCoords: z > 0 ? [
            [x, y, z - 1],
            [x + 1, y, z - 1],
            [x, y + 1, z - 1],
            [x + 1, y + 1, z - 1]
          ] : undefined,
          selected: false,
          visible: z === 0, // Only top layer is initially visible
          selectable: z === 0, // Only top layer is initially selectable
          layer: z,
          position: { x, y }
        }

        layer.tiles.push(tile)
      }
    }
  })

  // Create swap pool from remaining tiles (tiles not used in the puzzle)
  swapPool = [...remainingTiles]
  
  // If we don't have enough tiles in the swap pool, add some from the original bag
  // This ensures we always have tiles available for swapping
  if (swapPool.length < 20) {
    const additionalTiles = originalTileBag.slice(0, 20 - swapPool.length)
    swapPool.push(...additionalTiles)
  }

  console.log('Swap pool created with', swapPool.length, 'tiles:', swapPool.slice(0, 10), '...')
  
  return layers
}

// Check if a tile is selectable (all parent tiles must be removed)
export function isTileSelectable(tile: Tile): boolean {
  if (!tile.parentCoords || tile.parentCoords.length === 0) {
    return tile.visible
  }

  // Check if any parent tiles still exist
  for (const parentCoord of tile.parentCoords) {
    const parentExists = game.layers.some(layer => 
      layer.tiles.some(t => 
        t.coords.some(coord => 
          coord[0] === parentCoord[0] && 
          coord[1] === parentCoord[1] && 
          coord[2] === parentCoord[2]
        )
      )
    )
    if (parentExists) return false
  }

  return tile.visible
}

// Check if a tile is temp-selectable (all covering tiles are selected)
export function isTileTempSelectable(tile: Tile): boolean {
  // Must be visible but not normally selectable
  if (!tile.visible || isTileSelectable(tile)) {
    return false
  }

  // Must have parent coordinates (covering tiles)
  if (!tile.parentCoords || tile.parentCoords.length === 0) {
    return false
  }

  // All covering tiles must be currently selected
  for (const parentCoord of tile.parentCoords) {
    const coveringTile = game.layers.find(layer => 
      layer.tiles.find(t => 
        t.coords.some(coord => 
          coord[0] === parentCoord[0] && 
          coord[1] === parentCoord[1] && 
          coord[2] === parentCoord[2]
        )
      )
    )?.tiles.find(t => 
      t.coords.some(coord => 
        coord[0] === parentCoord[0] && 
        coord[1] === parentCoord[1] && 
        coord[2] === parentCoord[2]
      )
    )

    // If covering tile exists but is not selected, this tile is not temp-selectable
    if (coveringTile && !coveringTile.selected) {
      return false
    }
  }

  return true
}

// Update tile visibility and selectability
export function updateTileStates() {
  game.layers.forEach(layer => {
    layer.tiles.forEach(tile => {
      // Update visibility - tile becomes visible when any parent is removed
      if (tile.layer > 0) {
        const hasVisibleParent = !tile.parentCoords || tile.parentCoords.some(parentCoord => {
          return !game.layers.some(layer => 
            layer.tiles.some(t => 
              t.coords.some(coord => 
                coord[0] === parentCoord[0] && 
                coord[1] === parentCoord[1] && 
                coord[2] === parentCoord[2]
              )
            )
          )
        })
        tile.visible = hasVisibleParent
      }

      // Update selectability
      tile.selectable = isTileSelectable(tile)
    })
  })
  
  // No need to recreate the array - we only modified tile properties
  // Svelte's reactivity will handle the updates automatically
}

// Select/deselect a tile
export function toggleTileSelection(tile: Tile) {
  // Handle swap mode - only allow swapping of available tiles
  if (game.swapMode) {
    if (!tile.selectable) {
      game.feedback = "Can only swap available tiles, not temp-selectable ones"
      game.feedbackColor = 'red'
      return
    }
    swapTile(tile)
    return
  }

  // Allow selection of selectable tiles or temp-selectable tiles
  if (!tile.selectable && !isTileTempSelectable(tile)) return

  if (tile.selected) {
    // Deselect tile
    tile.selected = false
    const index = game.selectedTiles.findIndex(t => t.id === tile.id)
    if (index !== -1) {
      game.selectedTiles.splice(index, 1)
      game.currentWord = game.currentWord.slice(0, index) + game.currentWord.slice(index + 1)
    }
    
    // After deselection, check if any temp-selectable tiles should lose their status
    updateTempSelectableStates()
  } else {
    // Select tile
    tile.selected = true
    game.selectedTiles.push(tile)
    game.currentWord += tile.letter
  }
}

// Update temp-selectable states after tile deselection
function updateTempSelectableStates() {
  // Find all currently selected tiles that are temp-selectable
  const selectedTempSelectableTiles = game.selectedTiles.filter(tile => 
    !tile.selectable && tile.selected
  )

  // Check each temp-selectable tile to see if it should still be selectable
  for (const tile of selectedTempSelectableTiles) {
    if (!isTileTempSelectable(tile)) {
      // This tile is no longer temp-selectable, so deselect it
      tile.selected = false
      const index = game.selectedTiles.findIndex(t => t.id === tile.id)
      if (index !== -1) {
        game.selectedTiles.splice(index, 1)
        game.currentWord = game.currentWord.slice(0, index) + game.currentWord.slice(index + 1)
      }
    }
  }
  
  // No need to recreate the array - we only modified tile properties
  // Svelte's reactivity will handle the updates automatically
}

// Validate that all covering tiles are used when temp-selectable tiles are used
function validateTempSelectableTiles(): { valid: boolean; error: string } {
  // Find all temp-selectable tiles that are currently selected
  const selectedTempSelectableTiles = game.selectedTiles.filter(tile => 
    !tile.selectable && isTileTempSelectable(tile)
  )

  for (const tempTile of selectedTempSelectableTiles) {
    if (!tempTile.parentCoords || tempTile.parentCoords.length === 0) {
      continue
    }

    // Check if all covering tiles are also selected
    for (const parentCoord of tempTile.parentCoords) {
      const coveringTile = game.layers.find(layer => 
        layer.tiles.find(t => 
          t.coords.some(coord => 
            coord[0] === parentCoord[0] && 
            coord[1] === parentCoord[1] && 
            coord[2] === parentCoord[2]
          )
        )
      )?.tiles.find(t => 
        t.coords.some(coord => 
          coord[0] === parentCoord[0] && 
          coord[1] === parentCoord[1] && 
          coord[2] === parentCoord[2]
        )
      )

      // If covering tile exists but is not selected, validation fails
      if (coveringTile && !game.selectedTiles.includes(coveringTile)) {
        return {
          valid: false,
          error: `Cannot use ${tempTile.letter} - all covering tiles must be used in the same word`
        }
      }
    }
  }

  return { valid: true, error: '' }
}

// Submit current word
export function submitWord() {
  if (game.selectedTiles.length === 0) return
  if (game.gameOver) return

  // Build word from current tile order (after any reordering)
  const currentWord = game.selectedTiles.map(tile => tile.letter).join('')
  
  if (currentWord.length === 0) return

  // Validate temp-selectable tiles
  const tempSelectableValidation = validateTempSelectableTiles()
  if (!tempSelectableValidation.valid) {
    game.feedback = tempSelectableValidation.error
    game.feedbackColor = 'red'
    return
  }

  const upperWord = currentWord.toUpperCase()
  const possibleWords = generateWildcardPermutations(upperWord)
  const isValidWord = possibleWords.some(word => game.wordList.has(word))

  if (isValidWord) {
    const wordScore = calculateWordScore(currentWord.toUpperCase())
    game.totalScore += wordScore
    game.usedWords.push({ word: currentWord.toUpperCase(), score: wordScore })
    game.feedback = `"${currentWord}" is a valid word!`
    game.feedbackColor = 'green'

    // Remove selected tiles
    game.selectedTiles.forEach(tile => {
      const layer = game.layers[tile.layer]
      const index = layer.tiles.findIndex(t => t.id === tile.id)
      if (index !== -1) {
        layer.tiles.splice(index, 1)
      }
    })

    // Trigger reactivity for layer changes
    game.layers = [...game.layers]

    // Update tile states after removal
    updateTileStates()
  } else {
    game.feedback = `"${currentWord}" is not a valid word.`
    game.feedbackColor = 'red'
  }

  // Clear current selection
  clearSelection()
}

// Clear current selection
export function clearSelection() {
  game.selectedTiles.forEach(tile => {
    tile.selected = false
  })
  game.selectedTiles = []
  game.currentWord = ''
  
  // No need to recreate the array - we only modified tile properties
  // Svelte's reactivity will handle the updates automatically
}

// Backspace - remove last selected tile
export function backspace() {
  if (game.selectedTiles.length > 0) {
    const lastTile = game.selectedTiles.pop()!
    lastTile.selected = false
    game.currentWord = game.currentWord.slice(0, -1)
    
    // After removal, check if any temp-selectable tiles should lose their status
    updateTempSelectableStates()
  }
}

// Generate all possible wildcard permutations
function generateWildcardPermutations(word: string): string[] {
  const wildcards: number[] = []
  for (let i = 0; i < word.length; i++) {
    if (word[i] === '*') wildcards.push(i)
  }

  if (wildcards.length === 0) {
    return [word]
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const permutations: string[] = []

  function substitute(current: string[], index: number) {
    if (index === wildcards.length) {
      permutations.push(current.join(''))
      return
    }

    const pos = wildcards[index]
    for (const letter of letters) {
      current[pos] = letter
      substitute(current, index + 1)
    }
    current[pos] = '*'
  }

  substitute(word.split(''), 0)
  return permutations
}

// Calculate word score using custom scoring values
function calculateWordScore(word: string): number {
  const length = word.length
  
  // Custom scoring values based on word length
  const scores = {
    1: 0,
    2: 1,
    3: 3,
    4: 5,
    5: 8,
    6: 12,
    7: 17,
    8: 23,
    9: 30,
    10: 38,
    11: 47,
    12: 57,
    13: 68,
    14: 80,
    15: 93,
    16: 107
  }
  
  return scores[length] || 0
}

// Reorder tiles in the current word
export function reorderTiles(fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || 
      fromIndex >= game.selectedTiles.length || toIndex >= game.selectedTiles.length) {
    return
  }

  // Create a copy of the array to avoid mutation issues
  const tiles = [...game.selectedTiles]
  
  // Remove tile from original position
  const [movedTile] = tiles.splice(fromIndex, 1)
  
  // Insert at target position (no adjustment needed since we're working with a copy)
  tiles.splice(toIndex, 0, movedTile)
  
  // Update the selected tiles array
  game.selectedTiles = tiles
  
  // Update current word to match new order
  game.currentWord = game.selectedTiles.map(tile => tile.letter).join('')
  
  // No need to recreate the array - we only modified selectedTiles
  // Svelte's reactivity will handle the updates automatically
}

// Remove a specific tile from the current word
export function removeTileFromWord(index: number) {
  if (index < 0 || index >= game.selectedTiles.length) return
  
  const removedTile = game.selectedTiles[index]
  removedTile.selected = false
  
  // Remove from selected tiles
  game.selectedTiles.splice(index, 1)
  
  // Update current word
  game.currentWord = game.selectedTiles.map(tile => tile.letter).join('')
  
  // After removal, check if any temp-selectable tiles should lose their status
  updateTempSelectableStates()
}

// Get potential score for current word
export function getCurrentWordScore(): number {
  if (game.selectedTiles.length === 0) return 0
  const currentWord = game.selectedTiles.map(tile => tile.letter).join('')
  return calculateWordScore(currentWord.toUpperCase())
}

// Toggle swap mode
export function toggleSwapMode() {
  if (game.swapsRemaining <= 0) {
    game.feedback = "No swaps remaining!"
    game.feedbackColor = 'red'
    return
  }
  
  game.swapMode = !game.swapMode
  if (game.swapMode) {
    game.feedback = "Click a tile to swap it for a new one"
    game.feedbackColor = 'blue'
  } else {
    game.feedback = "Swap mode cancelled"
    game.feedbackColor = 'black'
  }
}

// Swap a tile for a new one
export function swapTile(tile: Tile) {
  if (!game.swapMode || game.swapsRemaining <= 0) return
  
  // Use daily swap pool if available (for daily puzzle mode)
  const currentSwapPool = (window as any).dailySwapPool || swapPool
  const dailyRng = (window as any).dailyRng // Seeded random for daily puzzle
  
  // Check if we have tiles available in the swap pool
  if (currentSwapPool.length === 0) {
    game.feedback = "No more tiles available for swapping!"
    game.feedbackColor = 'red'
    return
  }
  
  // Get a tile from the swap pool using seeded random for daily puzzle, or regular random for free play
  let randomIndex: number
  if (dailyRng) {
    // Use seeded random for deterministic daily puzzle swaps
    randomIndex = Math.floor(dailyRng.next() * currentSwapPool.length)
  } else {
    // Use regular random for free play
    randomIndex = Math.floor(Math.random() * currentSwapPool.length)
  }
  
  const newLetter = currentSwapPool.splice(randomIndex, 1)[0]
  
  // Update the tile's letter
  tile.letter = newLetter
  
  // Decrease swap count
  game.swapsRemaining--
  
  // Exit swap mode
  game.swapMode = false
  
  // Update feedback
  game.feedback = `Swapped to ${newLetter}! ${game.swapsRemaining} swaps remaining (${currentSwapPool.length} tiles left)`
  game.feedbackColor = 'green'
  
  // No need to trigger full re-render since we only changed one tile's letter
  // The tile component will automatically update due to the letter change
}

// Show end game confirmation dialog
export function showEndGameConfirmation() {
  if (game.gameOver) return
  game.showEndGameConfirmation = true
}

// Cancel end game confirmation
export function cancelEndGame() {
  game.showEndGameConfirmation = false
}

// Confirm and end the game
export function confirmEndGame() {
  if (game.gameOver) return
  
  // Count all remaining tiles (visible and hidden)
  const remainingTiles: Tile[] = []
  for (const layer of game.layers) {
    for (const tile of layer.tiles) {
      remainingTiles.push(tile)
    }
  }
  
  // Calculate penalty (3 points per remaining tile)
  game.penaltyScore = remainingTiles.length * 3
  
  // Calculate final score
  game.finalScore = game.totalScore - game.penaltyScore
  
  // Set game over
  game.gameOver = true
  game.showEndGameConfirmation = false
  
  // Clear current selection
  clearSelection()
  
  // Update feedback
  game.feedback = `Game Over! Final Score: ${game.finalScore} (${game.totalScore} - ${game.penaltyScore} penalty)`
  game.feedbackColor = game.finalScore >= 0 ? 'green' : 'red'
}

// Get tile state for styling
export function getTileState(tile: Tile): 'available' | 'selected' | 'visible-unselectable' | 'temp-selectable' | 'hidden' {
  if (!tile.visible) return 'hidden'
  if (tile.selected) return 'selected'
  if (isTileTempSelectable(tile)) return 'temp-selectable'
  if (!tile.selectable) return 'visible-unselectable'
  return 'available'
}

// Get swap pool status for debugging
export function getSwapPoolStatus() {
  return {
    remainingTiles: swapPool.length,
    tiles: swapPool.slice(0, 10), // Show first 10 tiles
    totalOriginal: originalTileBag.length
  }
}
