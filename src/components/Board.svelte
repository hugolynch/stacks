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
    grid-template-rows: subgrid;
    grid-template-columns: subgrid;
    gap: 4px;
  }
</style>
