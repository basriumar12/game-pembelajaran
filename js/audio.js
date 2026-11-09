/**
 * Retro Audio Synthesizer (Web Audio API)
 * Harvest Moon / Stardew Valley 8-bit & 16-bit Cozy Farm Vibes
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.musicPlaying = false;
    this.musicTimer = null;
    this.isMuted = false;
    this.tempo = 135;
    this.noteIndex = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.musicPlaying) {
      this.stopMusic();
    } else if (!this.isMuted && !this.musicPlaying) {
      this.startMusic();
    }
    return this.isMuted;
  }

  playTone(freq, type = "sine", duration = 0.2, gainValue = 0.1, pitchBend = 0) {
    if (this.isMuted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (pitchBend !== 0) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + pitchBend), this.ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  // SFX: Dice Roll Shake
  playDiceRoll() {
    if (this.isMuted) return;
    this.init();
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.playTone(300 + Math.random() * 250, "triangle", 0.08, 0.12, 100);
      }, i * 70);
    }
  }

  // SFX: Tile Jump / Hop
  playHop() {
    this.playTone(480, "sine", 0.12, 0.15, 200);
  }

  // SFX: Question Modal Pop
  playModalOpen() {
    this.playTone(523.25, "triangle", 0.1, 0.12); // C5
    setTimeout(() => this.playTone(659.25, "triangle", 0.12, 0.12), 80); // E5
    setTimeout(() => this.playTone(783.99, "triangle", 0.18, 0.14), 160); // G5
  }

  // SFX: Correct Answer Chime (Cheerful Farm Harvest)
  playCorrect() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, "sine", 0.25, 0.15);
      }, idx * 90);
    });
  }

  // SFX: Wrong Answer Buzzer (Gentle Thud)
  playWrong() {
    this.playTone(220, "sawtooth", 0.2, 0.15, -60);
    setTimeout(() => this.playTone(180, "sawtooth", 0.28, 0.15, -50), 120);
  }

  // SFX: Energy / Stamina Boost
  playHeal() {
    [400, 500, 600, 800].forEach((f, i) => {
      setTimeout(() => this.playTone(f, "triangle", 0.18, 0.1), i * 70);
    });
  }

  // SFX: Level Up / Win Fanfare
  playFanfare() {
    const notes = [
      { f: 523, d: 0.15 }, { f: 523, d: 0.15 }, { f: 523, d: 0.15 },
      { f: 659, d: 0.35 }, { f: 784, d: 0.25 }, { f: 1046, d: 0.6 }
    ];
    let time = 0;
    notes.forEach(n => {
      setTimeout(() => this.playTone(n.f, "triangle", n.d, 0.2), time);
      time += n.d * 1000 * 0.9;
    });
  }

  // Cozy Farm Background Music (Chiptune loop)
  startMusic() {
    if (this.musicPlaying || this.isMuted) return;
    this.init();
    this.musicPlaying = true;

    // Harvest Moon Town / Farm motif melody: C, E, G, A, G, E, D, C...
    const melody = [
      261.63, 0, 329.63, 0, 392.00, 440.00, 392.00, 329.63,
      293.66, 0, 329.63, 0, 261.63, 0, 196.00, 0,
      261.63, 293.66, 329.63, 392.00, 440.00, 0, 523.25, 440.00,
      392.00, 329.63, 293.66, 329.63, 261.63, 0, 0, 0
    ];

    const bass = [
      130.81, 130.81, 164.81, 164.81, 196.00, 196.00, 164.81, 164.81,
      146.83, 146.83, 164.81, 164.81, 130.81, 130.81, 98.00, 98.00
    ];

    const stepTime = 190; // ms per 16th beat
    let step = 0;

    this.musicTimer = setInterval(() => {
      if (!this.musicPlaying || this.isMuted) return;
      const mNote = melody[step % melody.length];
      const bNote = bass[Math.floor(step / 2) % bass.length];

      if (mNote > 0) {
        this.playTone(mNote, "triangle", 0.16, 0.05);
      }
      if (step % 2 === 0 && bNote > 0) {
        this.playTone(bNote, "sine", 0.22, 0.04);
      }
      step++;
    }, stepTime);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

window.soundSystem = new SoundSystem();
