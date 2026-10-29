/**
 * Core 2D Fighting Game Physics & Rules Engine for NETA FIGHT ARENA
 * Fixed 60 FPS physics, hitboxes/hurtboxes, round state machine, screen shake, hitstop.
 */

import {
  CharacterId,
  FighterEntity,
  FighterAction,
  SpecialBeam,
  GameStats,
  AIDifficulty,
} from './types';
import { CHARACTERS, ATTACKS } from './characters';
import { soundEngine } from './audio';
import { ArenaRenderer } from './arena';
import { FighterRenderer } from './renderFighter';
import { FighterAI } from './ai';

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  crouch: boolean;
  block: boolean;
  punch: boolean;
  heavyPunch: boolean;
  kick: boolean;
  heavyKick: boolean;
  special: boolean;
}

export interface EngineCallbacks {
  onRoundChange?: (roundNumber: number, state: 'intro' | 'fighting' | 'ko' | 'timeout') => void;
  onMatchOver?: (winnerId: CharacterId, stats: GameStats) => void;
  onSuperReady?: (characterId: CharacterId) => void;
}

const STAGE_WIDTH = 1200;
const STAGE_HEIGHT = 600;
const GROUND_Y = 460;
const GRAVITY = 0.85;
const JUMP_FORCE = -16.5;
const WALK_SPEED = 4.2;

export class FightingEngine {
  public player: FighterEntity;
  public opponent: FighterEntity;
  public arena: ArenaRenderer;
  public fighterRenderer: FighterRenderer;
  public ai: FighterAI;

  public roundNumber = 1;
  public maxRounds = 3;
  public roundTimeRemaining = 99;
  public roundTimerTick = 0;
  public roundState: 'intro' | 'fighting' | 'ko' | 'timeout' = 'intro';
  public introTimer = 90; // ~1.5 sec intro announcement
  public roundEndTimer = 0;

  public specialBeam: SpecialBeam | null = null;
  public cameraShake = { x: 0, y: 0, intensity: 0 };
  public hitStopFrames = 0;
  public frameCounter = 0;

  public stats: GameStats = {
    damageDealt: 0,
    damageTaken: 0,
    maxCombo: 0,
    supersUsed: 0,
    matchDurationSec: 0,
    winner: null,
  };

  private callbacks: EngineCallbacks = {};

  constructor(
    playerChar: CharacterId = 'modi',
    cpuChar: CharacterId = 'rahul',
    difficulty: AIDifficulty = 'medium',
    callbacks: EngineCallbacks = {}
  ) {
    this.callbacks = callbacks;
    this.arena = new ArenaRenderer();
    this.fighterRenderer = new FighterRenderer();
    this.ai = new FighterAI(difficulty);

    this.player = this.createFighter(playerChar, true, 340, 1);
    this.opponent = this.createFighter(cpuChar, false, 860, -1);
  }

  public setDifficulty(diff: AIDifficulty) {
    this.ai.setDifficulty(diff);
  }

  private createFighter(
    id: CharacterId,
    isPlayer: boolean,
    x: number,
    dir: 1 | -1
  ): FighterEntity {
    const config = CHARACTERS[id];
    return {
      id,
      isPlayer,
      name: config.name,
      x,
      y: GROUND_Y,
      vx: 0,
      vy: 0,
      direction: dir,
      health: 100,
      maxHealth: 100,
      displayHealth: 100,
      superMeter: 20, // start with a bit of super to try out early
      maxSuperMeter: 100,
      action: 'idle',
      actionTimer: 0,
      currentAttack: null,
      hasHitInCurrentAttack: false,
      isGrounded: true,
      isBlocking: false,
      comboCount: 0,
      comboTimer: 0,
      hitStun: 0,
      blockStun: 0,
      invincibleTimer: 0,
      roundsWon: 0,
    };
  }

  public resetMatch(playerChar: CharacterId, cpuChar: CharacterId) {
    this.roundNumber = 1;
    this.roundTimeRemaining = 99;
    this.roundState = 'intro';
    this.introTimer = 90;
    this.roundEndTimer = 0;
    this.specialBeam = null;
    this.stats = {
      damageDealt: 0,
      damageTaken: 0,
      maxCombo: 0,
      supersUsed: 0,
      matchDurationSec: 0,
      winner: null,
    };

    this.player = this.createFighter(playerChar, true, 340, 1);
    this.opponent = this.createFighter(cpuChar, false, 860, -1);

    soundEngine.playRoundBell();
  }

