<script lang="ts">
  import { onMount } from 'svelte'
  import { game, initializeGame, confirmEndGame, setDailyPuzzleMode } from './lib/state.svelte'
  import Board from './components/Board.svelte'
  import WordArea from './components/WordArea.svelte'
  import Score from './components/Score.svelte'
  import DailyPuzzle from './components/DailyPuzzle.svelte'
  import Instructions from './components/Instructions.svelte'
  const logo = './logo.svg'

  // Navigation state
  let currentPage = $state<'main' | 'daily' | 'instructions'>('main')

  onMount(() => {
    // Restore page state from localStorage
    const savedPage = localStorage.getItem('stacks-current-page')
    if (savedPage && ['main', 'daily', 'instructions'].includes(savedPage)) {
      currentPage = savedPage as 'main' | 'daily' | 'instructions'
    }

    // Set to regular game mode (not Daily Puzzle) unless on daily page
    setDailyPuzzleMode(currentPage === 'daily')
    
    // Only initialize game if on main page
    if (currentPage === 'main') {
      initializeGame()
    }
  })

  function goToMainGame() {
    currentPage = 'main'
    localStorage.setItem('stacks-current-page', 'main')
    // Set to regular game mode (not Daily Puzzle)
    setDailyPuzzleMode(false)
    // Reset game state and generate new puzzle for free play
    initializeGame()
  }

  function goToDailyPuzzle() {
    currentPage = 'daily'
    localStorage.setItem('stacks-current-page', 'daily')
  }

  function goToInstructions() {
    currentPage = 'instructions'
    localStorage.setItem('stacks-current-page', 'instructions')
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
    <button 
      class="nav-button" 
      class:active={currentPage === 'instructions'}
      onclick={goToInstructions}
    >
      Instructions
    </button>
  </nav>

  <!-- Main Game Page -->
  {#if currentPage === 'main'}
    <div class="game-page">
      <Board />
      <WordArea />
      <Score />
      
      <div class="bottom-controls">
        {#if game.gameOver}
          <button 
            onclick={goToMainGame} 
            class="new-game-button"
          >
            <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M3 21v-5h5"></path>
            </svg>
            New Game
          </button>
        {:else}
          <button 
            onclick={confirmEndGame} 
            class="done-button"
          >
            <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            End Game
          </button>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Daily Puzzle Page -->
  {#if currentPage === 'daily'}
    <DailyPuzzle />
  {/if}

  <!-- Instructions Page -->
  {#if currentPage === 'instructions'}
    <Instructions />
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
    box-sizing: border-box;
  }

  img {
    height: 60px;
    max-width: 100%;
    width: auto;
    display: block;
    margin: 0 auto;
  }

  @media (max-width: 768px) {
    main {
      padding: 16px;
    }
    
    img {
      height: 55px;
    }
  }

  @media (max-width: 480px) {
    main {
      padding: 12px;
    }
    
    img {
      height: 50px;
    }
  }

  @media (max-width: 360px) {
    main {
      padding: 8px;
    }
    
    img {
      height: 45px;
    }
  }

  @media (max-width: 320px) {
    main {
      padding: 6px;
    }
    
    img {
      height: 40px;
    }
  }

  .page-nav {
    display: flex;
    gap: 10px;
  }

  .nav-button {
    padding: 8px 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: white;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    transition: background-color 0.1s ease;
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
    transition: background-color 0.1s ease;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .done-button:hover:not(:disabled) {
    background-color: #c82333;
  }

  .done-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .new-game-button {
    padding: 8px 16px;
    border: 1px solid #007bff;
    border-radius: 4px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    transition: background-color 0.1s ease;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .new-game-button:hover {
    background-color: #0056b3;
  }

  .button-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

</style>
