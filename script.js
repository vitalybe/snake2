// ==============================================
// FILE: config.js
// Contains all game configuration and constants
// ==============================================
const GAME_CONFIG = {
  GROWTH_PER_FRUIT: 3,
  FRUITS_COUNT: 3,
  INITIAL_TAIL_LENGTH: 4,
  SPEED_BOOST_DURATION: 3000,
  NORMAL_SPEED: 150,
  BOOST_SPEED: 80,
  LASER_SPEED: 0.2,
  GRID_SIZE: 20,
};

let player1;
let player2;

// ==============================================
// FILE: gameState.js
// Contains game state management and initialization
// ==============================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const tileCount = canvas.width / GAME_CONFIG.GRID_SIZE;

let lastTime = 0;
let lastMoveTime1 = 0;
let lastMoveTime2 = 0;
let gameOver = false;
let fruits = [];

// Player state initialization
const createPlayer = (x, y, color) => ({
  x,
  y,
  vx: 0,
  vy: 0,
  tail: [{ x, y }],
  maxTail: GAME_CONFIG.INITIAL_TAIL_LENGTH,
  color,
  score: 0,
  speedBoostEnd: 0,
  currentSpeed: GAME_CONFIG.NORMAL_SPEED,
  hasLaser: false,
  laser: null,
  lastVx: 0,
  lastVy: 0,
});

// ==============================================
// FILE: powerUps.js
// Handles power-ups and special abilities
// ==============================================
function updateSpeedBoosts(currentTime) {
  [player1, player2].forEach((player) => {
    if (player.speedBoostEnd > 0 && currentTime > player.speedBoostEnd) {
      player.speedBoostEnd = 0;
      player.currentSpeed = GAME_CONFIG.NORMAL_SPEED;
    }
  });
}

function shootLaser(player) {
  if (player.hasLaser && !player.laser) {
    player.hasLaser = false;
    // Prioritize horizontal movement over vertical for laser direction
    let vx = player.vx || player.lastVx;
    let vy = 0;
    // Only use vertical if there's no horizontal movement
    if (vx === 0) {
      vy = player.vy || player.lastVy || -1;
    }
    player.laser = {
      x: player.x,
      y: player.y,
      vx: vx || 1, // Default to right if no direction
      vy: vy,
    };
  }
}

function updateLasers() {
  [player1, player2].forEach((player, index) => {
    const opponent = index === 0 ? player2 : player1;
    if (player.laser) {
      player.laser.x += player.laser.vx * GAME_CONFIG.LASER_SPEED;
      player.laser.y += player.laser.vy * GAME_CONFIG.LASER_SPEED;

      if (isOutOfBounds(player.laser)) {
        player.laser = null;
      } else if (checkLaserCollision(player.laser, opponent)) {
        endGame(
          `${
            player.color.charAt(0).toUpperCase() + player.color.slice(1)
          } Player Wins!`
        );
      }
    }
  });
}

// ==============================================
// FILE: collisionDetection.js
// Handles all collision-related logic
// ==============================================
function isOutOfBounds(object) {
  return (
    object.x < 0 ||
    object.x >= tileCount ||
    object.y < 0 ||
    object.y >= tileCount
  );
}

function checkLaserCollision(laser, player) {
  const laserX = Math.floor(laser.x);
  const laserY = Math.floor(laser.y);
  return player.tail
    .slice(0, 3)
    .some((segment) => segment.x === laserX && segment.y === laserY);
}

function checkCollision(player, opponent) {
  if (player.vx === 0 && player.vy === 0) return;

  // Self-collision
  if (
    player.tail
      .slice(1)
      .some((segment) => player.x === segment.x && player.y === segment.y)
  ) {
    endGame(
      `${
        opponent.color.charAt(0).toUpperCase() + opponent.color.slice(1)
      } Player Wins!`
    );
    return;
  }

  // Opponent collision
  if (
    opponent.tail.some(
      (segment) => player.x === segment.x && player.y === segment.y
    )
  ) {
    endGame(
      `${
        opponent.color.charAt(0).toUpperCase() + opponent.color.slice(1)
      } Player Wins!`
    );
  }
}

// ==============================================
// FILE: fruitManager.js
// Handles fruit spawning and collection
// ==============================================
function isOnSnake(x, y, player) {
  return player.tail.some((segment) => segment.x === x && segment.y === y);
}

function isOnFruit(x, y) {
  return fruits.some((fruit) => fruit.x === x && fruit.y === y);
}

function spawnFruit() {
  while (fruits.length < GAME_CONFIG.FRUITS_COUNT) {
    const rand = Math.random();
    const newFruit = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
      type: rand < 0.1 ? "speed" : rand < 0.2 ? "laser" : "regular",
    };

    if (
      !isOnSnake(newFruit.x, newFruit.y, player1) &&
      !isOnSnake(newFruit.x, newFruit.y, player2) &&
      !isOnFruit(newFruit.x, newFruit.y)
    ) {
      fruits.push(newFruit);
    }
  }
}

// ==============================================
// FILE: playerMovement.js
// Handles player movement and fruit collection
// ==============================================
function movePlayer(player, opponent) {
  if (player.vx === 0 && player.vy === 0) return;

  if (player.vx !== 0 || player.vy !== 0) {
    player.lastVx = player.vx;
    player.lastVy = player.vy;
  }

  player.x += player.vx;
  player.y += player.vy;

  // Wrap around edges
  if (player.x < 0) player.x = tileCount - 1;
  if (player.x >= tileCount) player.x = 0;
  if (player.y < 0) player.y = tileCount - 1;
  if (player.y >= tileCount) player.y = 0;

  player.tail.unshift({ x: player.x, y: player.y });
  while (player.tail.length > player.maxTail) {
    player.tail.pop();
  }

  // Check collisions after movement
  checkCollision(player, opponent);

  // Fruit collection
  for (let i = fruits.length - 1; i >= 0; i--) {
    if (player.x === fruits[i].x && player.y === fruits[i].y) {
      handleFruitCollection(player, fruits[i]);
      fruits.splice(i, 1);
      spawnFruit();
    }
  }
}

