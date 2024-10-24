import type { Player } from '../types';
import { isOutOfBounds } from '../stores/game';
import { GAME_CONFIG } from '../config';
import { tileCount } from '../stores/game';

export function handlePlayerMovement(player: Player, movement: { vx: number; vy: number }): boolean {
  if (!player) return false;

  // Check against current movement direction, not planned movement
  const currentVx = player.lastVx || player.vx;
  const currentVy = player.lastVy || player.vy;
  
  // Prevent moving in exact opposite direction of current movement
  const isOppositeDirection =
    (currentVx === -movement.vx && movement.vx !== 0) ||
    (currentVy === -movement.vy && movement.vy !== 0);

  // If not moving in opposite direction of current movement, set the next movement
  if (!isOppositeDirection) {
    player.vx = movement.vx;
    player.vy = movement.vy;
    return true;
  }
  return false;
}

export function movePlayer(player: Player): void {
  if (!player || (player.vx === 0 && player.vy === 0)) return;

  // Store the last movement direction
  player.lastVx = player.vx;
  player.lastVy = player.vy;

  // Move one full grid unit in the current direction
  player.x += player.vx;
  player.y += player.vy;

  // Wrap around edges
  if (player.x < 0) player.x = tileCount - 1;
  if (player.x >= tileCount) player.x = 0;
  if (player.y < 0) player.y = tileCount - 1;
  if (player.y >= tileCount) player.y = 0;

  // Update tail
  player.tail.unshift({ x: player.x, y: player.y });
  while (player.tail.length > player.maxTail) {
    player.tail.pop();
  }
}

export function checkCollision(player: Player, opponent: Player): boolean {
  if (!player || !opponent || (player.vx === 0 && player.vy === 0)) return false;

  // Check collision with own tail (skip head)
  if (
    player.tail
      .slice(1)
      .some((segment) => player.x === segment.x && player.y === segment.y)
  ) {
    return true;
  }

  // Check collision with opponent
  if (
    opponent.tail.some(
      (segment) => player.x === segment.x && player.y === segment.y
    )
  ) {
    return true;
  }

  return false;
}

export function checkLaserCollision(laser: { x: number; y: number }, player: Player): boolean {
  if (!laser || !player) return false;

  const laserX = Math.floor(laser.x);
  const laserY = Math.floor(laser.y);
  return player.tail
    .slice(0, 3)
    .some((segment) => segment.x === laserX && segment.y === laserY);
}

export function updateLasers(player1: Player, player2: Player): { winner: Player | null } {
  if (!player1 || !player2) return { winner: null };

  const players = [player1, player2];
  let winner: Player | null = null;

  players.forEach((player, index) => {
    const opponent = index === 0 ? player2 : player1;
    if (player.laser) {
      player.laser.x += player.laser.vx * GAME_CONFIG.LASER_SPEED;
      player.laser.y += player.laser.vy * GAME_CONFIG.LASER_SPEED;

      if (isOutOfBounds(player.laser)) {
        player.laser = null;
      } else if (checkLaserCollision(player.laser, opponent)) {
        winner = player;
      }
    }
  });

  return { winner };
}

export function shootLaser(player: Player): void {
  if (!player || !player.hasLaser || player.laser) return;

  player.hasLaser = false;
  
  // Get the last known movement direction
  const lastHorizontal = player.vx || player.lastVx;
  const lastVertical = player.vy || player.lastVy;

  // Initialize laser velocity
  let vx = 0;
  let vy = 0;

  // Prioritize horizontal movement
  if (lastHorizontal !== 0) {
    vx = lastHorizontal;
    vy = 0;  // Ensure vertical is 0 when moving horizontally
  } else {
    // Only use vertical if there's no horizontal movement
    vx = 0;  // Ensure horizontal is 0 when moving vertically
    vy = lastVertical || -1;  // Default to up if no vertical movement
  }

  player.laser = {
    x: player.x,
    y: player.y,
    vx,
    vy,
  };
}