  public startNextRound() {
    this.roundNumber++;
    this.roundTimeRemaining = 99;
    this.roundState = 'intro';
    this.introTimer = 80;
    this.roundEndTimer = 0;
    this.specialBeam = null;

    // Reset positions and health
    this.player.x = 340;
    this.player.y = GROUND_Y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.direction = 1;
    this.player.health = 100;
    this.player.displayHealth = 100;
    this.player.action = 'idle';
    this.player.actionTimer = 0;
    this.player.currentAttack = null;
    this.player.hasHitInCurrentAttack = false;
    this.player.hitStun = 0;
    this.player.blockStun = 0;

    this.opponent.x = 860;
    this.opponent.y = GROUND_Y;
    this.opponent.vx = 0;
    this.opponent.vy = 0;
    this.opponent.direction = -1;
    this.opponent.health = 100;
    this.opponent.displayHealth = 100;
    this.opponent.action = 'idle';
    this.opponent.actionTimer = 0;
    this.opponent.currentAttack = null;
    this.opponent.hasHitInCurrentAttack = false;
    this.opponent.hitStun = 0;
    this.opponent.blockStun = 0;

    soundEngine.playRoundBell();
  }

  public update(playerInput: InputState) {
    this.frameCounter++;

    // Hitstop freeze (gives tactile punchiness to heavy impacts)
    if (this.hitStopFrames > 0) {
      this.hitStopFrames--;
      this.updateCameraShake();
      this.arena.update();
      return;
    }

    this.updateCameraShake();
    this.arena.update();

    // Health bar smooth drain animation
    this.smoothHealthBars();

    // 1. Intro sequence
    if (this.roundState === 'intro') {
      this.introTimer--;
      if (this.introTimer <= 0) {
        this.roundState = 'fighting';
        if (this.callbacks.onRoundChange) {
          this.callbacks.onRoundChange(this.roundNumber, 'fighting');
        }
      }
      return;
    }

    // 2. Round End / K.O. sequence
    if (this.roundState === 'ko' || this.roundState === 'timeout') {
      this.roundEndTimer++;
      this.updateFighterPhysics(this.player);
      this.updateFighterPhysics(this.opponent);

      if (this.roundEndTimer > 120) {
        // Check if someone won match or next round
        if (this.player.roundsWon >= 2 || this.opponent.roundsWon >= 2) {
          const matchWinner = this.player.roundsWon >= 2 ? this.player.id : this.opponent.id;
          this.stats.winner = matchWinner;
          if (this.callbacks.onMatchOver) {
            this.callbacks.onMatchOver(matchWinner, this.stats);
          }
        } else {
          this.startNextRound();
        }
      }
      return;
    }

    // 3. Normal Fighting State
    this.stats.matchDurationSec += 1 / 60;
    this.roundTimerTick++;
    if (this.roundTimerTick >= 60) {
      this.roundTimerTick = 0;
      this.roundTimeRemaining = Math.max(0, this.roundTimeRemaining - 1);
      if (this.roundTimeRemaining === 0) {
        this.handleTimeout();
        return;
      }
    }

    // AI Command generation
    const aiCmd = this.ai.update(this.opponent, this.player);

    // Update fighter inputs
    this.processFighterInput(this.player, playerInput);
    this.processFighterInput(this.opponent, {
      left: aiCmd.moveDir === -1,
      right: aiCmd.moveDir === 1,
      jump: aiCmd.jump,
      crouch: aiCmd.crouch,
      block: aiCmd.block,
      punch: aiCmd.punch,
      heavyPunch: aiCmd.heavyPunch,
      kick: aiCmd.kick,
      heavyKick: aiCmd.heavyKick,
      special: aiCmd.special,
    });

    // Update state & physics
    this.updateFighter(this.player, this.opponent);
    this.updateFighter(this.opponent, this.player);

    // Face each other automatically unless locked in attack
    if (this.player.currentAttack === null && this.player.hitStun === 0) {
      this.player.direction = this.player.x < this.opponent.x ? 1 : -1;
    }
    if (this.opponent.currentAttack === null && this.opponent.hitStun === 0) {
      this.opponent.direction = this.opponent.x < this.player.x ? 1 : -1;
    }

    // Check melee attack collisions
    this.checkAttackCollision(this.player, this.opponent);
    this.checkAttackCollision(this.opponent, this.player);

    // Update & check Special Beam collisions
    this.updateSpecialBeam();

    // Check KO
    if (this.player.health <= 0 || this.opponent.health <= 0) {
      this.handleKO();
    }
  }