function handleFruitCollection(player, fruit) {
  switch (fruit.type) {
    case "speed":
      player.speedBoostEnd =
        performance.now() + GAME_CONFIG.SPEED_BOOST_DURATION;
      player.currentSpeed = GAME_CONFIG.BOOST_SPEED;
      break;
    case "laser":
      player.hasLaser = true;
      break;
    default:
      player.maxTail += GAME_CONFIG.GROWTH_PER_FRUIT;
      player.score++;
      updateScore();
  }
}

// ==============================================
// FILE: renderer.js
// Handles all game rendering
// ==============================================
function drawPlayer(player) {
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

function drawFruits() {
  fruits.forEach((fruit) => {
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

function drawLasers() {
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;

  [player1, player2].forEach((player) => {
    if (player.laser) {
      ctx.fillStyle = player === player1 ? "#90EE90" : "#87CEEB";
      ctx.fillRect(
        Math.floor(player.laser.x) * GAME_CONFIG.GRID_SIZE,
        Math.floor(player.laser.y) * GAME_CONFIG.GRID_SIZE,
        GAME_CONFIG.GRID_SIZE - 2,
        GAME_CONFIG.GRID_SIZE - 2
      );
    }
  });
}

// ==============================================
// FILE: scoreManager.js
// Handles score tracking and updates
// ==============================================
const player1ScoreEl = document.getElementById("player1-score");
const player2ScoreEl = document.getElementById("player2-score");
let maxScore1 = parseInt(localStorage.getItem("maxScore1")) || 0;
let maxScore2 = parseInt(localStorage.getItem("maxScore2")) || 0;

function updateScore() {
  if (player1.score > maxScore1) {
    maxScore1 = player1.score;
    localStorage.setItem("maxScore1", maxScore1);
  }
  if (player2.score > maxScore2) {
    maxScore2 = player2.score;
    localStorage.setItem("maxScore2", maxScore2);
  }

  player1ScoreEl.textContent = `Player 1 Score: ${player1.score} (Best: ${maxScore1})`;
  player2ScoreEl.textContent = `Player 2 Score: ${player2.score} (Best: ${maxScore2})`;
}

// ==============================================
// FILE: gameManager.js
// Handles game state management and main loop
// ==============================================
const gameOverEl = document.getElementById("game-over");
const gameOverMessageEl = document.getElementById("game-over-message");
const restartButton = document.getElementById("restart-button");

function game(currentTime) {
  if (gameOver) return;

  requestAnimationFrame(game);
  updateSpeedBoosts(currentTime);

  if (currentTime - lastMoveTime1 >= player1.currentSpeed) {
    movePlayer(player1, player2);
    lastMoveTime1 = currentTime;
  }

  if (currentTime - lastMoveTime2 >= player2.currentSpeed) {
    movePlayer(player2, player1);
    lastMoveTime2 = currentTime;
  }

  updateLasers();

  if (currentTime - lastTime >= 16) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFruits();
    drawPlayer(player1);
    drawPlayer(player2);
    drawLasers();
    lastTime = currentTime;
  }
}

function endGame(message) {
  gameOver = true;
  gameOverEl.style.display = "block";
  gameOverMessageEl.textContent = message;
}

function resetGame() {
  player1 = createPlayer(5, 5, "green");
  player1.controls = {
    ArrowLeft: { vx: -1, vy: 0 },
    ArrowUp: { vx: 0, vy: -1 },
    ArrowRight: { vx: 1, vy: 0 },
    ArrowDown: { vx: 0, vy: 1 },
    Space: "shoot",
  };
  player2 = createPlayer(tileCount - 5, tileCount - 5, "blue");
  player2.controls = {
    a: { vx: -1, vy: 0 },
    w: { vx: 0, vy: -1 },
    d: { vx: 1, vy: 0 },
    s: { vx: 0, vy: 1 },
    e: "shoot",
  };

  lastMoveTime1 = 0;
  lastMoveTime2 = 0;
  lastTime = 0;

  fruits = [];
  spawnFruit();
  updateScore();
}

// ==============================================
// FILE: inputHandler.js
// Handles keyboard input
// ==============================================

/**
 * Handles movement for a player
 * @param {Object} player - The player object to move
 * @param {Object} movement - The movement vector {vx, vy}
 * @returns {boolean} - Whether the movement was applied
 */
function handlePlayerMovement(player, movement) {
  // Prevent moving in exact opposite direction (common in snake-like games)
  const isOppositeDirection =
    player.vx === -movement.vx && player.vy === -movement.vy;

  if (!isOppositeDirection) {
    Object.assign(player, movement);
    return true;
  }
  return false;
}

/**
 * Main keyboard event handler
 */
document.addEventListener("keydown", (event) => {
  [player1, player2].forEach((player) => {
    const action = player.controls[event.key];
    if (!action) return; // Key not mapped for this player

    if (action === "shoot") {
      shootLaser(player);
    } else {
      handlePlayerMovement(player, action);
    }
  });
});

// ==============================================
// Initialize game
// ==============================================
restartButton.addEventListener("click", () => {
  resetGame();
  gameOverEl.style.display = "none";
  gameOver = false;
  requestAnimationFrame(game);
});

resetGame();
requestAnimationFrame(game);
