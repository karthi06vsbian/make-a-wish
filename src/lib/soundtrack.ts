/**
 * Meditative Web Audio Sound Generator
 * Generates an ethereal, peaceful temple drone & Tibetan singing bell
 * without external audio file dependencies.
 */

class MeditativeSoundtrack {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private droneOscillators: OscillatorNode[] = [];
  private lfo: OscillatorNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play() {
    this.initContext();
    if (!this.ctx) return;
    if (this.isPlaying) return;

    this.isPlaying = true;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(0.25, this.ctx.currentTime + 3);
    this.masterGain.connect(this.ctx.destination);

    // Warm sacred frequencies (Root 136.1 Hz "Om" / C#3 + harmonics)
    const baseFreq = 136.1;
    const harmonics = [
      { freq: baseFreq, type: 'sine' as OscillatorType, gain: 0.3 },
      { freq: baseFreq * 1.5, type: 'sine' as OscillatorType, gain: 0.18 }, // Sacred fifth
      { freq: baseFreq * 2.0, type: 'triangle' as OscillatorType, gain: 0.1 }, // Octave
      { freq: baseFreq * 2.5, type: 'sine' as OscillatorType, gain: 0.05 }, // Major third
      { freq: baseFreq * 0.5, type: 'sine' as OscillatorType, gain: 0.35 }, // Deep grounding sub
    ];

    // Subtle LFO for gentle breath-like pulsation
    this.lfo = this.ctx.createOscillator();
    this.lfo.frequency.value = 0.12; // 8-second cycle
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.08;
    this.lfo.connect(lfoGain);

    this.droneOscillators = [];

    harmonics.forEach(({ freq, type, gain }) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      oscGain.gain.setValueAtTime(gain, this.ctx.currentTime);
      lfoGain.connect(oscGain.gain);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      osc.start();
      this.droneOscillators.push(osc);
    });

    this.lfo.start();
  }

  public stop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    this.isPlaying = false;
    const fadeOutTime = this.ctx.currentTime + 2;

    this.masterGain.gain.exponentialRampToValueAtTime(0.0001, fadeOutTime);

    setTimeout(() => {
      this.droneOscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore already stopped
        }
      });
      this.droneOscillators = [];
      if (this.lfo) {
        try {
          this.lfo.stop();
          this.lfo.disconnect();
        } catch {
          // ignore
        }
        this.lfo = null;
      }
    }, 2200);
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Sounds a resonant Tibetan singing bowl chime (e.g., when wish is submitted or reflection bell is pressed)
   */
  public playSingingBell(freq: number = 432) {
    this.initContext();
    if (!this.ctx) return;

    const bellGain = this.ctx.createGain();
    bellGain.connect(this.ctx.destination);

    const now = this.ctx.currentTime;
    bellGain.gain.setValueAtTime(0.001, now);
    bellGain.gain.linearRampToValueAtTime(0.4, now + 0.05);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

    // Fundamental & metallic overtones
    const overtones = [
      { f: freq, g: 0.5 },
      { f: freq * 2.76, g: 0.25 },
      { f: freq * 5.4, g: 0.12 },
      { f: freq * 8.9, g: 0.05 },
    ];

    overtones.forEach(({ f, g }) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gNode = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      gNode.gain.setValueAtTime(g, now);
      osc.connect(gNode);
      gNode.connect(bellGain);

      osc.start(now);
      osc.stop(now + 6);
    });
  }
}

export const meditativeAudio = new MeditativeSoundtrack();