  private processFighterInput(fighter: FighterEntity, input: InputState) {
    if (fighter.hitStun > 0 || fighter.blockStun > 0 || fighter.action === 'knockdown') {
      return;
    }

    // Action execution (Attacks have precedence)
    if (fighter.currentAttack === null) {
      // Special Move
      if (input.special && fighter.superMeter >= fighter.maxSuperMeter) {
        this.executeAttack(fighter, 'special');
        fighter.superMeter = 0;
        if (fighter.isPlayer) this.stats.supersUsed++;
        return;
      }

      // Heavy Punch
      if (input.heavyPunch) {
        this.executeAttack(fighter, 'heavy_punch');
        return;
      }

      // Light Punch
      if (input.punch) {
        this.executeAttack(fighter, 'punch');
        return;
      }

      // Heavy Kick
      if (input.heavyKick) {
        this.executeAttack(fighter, 'heavy_kick');
        return;
      }

      // Light Kick
      if (input.kick) {
        this.executeAttack(fighter, 'kick');
        return;
      }

      // Blocking (holding back or block button)
      const isHoldingBack = (fighter.direction === 1 && input.left) || (fighter.direction === -1 && input.right);
      fighter.isBlocking = input.block || isHoldingBack;
      if (fighter.isBlocking) {
        fighter.action = 'block';
        return;
      }

      // Jump
      if (input.jump && fighter.isGrounded) {
        fighter.vy = JUMP_FORCE;
        fighter.isGrounded = false;
        fighter.action = 'jump';
        soundEngine.playWhoosh(400);
        return;
      }

      // Crouch
      if (input.crouch && fighter.isGrounded) {
        fighter.action = 'crouch';
        fighter.vx = 0;
        return;
      }

      // Movement
      if (input.left) {
        fighter.vx = -WALK_SPEED;
        fighter.action = fighter.direction === 1 ? 'walk_back' : 'walk_fwd';
      } else if (input.right) {
        fighter.vx = WALK_SPEED;
        fighter.action = fighter.direction === 1 ? 'walk_fwd' : 'walk_back';
      } else if (fighter.isGrounded) {
        fighter.vx = 0;
        fighter.action = 'idle';
      }
    }
  }

  private executeAttack(
    fighter: FighterEntity,
    type: 'punch' | 'heavy_punch' | 'kick' | 'heavy_kick' | 'special'
  ) {
    const attackData = ATTACKS[fighter.id][type];
    fighter.currentAttack = attackData;
    fighter.action = type;
    fighter.actionTimer = 0;
    fighter.hasHitInCurrentAttack = false;
    fighter.vx = 0;

    // Audio cue
    if (type === 'punch') soundEngine.playWhoosh(350);
    else if (type === 'heavy_punch') soundEngine.playWhoosh(240);
    else if (type === 'kick') soundEngine.playWhoosh(380);
    else if (type === 'heavy_kick') soundEngine.playWhoosh(260);
    else if (type === 'special') soundEngine.playSuperCharge();
  }

