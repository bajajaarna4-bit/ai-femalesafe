// Web Audio API Synthesizers for SAATHI AI
// Works purely client-side without relying on external audio downloads

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sirenOscillator: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private ringtoneInterval: any = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a short tactile confirmation beep
  playBeep(freq = 600, duration = 0.15) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // Play soothing safe check-in chime
  playCheckinChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.15, this.ctx!.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + i * 0.12);
        osc.stop(this.ctx!.currentTime + i * 0.12 + 0.35);
      });
    } catch (e) {
      console.warn('Chime error', e);
    }
  }

  // Play urgent alert chime for warnings or countdown
  playWarningChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      [880, 780, 880, 780].forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.15);
        gain.gain.setValueAtTime(0.1, this.ctx!.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.15 + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.15);
        osc.stop(this.ctx!.currentTime + idx * 0.15 + 0.12);
      });
    } catch (e) {
      console.warn('Warning chime error', e);
    }
  }

  // Start continuous loud police/emergency siren
  startSiren() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      this.stopSiren();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);

      // Pitch sweep up and down
      const now = this.ctx.currentTime;
      for (let i = 0; i < 30; i++) {
        osc.frequency.setValueAtTime(700, now + i * 0.8);
        osc.frequency.exponentialRampToValueAtTime(1400, now + i * 0.8 + 0.4);
        osc.frequency.exponentialRampToValueAtTime(700, now + i * 0.8 + 0.8);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();

      this.sirenOscillator = osc;
      this.sirenGain = gain;
    } catch (e) {
      console.warn('Siren start error', e);
    }
  }

  stopSiren() {
    try {
      if (this.sirenOscillator) {
        this.sirenOscillator.stop();
        this.sirenOscillator.disconnect();
        this.sirenOscillator = null;
      }
      if (this.sirenGain) {
        this.sirenGain.disconnect();
        this.sirenGain = null;
      }
    } catch (e) {
      console.warn('Siren stop error', e);
    }
  }

  // Realistic phone ringtone for fake call generator
  startPhoneRingtone() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      this.stopPhoneRingtone();

      const playBurst = () => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        // Dual-tone multi-frequency ring tone (440Hz + 480Hz US standard or 400Hz+450Hz)
        [440, 480].forEach(f => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, t);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.setValueAtTime(0.18, t + 1.8);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.0);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(t);
          osc.stop(t + 2.0);
        });
      };

      playBurst();
      this.ringtoneInterval = setInterval(playBurst, 4000);
    } catch (e) {
      console.warn('Ringtone error', e);
    }
  }

  stopPhoneRingtone() {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
  }

  // Text to speech simulation for fake call voice
  speakFakeCaller(text = "Hey, where are you right now? Dad and I are waiting outside for your cab, let us know once you reach the gate.") {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.0;
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }
}

export const sounds = new SoundEngine();

