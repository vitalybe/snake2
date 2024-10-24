<script lang="ts">
  import { onMount } from 'svelte';
  import { GAME_CONFIG } from '../config';
  import { player1, player2, fruits, gameOver, lastTime } from '../stores/game';
  import type { Player, Fruit } from '../types';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  function drawPlayer(player: Player) {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;

    // Draw tail
    player.tail.forEach((segment) => {
      ctx.fillStyle = player.color;
      ctx.fillRect(
        segment.x * GAME_CONFIG.GRID_SIZE,
        segment.y * GAME_CONFIG.GRID_SIZE,
        GAME_CONFIG.GRID_SIZE - 2,
        GAME_CONFIG.GRID_SIZE - 2
      );
      ctx.strokeRect(
        segment.x * GAME_CONFIG.GRID_SIZE,
        segment.y * GAME_CONFIG.GRID_SIZE,
        GAME_CONFIG.GRID_SIZE - 2,
        GAME_CONFIG.GRID_SIZE - 2
      );
    });

    // Draw head
    ctx.fillStyle =
      player.speedBoostEnd > 0 ? "#fff" : player.hasLaser ? "#ff0000" : "#ffff00";
    ctx.fillRect(
      player.tail[0].x * GAME_CONFIG.GRID_SIZE,
      player.tail[0].y * GAME_CONFIG.GRID_SIZE,
      GAME_CONFIG.GRID_SIZE - 2,
      GAME_CONFIG.GRID_SIZE - 2
    );
    ctx.strokeRect(
      player.tail[0].x * GAME_CONFIG.GRID_SIZE,
      player.tail[0].y * GAME_CONFIG.GRID_SIZE,
      GAME_CONFIG.GRID_SIZE - 2,
      GAME_CONFIG.GRID_SIZE - 2
    );
  }

  function drawFruits(currentFruits: Fruit[]) {
    currentFruits.forEach((fruit) => {
      if (fruit.type === "speed") {
        ctx.font = `${GAME_CONFIG.GRID_SIZE}px Arial`;
        ctx.fillText(
          "⚡",
          fruit.x * GAME_CONFIG.GRID_SIZE,
          (fruit.y + 1) * GAME_CONFIG.GRID_SIZE
        );
      } else if (fruit.type === "laser") {
        ctx.font = `${GAME_CONFIG.GRID_SIZE}px Arial`;
        ctx.fillText(
          "🎯",
          fruit.x * GAME_CONFIG.GRID_SIZE,
          (fruit.y + 1) * GAME_CONFIG.GRID_SIZE
        );
      } else {
        ctx.fillStyle = "red";
        ctx.fillRect(
          fruit.x * GAME_CONFIG.GRID_SIZE,
          fruit.y * GAME_CONFIG.GRID_SIZE,
          GAME_CONFIG.GRID_SIZE - 2,
          GAME_CONFIG.GRID_SIZE - 2
        );
      }
    });
  }

  function drawLasers(p1: Player | null, p2: Player | null) {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;

    [p1, p2].forEach((player) => {
      if (player?.laser) {
        ctx.fillStyle = player === p1 ? "#90EE90" : "#87CEEB";
        ctx.fillRect(
          Math.floor(player.laser.x) * GAME_CONFIG.GRID_SIZE,
          Math.floor(player.laser.y) * GAME_CONFIG.GRID_SIZE,
          GAME_CONFIG.GRID_SIZE - 2,
          GAME_CONFIG.GRID_SIZE - 2
        );
      }
    });
  }

  function render(currentTime: number) {
    if ($gameOver) return;

    if (currentTime - $lastTime >= 16) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawFruits($fruits);
      if ($player1) drawPlayer($player1);
      if ($player2) drawPlayer($player2);
      drawLasers($player1, $player2);
      lastTime.set(currentTime);
    }

    requestAnimationFrame(render);
  }

  onMount(() => {
    ctx = canvas.getContext('2d')!;
    requestAnimationFrame(render);
  });
</script>

<canvas
  bind:this={canvas}
  id="gameCanvas"
  width="600"
  height="600"></canvas>

<style>
  canvas {
    border: 1px solid #fff;
    background-color: #000;
  }
</style>
