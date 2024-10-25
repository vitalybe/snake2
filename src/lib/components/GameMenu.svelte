<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function startGame() {
    dispatch('start');
  }
</script>

<div id="game-menu">
  <h1>Snake Game</h1>
  <button on:click={startGame}>Start Game</button>
</div>

<style>
  #game-menu {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.8);
    color: #fff;
  }

  button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  }
</style>
