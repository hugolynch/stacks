<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { Tile } from '../types/game'

  export let tile: Tile
  export let index: number

  const dispatch = createEventDispatcher()

  function handleClick() {
    dispatch('click', { index, tile })
  }
</script>

<div 
  class="word-tile"
  on:click={handleClick}
  role="button"
  tabindex="0"
  on:keydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }}
>
  {tile.letter}
</div>

<style>
  .word-tile {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: #90EE90;
    border: 2px solid #4CAF50;
    border-radius: 4px;
    cursor: grab;
    user-select: none;
    font-weight: bold;
    font-size: 18px;
    transition: all 0.1s ease;
  }

  .word-tile:hover {
    background-color: #7ED321;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .word-tile:active {
    cursor: grabbing;
  }

  .word-tile:focus {
    outline: 2px solid #007acc;
    outline-offset: 2px;
  }
</style>