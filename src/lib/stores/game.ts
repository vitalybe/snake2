import { writable, derived } from 'svelte/store';
import type { Player, Fruit, Position } from '../types';
import { GAME_CONFIG } from '../config';

export const gameOver = writable(false);
export const fruits = writable<Fruit[]>([]);
export const player1 = writable<Player | null>(null);
export const player2 = writable<Player | null>(null);
export const lastTime = writable(0);
export const lastMoveTime1 = writable(0);
export const lastMoveTime2 = writable(0);
export const gameState = writable<'menu' | 'playing' | 'gameOver'>('menu');
export const playerName = writable<string | null>(null);

export const tileCount = 600 / GAME_CONFIG.GRID_SIZE;

export function createPlayer(x: number, y: number, color: string, name: string): Player {
  return {
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
    controls: {},
    name,
  };
}

export function isOutOfBounds(object: Position): boolean {
  return (
    object.x < 0 ||
    object.x >= tileCount ||
    object.y < 0 ||
    object.y >= tileCount
  );
}

export function isOnSnake(x: number, y: number, player: Player): boolean {
  return player.tail.some((segment) => segment.x === x && segment.y === y);
}

export function isOnFruit(x: number, y: number, currentFruits: Fruit[]): boolean {
  return currentFruits.some((fruit) => fruit.x === x && fruit.y === y);
}

export function spawnFruit(): void {
  fruits.update(currentFruits => {
    const newFruits = [...currentFruits];
    let attempts = 0;
    const maxAttempts = 100;

    while (newFruits.length < GAME_CONFIG.FRUITS_COUNT && attempts < maxAttempts) {
      const rand = Math.random();
      const newFruit: Fruit = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
        type: rand < 0.1 ? "speed" : rand < 0.2 ? "laser" : "regular",
      };

      let p1: Player | null = null;
      let p2: Player | null = null;
      player1.subscribe(value => p1 = value)();
      player2.subscribe(value => p2 = value)();

      if (
        p1 && p2 &&
        !isOnSnake(newFruit.x, newFruit.y, p1) &&
        !isOnSnake(newFruit.x, newFruit.y, p2) &&
        !isOnFruit(newFruit.x, newFruit.y, newFruits)
      ) {
        newFruits.push(newFruit);
      }
      attempts++;
    }
    return newFruits;
  });
}

export function resetGame(): void {
  const p1 = createPlayer(5, 5, "green", "Player 1");
  p1.controls = {
    ArrowLeft: { vx: -1, vy: 0 },
    ArrowUp: { vx: 0, vy: -1 },
    ArrowRight: { vx: 1, vy: 0 },
    ArrowDown: { vx: 0, vy: 1 },
    " ": "shoot", // Space key
  };

  const p2 = createPlayer(tileCount - 5, tileCount - 5, "blue", "Player 2");
  p2.controls = {
    a: { vx: -1, vy: 0 },
    w: { vx: 0, vy: -1 },
    d: { vx: 1, vy: 0 },
    s: { vx: 0, vy: 1 },
    e: "shoot",
  };

  player1.set(p1);
  player2.set(p2);
  lastMoveTime1.set(0);
  lastMoveTime2.set(0);
  lastTime.set(0);
  gameOver.set(false);
  fruits.set([]);
  gameState.set('playing');
  spawnFruit();
}
