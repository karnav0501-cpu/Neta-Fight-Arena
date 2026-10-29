/**
 * Procedural Web Audio API sound generator for NETA FIGHT ARENA
 * Zero external asset dependencies, zero loading latency, 100% original comical meme SFX.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private crowdGain: GainNode | null = null;
  private crowdSource: AudioBufferSourceNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private isInitialized: boolean = false;

  private initContext() {
    if (this.isInitialized && this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
      this.startAmbientCrowd();
    } catch {
      // Audio not supported or blocked
    }
  }

  public ensureContext() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  // --- Sound Effects ---

  public playWhoosh(pitch = 300) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playHit(heavy = false, blocked = false) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    if (blocked) {
      // Metal shield block clang
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc2.type = 'square';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.15);
      osc2.frequency.setValueAtTime(940, now);
      osc2.frequency.exponentialRampToValueAtTime(220, now + 0.1);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.16);
      osc2.stop(now + 0.16);
      return;
    }

    // Flesh punch impact (transient snap + sub bass boom)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = heavy ? 'sawtooth' : 'triangle';
    const startFreq = heavy ? 180 : 260;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + (heavy ? 0.22 : 0.14));

    gain.gain.setValueAtTime(heavy ? 0.7 : 0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + (heavy ? 0.22 : 0.14));

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + (heavy ? 0.23 : 0.15));

    // Heavy impact thud
    if (heavy) {
      this.playSubBass(0.25);
    }
  }

  public playSubBass(duration = 0.3) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + duration);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playSuperCharge() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.5);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.55);
  }

  public playSuperBlast() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    
    // Low rumble + electric buzz
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc2.type = 'sine';

    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.7);

    osc2.frequency.setValueAtTime(120, now);
    osc2.frequency.exponentialRampToValueAtTime(25, now + 0.7);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.76);
    osc2.stop(now + 0.76);

    this.cheerBurst();
  }

  public playRoundBell() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    [1046.5, 2093].forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.25);
    });
  }

  public playKO() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    // Dramatic gong
    const freqs = [180, 240, 310, 420];
    freqs.forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 1.8);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.85);
    });

    this.cheerBurst(1.5);
  }

  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const notes = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 659.25, d: 0.15 }, // E5
      { f: 783.99, d: 0.15 }, // G5
      { f: 1046.5, d: 0.45 }, // C6
    ];

    let t = this.ctx.currentTime;
    notes.forEach((note) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + note.d);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + note.d + 0.05);

      t += note.d * 0.9;
    });

    this.cheerBurst(2.0);
  }

  public playDefeatTrombone() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const notes = [
      { f: 370, d: 0.25 }, // F#4
      { f: 349, d: 0.25 }, // F4
      { f: 330, d: 0.3 },  // E4
      { f: 311, d: 0.7 },  // Eb4 (wah slide)
    ];

    let t = this.ctx.currentTime;
    notes.forEach((note, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.f, t);
      if (idx === 3) {
        osc.frequency.linearRampToValueAtTime(260, t + note.d);
      }

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + note.d);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + note.d + 0.05);

      t += note.d;
    });
  }

  public cheerBurst(durationMultiplier = 1.0) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const dur = 0.8 * durationMultiplier;

    // Filtered pink-like noise burst
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.96 * b1 + white * 0.11;
      b2 = 0.86 * b2 + white * 0.25;
      data[i] = (b0 + b1 + b2) * 0.35;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(700, now);
    filter.Q.setValueAtTime(1.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + dur);
  }

  private startAmbientCrowd() {
    if (!this.ctx || !this.masterGain) return;
    try {
      const dur = 4.0;
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Low rumble background murmur
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        last = last * 0.97 + white * 0.03;
        data[i] = last * 0.4;
      }

      this.crowdSource = this.ctx.createBufferSource();
      this.crowdSource.buffer = buffer;
      this.crowdSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      this.crowdGain = this.ctx.createGain();
      this.crowdGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

      this.crowdSource.connect(filter);
      filter.connect(this.crowdGain);
      this.crowdGain.connect(this.masterGain);

      this.crowdSource.start();
    } catch {
      // Ignore background loop failure
    }
  }
}

export const soundEngine = new SoundEngine();
