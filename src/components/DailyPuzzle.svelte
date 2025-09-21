<script lang="ts">
  import { onMount } from 'svelte'
  import { 
    getDailyPuzzleData, 
    getTodayDate, 
    generateDailySeed, 
    generateDailyPuzzle,
    markTodayPuzzleCompleted,
    updateTodayBestScore,
    isTodayPuzzleCompleted,
    saveDailyGameState,
    loadDailyGameState,
    clearDailyGameState,
    resetDailyPuzzleForReplay,
    saveDailyProgress
  } from '../lib/daily-puzzle'
  import { game, initializeGame, showEndGameConfirmation, cancelEndGame, confirmEndGame } from '../lib/state.svelte'
  import Board from './Board.svelte'
  import WordArea from './WordArea.svelte'
  import Score from './Score.svelte'
  import type { Tile, Layer, Coordinate } from '../types/game'

  // Daily puzzle data
  let dailyData = $state({
    date: '',
    seed: 0,
    isCompleted: false,
    firstScore: 0,
    bestScore: 0,
    attempts: 0
  })

  onMount(() => {
    initializeDailyPuzzle()
  })

  // Auto-save game state whenever it changes
  $effect(() => {
    if (game.layers.length > 0) {
      // Only save if we have a puzzle loaded
      saveDailyGameState(game)
    }
  })

  // Update best score when total score changes
  $effect(() => {
    if (game.totalScore > 0) {
      updateBestScore()
    }
  })

  function initializeDailyPuzzle() {
    // Get today's puzzle data
    dailyData = getDailyPuzzleData()
    
    // Load word list if not already loaded
    if (game.wordList.size === 0) {
      fetch('./wordlist.txt')
        .then(response => response.text())
        .then(data => {
          game.wordList = new Set(data.split('\n').map(word => word.trim().toUpperCase()))
          console.log('Daily puzzle wordlist loaded:', game.wordList.size, 'words')
        })
        .catch(err => console.error('Error loading wordlist:', err))
    }

    // Try to load saved game state
    const savedState = loadDailyGameState()
    
    if (savedState) {
      // Restore saved state
      console.log('Loading saved daily puzzle state')
      game.currentWord = savedState.currentWord
      game.selectedTiles = savedState.selectedTiles
      game.usedWords = savedState.usedWords
      game.totalScore = savedState.totalScore
      game.layers = savedState.layers
      game.feedback = savedState.feedback
      game.feedbackColor = savedState.feedbackColor
      game.swapsRemaining = savedState.swapsRemaining
      game.swapMode = savedState.swapMode
      game.gameOver = savedState.gameOver
      game.finalScore = savedState.finalScore
      game.penaltyScore = savedState.penaltyScore
      game.showEndGameConfirmation = savedState.showEndGameConfirmation
      
      // Restore swap pool and RNG (we need to regenerate them)
      const puzzle = generateDailyPuzzle(dailyData.seed)
      ;(window as any).dailySwapPool = puzzle.swapPool
      ;(window as any).dailyRng = puzzle.rng
    } else {
      // No saved state, start fresh
      console.log('Starting fresh daily puzzle')
      game.currentWord = ''
      game.selectedTiles = []
      game.usedWords = []
      game.totalScore = 0
      game.feedback = ''
      game.feedbackColor = 'black'
      game.swapsRemaining = 3 // Allow 3 swaps in daily puzzle
      game.swapMode = false
      game.gameOver = false
      game.finalScore = 0
      game.penaltyScore = 0
      game.showEndGameConfirmation = false

      // Generate daily puzzle layout and swap pool
      const puzzle = generateDailyPuzzle(dailyData.seed)
      game.layers = puzzle.layers
      
      // Set up the swap pool and seeded random for daily puzzle
      ;(window as any).dailySwapPool = puzzle.swapPool
      ;(window as any).dailyRng = puzzle.rng
    }
  }


  // Update best score when words are submitted
  function updateBestScore() {
    updateTodayBestScore(game.totalScore)
    dailyData.bestScore = Math.max(dailyData.bestScore, game.totalScore)
  }

  // Handle daily puzzle end game
  function handleDailyEndGame() {
    // Call the regular confirmEndGame function
    confirmEndGame()
    
    // Update local data first
    dailyData.isCompleted = true
    if (dailyData.attempts === 0) {
      dailyData.firstScore = game.finalScore
    }
    dailyData.bestScore = Math.max(dailyData.bestScore, game.finalScore)
    dailyData.attempts += 1
    
    // Save the updated data to localStorage
    saveDailyProgress(dailyData)
    
    // Clear the saved game state since puzzle is completed
    clearDailyGameState()
  }

  // Reset daily puzzle for replay
  function resetDailyPuzzle() {
    // Clear the current game state
    resetDailyPuzzleForReplay()
    
    // Reset completion status to hide banner
    dailyData.isCompleted = false
    
    // Reset game state to fresh puzzle
    game.currentWord = ''
    game.selectedTiles = []
    game.usedWords = []
    game.totalScore = 0
    game.feedback = ''
    game.feedbackColor = 'black'
    game.swapsRemaining = 3
    game.swapMode = false
    game.gameOver = false
    game.finalScore = 0
    game.penaltyScore = 0
    game.showEndGameConfirmation = false

    // Generate fresh puzzle
    const puzzle = generateDailyPuzzle(dailyData.seed)
    game.layers = puzzle.layers
    
    // Set up the swap pool and seeded random
    ;(window as any).dailySwapPool = puzzle.swapPool
    ;(window as any).dailyRng = puzzle.rng
  }

  // Format date for display
  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // Share daily puzzle stats
  async function shareStats() {
    const statsText =
`Stacks Daily Puzzle
${formatDate(dailyData.date)}
    
First Score: ${dailyData.firstScore}
Best Score: ${dailyData.bestScore}
Attempts: ${dailyData.attempts}`

    try {
      await navigator.clipboard.writeText(statsText)
      game.feedback = 'Stats copied to clipboard!'
      game.feedbackColor = 'green'
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      game.feedback = 'Failed to copy to clipboard'
      game.feedbackColor = 'red'
    }
  }
