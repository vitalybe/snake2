// Get the canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game configuration constants
const GAME_CONFIG = {
  GROWTH_PER_FRUIT: 3,    // How much snake grows when eating a fruit
  FRUITS_COUNT: 2,        // Number of fruits on screen at once
  INITIAL_TAIL_LENGTH: 4  // Starting tail length
};

// Set up the game variables
const gridSize = 20;
const tileCount = canvas.width / gridSize;
const gameSpeed = 150; // Controls snake speed in milliseconds
let lastTime = 0;

let player1 = {
  x: 5,
  y: 5,
  vx: 0,
  vy: 0,
  tail: [{x: 5, y: 5}], // Initialize with starting position
  maxTail: GAME_CONFIG.INITIAL_TAIL_LENGTH,
  color: "green",
  score: 0,
};

let player2 = {
  x: tileCount - 5,
  y: tileCount - 5,
  vx: 0,
  vy: 0,
  tail: [{x: tileCount - 5, y: tileCount - 5}], // Initialize with starting position
  maxTail: GAME_CONFIG.INITIAL_TAIL_LENGTH,
  color: "blue",
  score: 0,
};

// Array to store multiple fruits
let fruits = [];

let gameOver = false;

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

  // Control game speed
  if (currentTime - lastTime < gameSpeed) return;
  lastTime = currentTime;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  movePlayer(player1);
  movePlayer(player2);

  checkCollision(player1, player2);
  checkCollision(player2, player1);

  drawFruits();
  drawPlayer(player1);
  drawPlayer(player2);
}

// Move player
function movePlayer(player) {
  // Only move if there's velocity
  if (player.vx === 0 && player.vy === 0) return;

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
      player.maxTail += GAME_CONFIG.GROWTH_PER_FRUIT;
      player.score++;
      updateScore();
      fruits.splice(i, 1); // Remove eaten fruit
      spawnFruit(); // Spawn new fruit
    }
  }
}

// Draw player
function drawPlayer(player) {
  ctx.fillStyle = player.color;
  for (let segment of player.tail) {
    ctx.fillRect(
      segment.x * gridSize,
      segment.y * gridSize,
      gridSize - 2,
      gridSize - 2
    );
  }
}

// Draw fruits
function drawFruits() {
  ctx.fillStyle = "red";
  for (let fruit of fruits) {
    ctx.fillRect(
      fruit.x * gridSize,
      fruit.y * gridSize,
      gridSize - 2,
      gridSize - 2
    );
  }
}

// Spawn new fruit
function spawnFruit() {
  while (fruits.length < GAME_CONFIG.FRUITS_COUNT) {
    const newFruit = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
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
  return fruits.some(fruit => fruit.x === x && fruit.y === y);
}

// Check if position is on a snake
function isOnSnake(x, y, player) {
  return player.tail.some(segment => segment.x === x && segment.y === y);
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
  player1ScoreEl.textContent = `Player 1 Score: ${player1.score}`;
  player2ScoreEl.textContent = `Player 2 Score: ${player2.score}`;
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
  player1.tail = [{x: 5, y: 5}];
  player1.maxTail = GAME_CONFIG.INITIAL_TAIL_LENGTH;
  player1.score = 0;

  player2.x = tileCount - 5;
  player2.y = tileCount - 5;
  player2.vx = 0;
  player2.vy = 0;
  player2.tail = [{x: tileCount - 5, y: tileCount - 5}];
  player2.maxTail = GAME_CONFIG.INITIAL_TAIL_LENGTH;
  player2.score = 0;

  fruits = []; // Clear existing fruits
  spawnFruit(); // Spawn initial fruits
  updateScore();
}

// Handle keyboard input
document.addEventListener("keydown", (e) => {
  // Player 1 controls (Arrow Keys)
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

  // Player 2 controls (WASD)
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
});

// Start the game
resetGame();
requestAnimationFrame(game);
