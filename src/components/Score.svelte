<script lang="ts">
  import { game } from '../lib/state.svelte'
</script>

<div class="score-container">
  {#if game.gameOver}
    <h3 class="final-score">Final Score: {game.finalScore}</h3>
    <div class="score-breakdown">
      <div class="score-item">
        <span class="label">Words Score:</span>
        <span class="value">{game.totalScore}</span>
      </div>
      <div class="score-item penalty">
        <span class="label">Penalty ({game.penaltyScore / 3} remaining letters):</span>
        <span class="value">-{game.penaltyScore}</span>
      </div>
      <div class="score-item total">
        <span class="label">Final Score:</span>
        <span class="value">{game.finalScore}</span>
      </div>
    </div>
  {:else}
    <h3>Score: {game.totalScore}</h3>
  {/if}
  
  {#if game.usedWords.length > 0}
    <div class="word-list">
      <ul>
        {#each game.usedWords as wordData (wordData.word)}
          <li>{wordData.word} ({wordData.score})</li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style>
  .score-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    margin-top: 10px;
  }

  h3 {
    margin: 0;
    font-size: 1.5em;
    color: #333;
  }

  .final-score {
    color: #28a745;
    font-size: 1.8em;
    font-weight: bold;
  }

  .score-breakdown {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 15px;
    background-color: #f8f9fa;
    border: 2px solid #dee2e6;
    border-radius: 8px;
    min-width: 250px;
  }

  .score-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;
  }

  .score-item.penalty {
    color: #dc3545;
    font-weight: bold;
  }

  .score-item.total {
    border-top: 2px solid #dee2e6;
    padding-top: 10px;
    margin-top: 5px;
    font-weight: bold;
    font-size: 1.1em;
  }

  .label {
    font-weight: 500;
  }

  .value {
    font-weight: bold;
  }

  .word-list {
    text-align: center;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
    max-height: 200px;
    overflow-y: auto;
  }

  li {
    padding: 4px 8px;
    background-color: #f0f0f0;
    border-radius: 4px;
    font-size: 0.9em;
  }
</style>
