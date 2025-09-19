<script lang="ts">
  import { onMount } from 'svelte'
  import { game, initializeGame, showEndGameConfirmation, cancelEndGame, confirmEndGame } from './lib/state.svelte'
  import Board from './components/Board.svelte'
  import WordArea from './components/WordArea.svelte'
  import Score from './components/Score.svelte'
  const logo = '/logo.svg'

  onMount(() => {
    initializeGame()
  })
</script>

<main>
  <img src={logo} alt="Stacks Logo" />
  <Board />
  <WordArea />
  <Score />
  
  <div class="bottom-controls">
    <button 
      on:click={showEndGameConfirmation} 
      disabled={game.gameOver}
      class="done-button"
    >
      End Game
    </button>
  </div>

  <!-- Confirmation Dialog -->
  {#if game.showEndGameConfirmation}
    <div 
      class="confirmation-overlay" 
      on:click={cancelEndGame}
      on:keydown={(e) => e.key === 'Escape' && cancelEndGame()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      tabindex="-1"
    >
      <div 
        class="confirmation-dialog" 
        on:click|stopPropagation
        on:keydown={(e) => e.key === 'Escape' && cancelEndGame()}
        role="alertdialog"
        tabindex="0"
      >
        <h3 id="dialog-title">End Game?</h3>
        <p>Are you sure you want to end the game? You'll receive a penalty for any remaining letters.</p>
        
        <div class="confirmation-buttons">
          <button on:click={cancelEndGame} class="cancel-button">
            Cancel
          </button>
          <button on:click={confirmEndGame} class="confirm-button">
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
  }

  .bottom-controls {
    margin-top: auto;
    padding: 20px 0;
  }

  .done-button {
    padding: 12px 24px;
    border: 2px solid #c82333;
    border-radius: 8px;
    background-color: #dc3545;
    color: white;
    cursor: pointer;
    font-family: inherit;
    font-size: 16px;
    font-weight: bold;
    transition: all 0.2s ease;
  }

  .done-button:hover:not(:disabled) {
    background-color: #c82333;
    border-color: #a71e2a;
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
