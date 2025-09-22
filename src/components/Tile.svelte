<script lang="ts">
  import type { Tile } from '../types/game'
  import type { TileState } from '../types/game'
  import { createEventDispatcher } from 'svelte'

  export let tile: Tile
  export let state: TileState

  const dispatch = createEventDispatcher()

  function handleClick() {
    dispatch('click')
  }

  function getGridStyle() {
    return `grid-row-start: ${tile.position.x + 1}; grid-column-start: ${tile.position.y + 1};`
  }
</script>

<div 
  class="tile {state}"
  style={getGridStyle()}
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
  <div class="corner top-left">{tile.letter}</div>
  <div class="corner top-right">{tile.letter}</div>
  <div class="corner bottom-left">{tile.letter}</div>
  <div class="corner bottom-right">{tile.letter}</div>
</div>

<style>
  .tile {
    aspect-ratio: 1 / 1;
    grid-row-end: span 2;
    grid-column-end: span 2;
    position: relative;
    border-bottom: 4px solid #E4CBAF;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.1s ease;
  }

  .tile.available {
    background-color: #F2E3CA;
  }

  .tile.available:hover {
    background-color: #EBD7BD;
  }

  .tile.selected {
    background-color: #CCE6BF;
    border-bottom: 4px solid #BED4AA;
  }

  .tile.visible-unselectable {
    background-color: #F0C6AF;
    border-bottom: 4px solid #E3B49A;
    cursor: not-allowed;
  }

  .tile.temp-selectable {
    background-color: #B3D9FF;
    border-bottom: 4px solid #99CCFF;
    cursor: pointer;
  }

  .tile.temp-selectable:hover {
    background-color: #A6D1FF;
  }

  .tile.hidden {
    display: none;
  }

  .corner {
    position: absolute;
    width: 50%;
    height: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
  }

  .top-left {
    top: 0;
    left: 0;
  }

  .top-right {
    top: 0;
    right: 0;
  }

  .bottom-left {
    bottom: 0;
    left: 0;
  }

  .bottom-right {
    bottom: 0;
    right: 0;
  }
</style>
