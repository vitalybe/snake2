<script lang="ts">
  import { onMount } from 'svelte';
  import GameCanvas from '$lib/components/GameCanvas.svelte';
  import Scoreboard from '$lib/components/Scoreboard.svelte';
  import GameOver from '$lib/components/GameOver.svelte';
  import { resetGame, player1, player2, gameOver, lastMoveTime1, lastMoveTime2, fruits, spawnFruit } from '$lib/stores/game';
  import { handlePlayerMovement, movePlayer, checkCollision, updateLasers, shootLaser } from '$lib/game/movement';
  import { updateSpeedBoosts, checkFruitCollisions, handleFruitCollection } from '$lib/game/powerups';
  import type { Fruit } from '$lib/types';

  let gameOverMessage = '';

  function endGame(message: string) {
    gameOver.set(true);
    gameOverMessage = message;
  }

  function handleRestart() {
    resetGame();
    gameOverMessage = '';
  }

  function gameLoop(currentTime: number) {
    if ($gameOver) return;

    updateSpeedBoosts(currentTime, [$player1!, $player2!]);

    if (currentTime - $lastMoveTime1 >= $player1!.currentSpeed) {
      movePlayer($player1!, $player2!);
      lastMoveTime1.set(currentTime);

      if (checkCollision($player1!, $player2!)) {
        endGame("Blue Player Wins!");
        return;
      }

      const { collectedFruitIndex } = checkFruitCollisions($player1!, $fruits);
      if (collectedFruitIndex !== null && collectedFruitIndex >= 0) {
        const collectedFruit = $fruits[collectedFruitIndex];
        handleFruitCollection($player1!, collectedFruit);
        fruits.update((f: Fruit[]) => {
          f.splice(collectedFruitIndex, 1);
          return f;
        });
        spawnFruit();
      }
    }

    if (currentTime - $lastMoveTime2 >= $player2!.currentSpeed) {
      movePlayer($player2!, $player1!);
      lastMoveTime2.set(currentTime);

      if (checkCollision($player2!, $player1!)) {
        endGame("Green Player Wins!");
        return;
      }

      const { collectedFruitIndex } = checkFruitCollisions($player2!, $fruits);
      if (collectedFruitIndex !== null && collectedFruitIndex >= 0) {
        const collectedFruit = $fruits[collectedFruitIndex];
        handleFruitCollection($player2!, collectedFruit);
        fruits.update((f: Fruit[]) => {
          f.splice(collectedFruitIndex, 1);
          return f;
        });
        spawnFruit();
      }
    }

    const { winner } = updateLasers($player1!, $player2!);
    if (winner) {
      endGame(`${winner.color === 'green' ? 'Green' : 'Blue'} Player Wins!`);
      return;
    }

    requestAnimationFrame(gameLoop);
  }

  onMount(() => {
    resetGame();

    const handleKeydown = (event: KeyboardEvent) => {
      [$player1!, $player2!].forEach((player) => {
        const action = player.controls[event.key];
        if (!action) return;

        if (action === "shoot") {
          shootLaser(player);
        } else {
          handlePlayerMovement(player, action);
        }
      });
    };

    document.addEventListener("keydown", handleKeydown);
    requestAnimationFrame(gameLoop);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  });
</script>

<main>
  <h1>Local Multiplayer Snake Game</h1>
  <Scoreboard />
  <GameCanvas />
  <div id="controls">
    <h2>Controls</h2>
    <p><strong>Player 1 (Green Snake):</strong> Arrow Keys</p>
    <p><strong>Player 2 (Blue Snake):</strong> W (Up), A (Left), S (Down), D (Right)</p>
  </div>
  <GameOver message={gameOverMessage} on:restart={handleRestart} />
</main>

<style>
  main {
    text-align: center;
    font-family: Arial, sans-serif;
    background-color: #222;
    color: #fff;
    min-height: 100vh;
    padding: 20px;
  }

  h1 {
    margin-top: 20px;
  }

  #controls {
    margin-top: 10px;
  }
</style>
