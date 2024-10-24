import type { Player, Fruit } from '../types';
import { GAME_CONFIG } from '../config';
import { player1, player2 } from '../stores/game';

export function updateSpeedBoosts(currentTime: number, players: Player[]): void {
  players.forEach((player) => {
    if (player.speedBoostEnd > 0 && currentTime > player.speedBoostEnd) {
      player.speedBoostEnd = 0;
      player.currentSpeed = GAME_CONFIG.NORMAL_SPEED;
      // Update the appropriate store
      if (player.color === 'green') {
        player1.update(p => ({ ...p!, currentSpeed: GAME_CONFIG.NORMAL_SPEED, speedBoostEnd: 0 }));
      } else {
        player2.update(p => ({ ...p!, currentSpeed: GAME_CONFIG.NORMAL_SPEED, speedBoostEnd: 0 }));
      }
    }
  });
}

export function handleFruitCollection(player: Player, fruit: Fruit | undefined): void {
  if (!fruit) return;
  
  const store = player.color === 'green' ? player1 : player2;
  
  switch (fruit.type) {
    case "speed":
      const speedBoostEnd = performance.now() + GAME_CONFIG.SPEED_BOOST_DURATION;
      store.update(p => ({
        ...p!,
        speedBoostEnd,
        currentSpeed: GAME_CONFIG.BOOST_SPEED
      }));
      break;
    case "laser":
      store.update(p => ({
        ...p!,
        hasLaser: true
      }));
      break;
    default:
      store.update(p => ({
        ...p!,
        maxTail: p!.maxTail + GAME_CONFIG.GROWTH_PER_FRUIT,
        score: p!.score + 1
      }));
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
