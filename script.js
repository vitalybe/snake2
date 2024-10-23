// Get the canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game configuration constants
const GAME_CONFIG = {
  GROWTH_PER_FRUIT: 3, // How much snake grows when eating a fruit
  FRUITS_COUNT: 3, // Number of fruits on screen at once
  INITIAL_TAIL_LENGTH: 4, // Starting tail length
  SPEED_BOOST_DURATION: 3000, // Speed boost duration in milliseconds
  NORMAL_SPEED: 150, // Normal game speed
  BOOST_SPEED: 80, // Boosted game speed
  LASER_SPEED: 0.2, // Speed of laser projectile (reduced for slower movement)
};

// Set up the game variables
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let lastTime = 0;
let lastMoveTime1 = 0;
let lastMoveTime2 = 0;

let player1 = {
  x: 5,
  y: 5,
  vx: 0,
  vy: 0,
  tail: [{ x: 5, y: 5 }],
  maxTail: GAME_CONFIG.INITIAL_TAIL_LENGTH,
  color: "green",
  score: 0,
  speedBoostEnd: 0,
  currentSpeed: GAME_CONFIG.NORMAL_SPEED,
  hasLaser: false,
  laser: null,
};

let player2 = {
  x: tileCount - 5,
  y: tileCount - 5,
  vx: 0,
  vy: 0,
  tail: [{ x: tileCount - 5, y: tileCount - 5 }],
  maxTail: GAME_CONFIG.INITIAL_TAIL_LENGTH,
  color: "blue",
  score: 0,
  speedBoostEnd: 0,
  currentSpeed: GAME_CONFIG.NORMAL_SPEED,
  hasLaser: false,
  laser: null,
};

// Array to store multiple fruits
let fruits = [];

let gameOver = false;

// Load max scores from localStorage
let maxScore1 = parseInt(localStorage.getItem("maxScore1")) || 0;
let maxScore2 = parseInt(localStorage.getItem("maxScore2")) || 0;

// Scoreboard elements
const player1ScoreEl = document.getElementById("player1-score");
const player2ScoreEl = document.getElementById("player2-score");
const gameOverEl = document.getElementById("game-over");
const gameOverMessageEl = document.getElementById("game-over-message");
const restartButton = document.getElementById("restart-button");

// Game loop
function game(currentTime) {
  if (gameOver) return;

  requestAnimationFrame(game);

  // Update speed boosts
  updateSpeedBoosts(currentTime);

  // Move player 1
  if (currentTime - lastMoveTime1 >= player1.currentSpeed) {
    movePlayer(player1);
    checkCollision(player1, player2);
    lastMoveTime1 = currentTime;
  }

  // Move player 2
  if (currentTime - lastMoveTime2 >= player2.currentSpeed) {
    movePlayer(player2);
    checkCollision(player2, player1);
    lastMoveTime2 = currentTime;
  }

  // Update lasers
  updateLasers();

  // Render frame
  if (currentTime - lastTime >= 16) {
    // ~60 FPS
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFruits();
    drawPlayer(player1);
    drawPlayer(player2);
    drawLasers();
    lastTime = currentTime;
  }
}

function updateSpeedBoosts(currentTime) {
  // Check and update player speed boosts
  if (player1.speedBoostEnd > 0 && currentTime > player1.speedBoostEnd) {
    player1.speedBoostEnd = 0;
    player1.currentSpeed = GAME_CONFIG.NORMAL_SPEED;
  }
  if (player2.speedBoostEnd > 0 && currentTime > player2.speedBoostEnd) {
    player2.speedBoostEnd = 0;
    player2.currentSpeed = GAME_CONFIG.NORMAL_SPEED;
  }
}

function updateLasers() {
  // Update player 1 laser
  if (player1.laser) {
    player1.laser.x += player1.laser.vx * GAME_CONFIG.LASER_SPEED;
    player1.laser.y += player1.laser.vy * GAME_CONFIG.LASER_SPEED;

    // Check wall collision
    if (
      player1.laser.x < 0 ||
      player1.laser.x >= tileCount ||
      player1.laser.y < 0 ||
      player1.laser.y >= tileCount
    ) {
      player1.laser = null;
    }
    // Check player 2 collision with improved hit detection
    else if (checkLaserCollision(player1.laser, player2)) {
      endGame("Green Player Wins!");
    }
  }

  // Update player 2 laser
  if (player2.laser) {
    player2.laser.x += player2.laser.vx * GAME_CONFIG.LASER_SPEED;
    player2.laser.y += player2.laser.vy * GAME_CONFIG.LASER_SPEED;

    // Check wall collision
    if (
      player2.laser.x < 0 ||
      player2.laser.x >= tileCount ||
      player2.laser.y < 0 ||
      player2.laser.y >= tileCount
    ) {
      player2.laser = null;
    }
    // Check player 1 collision with improved hit detection
    else if (checkLaserCollision(player2.laser, player1)) {
      endGame("Blue Player Wins!");
    }
  }
}