  private updateFighter(fighter: FighterEntity, opponent: FighterEntity) {
    this.updateFighterPhysics(fighter);

    // Stun decay
    if (fighter.hitStun > 0) {
      fighter.hitStun--;
      if (fighter.hitStun === 0 && fighter.health > 0) {
        fighter.action = 'idle';
      }
    }
    if (fighter.blockStun > 0) {
      fighter.blockStun--;
      if (fighter.blockStun === 0) {
        fighter.action = 'idle';
        fighter.isBlocking = false;
      }
    }
    if (fighter.invincibleTimer > 0) {
      fighter.invincibleTimer--;
    }

    // Attack frame advancement
    if (fighter.currentAttack) {
      fighter.actionTimer++;
      const attack = fighter.currentAttack;
      const totalFrames = attack.startup + attack.active + attack.recovery;

      // Special beam firing trigger
      if (fighter.action === 'special' && fighter.actionTimer === attack.startup) {
        this.fireSpecialBeam(fighter);
      }

      if (fighter.actionTimer >= totalFrames) {
        fighter.currentAttack = null;
        fighter.action = fighter.isGrounded ? 'idle' : 'jump';
        fighter.actionTimer = 0;
      }
    }

    // Push apart if overlapping
    const overlapDist = 55;
    const dx = fighter.x - opponent.x;
    if (Math.abs(dx) < overlapDist && fighter.isGrounded && opponent.isGrounded) {
      const pushDir = dx >= 0 ? 1 : -1;
      const pushAmount = (overlapDist - Math.abs(dx)) / 2;
      fighter.x += pushDir * pushAmount;
      opponent.x -= pushDir * pushAmount;
    }
  }

  private updateFighterPhysics(fighter: FighterEntity) {
    fighter.x += fighter.vx;
    fighter.y += fighter.vy;

    // Apply gravity if not on ground
    if (!fighter.isGrounded) {
      fighter.vy += GRAVITY;
      if (fighter.y >= GROUND_Y) {
        fighter.y = GROUND_Y;
        fighter.vy = 0;
        fighter.isGrounded = true;
        if (fighter.action === 'jump') fighter.action = 'idle';
      }
    }

    // Boundary constraints (Arena edges)
    const padding = 70;
    if (fighter.x < padding) fighter.x = padding;
    if (fighter.x > STAGE_WIDTH - padding) fighter.x = STAGE_WIDTH - padding;
  }

  private checkAttackCollision(attacker: FighterEntity, defender: FighterEntity) {
    if (!attacker.currentAttack || attacker.hasHitInCurrentAttack) return;

    const attack = attacker.currentAttack;
    // Check if within active frames
    const isActive =
      attacker.actionTimer >= attack.startup &&
      attacker.actionTimer < attack.startup + attack.active;

    if (!isActive) return;

    // Calculate attack hitbox relative to attacker position
    const hitX = attacker.x + (attacker.direction === 1 ? 0 : -attack.rangeX);
    const hitY = attacker.y - attack.rangeY - 20;
    const hitW = attack.rangeX;
    const hitH = attack.rangeY + 40;

    // Defender hurtbox
    const defW = 55;
    const defH = 110;
    const defX = defender.x - defW / 2;
    const defY = defender.y - defH;

    // AABB intersection
    const intersects =
      hitX < defX + defW &&
      hitX + hitW > defX &&
      hitY < defY + defH &&
      hitY + hitH > defY;

    if (intersects && defender.invincibleTimer === 0) {
      attacker.hasHitInCurrentAttack = true;
      this.applyHit(attacker, defender, attack);
    }
  }

