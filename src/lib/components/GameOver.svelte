<script lang="ts">
  import { gameOver } from '../stores/game';
  import { createEventDispatcher } from 'svelte';

  export let message: string = '';
  const dispatch = createEventDispatcher();

  function handleRestart() {
    dispatch('restart');
  }
</script>

<div id="game-over" style="display: {$gameOver ? 'block' : 'none'}">
  <h2 id="game-over-message">{message}</h2>
  <button id="restart-button" on:click={handleRestart}>Play Again</button>
</div>

<style>
  #game-over {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.8);
    padding: 30px;
    border-radius: 10px;
  }

  #restart-button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  }
</style>
