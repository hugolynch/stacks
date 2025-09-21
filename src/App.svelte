<script lang="ts">
  import { onMount } from 'svelte'
  import { game, initializeGame, showEndGameConfirmation, cancelEndGame, confirmEndGame } from './lib/state.svelte'
  import Board from './components/Board.svelte'
  import WordArea from './components/WordArea.svelte'
  import Score from './components/Score.svelte'
  import DailyPuzzle from './components/DailyPuzzle.svelte'
  const logo = './logo.svg'

  // Navigation state
  let currentPage = $state<'main' | 'daily'>('main')

  onMount(() => {
    initializeGame()
  })

  function goToMainGame() {
    currentPage = 'main'
    // Reset game state and generate new puzzle for free play
    initializeGame()
  }

  function goToDailyPuzzle() {
    currentPage = 'daily'
  }
</script>

<main>
  <img src={logo} alt="Stacks Logo" />
  
  <!-- Navigation -->
  <nav class="page-nav">
    <button 
      class="nav-button" 
      class:active={currentPage === 'main'}
      onclick={goToMainGame}
    >
      Free Play
    </button>
    <button 
      class="nav-button" 
      class:active={currentPage === 'daily'}
      onclick={goToDailyPuzzle}
    >
      Daily Puzzle
    </button>
  </nav>

  <!-- Main Game Page -->
  {#if currentPage === 'main'}
    <div class="game-page">
      <Board />
      <WordArea />
      <Score />
      
      <div class="bottom-controls">
        <button 
          onclick={showEndGameConfirmation} 
          disabled={game.gameOver}
          class="done-button"
        >
          End Game
        </button>
      </div>
    </div>
  {/if}

  <!-- Daily Puzzle Page -->
  {#if currentPage === 'daily'}
    <DailyPuzzle />
  {/if}

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
        <h3 id="dialog-title">End Game?</h3>
        <p>Are you sure you want to end the game? You'll receive a penalty for any remaining letters.</p>
        
        <div class="confirmation-buttons">
          <button onclick={cancelEndGame} class="cancel-button">
            Cancel
          </button>
          <button onclick={confirmEndGame} class="confirm-button">
            End Game
          </button>
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
  main {
    font-family: monospace;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 20px;
    min-height: 100vh;
  }

  img {
    height: 60px;
    max-width: 100%;
    width: auto;
  }

  @media (max-width: 480px) {
    img {
      height: 50px;
    }
  }

  @media (max-width: 320px) {
    img {
      height: 40px;
    }
  }

  .page-nav {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }

  .nav-button {
    padding: 8px 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: white;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    transition: background-color 0.2s ease;
  }

  .nav-button:hover:not(:disabled) {
    background-color: #f0f0f0;
  }

  .nav-button.active {
    background-color: #007bff;
    color: white;
    border-color: #0056b3;
  }

  .nav-button.active:hover {
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

  .done-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

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
    border-radius: 12px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    text-align: center;
  }

  .confirmation-dialog h3 {
    margin: 0 0 16px 0;
    font-size: 1.5em;
    color: #333;
  }

  .confirmation-dialog p {
    margin: 0 0 24px 0;
    color: #666;
    line-height: 1.5;
  }

  .confirmation-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .cancel-button, .confirm-button {
    padding: 10px 20px;
    border: 2px solid;
    border-radius: 6px;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    font-weight: bold;
    transition: all 0.2s ease;
  }

  .cancel-button {
    background-color: white;
    color: #6c757d;
    border-color: #6c757d;
  }

  .cancel-button:hover {
    background-color: #6c757d;
    color: white;
  }

  .confirm-button {
    background-color: #dc3545;
    color: white;
    border-color: #c82333;
  }

  .confirm-button:hover {
    background-color: #c82333;
  }
</style>
