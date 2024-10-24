<script lang="ts">
  import { onMount } from 'svelte';
  import { player1, player2 } from '../stores/game';

  let maxScore1 = 0;
  let maxScore2 = 0;

  onMount(() => {
    maxScore1 = parseInt(localStorage.getItem("maxScore1") || "0");
    maxScore2 = parseInt(localStorage.getItem("maxScore2") || "0");
  });

  $: {
    if (typeof window !== 'undefined' && $player1 && $player1.score > maxScore1) {
      maxScore1 = $player1.score;
      localStorage.setItem("maxScore1", maxScore1.toString());
    }
    if (typeof window !== 'undefined' && $player2 && $player2.score > maxScore2) {
      maxScore2 = $player2.score;
      localStorage.setItem("maxScore2", maxScore2.toString());
    }
  }
</script>

<div id="scoreboard">
  <div id="player2-score">
    Player 2 Score: {$player2?.score ?? 0} (Best: {maxScore2})
  </div>
  <div id="player1-score">
    Player 1 Score: {$player1?.score ?? 0} (Best: {maxScore1})
  </div>
</div>

<style>
  #scoreboard {
    display: flex;
    justify-content: space-around;
    margin-bottom: 10px;
  }
</style>
