<script lang="ts">
  import { onMount } from 'svelte';
  import { player1, player2 } from '../stores/game';

  let maxScores: { [key: string]: number } = {};

  onMount(() => {
    const storedScores = localStorage.getItem("maxScores");
    if (storedScores) {
      maxScores = JSON.parse(storedScores);
    }
  });

  $: {
    if (typeof window !== 'undefined' && $player1) {
      const playerName = $player1.name || "Player 1";
      if ($player1.score > (maxScores[playerName] || 0)) {
        maxScores[playerName] = $player1.score;
        localStorage.setItem("maxScores", JSON.stringify(maxScores));
      }
    }
    if (typeof window !== 'undefined' && $player2) {
      const playerName = $player2.name || "Player 2";
      if ($player2.score > (maxScores[playerName] || 0)) {
        maxScores[playerName] = $player2.score;
        localStorage.setItem("maxScores", JSON.stringify(maxScores));
      }
    }
  }
</script>

<div id="scoreboard">
  <div id="player2-score">
    {($player2?.name || "Player 2")} Score: {$player2?.score ?? 0} (Best: {maxScores[$player2?.name || "Player 2"] || 0})
  </div>
  <div id="player1-score">
    {($player1?.name || "Player 1")} Score: {$player1?.score ?? 0} (Best: {maxScores[$player1?.name || "Player 1"] || 0})
  </div>
</div>

<style>
  #scoreboard {
    display: flex;
    justify-content: space-around;
    margin-bottom: 10px;
  }
</style>
