import type { Player } from '../types';
import { isOutOfBounds } from '../stores/game';
import { GAME_CONFIG } from '../config';
import { tileCount } from '../stores/game';

export function handlePlayerMovement(player: Player, movement: { vx: number; vy: number }): boolean {
  if (!player) return false;

  // Prevent moving in exact opposite direction
  const isOppositeDirection =
    (player.vx === -movement.vx && movement.vx !== 0) ||
    (player.vy === -movement.vy && movement.vy !== 0);

  if (!isOppositeDirection) {
    player.vx = movement.vx;
    player.vy = movement.vy;
    return true;
  }
  return false;
}

export function movePlayer(player: Player, opponent: Player): void {
  if (!player || (player.vx === 0 && player.vy === 0)) return;

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
}

export function checkCollision(player: Player, opponent: Player): boolean {
  if (!player || !opponent || (player.vx === 0 && player.vy === 0)) return false;

  // Self-collision
  if (
    player.tail
      .slice(1)
      .some((segment) => player.x === segment.x && player.y === segment.y)
  ) {
    return true;
  }

  // Opponent collision
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
