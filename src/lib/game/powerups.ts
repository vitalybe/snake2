import type { Player, Fruit } from '../types';
import { GAME_CONFIG } from '../config';

export function updateSpeedBoosts(currentTime: number, players: Player[]): void {
  players.forEach((player) => {
    if (player.speedBoostEnd > 0 && currentTime > player.speedBoostEnd) {
      player.speedBoostEnd = 0;
      player.currentSpeed = GAME_CONFIG.NORMAL_SPEED;
    }
  });
}

export function handleFruitCollection(player: Player, fruit: Fruit | undefined): void {
  if (!fruit) return;
  
  switch (fruit.type) {
    case "speed":
      player.speedBoostEnd = performance.now() + GAME_CONFIG.SPEED_BOOST_DURATION;
      player.currentSpeed = GAME_CONFIG.BOOST_SPEED;
      break;
    case "laser":
      player.hasLaser = true;
      break;
    default:
      player.maxTail += GAME_CONFIG.GROWTH_PER_FRUIT;
      player.score++;
  }
}

export function checkFruitCollisions(
  player: Player, 
  fruits: Fruit[]
): { collectedFruitIndex: number | null } {
  const collectedFruitIndex = fruits.findIndex(
    (fruit) => player.x === fruit.x && player.y === fruit.y
  );

  return { collectedFruitIndex };
}