  private applyHit(
    attacker: FighterEntity,
    defender: FighterEntity,
    attack: {
      damage: number;
      chipDamage: number;
      knockback: number;
      superGainAttacker: number;
      superGainDefender: number;
      sound: 'punch' | 'heavy_punch' | 'kick' | 'heavy_kick' | 'special';
      comicWord: string;
    }
  ) {
    const isBlocked = defender.isBlocking;
    const damage = isBlocked ? attack.chipDamage : attack.damage;
    const isHeavy = attack.sound === 'heavy_punch' || attack.sound === 'heavy_kick' || attack.sound === 'special';

    defender.health = Math.max(0, defender.health - damage);

    // Super meter gain
    attacker.superMeter = Math.min(attacker.maxSuperMeter, attacker.superMeter + attack.superGainAttacker);
    defender.superMeter = Math.min(defender.maxSuperMeter, defender.superMeter + attack.superGainDefender);

    if (attacker.isPlayer) {
      this.stats.damageDealt += damage;
      attacker.comboCount++;
      if (attacker.comboCount > this.stats.maxCombo) {
        this.stats.maxCombo = attacker.comboCount;
      }
    } else {
      this.stats.damageTaken += damage;
    }

    // Audio & Feedback
    soundEngine.playHit(isHeavy, isBlocked);

    // Screen Shake
    this.addCameraShake(isHeavy ? 14 : 7);

    // Hitstop
    if (isHeavy && !isBlocked) {
      this.hitStopFrames = 3;
    }

    // Knockback
    const knockDir = attacker.direction;
    defender.vx = knockDir * (isBlocked ? attack.knockback * 0.4 : attack.knockback);

    if (isBlocked) {
      defender.blockStun = 12;
      this.arena.addComicText('BLOCKED!', defender.x, defender.y - 80, '#94a3b8', '#000');
      this.arena.addSpark(defender.x, defender.y - 60, '#38bdf8', 6);
    } else {
      defender.hitStun = isHeavy ? 24 : 14;
      defender.action = isHeavy ? 'hit_heavy' : 'hit_light';

      // Sparks & Comic Text
      const hitColor = attacker.id === 'modi' ? '#f97316' : '#0284c7';
      this.arena.addSpark(defender.x, defender.y - 60, hitColor, isHeavy ? 16 : 8);
      this.arena.addComicText(attack.comicWord, defender.x, defender.y - 75, '#fde047', '#000000');
    }
  }

  private fireSpecialBeam(attacker: FighterEntity) {
    soundEngine.playSuperBlast();
    this.addCameraShake(22);

    this.specialBeam = {
      active: true,
      owner: attacker.id,
      x: attacker.x + attacker.direction * 35,
      y: attacker.y - 65,
      width: 580,
      height: 90,
      direction: attacker.direction,
      progress: 0,
      duration: 32,
      color: attacker.id === 'modi' ? '#f97316' : '#0284c7',
    };
  }

  private updateSpecialBeam() {
    if (!this.specialBeam || !this.specialBeam.active) return;

    this.specialBeam.progress++;
    const target = this.specialBeam.owner === this.player.id ? this.opponent : this.player;
    const beam = this.specialBeam;

    // Check hit in beam zone
    const beamStartX = beam.direction === 1 ? beam.x : beam.x - beam.width;
    const beamEndX = beam.direction === 1 ? beam.x + beam.width : beam.x;
    const beamTop = beam.y - beam.height / 2;
    const beamBottom = beam.y + beam.height / 2;

    const inBeam =
      target.x >= beamStartX &&
      target.x <= beamEndX &&
      target.y >= beamTop &&
      target.y <= beamBottom + 100;

    if (inBeam && beam.progress % 6 === 0 && target.invincibleTimer === 0) {
      const isBlocked = target.isBlocking;
      const damage = isBlocked ? 3 : 11;
      target.health = Math.max(0, target.health - damage);
      target.vx = beam.direction * 6;
      target.hitStun = 10;
      target.action = 'hit_heavy';

      if (beam.owner === this.player.id) {
        this.stats.damageDealt += damage;
      } else {
        this.stats.damageTaken += damage;
      }

      this.arena.addSpark(target.x, target.y - 50, beam.color, 8);
      this.addCameraShake(8);
      soundEngine.playHit(true, isBlocked);
    }

    if (beam.progress >= beam.duration) {
      this.specialBeam.active = false;
      this.specialBeam = null;
    }
  }

  private handleKO() {
    this.roundState = 'ko';
    this.roundEndTimer = 0;
    soundEngine.playKO();
    this.addCameraShake(25);

    if (this.player.health <= 0) {
      this.player.action = 'defeat';
      this.opponent.action = 'victory';
      this.opponent.roundsWon++;
      this.arena.addComicText('K.O.!', this.player.x, this.player.y - 80, '#ef4444', '#000');
    } else {
      this.opponent.action = 'defeat';
      this.player.action = 'victory';
      this.player.roundsWon++;
      this.arena.addComicText('K.O.!', this.opponent.x, this.opponent.y - 80, '#22c55e', '#000');
      soundEngine.playVictoryFanfare();
    }
  }