</script>

<main class="daily-puzzle">
  <header class="daily-header">
    <div class="daily-info">
      <div class="date">{formatDate(dailyData.date)}</div>
    </div>
  </header>

  <!-- Completion Status -->
  {#if dailyData.isCompleted}
    <div class="completion-banner success">
      <div class="completion-content">
        <div class="completion-title">Daily puzzle completed!</div>
        <div class="score-breakdown">
          <div class="words-found">
            <div class="words-title">Words found:</div>
            <div class="words-list">
              {#each game.usedWords as wordData (wordData.word)}
                <span class="word-pill">{wordData.word} ({wordData.score})</span>
              {/each}
              {#if game.penaltyScore > 0}
                <span class="penalty-pill">
                  UNUSED TILES (-{game.penaltyScore})
                </span>
              {/if}
            </div>
          </div>
          <div class="final-score">
            Final score: {game.finalScore}
          </div>
        </div>
        <div class="score-stats">
          <div class="score-item">
            <span class="score-label">First Score:</span>
            <span class="score-value">{dailyData.firstScore}</span>
          </div>
          <div class="score-item">
            <span class="score-label">Best Score:</span>
            <span class="score-value">{dailyData.bestScore}</span>
          </div>
          <div class="score-item">
            <span class="score-label">Attempts:</span>
            <span class="score-value">{dailyData.attempts}</span>
          </div>
        </div>
        <div class="completion-actions">
          <button onclick={shareStats} class="share-button">
            Share
          </button>
          <button onclick={resetDailyPuzzle} class="reset-button">
            Play Again
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Game Board -->
  <div class="game-page">
    <Board />
    <WordArea />
    <Score />

    <div class="bottom-controls">
      <button
        onclick={handleDailyEndGame}
        disabled={game.gameOver}
        class="done-button"
      >
        Done
      </button>
    </div>
  </div>


  <!-- Confirmation Dialog -->
  {#if game.showEndGameConfirmation}
    <div
      class="confirmation-overlay"
      onclick={cancelEndGame}
      onkeydown={(e) => e.key === 'Escape' && cancelEndGame()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      tabindex="-1"
    >
      <div
        class="confirmation-dialog"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.key === 'Escape' && cancelEndGame()}
        role="alertdialog"
        tabindex="0"
      >
        <h3 id="dialog-title">End Daily Puzzle?</h3>
        <p>Are you sure you want to end the daily puzzle? You'll receive a penalty for any remaining letters.</p>

        <div class="confirmation-buttons">
          <button onclick={cancelEndGame} class="cancel-button">
            Cancel
          </button>
          <button onclick={handleDailyEndGame} class="confirm-button">
            End Puzzle
          </button>
        </div>
      </div>
    </div>
  {/if}

</main>

<style>
  .daily-puzzle {
    font-family: monospace;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    min-height: 100vh;
  }

  .daily-header {
    text-align: center;
    margin-bottom: 10px;
  }


  .daily-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .date {
    font-size: 1.2em;
    font-weight: bold;
  }

  .seed-info {
    font-size: 0.9em;
    opacity: 0.7;
    color: #666;
  }

  .completion-banner {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #dee2e6;
    text-align: center;
    max-width: 400px;
    margin: 0 auto;
  }

  .completion-banner.success {
    background-color: #f8f9fa;
    color: #333;
    border: 1px solid #dee2e6;
  }

  .completion-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .completion-title {
    font-size: 1.1em;
    font-weight: 600;
    color: #333;
  }

  .score-stats {
    display: flex;
    gap: 30px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .score-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }

  .score-label {
    font-size: 0.9em;
    color: #666;
    margin-bottom: 3px;
  }

  .score-value {
    font-size: 1.1em;
    font-weight: 600;
    color: #333;
  }

  .score-breakdown {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
  }

  .words-found {
    margin-bottom: 5px;
  }

  .words-title {
    font-weight: 500;
    margin-bottom: 16px;
    color: #333;
  }

  .words-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: flex-start;
  }

  .word-pill {
    background-color: #f0f0f0;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9em;
  }

  .penalty-pill {
    background-color: #f8d7da;
    color: #dc3545;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.9em;
  }

  .final-score {
    font-weight: bold;
    color: #333;
  }

  .completion-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .share-button {
    padding: 8px 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: white;
    color: #333;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }

  .share-button:hover {
    background-color: #f0f0f0;
  }

  .reset-button {
    padding: 8px 16px;
    border: 1px solid #007bff;
    border-radius: 4px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }

  .reset-button:hover {
    background-color: #0056b3;
  }

  .game-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
  }

  .bottom-controls {
    margin-top: auto;
    padding: 20px 0;
  }

  .done-button {
    padding: 8px 16px;
    border: 1px solid #dc3545;
    border-radius: 4px;
    background-color: #dc3545;
    color: white;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    transition: background-color 0.2s ease;
  }

  .done-button:hover:not(:disabled) {
    background-color: #c82333;
  }

  /* Confirmation Dialog Styles */
  .confirmation-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .confirmation-dialog {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    width: 90%;
    text-align: center;
  }

  .confirmation-dialog h3 {
    margin: 0 0 15px 0;
    color: #333;
    font-size: 1.3em;
  }

  .confirmation-dialog p {
    margin: 0 0 25px 0;
    color: #666;
    line-height: 1.4;
  }

  .confirmation-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
  }

  .cancel-button,
  .confirm-button {
    padding: 10px 20px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: white;
    color: #333;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    transition: background-color 0.2s ease;
  }

  .cancel-button:hover {
    background-color: #f0f0f0;
  }

  .confirm-button {
    background-color: #dc3545;
    color: white;
    border-color: #dc3545;
  }

  .confirm-button:hover {
    background-color: #c82333;
  }
</style>