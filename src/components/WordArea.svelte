<script lang="ts">
  import { game, submitWord, clearSelection, reorderTiles, removeTileFromWord, getCurrentWordScore, toggleSwapMode } from '../lib/state.svelte'
  import { dndzone } from 'svelte-dnd-action'
  import WordTile from './WordTile.svelte'
  import type { Tile } from '../types/game'

  function handleKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        submitWord()
        break
      case 'Escape':
        e.preventDefault()
        clearSelection()
        break
    }
  }

  function handleDndConsider(e: CustomEvent) {
    // Update the selected tiles order when drag is considered
    game.selectedTiles = e.detail.items
    // Update current word to reflect new order
    game.currentWord = game.selectedTiles.map(tile => tile.letter).join('')
  }

  function handleDndFinalize(e: CustomEvent) {
    // Finalize the reorder
    game.selectedTiles = e.detail.items
    // Update current word to reflect new order
    game.currentWord = game.selectedTiles.map(tile => tile.letter).join('')
  }

  function handleTileClick(e: CustomEvent) {
    removeTileFromWord(e.detail.index)
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex a11y_no_noninteractive_element_interactions -->
<div class="word-area" on:keydown={handleKeydown} tabindex="0" role="group" aria-label="Word building area - press Enter to submit, Escape to clear" aria-live="polite">
  <div class="word-area-row">
    <div 
      class="word-tiles-container"
      use:dndzone={{ items: game.selectedTiles, flipDurationMs: 200 }}
      on:consider={handleDndConsider}
      on:finalize={handleDndFinalize}
    >
      {#each game.selectedTiles as tile, index (tile.id)}
        <WordTile 
          {tile} 
          {index}
          on:click={handleTileClick}
        />
      {/each}
    </div>
    
    {#if game.currentWord.length > 0}
      <div class="potential-score">
        {getCurrentWordScore()}
      </div>
    {/if}
  </div>
  
  <p class="feedback" style="color: {game.feedbackColor}">
    {game.feedback}
  </p>
  
  <div class="controls">
    <button on:click={clearSelection} disabled={game.currentWord.length === 0 || game.gameOver}>
      Clear
    </button>
    <button 
      on:click={toggleSwapMode} 
      disabled={game.swapsRemaining <= 0 || game.gameOver}
      class:swap-mode={game.swapMode}
    >
      Swap ({game.swapsRemaining})
    </button>
    <button on:click={submitWord} disabled={game.currentWord.length === 0 || game.gameOver}>
      Submit
    </button>
  </div>
  
</div>

<style>
  .word-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .word-area:focus {
    outline: 2px solid #007acc;
    outline-offset: 2px;
  }


  .word-area-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .word-tiles-container {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
    min-height: 50px;
    padding: 10px;
    background-color: #f0f0f0;
    border-radius: 8px;
    border: 2px dashed #ccc;
    flex: 1;
  }

  .word-tiles-container:empty::before {
    content: "Select tiles to build your word";
    color: #999;
    font-style: italic;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
  }


  .controls {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }

  button {
    padding: 8px 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: white;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    transition: background-color 0.2s ease;
  }

  button:hover:not(:disabled) {
    background-color: #f0f0f0;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button.swap-mode {
    background-color: #007bff;
    color: white;
    border-color: #0056b3;
  }

  button.swap-mode:hover:not(:disabled) {
    background-color: #0056b3;
  }

  .feedback {
    margin: 0;
    font-weight: bold;
    min-height: 1.2em;
  }

  .potential-score {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 40px;
    background-color: #28a745;
    color: white;
    border-radius: 8px;
    font-size: 18px;
    font-weight: 700;
  }
</style>