function checkLaserCollision(laser, player) {
  const laserX = Math.floor(laser.x);
  const laserY = Math.floor(laser.y);

  // Check collision with any part of the snake (head or tail)
  return player.tail.some((segment) => {
    // Check if the laser is within the bounds of the segment
    return segment.x === laserX && segment.y === laserY;
  });
}

function shootLaser(player) {
  if (player.hasLaser && !player.laser) {
    player.hasLaser = false;
    player.laser = {
      x: player.x,
      y: player.y,
      vx: player.vx || player.lastVx || 1, // Use last direction if not moving
      vy: player.vy || player.lastVy || 0,
    };
  }
}

function drawLasers() {
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;

  if (player1.laser) {
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(
      Math.floor(player1.laser.x) * gridSize,
      Math.floor(player1.laser.y) * gridSize,
      gridSize - 2,
      gridSize - 2
    );
  }

  if (player2.laser) {
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(
      Math.floor(player2.laser.x) * gridSize,
      Math.floor(player2.laser.y) * gridSize,
      gridSize - 2,
      gridSize - 2
    );
  }
}

// Move player
function movePlayer(player) {
  // Only move if there's velocity
  if (player.vx === 0 && player.vy === 0) return;

  // Store last direction for laser
  if (player.vx !== 0 || player.vy !== 0) {
    player.lastVx = player.vx;
    player.lastVy = player.vy;
  }

  player.x += player.vx;
  player.y += player.vy;

  // Wrap around the edges
  if (player.x < 0) player.x = tileCount - 1;
  if (player.x >= tileCount) player.x = 0;
  if (player.y < 0) player.y = tileCount - 1;
  if (player.y >= tileCount) player.y = 0;

  // Add new position to the tail
  player.tail.unshift({ x: player.x, y: player.y });

  // Keep tail at proper length
  while (player.tail.length > player.maxTail) {
    player.tail.pop();
  }

  // Check if player eats any fruit
  for (let i = fruits.length - 1; i >= 0; i--) {
    if (player.x === fruits[i].x && player.y === fruits[i].y) {
      if (fruits[i].type === "speed") {
        player.speedBoostEnd =
          performance.now() + GAME_CONFIG.SPEED_BOOST_DURATION;
        player.currentSpeed = GAME_CONFIG.BOOST_SPEED;
      } else if (fruits[i].type === "laser") {
        player.hasLaser = true;
      } else {
        player.maxTail += GAME_CONFIG.GROWTH_PER_FRUIT;
        player.score++;
        updateScore();
      }
      fruits.splice(i, 1); // Remove eaten fruit
      spawnFruit(); // Spawn new fruit
    }
  }
}

// Draw player
function drawPlayer(player) {
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;

  // Draw tail segments with border
  for (let i = player.tail.length - 1; i >= 0; i--) {
    const segment = player.tail[i];
    ctx.fillStyle = player.color;
    ctx.fillRect(
      segment.x * gridSize,
      segment.y * gridSize,
      gridSize - 2,
      gridSize - 2
    );
    ctx.strokeRect(
      segment.x * gridSize,
      segment.y * gridSize,
      gridSize - 2,
      gridSize - 2
    );
  }

  // Draw head with different color based on power-ups
  ctx.fillStyle =
    player.speedBoostEnd > 0 ? "#fff" : player.hasLaser ? "#ff0000" : "#ffff00";
  ctx.fillRect(
    player.tail[0].x * gridSize,
    player.tail[0].y * gridSize,
    gridSize - 2,
    gridSize - 2
  );
  ctx.strokeRect(
    player.tail[0].x * gridSize,
    player.tail[0].y * gridSize,
    gridSize - 2,
    gridSize - 2
  );
}

// Draw fruits
function drawFruits() {
  for (let fruit of fruits) {
    if (fruit.type === "speed") {
      // Draw speed fruit with emoji
      ctx.font = `${gridSize}px Arial`;
      ctx.fillText("⚡", fruit.x * gridSize, (fruit.y + 1) * gridSize);
    } else if (fruit.type === "laser") {
      // Draw laser fruit with different emoji
      ctx.font = `${gridSize}px Arial`;
      ctx.fillText("🎯", fruit.x * gridSize, (fruit.y + 1) * gridSize);
    } else {
      // Draw regular fruit
      ctx.fillStyle = "red";
      ctx.fillRect(
        fruit.x * gridSize,
        fruit.y * gridSize,
        gridSize - 2,
        gridSize - 2
      );
    }
  }
}

