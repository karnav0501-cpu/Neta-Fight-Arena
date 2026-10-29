/**
 * Articulated 2D Cartoon Shadow-Fighter renderer for NETA FIGHT ARENA
 * Characters: Narendra Modi & Rahul Gandhi
 * Inspired by side-view shadow fighting games with satirical cartoon detailing.
 */

import { FighterEntity, SpecialBeam } from './types';

export class FighterRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    fighter: FighterEntity,
    beam: SpecialBeam | null,
    frameTime: number
  ) {
    ctx.save();

    const isModi = fighter.id === 'modi';
    const posX = fighter.x;
    const posY = fighter.y;
    const dir = fighter.direction; // 1 facing right, -1 facing left

    // 1. Ground Contact Shadow
    this.renderGroundShadow(ctx, posX, posY);

    // 2. Flip coordinate space for fighter facing direction
    ctx.translate(posX, posY);
    ctx.scale(dir, 1);

    // 3. Hit Flash / Invincibility flicker
    if (fighter.invincibleTimer > 0 && Math.floor(frameTime * 10) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // 4. Combat Aura (Glows when super meter is high or performing special)
    this.renderAura(ctx, fighter, isModi, frameTime);

    // 5. Draw Fighter Body & Costume by Action
    ctx.save();
    if (fighter.action === 'hit_light' || fighter.action === 'hit_heavy') {
      // Red flash on impact
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 15;
    }

    if (isModi) {
      this.renderModi(ctx, fighter, frameTime);
    } else {
      this.renderRahul(ctx, fighter, frameTime);
    }
    ctx.restore();

    // 6. Kinetic Guard Shield when blocking
    if (fighter.isBlocking) {
      this.renderBlockShield(ctx, isModi, frameTime);
    }

    // 7. Attack trails & swooshes
    this.renderAttackVFX(ctx, fighter);

    ctx.restore();

    // 8. Super Beam / Projectile (Global coordinate space)
    if (beam && beam.active && beam.owner === fighter.id) {
      this.renderSpecialBeam(ctx, beam, isModi, frameTime);
    }
  }

  private renderGroundShadow(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    const groundY = 460;
    const heightAboveGround = Math.max(0, groundY - y);
    const scaleFactor = Math.max(0.3, 1 - heightAboveGround / 250);
    const shadowWidth = 55 * scaleFactor;
    const shadowAlpha = Math.max(0.1, 0.45 * scaleFactor);

    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(x, groundY - 12, shadowWidth, 10 * scaleFactor, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private renderAura(
    ctx: CanvasRenderingContext2D,
    fighter: FighterEntity,
    isModi: boolean,
    frameTime: number
  ) {
    const isSuperReady = fighter.superMeter >= fighter.maxSuperMeter;
    const isSpecial = fighter.action === 'special';

    if (!isSuperReady && !isSpecial) return;

    ctx.save();
    const color = isModi ? 'rgba(249, 115, 22,' : 'rgba(2, 132, 199,';
    const pulse = Math.sin(frameTime * 8) * 6;
    const glowRadius = isSpecial ? 75 + pulse * 2 : 45 + pulse;

    const auraGrad = ctx.createRadialGradient(0, -65, 20, 0, -65, glowRadius);
    auraGrad.addColorStop(0, `${color} 0.5)`);
    auraGrad.addColorStop(0.7, `${color} 0.2)`);
    auraGrad.addColorStop(1, `${color} 0)`);

    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, -65, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Floating energy motes
    for (let i = 0; i < 4; i++) {
      const angle = frameTime * 4 + i * (Math.PI / 2);
      const ex = Math.cos(angle) * (35 + pulse);
      const ey = -65 + Math.sin(angle) * (45 + pulse);
      ctx.fillStyle = isModi ? '#fbbf24' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(ex, ey, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ==========================================
  // NARENDRA MODI RENDERER
  // Features: White Kurta-Pajama, Saffron Sleeveless Nehru Jacket,
  // White beard, spectacles, broad 56-inch torso.
  // ==========================================
  private renderModi(ctx: CanvasRenderingContext2D, fighter: FighterEntity, frameTime: number) {
    const action = fighter.action;
    const timer = fighter.actionTimer;

    // Kinematic offsets based on action state
    let bodyY = -60;
    let bodyTilt = 0;
    let headTilt = 0;
    let punchExt = 0;
    let kickExt = 0;
    let legL_Angle = 0;
    let legR_Angle = 0;
    let armFront_Angle = 0;
    let armBack_Angle = 0;

    switch (action) {
      case 'idle':
        bodyY += Math.sin(frameTime * 4) * 2;
        bodyTilt = 0.04;
        armFront_Angle = 0.3 + Math.sin(frameTime * 4) * 0.05;
        armBack_Angle = -0.3;
        break;

      case 'walk_fwd':
        bodyY += Math.sin(frameTime * 12) * 3;
        bodyTilt = 0.12;
        legL_Angle = Math.sin(frameTime * 10) * 0.5;
        legR_Angle = -Math.sin(frameTime * 10) * 0.5;
        armFront_Angle = -Math.sin(frameTime * 10) * 0.4;
        break;

      case 'walk_back':
        bodyY += Math.sin(frameTime * 10) * 2;
        bodyTilt = -0.08;
        legL_Angle = -Math.sin(frameTime * 8) * 0.4;
        legR_Angle = Math.sin(frameTime * 8) * 0.4;
        break;

      case 'jump':
        bodyY -= 15;
        bodyTilt = 0.15;
        legL_Angle = 0.6;
        legR_Angle = 0.3;
        armFront_Angle = -0.8;
        break;

      case 'crouch':
        bodyY += 25;
        bodyTilt = 0.2;
        legL_Angle = 1.1;
        legR_Angle = 1.2;
        armFront_Angle = 0.8;
        break;

      case 'punch':
        punchExt = Math.sin(Math.min(1, timer / 6) * Math.PI) * 42;
        bodyTilt = 0.18;
        armFront_Angle = -1.5;
        break;

      case 'heavy_punch':
        punchExt = Math.sin(Math.min(1, timer / 12) * Math.PI) * 62;
        bodyTilt = 0.28;
        armFront_Angle = -1.6;
        bodyY += 4;
        break;

      case 'kick':
        kickExt = Math.sin(Math.min(1, timer / 8) * Math.PI) * 45;
        legL_Angle = -1.4;
        bodyTilt = -0.2;
        break;

      case 'heavy_kick':
        kickExt = Math.sin(Math.min(1, timer / 14) * Math.PI) * 65;
        legL_Angle = -1.8;
        bodyTilt = -0.35;
        bodyY -= 10;
        break;

      case 'block':
        bodyTilt = -0.12;
        armFront_Angle = -1.1;
        armBack_Angle = -1.0;
        break;

      case 'hit_light':
      case 'hit_heavy':
        bodyTilt = -0.4;
        headTilt = -0.3;
        bodyY += 5;
        armFront_Angle = 0.6;
        break;

      case 'knockdown':
        bodyTilt = -1.4;
        bodyY += 45;
        legL_Angle = 0.8;
        break;

      case 'victory':
        bodyTilt = 0;
        armFront_Angle = -1.8; // Namaste / Wave
        armBack_Angle = -1.8;
        headTilt = 0.1;
        break;

      case 'defeat':
        bodyTilt = 0.5;
        headTilt = 0.6;
        bodyY += 15;
        armFront_Angle = 0.8;
        break;

      case 'special':
        // Dramatic 56-inch power charge pose
        bodyTilt = 0.22;
        punchExt = Math.sin(Math.min(1, timer / 20) * Math.PI) * 50;
        armFront_Angle = -1.55;
        break;
    }

    ctx.save();
    ctx.translate(0, bodyY);
    ctx.rotate(bodyTilt);

    // 1. Back Arm (Shadow Silhouette)
    ctx.save();
    ctx.translate(-5, -35);
    ctx.rotate(armBack_Angle);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-6, 0, 12, 32);
    ctx.restore();

    // 2. Legs & Lower Kurta-Pajama (White Pajama Pants + Kurta Hem)
    // Left Leg
    ctx.save();
    ctx.translate(-8, 10);
    ctx.rotate(legL_Angle);
    ctx.fillStyle = '#e2e8f0'; // White pajama
    ctx.fillRect(-6, 0, 13, 48);
    // Black slip-on shoes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-6, 44, 20, 10);
    ctx.restore();

    // Right Leg
    ctx.save();
    ctx.translate(10, 10);
    ctx.rotate(legR_Angle);
    ctx.fillStyle = '#cbd5e1'; // Slightly shaded white pajama
    ctx.fillRect(-6, 0, 13, 48);
    // Black slip-on shoes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-6, 44, 20, 10);
    ctx.restore();

    // 3. White Kurta Folds (Base layer extending past waist)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-22, -20);
    ctx.lineTo(24, -20);
    ctx.lineTo(28, 22);
    ctx.lineTo(-24, 22);
    ctx.closePath();
    ctx.fill();

    // 4. Broad Torso & Saffron Sleeveless Jacket (Iconic Modi Bandhgala Jacket)
    ctx.fillStyle = '#ea580c'; // Saffron jacket base
    ctx.beginPath();
    ctx.moveTo(-20, -42);
    ctx.lineTo(22, -42);
    ctx.lineTo(25, 14);
    ctx.lineTo(-22, 14);
    ctx.closePath();
    ctx.fill();

    // Saffron Jacket Collar (Mandarin collar)
    ctx.fillStyle = '#f97316';
    ctx.fillRect(-15, -46, 30, 7);

    // Front Jacket Placket & Golden Buttons
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(3, -42);
    ctx.lineTo(3, 14);
    ctx.stroke();

    for (let by = -36; by <= 6; by += 10) {
      ctx.fillStyle = '#fde047'; // Gold button
      ctx.beginPath();
      ctx.arc(3, by, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Breast pocket with saffron pocket square
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(8, -30, 10, 2);
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(9, -30);
    ctx.lineTo(13, -35);
    ctx.lineTo(17, -30);
    ctx.fill();

    // 5. White Kurta Sleeves (Full sleeves on upper arms)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-22, -40, 10, 18);

    // 6. Front Arm & Punching Fist
    ctx.save();
    ctx.translate(8, -35);
    ctx.rotate(armFront_Angle);

    // Kurta sleeve forearm
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-5, 0, 12, 28 + punchExt);

    // Hand / Fist
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(1, 28 + punchExt, 9, 0, Math.PI * 2);
    ctx.fill();

    // Punch impact burst on full extension
    if (punchExt > 30) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(1, 35 + punchExt, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 7. Head & Caricature Facial Profile
    ctx.save();
    ctx.translate(0, -52);
    ctx.rotate(headTilt);

    // Head base silhouette (fair skin tone with shadow fight contour)
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(3, 0, 18, 0, Math.PI * 2);
    ctx.fill();

    // Silver-White Trimmed Hair
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(0, -4, 18, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();

    // Iconic Full Silver-White Beard & Moustache
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-10, 3);
    ctx.quadraticCurveTo(5, 6, 17, 3);
    ctx.lineTo(19, 14);
    ctx.quadraticCurveTo(8, 22, -6, 18);
    ctx.closePath();
    ctx.fill();

    // Beard texture lines
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(3, 7);
    ctx.lineTo(5, 17);
    ctx.moveTo(11, 6);
    ctx.lineTo(13, 16);
    ctx.stroke();

    // Spectacles (Distinct rimless/golden frame glasses)
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.strokeRect(6, -4, 11, 8);
    // Glasses bridge and ear arm
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(3, 0);
    ctx.moveTo(17, 0);
    ctx.lineTo(19, -2);
    ctx.stroke();

    // Confident Eye
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(11, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // Head end

    ctx.restore(); // Body end
  }

  // ==========================================
  // RAHUL GANDHI RENDERER
  // Features: White Polo T-Shirt, Blue Jeans, Rolled Sleeves,
  // Athletic stance, neat wavy hair, stubble, dynamic kicks.
  // ==========================================
  private renderRahul(ctx: CanvasRenderingContext2D, fighter: FighterEntity, frameTime: number) {
    const action = fighter.action;
    const timer = fighter.actionTimer;

    let bodyY = -60;
    let bodyTilt = 0;
    let headTilt = 0;
    let punchExt = 0;
    let kickExt = 0;
    let legL_Angle = 0;
    let legR_Angle = 0;
    let armFront_Angle = 0;
    let armBack_Angle = 0;

    switch (action) {
      case 'idle':
        // Boxer bounce stance
        bodyY += Math.sin(frameTime * 6) * 3;
        bodyTilt = 0.08;
        armFront_Angle = -0.9 + Math.sin(frameTime * 6) * 0.08;
        armBack_Angle = -0.7;
        break;

      case 'walk_fwd':
        bodyY += Math.sin(frameTime * 14) * 3;
        bodyTilt = 0.16;
        legL_Angle = Math.sin(frameTime * 12) * 0.6;
        legR_Angle = -Math.sin(frameTime * 12) * 0.6;
        armFront_Angle = -Math.sin(frameTime * 12) * 0.5 - 0.5;
        break;

      case 'walk_back':
        bodyY += Math.sin(frameTime * 10) * 2;
        bodyTilt = -0.06;
        legL_Angle = -Math.sin(frameTime * 9) * 0.45;
        legR_Angle = Math.sin(frameTime * 9) * 0.45;
        break;

      case 'jump':
        bodyY -= 18;
        bodyTilt = 0.2;
        legL_Angle = 0.7;
        legR_Angle = 0.4;
        armFront_Angle = -1.2;
        break;

      case 'crouch':
        bodyY += 26;
        bodyTilt = 0.25;
        legL_Angle = 1.15;
        legR_Angle = 1.25;
        armFront_Angle = 0.5;
        break;

      case 'punch':
        punchExt = Math.sin(Math.min(1, timer / 5) * Math.PI) * 44;
        bodyTilt = 0.16;
        armFront_Angle = -1.55;
        break;

      case 'heavy_punch':
        punchExt = Math.sin(Math.min(1, timer / 10) * Math.PI) * 64;
        bodyTilt = 0.26;
        armFront_Angle = -1.6;
        bodyY += 3;
        break;

      case 'kick':
        kickExt = Math.sin(Math.min(1, timer / 7) * Math.PI) * 48;
        legL_Angle = -1.45;
        bodyTilt = -0.22;
        break;

      case 'heavy_kick':
        // Iconic Bharat Flying Kick
        kickExt = Math.sin(Math.min(1, timer / 13) * Math.PI) * 72;
        legL_Angle = -1.9;
        bodyTilt = -0.4;
        bodyY -= 14;
        break;

      case 'block':
        bodyTilt = -0.15;
        armFront_Angle = -1.2;
        armBack_Angle = -1.05;
        break;

      case 'hit_light':
      case 'hit_heavy':
        bodyTilt = -0.42;
        headTilt = -0.28;
        bodyY += 4;
        armFront_Angle = 0.4;
        break;

      case 'knockdown':
        bodyTilt = -1.45;
        bodyY += 45;
        legL_Angle = 0.9;
        break;

      case 'victory':
        bodyTilt = 0;
        armFront_Angle = -2.1; // Double fist pump
        armBack_Angle = -2.1;
        headTilt = -0.1;
        break;

      case 'defeat':
        bodyTilt = 0.55;
        headTilt = 0.65;
        bodyY += 15;
        armFront_Angle = 0.7;
        break;

      case 'special':
        // Khatakhat Storm sprint rush pose
        bodyTilt = 0.35;
        punchExt = Math.sin(Math.min(1, timer / 18) * Math.PI) * 55;
        armFront_Angle = -1.65;
        bodyY += 2;
        break;
    }

    ctx.save();
    ctx.translate(0, bodyY);
    ctx.rotate(bodyTilt);

    // 1. Back Arm
    ctx.save();
    ctx.translate(-4, -34);
    ctx.rotate(armBack_Angle);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-5, 0, 10, 30);
    ctx.restore();

    // 2. Legs: Classic Blue Denim Jeans
    // Left Leg
    ctx.save();
    ctx.translate(-7, 8);
    ctx.rotate(legL_Angle);
    ctx.fillStyle = '#1d4ed8'; // Classic blue denim
    ctx.fillRect(-6, 0, 12, 50);
    // Dark brown/tan trekking sneakers
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-6, 46, 20, 10);
    // White sneaker sole
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-6, 54, 20, 3);
    ctx.restore();

    // Right Leg
    ctx.save();
    ctx.translate(9, 8);
    ctx.rotate(legR_Angle);
    ctx.fillStyle = '#1e40af'; // Shaded blue denim
    ctx.fillRect(-6, 0, 12, 50);
    // Sneakers
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-6, 46, 20, 10);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-6, 54, 20, 3);
    ctx.restore();

    // 3. Torso: Crisp White Polo T-Shirt
    ctx.fillStyle = '#f8fafc'; // White Polo
    ctx.beginPath();
    ctx.moveTo(-18, -40);
    ctx.lineTo(18, -40);
    ctx.lineTo(16, 12);
    ctx.lineTo(-16, 12);
    ctx.closePath();
    ctx.fill();

    // Polo Collar & Placket
    ctx.fillStyle = '#e2e8f0';
    // Left collar flap
    ctx.beginPath();
    ctx.moveTo(-6, -42);
    ctx.lineTo(-14, -36);
    ctx.lineTo(-3, -32);
    ctx.closePath();
    ctx.fill();
    // Right collar flap
    ctx.beginPath();
    ctx.moveTo(6, -42);
    ctx.lineTo(14, -36);
    ctx.lineTo(3, -32);
    ctx.closePath();
    ctx.fill();

    // Polo button placket
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(-2, -38, 4, 14);

    // Subtle small Congress hand crest on left chest
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(8, -26, 3, 0, Math.PI * 2);
    ctx.fill();

    // Dark belt at waist
    ctx.fillStyle = '#334155';
    ctx.fillRect(-16, 9, 32, 4);
    ctx.fillStyle = '#e2e8f0'; // Silver belt buckle
    ctx.fillRect(-3, 8, 6, 6);

    // 4. Athletic Front Arm (Rolled Sleeves / Short Polo Sleeve)
    ctx.save();
    ctx.translate(6, -34);
    ctx.rotate(armFront_Angle);

    // Polo short sleeve
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-5, 0, 11, 14);

    // Forearm (Skin tone)
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(-4, 14, 9, 20 + punchExt);

    // Boxing / Martial Arts fist
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(0, 34 + punchExt, 8, 0, Math.PI * 2);
    ctx.fill();

    // Punch impact flash
    if (punchExt > 30) {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 42 + punchExt, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 5. Head & Profile (Wavy Hair, Stubble, Determined Expression)
    ctx.save();
    ctx.translate(0, -50);
    ctx.rotate(headTilt);

    // Head base silhouette
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(2, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    // Iconic Wavy Brown/Black Hair
    ctx.fillStyle = '#1e1b18';
    ctx.beginPath();
    ctx.arc(0, -5, 17, Math.PI * 0.85, Math.PI * 2.15);
    ctx.fill();
    // Hair tufts / volume
    ctx.beginPath();
    ctx.arc(8, -14, 8, 0, Math.PI * 2);
    ctx.arc(-4, -15, 8, 0, Math.PI * 2);
    ctx.fill();

    // Trimmed Stubble / Beard Shadow
    ctx.fillStyle = 'rgba(30, 27, 24, 0.4)';
    ctx.beginPath();
    ctx.arc(3, 5, 14, 0.2, Math.PI * 0.9);
    ctx.fill();

    // Determined Eye & Eyebrow
    ctx.fillStyle = '#1e1b18';
    // Brow
    ctx.fillRect(5, -6, 10, 2.5);
    // Eye
    ctx.beginPath();
    ctx.arc(10, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // Head end

    ctx.restore(); // Body end
  }

  private renderBlockShield(ctx: CanvasRenderingContext2D, isModi: boolean, frameTime: number) {
    ctx.save();
    const color = isModi ? '#f97316' : '#0284c7';
    const pulse = Math.sin(frameTime * 15) * 4;

    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.fillStyle = isModi ? 'rgba(249, 115, 22, 0.25)' : 'rgba(2, 132, 199, 0.25)';

    // Hexagonal energy shield barrier in front of defender
    ctx.beginPath();
    const cx = 35;
    const cy = -55;
    const r = 42 + pulse;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private renderAttackVFX(ctx: CanvasRenderingContext2D, fighter: FighterEntity) {
    const action = fighter.action;
    const timer = fighter.actionTimer;

    // Curved kick swoosh blade
    if (action === 'kick' || action === 'heavy_kick') {
      ctx.save();
      const isHeavy = action === 'heavy_kick';
      const color = fighter.id === 'modi' ? 'rgba(249, 115, 22, 0.8)' : 'rgba(56, 189, 248, 0.8)';

      ctx.strokeStyle = color;
      ctx.lineWidth = isHeavy ? 8 : 5;
      ctx.beginPath();
      ctx.arc(20, -45, isHeavy ? 65 : 45, -0.6, 1.2);
      ctx.stroke();
      ctx.restore();
    }
  }

  private renderSpecialBeam(
    ctx: CanvasRenderingContext2D,
    beam: SpecialBeam,
    isModi: boolean,
    frameTime: number
  ) {
    ctx.save();
    const startX = beam.x;
    const startY = beam.y;
    const dir = beam.direction;
    const width = beam.width * dir;
    const h = beam.height;

    // Outer Glow Beam
    const mainColor = isModi ? 'rgba(249, 115, 22,' : 'rgba(2, 132, 199,';
    const coreColor = isModi ? '#fde047' : '#e0f2fe';

    const beamGrad = ctx.createLinearGradient(0, startY - h / 2, 0, startY + h / 2);
    beamGrad.addColorStop(0, `${mainColor} 0)`);
    beamGrad.addColorStop(0.2, `${mainColor} 0.6)`);
    beamGrad.addColorStop(0.5, '#ffffff');
    beamGrad.addColorStop(0.8, `${mainColor} 0.6)`);
    beamGrad.addColorStop(1, `${mainColor} 0)`);

    ctx.fillStyle = beamGrad;
    ctx.fillRect(startX, startY - h / 2, width, h);

    // Core high-intensity lightning streak
    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    for (let x = 0; Math.abs(x) < Math.abs(width); x += 40 * dir) {
      const wobble = (Math.random() - 0.5) * 16;
      ctx.lineTo(startX + x, startY + wobble);
    }
    ctx.stroke();

    // Beam head burst
    const headX = startX + width;
    const burstGrad = ctx.createRadialGradient(headX, startY, 10, headX, startY, 70);
    burstGrad.addColorStop(0, '#ffffff');
    burstGrad.addColorStop(0.5, isModi ? '#f97316' : '#0284c7');
    burstGrad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = burstGrad;
    ctx.beginPath();
    ctx.arc(headX, startY, 70, 0, Math.PI * 2);
    ctx.fill();

    // Floating party symbols along the beam!
    // Modi: Lotus petals glowing; Rahul: Hand palms glowing
    for (let i = 1; i <= 3; i++) {
      const symX = startX + (width / 4) * i;
      const symY = startY + Math.sin(frameTime * 10 + i) * 15;
      ctx.fillStyle = coreColor;
      ctx.beginPath();
      ctx.arc(symX, symY, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
