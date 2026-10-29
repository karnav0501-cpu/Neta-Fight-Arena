/**
 * Types and interfaces for NETA FIGHT ARENA
 */

export type CharacterId = 'modi' | 'rahul';

export type FighterAction =
  | 'idle'
  | 'walk_fwd'
  | 'walk_back'
  | 'jump'
  | 'crouch'
  | 'punch'
  | 'heavy_punch'
  | 'kick'
  | 'heavy_kick'
  | 'special'
  | 'block'
  | 'hit_light'
  | 'hit_heavy'
  | 'knockdown'
  | 'victory'
  | 'defeat';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface CharacterConfig {
  id: CharacterId;
  name: string;
  fullName: string;
  title: string;
  partyName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  auraColor: string;
  specialName: string;
  specialDescription: string;
  quotes: {
    win: string[];
    special: string[];
    taunt: string[];
  };
}

export interface AttackFrameData {
  startup: number;   // frames before active
  active: number;    // active hit frames
  recovery: number;  // recovery frames
  damage: number;
  chipDamage: number;
  rangeX: number;
  rangeY: number;
  knockback: number;
  superGainAttacker: number;
  superGainDefender: number;
  sound: 'punch' | 'heavy_punch' | 'kick' | 'heavy_kick' | 'special';
  comicWord: string;
}

export interface HitBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ComicTextParticle {
  id: number;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  strokeColor: string;
  scale: number;
  maxScale: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
}

export interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
}

export interface SpecialBeam {
  active: boolean;
  owner: CharacterId;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: 1 | -1;
  progress: number;
  duration: number;
  color: string;
}

export interface FighterEntity {
  id: CharacterId;
  isPlayer: boolean;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  direction: 1 | -1; // 1 facing right, -1 facing left
  health: number;
  maxHealth: number;
  displayHealth: number; // for smooth trailing bar
  superMeter: number;
  maxSuperMeter: number;
  action: FighterAction;
  actionTimer: number; // in frames
  currentAttack: AttackFrameData | null;
  hasHitInCurrentAttack: boolean;
  isGrounded: boolean;
  isBlocking: boolean;
  comboCount: number;
  comboTimer: number;
  hitStun: number;
  blockStun: number;
  invincibleTimer: number;
  roundsWon: number;
}

export type GameScreen = 'title' | 'select' | 'playing' | 'round_over' | 'game_over';

export interface GameStats {
  damageDealt: number;
  damageTaken: number;
  maxCombo: number;
  supersUsed: number;
  matchDurationSec: number;
  winner: CharacterId | null;
}
