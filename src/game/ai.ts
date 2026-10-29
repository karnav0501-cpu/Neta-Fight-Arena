/**
 * Intelligent AI Opponent Controller for NETA FIGHT ARENA
 * Manages spacing, dynamic blocking, combos, whiff punishing, and super activation.
 */

import { FighterEntity, AIDifficulty } from './types';

export interface AICommand {
  moveDir: number;      // -1, 0, 1
  jump: boolean;
  crouch: boolean;
  block: boolean;
  punch: boolean;
  heavyPunch: boolean;
  kick: boolean;
  heavyKick: boolean;
  special: boolean;
}

export class FighterAI {
  private difficulty: AIDifficulty;
  private stateTimer = 0;
  private currentStrategy: 'approach' | 'retreat' | 'pressure' | 'defend' | 'idle' = 'idle';
  private strategyDuration = 20;
  private comboStep = 0;
  private comboCooldown = 0;

  constructor(difficulty: AIDifficulty = 'medium') {
    this.difficulty = difficulty;
  }

  public setDifficulty(diff: AIDifficulty) {
    this.difficulty = diff;
  }

  public update(ai: FighterEntity, player: FighterEntity): AICommand {
    const cmd: AICommand = {
      moveDir: 0,
      jump: false,
      crouch: false,
      block: false,
      punch: false,
      heavyPunch: false,
      kick: false,
      heavyKick: false,
      special: false,
    };

    // If currently locked in an attack or hitstun, AI cannot issue new commands
    if (ai.hitStun > 0 || ai.blockStun > 0 || ai.action === 'knockdown') {
      return cmd;
    }

    const dist = Math.abs(ai.x - player.x);
    const aiToPlayerDir = player.x > ai.x ? 1 : -1;

    // Difficulty settings
    const blockProb = this.difficulty === 'easy' ? 0.35 : this.difficulty === 'medium' ? 0.65 : 0.85;
    const aggressionRate = this.difficulty === 'easy' ? 0.5 : this.difficulty === 'medium' ? 0.75 : 0.9;

    this.stateTimer++;
    if (this.comboCooldown > 0) this.comboCooldown--;

    // 1. Check if AI should use Super Attack
    if (ai.superMeter >= ai.maxSuperMeter) {
      // If player is in beam line and not currently in invincibility
      if (dist < 500 && player.invincibleTimer === 0 && Math.random() < 0.08) {
        cmd.special = true;
        return cmd;
      }
    }

    // 2. Reactive Defense: If player is attacking and close enough, attempt to block
    const playerIsAttacking =
      player.currentAttack !== null ||
      player.action === 'punch' ||
      player.action === 'heavy_punch' ||
      player.action === 'kick' ||
      player.action === 'heavy_kick' ||
      player.action === 'special';

    if (playerIsAttacking && dist < 140) {
      if (Math.random() < blockProb) {
        cmd.block = true;
        // Face player while blocking
        cmd.moveDir = -aiToPlayerDir;
        return cmd;
      }
    }

    // 3. Strategy Rotation
    if (this.stateTimer >= this.strategyDuration) {
      this.stateTimer = 0;
      const roll = Math.random();

      if (dist > 280) {
        this.currentStrategy = roll < aggressionRate ? 'approach' : 'idle';
        this.strategyDuration = 25 + Math.floor(Math.random() * 20);
      } else if (dist < 105) {
        if (roll < 0.65) this.currentStrategy = 'pressure';
        else if (roll < 0.85) this.currentStrategy = 'retreat';
        else this.currentStrategy = 'defend';
        this.strategyDuration = 18 + Math.floor(Math.random() * 15);
      } else {
        // Mid-range footsies
        this.currentStrategy = roll < 0.6 ? 'pressure' : 'approach';
        this.strategyDuration = 20 + Math.floor(Math.random() * 15);
      }
    }

    // 4. Execute Current Strategy
    switch (this.currentStrategy) {
      case 'approach':
        cmd.moveDir = aiToPlayerDir;
        // Occasionally jump-in over player
        if (dist < 220 && Math.random() < 0.03 && ai.isGrounded) {
          cmd.jump = true;
        }
        break;

      case 'retreat':
        cmd.moveDir = -aiToPlayerDir;
        break;

      case 'defend':
        cmd.block = true;
        cmd.moveDir = -aiToPlayerDir;
        break;

      case 'pressure':
        // Move into strike distance
        if (dist > 95) {
          cmd.moveDir = aiToPlayerDir;
        } else if (dist < 60) {
          cmd.moveDir = -aiToPlayerDir * 0.5;
        }

        // Execute Attack Combos if in range
        if (dist <= 110 && this.comboCooldown === 0) {
          const attackRoll = Math.random();

          if (this.comboStep === 0) {
            // First hit: Light punch or kick
            if (attackRoll < 0.5) cmd.punch = true;
            else cmd.kick = true;
            this.comboStep = 1;
            this.comboCooldown = 12;
          } else if (this.comboStep === 1) {
            // Second hit: Followup strike
            if (attackRoll < 0.45) cmd.punch = true;
            else if (attackRoll < 0.8) cmd.heavyPunch = true;
            else cmd.heavyKick = true;
            this.comboStep = 2;
            this.comboCooldown = 15;
          } else {
            // Finisher hit: Heavy kick or Heavy punch
            if (attackRoll < 0.55) cmd.heavyKick = true;
            else cmd.heavyPunch = true;
            this.comboStep = 0;
            this.comboCooldown = 28;
          }
        }
        break;

      case 'idle':
      default:
        // Slight twitch / posture adjustment
        if (Math.random() < 0.08) {
          cmd.moveDir = Math.random() > 0.5 ? 1 : -1;
        }
        break;
    }

    return cmd;
  }
}
