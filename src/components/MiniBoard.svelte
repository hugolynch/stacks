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
    width: calc(45px * 6);
    grid-template: repeat(6, 1fr) / repeat(6, 1fr);
    gap: 2px;
    margin: 5px auto;
  }

  .layer {
    display: grid;
    grid-area: 1 / 1 / -1 / -1;
    grid-template-rows: repeat(6, 1fr);
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
  }
</style>