// Spawn new fruit
function spawnFruit() {
  while (fruits.length < GAME_CONFIG.FRUITS_COUNT) {
    const newFruit = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
      type:
        Math.random() < 0.2
          ? "speed"
          : Math.random() < 0.4
          ? "laser"
          : "regular", // 20% speed, 20% laser, 60% regular
    };

    // Ensure the fruit doesn't spawn on a snake or another fruit
    if (
      !isOnSnake(newFruit.x, newFruit.y, player1) &&
      !isOnSnake(newFruit.x, newFruit.y, player2) &&
      !isOnFruit(newFruit.x, newFruit.y)
    ) {
      fruits.push(newFruit);
    }
  }
}

// Check if position is on any existing fruit
function isOnFruit(x, y) {
  return fruits.some((fruit) => fruit.x === x && fruit.y === y);
}

// Check if position is on a snake
function isOnSnake(x, y, player) {
  return player.tail.some((segment) => segment.x === x && segment.y === y);
}

// Check collision with self and opponent
function checkCollision(player, opponent) {
  // Skip collision check if not moving
  if (player.vx === 0 && player.vy === 0) return;

  // Self-collision (skip head)
  for (let i = 1; i < player.tail.length; i++) {
    if (player.x === player.tail[i].x && player.y === player.tail[i].y) {
      endGame(
        opponent === player
          ? "Draw"
          : `${
              opponent.color.charAt(0).toUpperCase() + opponent.color.slice(1)
            } Player Wins!`
      );
      return;
    }
  }

  // Collision with opponent
  for (let segment of opponent.tail) {
    if (player.x === segment.x && player.y === segment.y) {
      endGame(
        `${
          opponent.color.charAt(0).toUpperCase() + opponent.color.slice(1)
        } Player Wins!`
      );
      return;
    }
  }
}

// Update scoreboard
function updateScore() {
  // Update max scores
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

// End game
function endGame(message) {
  gameOver = true;
  gameOverEl.style.display = "block";
  gameOverMessageEl.textContent = message;
}

// Restart game
restartButton.addEventListener("click", () => {
  resetGame();
  gameOverEl.style.display = "none";
  gameOver = false;
  requestAnimationFrame(game);
});

// Reset game state
function resetGame() {
  player1.x = 5;
  player1.y = 5;
  player1.vx = 0;
  player1.vy = 0;
  player1.tail = [{ x: 5, y: 5 }];
  player1.maxTail = GAME_CONFIG.INITIAL_TAIL_LENGTH;
  player1.score = 0;
  player1.speedBoostEnd = 0;
  player1.currentSpeed = GAME_CONFIG.NORMAL_SPEED;
  player1.hasLaser = false;
  player1.laser = null;

  player2.x = tileCount - 5;
  player2.y = tileCount - 5;
  player2.vx = 0;
  player2.vy = 0;
  player2.tail = [{ x: tileCount - 5, y: tileCount - 5 }];
  player2.maxTail = GAME_CONFIG.INITIAL_TAIL_LENGTH;
  player2.score = 0;
  player2.speedBoostEnd = 0;
  player2.currentSpeed = GAME_CONFIG.NORMAL_SPEED;
  player2.hasLaser = false;
  player2.laser = null;

  lastMoveTime1 = 0;
  lastMoveTime2 = 0;
  lastTime = 0;

  fruits = []; // Clear existing fruits
  spawnFruit(); // Spawn initial fruits
  updateScore();
}

// Handle keyboard input
document.addEventListener("keydown", (e) => {
  // Player 1 controls (Arrow Keys + Space for laser)
  if (e.key === "ArrowLeft" && player1.vx === 0) {
    player1.vx = -1;
    player1.vy = 0;
  }
  if (e.key === "ArrowUp" && player1.vy === 0) {
    player1.vx = 0;
    player1.vy = -1;
  }
  if (e.key === "ArrowRight" && player1.vx === 0) {
    player1.vx = 1;
    player1.vy = 0;
  }
  if (e.key === "ArrowDown" && player1.vy === 0) {
    player1.vx = 0;
    player1.vy = 1;
  }
  if (e.code === "Space") {
    shootLaser(player1);
  }

  // Player 2 controls (WASD + E for laser)
  if (e.key === "a" && player2.vx === 0) {
    player2.vx = -1;
    player2.vy = 0;
  }
  if (e.key === "w" && player2.vy === 0) {
    player2.vx = 0;
    player2.vy = -1;
  }
  if (e.key === "d" && player2.vx === 0) {
    player2.vx = 1;
    player2.vy = 0;
  }
  if (e.key === "s" && player2.vy === 0) {
    player2.vx = 0;
    player2.vy = 1;
  }
  if (e.key === "e") {
    shootLaser(player2);
  }
});

// Start the game
resetGame();
requestAnimationFrame(game);
