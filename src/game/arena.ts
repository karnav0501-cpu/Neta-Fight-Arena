/**
 * Dynamic 2D Arena renderer with crowd animations, political party banners,
 * lighting effects, confetti, and comic VFX.
 */

import { ComicTextParticle, SparkParticle, ConfettiParticle } from './types';

export class ArenaRenderer {
  private crowdBobTimer = 0;
  private spotlightAngle = 0;
  private confetti: ConfettiParticle[] = [];
  private sparks: SparkParticle[] = [];
  private comicTexts: ComicTextParticle[] = [];
  private nextComicId = 1;

  constructor() {
    this.initConfetti();
  }

  private initConfetti() {
    this.confetti = [];
    const colors = ['#f97316', '#ffffff', '#10b981', '#0284c7', '#fbbf24'];
    for (let i = 0; i < 45; i++) {
      this.confetti.push({
        x: Math.random() * 1200,
        y: Math.random() * 600,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 0.5 + Math.random() * 1.5,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.08,
      });
    }
  }

  public addSpark(x: number, y: number, color = '#fbbf24', count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 9;
      this.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        radius: 2 + Math.random() * 3,
        color,
        alpha: 1,
        life: 18 + Math.floor(Math.random() * 12),
      });
    }
  }

  public addComicText(text: string, x: number, y: number, color = '#facc15', stroke = '#000000') {
    this.comicTexts.push({
      id: this.nextComicId++,
      text,
      x: x + (Math.random() - 0.5) * 30,
      y: y - 20,
      vx: (Math.random() - 0.5) * 2,
      vy: -3.5 - Math.random() * 2,
      color,
      strokeColor: stroke,
      scale: 0.4,
      maxScale: 1.4 + Math.random() * 0.3,
      opacity: 1,
      life: 0,
      maxLife: 35,
    });
  }

  public update() {
    this.crowdBobTimer += 0.05;
    this.spotlightAngle += 0.015;

    // Confetti update
    for (const c of this.confetti) {
      c.x += c.vx;
      c.y += c.vy;
      c.rotation += c.vRot;
      if (c.y > 600) {
        c.y = -10;
        c.x = Math.random() * 1200;
      }
      if (c.x < 0) c.x = 1200;
      if (c.x > 1200) c.x = 0;
    }

    // Sparks update
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.25; // gravity
      s.life--;
      s.alpha = Math.max(0, s.life / 25);
      if (s.life <= 0) {
        this.sparks.splice(i, 1);
      }
    }

    // Comic texts update
    for (let i = this.comicTexts.length - 1; i >= 0; i--) {
      const ct = this.comicTexts[i];
      ct.life++;
      ct.x += ct.vx;
      ct.y += ct.vy;
      ct.vy += 0.08;

      if (ct.life < 8) {
        // Pop in
        ct.scale = 0.4 + (ct.maxScale - 0.4) * (ct.life / 8);
      } else {
        // Float and fade
        ct.scale = ct.maxScale;
        const remaining = ct.maxLife - ct.life;
        ct.opacity = Math.max(0, remaining / (ct.maxLife - 8));
      }

      if (ct.life >= ct.maxLife) {
        this.comicTexts.splice(i, 1);
      }
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    p1Id: 'modi' | 'rahul',
    cameraShakeX = 0,
    cameraShakeY = 0
  ) {
    ctx.save();
    ctx.translate(cameraShakeX, cameraShakeY);

    // 1. Sky & Stadium Horizon Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#090d16');
    skyGrad.addColorStop(0.4, '#131d2e');
    skyGrad.addColorStop(0.7, '#1e293b');
    skyGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Distant Stadium Lights & Rally Backdrops
    this.renderStadiumLights(ctx, width, height);

    // 3. Cheering Crowds (Split: Left Side vs Right Side)
    // Left side: Modi's crowd (BJP Saffron) or Rahul's crowd (Congress Blue/Green) based on who is on left
    const leftIsModi = p1Id === 'modi';
    this.renderCrowd(ctx, width, height, 0, width / 2, leftIsModi ? 'modi' : 'rahul', -1);
    this.renderCrowd(ctx, width, height, width / 2, width, leftIsModi ? 'rahul' : 'modi', 1);

    // 4. Center Arena Stage Platform
    const stageY = 460;
    this.renderStage(ctx, width, height, stageY);

    // 5. Party Banners & Hoardings
    this.renderBanners(ctx, width, stageY, leftIsModi);

    // 6. Confetti
    this.renderConfetti(ctx);

    ctx.restore();
  }

  private renderStadiumLights(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    // Metal truss at top
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, 24);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 20, 24);
      ctx.lineTo(x + 40, 0);
      ctx.stroke();
    }

    // Spotlights sweeping the stage
    const spotX1 = 200;
    const spotX2 = width - 200;
    const sweep1 = Math.sin(this.spotlightAngle) * 120;
    const sweep2 = Math.cos(this.spotlightAngle * 0.8) * 120;

    // Saffron spotlight on left
    const beamGrad1 = ctx.createRadialGradient(spotX1, 24, 10, spotX1 + sweep1, 460, 320);
    beamGrad1.addColorStop(0, 'rgba(249, 115, 22, 0.28)');
    beamGrad1.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = beamGrad1;
    ctx.beginPath();
    ctx.moveTo(spotX1 - 15, 24);
    ctx.lineTo(spotX1 + 15, 24);
    ctx.lineTo(spotX1 + sweep1 + 180, 460);
    ctx.lineTo(spotX1 + sweep1 - 180, 460);
    ctx.closePath();
    ctx.fill();

    // Cyan/Blue spotlight on right
    const beamGrad2 = ctx.createRadialGradient(spotX2, 24, 10, spotX2 + sweep2, 460, 320);
    beamGrad2.addColorStop(0, 'rgba(2, 132, 199, 0.28)');
    beamGrad2.addColorStop(1, 'rgba(2, 132, 199, 0)');
    ctx.fillStyle = beamGrad2;
    ctx.beginPath();
    ctx.moveTo(spotX2 - 15, 24);
    ctx.lineTo(spotX2 + 15, 24);
    ctx.lineTo(spotX2 + sweep2 + 180, 460);
    ctx.lineTo(spotX2 + sweep2 - 180, 460);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private renderCrowd(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    startX: number,
    endX: number,
    party: 'modi' | 'rahul',
    facing: number
  ) {
    ctx.save();
    const isModi = party === 'modi';
    const mainColor = isModi ? '#ea580c' : '#0284c7';
    const flagColor = isModi ? '#f97316' : '#10b981';
    const accentColor = isModi ? '#fde047' : '#ffffff';

    // Layer 1: Back crowd silhouettes
    ctx.fillStyle = isModi ? '#1f130d' : '#0d1927';
    for (let x = startX + 10; x < endX; x += 32) {
      const bob = Math.sin(this.crowdBobTimer * 2 + x * 0.1) * 6;
      const cy = 340 + bob;
      ctx.beginPath();
      ctx.arc(x, cy, 14, 0, Math.PI * 2);
      ctx.rect(x - 16, cy + 10, 32, 110);
      ctx.fill();
    }

    // Layer 2: Mid crowd with party turbans/caps & waving banners
    for (let x = startX + 18; x < endX - 10; x += 48) {
      const wave = Math.sin(this.crowdBobTimer * 2.5 + x * 0.15) * 8;
      const cy = 370 + wave;

      // Body silhouette
      ctx.fillStyle = isModi ? '#331908' : '#0f243b';
      ctx.beginPath();
      ctx.arc(x, cy, 18, 0, Math.PI * 2);
      ctx.rect(x - 22, cy + 12, 44, 90);
      ctx.fill();

      // Headwear (Saffron turban/pagri for Modi side, White Gandhi topi or polo scarf for Rahul side)
      if (isModi) {
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.ellipse(x, cy - 8, 19, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(x + 10, cy - 12, 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        // Gandhi cap shape or scarf
        ctx.ellipse(x, cy - 8, 17, 8, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x - 15, cy - 4, 30, 4);
      }

      // Waving flags and placards on poles
      if (x % 96 === 0) {
        const flagBob = Math.cos(this.crowdBobTimer * 3 + x) * 12;
        const poleX = x + facing * 15;
        const poleTopY = 220 + flagBob;

        // Pole
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(poleX, cy);
        ctx.lineTo(poleX, poleTopY);
        ctx.stroke();

        // Flag
        ctx.fillStyle = flagColor;
        ctx.beginPath();
        ctx.moveTo(poleX, poleTopY);
        ctx.quadraticCurveTo(poleX + 35 * facing, poleTopY + Math.sin(this.crowdBobTimer * 4) * 8, poleX + 70 * facing, poleTopY + 12);
        ctx.lineTo(poleX + 70 * facing, poleTopY + 45);
        ctx.quadraticCurveTo(poleX + 35 * facing, poleTopY + 35 + Math.sin(this.crowdBobTimer * 4) * 8, poleX, poleTopY + 32);
        ctx.closePath();
        ctx.fill();

        // Symbol on flag
        ctx.fillStyle = accentColor;
        if (isModi) {
          // Lotus simplified symbol (flower petals)
          ctx.beginPath();
          ctx.arc(poleX + 35 * facing, poleTopY + 22, 7, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Palm hand / Tricolor stripe
          ctx.fillRect(poleX + (facing > 0 ? 10 : -45), poleTopY + 10, 35, 6);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(poleX + (facing > 0 ? 10 : -45), poleTopY + 16, 35, 6);
          ctx.fillStyle = '#10b981';
          ctx.fillRect(poleX + (facing > 0 ? 10 : -45), poleTopY + 22, 35, 6);
        }
      }
    }

    ctx.restore();
  }

  private renderStage(ctx: CanvasRenderingContext2D, width: number, height: number, stageY: number) {
    ctx.save();

    // Stage platform drop shadow
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, stageY + 35, width, height - stageY - 35);

    // Stage side bevel
    const bevelGrad = ctx.createLinearGradient(0, stageY, 0, stageY + 35);
    bevelGrad.addColorStop(0, '#1e293b');
    bevelGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = bevelGrad;
    ctx.fillRect(0, stageY, width, 35);

    // Stage Top Surface (Polished arena floor with high gloss)
    const floorGrad = ctx.createLinearGradient(0, stageY - 30, 0, stageY + 5);
    floorGrad.addColorStop(0, '#1e293b');
    floorGrad.addColorStop(0.5, '#334155');
    floorGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, stageY - 20, width, 25);

    // Stage glowing rim line (Neon dividing center line)
    const rimGrad = ctx.createLinearGradient(0, 0, width, 0);
    rimGrad.addColorStop(0, '#f97316');   // Modi Saffron
    rimGrad.addColorStop(0.48, '#fbbf24');
    rimGrad.addColorStop(0.5, '#ffffff');  // Center tricolor white
    rimGrad.addColorStop(0.52, '#38bdf8');
    rimGrad.addColorStop(1, '#0284c7');   // Rahul Cyan
    ctx.strokeStyle = rimGrad;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, stageY - 18);
    ctx.lineTo(width, stageY - 18);
    ctx.stroke();

    // Center Stage Decal: Ashoka Chakra / Neta Arena emblem on the ground
    const centerX = width / 2;
    ctx.save();
    ctx.translate(centerX, stageY - 8);
    ctx.scale(1, 0.28); // 3D floor perspective ellipse
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 110, 0, Math.PI * 2);
    ctx.stroke();
    // Inner spoke lines
    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI) / 12;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * 110, Math.sin(angle) * 110);
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  }

  private renderBanners(ctx: CanvasRenderingContext2D, width: number, stageY: number, leftIsModi: boolean) {
    ctx.save();

    // Modi side banner
    const modiX = leftIsModi ? 40 : width - 360;
    const rahulX = leftIsModi ? width - 360 : 40;

    // Modi Banner: Saffron with bold Hindi/English text
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(modiX, stageY - 130, 320, 48);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3;
    ctx.strokeRect(modiX, stageY - 130, 320, 48);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ 56 INCH VIKAS ARENA ★', modiX + 160, stageY - 106);
    ctx.font = '700 11px system-ui, sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('MODI CAMP · LOTUS POWER', modiX + 160, stageY - 90);

    // Rahul Banner: Congress Blue/Tricolor with bold slogan
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(rahulX, stageY - 130, 320, 48);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(rahulX, stageY - 130, 320, 48);

    // Tricolor bottom strip
    ctx.fillStyle = '#f97316';
    ctx.fillRect(rahulX, stageY - 86, 106, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rahulX + 106, stageY - 86, 107, 4);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(rahulX + 213, stageY - 86, 107, 4);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ MOHABBAT KI DUKAAN ★', rahulX + 160, stageY - 106);
    ctx.font = '700 11px system-ui, sans-serif';
    ctx.fillStyle = '#67e8f9';
    ctx.fillText('RAHUL CAMP · KHATAKHAT YATRA', rahulX + 160, stageY - 92);

    ctx.restore();
  }

  private renderConfetti(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const c of this.confetti) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rotation);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
      ctx.restore();
    }
    ctx.restore();
  }

  public renderForegroundVFX(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // 1. Sparks
    for (const s of this.sparks) {
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 2. Comic Hit Text Overlays
    for (const ct of this.comicTexts) {
      ctx.save();
      ctx.translate(ct.x, ct.y);
      ctx.scale(ct.scale, ct.scale);
      ctx.globalAlpha = ct.opacity;

      ctx.font = '900 32px "Arial Black", Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Thick comic outline
      ctx.lineJoin = 'miter';
      ctx.miterLimit = 2;
      ctx.strokeStyle = ct.strokeColor;
      ctx.lineWidth = 8;
      ctx.strokeText(ct.text, 0, 0);

      // Inner fill
      ctx.fillStyle = ct.color;
      ctx.fillText(ct.text, 0, 0);

      ctx.restore();
    }

    ctx.restore();
  }
}
