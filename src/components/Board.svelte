<script lang="ts">
  import { game, toggleTileSelection, getTileState } from '../lib/state.svelte'
  import type { Tile } from '../types/game'
  import TileComponent from './Tile.svelte'

  function handleTileClick(tile: Tile) {
    toggleTileSelection(tile)
  }
</script>

<div class="game-container">
  {#each game.layers.slice().reverse() as layer, layerIndex}
    <div class="layer">
      {#each layer.tiles as tile (tile.id)}
        <TileComponent 
          {tile} 
          state={getTileState(tile)}
          on:click={() => handleTileClick(tile)}
        />
      {/each}
    </div>
  {/each}
</div>

<div class="board-background">
  <div class="top-layer-background">
    <div class="middle-layer-background">
      <div class="bottom-layer-background"></div>
    </div>
  </div>
</div>

<style>
  .game-container {
    display: grid;
    width: calc(45px * 8);
    grid-template: repeat(8, 1fr) / repeat(8, 1fr);
    gap: 2px;
    margin: 5px auto;
  }

  .layer {
    display: grid;
    grid-area: 1 / 1 / -1 / -1;
    grid-template-rows: repeat(8, 1fr);
    grid-template-columns: repeat(8, 1fr);
    gap: 4px;
  }

  .board-background {
    position: absolute;
    z-index: -1;
    pointer-events: none;
    background-color: purple;
    padding: 8px;
  }

  .top-layer-background {
    position: absolute;
    width: 376px;
    height: 372px;
    background-color: #6D6E78;
    left: -180px;
    top: 1px;
    border-radius: 16px;
    box-shadow: 0 -6px 0 0 #484953;
  }

  .middle-layer-background {
    position: absolute;
    background-color: #484953;
    width: 284px;
    height: 280px;
    left: 46px;
    top: 46px;
    border-radius: 16px;
    box-shadow: 0 -4px 0 0 #3E3F47;
  }

  .bottom-layer-background {
    position: absolute;
    width: 194px;
    height: 190px;
    left: 45px;
    top: 45px;
    background-color: #2E2F38;
    border-radius: 16px;
    box-shadow: 0 -2px 0 0 #2E2F38;
  }
</style>