  private handleTimeout() {
    this.roundState = 'timeout';
    this.roundEndTimer = 0;

    if (this.player.health > this.opponent.health) {
      this.player.roundsWon++;
      this.player.action = 'victory';
      this.opponent.action = 'defeat';
    } else if (this.opponent.health > this.player.health) {
      this.opponent.roundsWon++;
      this.opponent.action = 'victory';
      this.player.action = 'defeat';
    } else {
      // Draw round
      this.player.action = 'idle';
      this.opponent.action = 'idle';
    }

    this.arena.addComicText('TIME OVER!', STAGE_WIDTH / 2, 280, '#fbbf24', '#000');
  }

  public addCameraShake(intensity: number) {
    this.cameraShake.intensity = Math.max(this.cameraShake.intensity, intensity);
  }

  private updateCameraShake() {
    if (this.cameraShake.intensity > 0.5) {
      this.cameraShake.x = (Math.random() - 0.5) * this.cameraShake.intensity * 1.5;
      this.cameraShake.y = (Math.random() - 0.5) * this.cameraShake.intensity * 1.5;
      this.cameraShake.intensity *= 0.88;
    } else {
      this.cameraShake.x = 0;
      this.cameraShake.y = 0;
      this.cameraShake.intensity = 0;
    }
  }

  private smoothHealthBars() {
    // Player health display drain
    if (this.player.displayHealth > this.player.health) {
      this.player.displayHealth = Math.max(
        this.player.health,
        this.player.displayHealth - 0.5
      );
    }
    // Opponent health display drain
    if (this.opponent.displayHealth > this.opponent.health) {
      this.opponent.displayHealth = Math.max(
        this.opponent.health,
        this.opponent.displayHealth - 0.5
      );
    }
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const scale = Math.min(width / STAGE_WIDTH, height / STAGE_HEIGHT);
    const offsetX = (width - STAGE_WIDTH * scale) / 2;
    const offsetY = (height - STAGE_HEIGHT * scale) / 2;

    ctx.save();
    // Clear screen
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, width, height);

    // Apply arena viewport transform
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // 1. Render Arena Background & Crowds
    this.arena.render(
      ctx,
      STAGE_WIDTH,
      STAGE_HEIGHT,
      this.player.id,
      this.cameraShake.x,
      this.cameraShake.y
    );

    // 2. Render Fighters
    const frameTime = this.frameCounter / 60;
    this.fighterRenderer.render(ctx, this.player, this.specialBeam, frameTime);
    this.fighterRenderer.render(ctx, this.opponent, this.specialBeam, frameTime);

    // 3. Render Arena Foreground VFX (Sparks, Comic Popups)
    this.arena.renderForegroundVFX(ctx);

    // 4. In-Arena Announcements ("ROUND 1", "FIGHT!", "K.O.!")
    this.renderAnnouncements(ctx);

    ctx.restore();
  }

  private renderAnnouncements(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const cx = STAGE_WIDTH / 2;
    const cy = 240;

    if (this.roundState === 'intro') {
      const progress = 1 - this.introTimer / 90;
      const text = progress < 0.6 ? `ROUND ${this.roundNumber}` : 'FIGHT!';
      const color = progress < 0.6 ? '#fde047' : '#ef4444';

      ctx.font = '900 68px "Arial Black", Impact, sans-serif';
      ctx.lineWidth = 12;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(text, cx, cy);

      ctx.fillStyle = color;
      ctx.fillText(text, cx, cy);
    } else if (this.roundState === 'ko') {
      ctx.font = '900 84px "Arial Black", Impact, sans-serif';
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#000000';
      ctx.strokeText('K.O.!', cx, cy);

      ctx.fillStyle = '#ef4444';
      ctx.fillText('K.O.!', cx, cy);
    } else if (this.roundState === 'timeout') {
      ctx.font = '900 64px "Arial Black", Impact, sans-serif';
      ctx.lineWidth = 12;
      ctx.strokeStyle = '#000000';
      ctx.strokeText('TIME OVER', cx, cy);

      ctx.fillStyle = '#fbbf24';
      ctx.fillText('TIME OVER', cx, cy);
    }

    ctx.restore();
  }
}
