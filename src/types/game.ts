export type GameMode = 
  | 'CLASSIC_DEMO'      // Exact Kotlin behavior: infinite training, moving background columns, 6 targets
  | 'REFLEX_DRILL'      // 60-second ranked challenge with timer and combos
  | 'MOVING_TARGETS'    // Targets patrol left and right at varying speeds
  | 'SNIPER_RANGE'      // Distant targets with 4x/8x toggleable scope
  | 'ONE_TAP_HEADSHOT'; // Only headshots register; bodyshots ricochet

export interface Target {
  id: string;
  x: number;             // Normalized 0 to 1
  y: number;             // Normalized 0.25 to 0.8
  baseY: number;
  distance: number;      // In meters, e.g., 20m - 85m
  speedX: number;        // For moving targets
  speedY: number;
  direction: 1 | -1;
  name: string;          // "TARGET", "ENEMY", "BOT #04"
  health: number;
  maxHealth: number;
  isHit: boolean;
  hitTimestamp: number;
  lastHeadshot: boolean;
  spawnTime: number;
}

export interface Weapon {
  id: string;
  name: string;
  type: 'Pistol' | 'SMG' | 'Sniper' | 'Shotgun' | 'Rifle';
  damageHead: number;
  damageBody: number;
  fireRate: number;      // Milliseconds between shots
  magSize: number;
  reloadTimeMs: number;
  image?: string;
  recoilAmount: number;
  hasScope: boolean;
  scopeZoom: number;
  burstCount?: number;
  pellets?: number;
  soundPreset: 'deagle' | 'mp40' | 'awm' | 'shotgun' | 'rifle';
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  isHeadshot: boolean;
  createdAt: number;
  lifetimeMs: number;
  vx: number;
  vy: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  gravity?: number;
}

export interface BulletTracer {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number;       // 0 to 1+
  speed: number;          // progress increment per frame
  color: string;
  glowColor: string;
  width: number;
  tailLength: number;
  alpha: number;
  arrived: boolean;
}

export interface EspSettings {
  showBox: boolean;
  boxStyle: 'classic_stroke' | 'corner_brackets' | 'tactical_frame';
  showHeadCircle: boolean;
  showBody: boolean;
  showName: boolean;
  showDistance: boolean;
  showHealthBar: boolean;
  showSnaplines: boolean;
  espColor: string;
  showColumns: boolean;
  columnSpeed: number;
  soundEnabled: boolean;
  volume: number;
  crosshairStyle: 'classic_dot' | 'crosshair' | 'tactical_circle' | 't_shape';
  crosshairColor: string;
  scopeActive: boolean;
  recoilEnabled: boolean;
}

export interface GameScoreState {
  score: number;
  headshots: number;
  bodyshots: number;
  totalShots: number;
  hits: number;
  streak: number;
  bestStreak: number;
  lastReactionTimeMs: number | null;
  reactionHistory: number[];
  startTime: number;
  timeRemaining: number;
  isGameOver: boolean;
}
