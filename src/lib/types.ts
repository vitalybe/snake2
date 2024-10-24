export interface Position {
  x: number;
  y: number;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tail: Position[];
  maxTail: number;
  color: string;
  score: number;
  speedBoostEnd: number;
  currentSpeed: number;
  hasLaser: boolean;
  laser: Laser | null;
  lastVx: number;
  lastVy: number;
  controls: Controls;
}

export interface Laser {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface Fruit {
  x: number;
  y: number;
  type: 'speed' | 'laser' | 'regular';
}

export interface Controls {
  [key: string]: { vx: number; vy: number; } | 'shoot';
}

export interface GameConfig {
  GROWTH_PER_FRUIT: number;
  FRUITS_COUNT: number;
  INITIAL_TAIL_LENGTH: number;
  SPEED_BOOST_DURATION: number;
  NORMAL_SPEED: number;
  BOOST_SPEED: number;
  LASER_SPEED: number;
  GRID_SIZE: number;
}
