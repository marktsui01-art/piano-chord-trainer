import * as Tone from 'tone';
import { AudioManager } from './audio';

interface RhythmTarget {
  time: number; // 0 to 1 (relative to loop)
  lane: number; // 0, 1, 2
}

export class RhythmGame {
  private isRunning: boolean = false;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private audioManager: AudioManager;
  private animationId: number = 0;
  private resizeListener: (() => void) | null = null;

  // Synths for local rhythm sounds
  private leftSynths: Tone.MembraneSynth[] = [];
  private rightSynths: Tone.MetalSynth[] = []; // Changed to MetalSynth

  // Configuration
  private loopDuration = 2; // seconds
  private difficulty: 'easy' | 'hard' = 'easy';
  private demoMode: boolean = false;

  // Rhythm Data
  private leftRhythm: RhythmTarget[] = [];
  private rightRhythm: RhythmTarget[] = [];

  // State
  private score = 0;
  private attempts = 0;

  // Visuals
  private noteRadius = 12;
  private targetX = 100;
  private speed = 250; // Pixels per second

  // Colors
  private leftColors = ['#F44336', '#E91E63', '#9C27B0']; // Red, Pink, Purple
  private rightColors = ['#2196F3', '#03A9F4', '#00BCD4']; // Blue, Light Blue, Cyan

  // Lane Y positions (calculated in resize)
  private leftLaneYs: number[] = [];
  private rightLaneYs: number[] = [];

  // Feedback
  private feedbacks: { x: number; y: number; text: string; color: string; life: number }[] = [];

  constructor(audioManager: AudioManager) {
    this.audioManager = audioManager;

    // Initialize Synths
    // Left Hand: 3 Distinct Low Drums
    this.leftSynths = [
      new Tone.MembraneSynth().toDestination(),
      new Tone.MembraneSynth().toDestination(),
      new Tone.MembraneSynth().toDestination()
    ];
    // Tweak parameters for distinction
    this.leftSynths[0].pitchDecay = 0.05; // Tight kick
    this.leftSynths[1].pitchDecay = 0.1;  // Tom-ish
    this.leftSynths[2].pitchDecay = 0.2;  // Loose tom

    // Right Hand: 3 Distinct Cymbal Sounds (MetalSynth)
    this.rightSynths = [
        // Lane 0: Closed Hi-Hat (Short decay, high pitch)
        new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5
        }).toDestination(),

        // Lane 1: Open Hi-Hat (Longer decay)
        new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 0.5, release: 0.1 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5
        }).toDestination(),

        // Lane 2: Ride/Crash (Lower harmonicity, longer ring)
        new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 1.0, release: 0.2 },
            harmonicity: 3.1,
            modulationIndex: 16,
            resonance: 3000,
            octaves: 1
        }).toDestination(),
    ];

    // Set Frequencies
    this.rightSynths[0].frequency.value = 200;
    this.rightSynths[1].frequency.value = 200;
    this.rightSynths[2].frequency.value = 300;

    // Set Volumes
    this.leftSynths.forEach(s => s.volume.value = -10);
    this.rightSynths.forEach(s => s.volume.value = -15); // MetalSynth can be loud

    // Initial Rhythm Generation
    this.generateRhythm();
  }

  private generateRhythm() {
    // 2 vs 3 Polyrhythm Base
    // Left (2 beats): 0, 0.5
    // Right (3 beats): 0, 0.33, 0.66

    this.leftRhythm = [];
    this.rightRhythm = [];

    const leftBase = [0, 0.5];
    const rightBase = [0, 1/3, 2/3];

    // Assign lanes based on difficulty
    leftBase.forEach((t, i) => {
        // For easy, always lane 0. For hard, cycle or random.
        const lane = this.difficulty === 'easy' ? 0 : (i % 3);
        this.leftRhythm.push({ time: t, lane });
    });

    rightBase.forEach((t, i) => {
        const lane = this.difficulty === 'easy' ? 0 : (i % 3);
        this.rightRhythm.push({ time: t, lane });
    });

    // If Hard, let's add more variation or keep it simple but spread across keys?
    // User asked: "Easy level just uses one button... Difficult level will use all 3".
    // So the rhythm pattern itself (time) can stay 2 vs 3, but mapped to different keys.
    // Let's stick to the basic polyrhythm but distributed.
    if (this.difficulty === 'hard') {
        // Harder pattern: Distribute 2 beats across 3 lanes?
        // Let's make it fixed so it's learnable.
        // Left: Beat 1 -> Lane 0, Beat 2 -> Lane 1
        this.leftRhythm[0].lane = 0;
        this.leftRhythm[1].lane = 1; // Or 2

        // Right: Beat 1 -> Lane 0, Beat 2 -> Lane 1, Beat 3 -> Lane 2
        this.rightRhythm[0].lane = 0;
        this.rightRhythm[1].lane = 1;
        this.rightRhythm[2].lane = 2;
    }
  }

  public setDifficulty(level: 'easy' | 'hard') {
    if (this.difficulty !== level) {
        this.difficulty = level;
        this.generateRhythm();
        if (this.isRunning) {
            this.start(); // Restart to apply new schedule
        }
    }
  }

  public setDemoMode(enabled: boolean) {
      this.demoMode = enabled;
  }

  public init(canvasId: string) {
    if (this.canvas) return;

    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.resizeListener = () => this.resize();
      this.resize();
      window.addEventListener('resize', this.resizeListener!);
    }
  }

  private resize() {
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.width = this.canvas.parentElement.clientWidth;
      this.canvas.height = 300;

      // Calculate Lane Y positions
      // Top Half (0-150) for Left Hand
      // Bottom Half (150-300) for Right Hand
      const topOffset = 30;
      const spacing = 40;

      this.leftLaneYs = [topOffset, topOffset + spacing, topOffset + spacing * 2];

      const bottomBase = 180;
      this.rightLaneYs = [bottomBase, bottomBase + spacing, bottomBase + spacing * 2];
    }
  }

  public async start() {
    await Tone.start();
    Tone.Transport.stop();
    Tone.Transport.cancel();

    // Reset State
    this.score = 0;
    this.attempts = 0;
    this.feedbacks = [];

    Tone.Transport.bpm.value = 60;
    this.loopDuration = 2;
    Tone.Transport.loop = true;
    Tone.Transport.loopStart = 0;
    Tone.Transport.loopEnd = this.loopDuration;

    // Schedule Events
    this.scheduleEvents('left', this.leftRhythm);
    this.scheduleEvents('right', this.rightRhythm);

    Tone.Transport.start();
    this.isRunning = true;

    // Start loop if not already running
    cancelAnimationFrame(this.animationId);
    this.loop();
  }

  private scheduleEvents(hand: 'left' | 'right', rhythm: RhythmTarget[]) {
      rhythm.forEach(target => {
          Tone.Transport.schedule((time) => {
              // Always play sound if Demo Mode is on
              // OR if it's meant to be a metronome?
              // User said "Demo Mode (checkbox) so we can hear what it sounds like".
              // Implicitly, normal mode might be silent until user hits?
              // Or maybe normal mode has a "guide" track?
              // The original code had a metronome.
              // Let's say: In Normal mode, we play a quiet click (Guide).
              // In Demo mode, we play the FULL sound and trigger visuals.

              if (this.demoMode) {
                  this.triggerSound(hand, target.lane, time);
                  // Visual hit effect
                  Tone.Draw.schedule(() => {
                      const y = hand === 'left' ? this.leftLaneYs[target.lane] : this.rightLaneYs[target.lane];
                      this.showFeedback(this.targetX, y, 'Auto', hand === 'left' ? this.leftColors[target.lane] : this.rightColors[target.lane]);
                  }, time);
              }
          }, target.time * this.loopDuration);
      });
  }

  public stop() {
    this.isRunning = false;
    Tone.Transport.stop();
    cancelAnimationFrame(this.animationId);
  }

  private triggerSound(hand: 'left' | 'right', lane: number, time?: number) {
      if (hand === 'left') {
          // C2, E2, G2
          const notes = ['C2', 'E2', 'G2'];
          this.leftSynths[lane].triggerAttackRelease(notes[lane], '16n', time);
      } else {
          // MetalSynth uses frequency + duration
          // We can use different notes/frequencies to vary them slightly too if parameters aren't enough
          const notes = ['32n', '16n', '4n']; // Durations for Closed, Open, Crash
          // Trigger the synth. MetalSynth.triggerAttackRelease(note, duration, time, velocity)
          // We pass the configured frequency as the 'note' argument.
          this.rightSynths[lane].triggerAttackRelease(this.rightSynths[lane].frequency.value, notes[lane], time);
      }
  }

  public handleInput(hand: 'left' | 'right', lane: number) {
    if (!this.isRunning) return;

    // If in Demo Mode, user input might be ignored or act as play-along?
    // Let's allow play-along.

    const currentTime = Tone.Transport.progress * this.loopDuration;
    const rhythm = hand === 'left' ? this.leftRhythm : this.rightRhythm;

    // Filter by lane! User must hit the correct lane.
    const laneTargets = rhythm.filter(r => r.lane === lane);

    const tolerance = 0.15; // 150ms

    let hit = false;
    let bestDiff = Infinity;

    for (const target of laneTargets) {
      const targetTime = target.time * this.loopDuration;
      let diff = Math.abs(currentTime - targetTime);

      if (diff > this.loopDuration / 2) {
        diff = this.loopDuration - diff;
      }

      if (diff < tolerance) {
        if (diff < bestDiff) {
          bestDiff = diff;
          hit = true;
        }
      }
    }

    const y = hand === 'left' ? this.leftLaneYs[lane] : this.rightLaneYs[lane];
    const color = hand === 'left' ? this.leftColors[lane] : this.rightColors[lane];

    if (hit) {
      this.score++;
      this.showFeedback(this.targetX, y, 'Good!', color);
      this.triggerSound(hand, lane);
    } else {
      this.showFeedback(this.targetX, y, 'Miss', '#888');
      // Optional: Play "clack" or miss sound?
      this.audioManager.playIncorrect();
    }

    if (!this.demoMode) {
        this.attempts++;
    }

    const scoreEl = document.getElementById('rhythm-score-display');
    if (scoreEl) {
        scoreEl.textContent = `Score: ${this.score}`;
    }
  }

  private showFeedback(x: number, y: number, text: string, color: string) {
    this.feedbacks.push({ x, y, text, color, life: 1.0 });
  }

  private loop = () => {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(this.loop);
  };

  private update() {
    for (let i = this.feedbacks.length - 1; i >= 0; i--) {
      this.feedbacks[i].life -= 0.05;
      this.feedbacks[i].y -= 0.5;
      if (this.feedbacks[i].life <= 0) {
        this.feedbacks.splice(i, 1);
      }
    }
  }

  private draw() {
    if (!this.ctx || !this.canvas) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const ctx = this.ctx;

    // Background
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, width, height);

    // Draw Target Line
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.targetX, 0);
    ctx.lineTo(this.targetX, height);
    ctx.stroke();

    // Draw Tracks (Lanes)
    ctx.lineWidth = 1;

    // Left Hand Lanes
    this.leftLaneYs.forEach((y, i) => {
        // Draw track line
        ctx.strokeStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        // Label (only on first lane or all?)
        if (i === 0) {
            ctx.fillStyle = '#ccc';
            ctx.font = '14px Arial';
            ctx.fillText('Left Hand (A, S, D)', 10, y - 15);
        }
    });

    // Right Hand Lanes
    this.rightLaneYs.forEach((y, i) => {
        ctx.strokeStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        if (i === 0) {
            ctx.fillStyle = '#ccc';
            ctx.font = '14px Arial';
            ctx.fillText('Right Hand (J, K, L)', 10, y - 15);
        }
    });

    // Draw Notes
    const progress = Tone.Transport.progress;

    const drawNotes = (rhythm: RhythmTarget[], ys: number[], colors: string[]) => {
        rhythm.forEach(target => {
            const offsets = [0, 1];
            offsets.forEach(offset => {
                const noteTime = target.time + offset;
                const timeDiff = noteTime - progress;

                if (timeDiff < -0.2) return;

                const dist = timeDiff * this.loopDuration * this.speed;
                const x = this.targetX + dist;
                const y = ys[target.lane];
                const color = colors[target.lane];

                if (x < width + 50 && x > -50) {
                    ctx.beginPath();
                    ctx.arc(x, y, this.noteRadius, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
        });
    };

    drawNotes(this.leftRhythm, this.leftLaneYs, this.leftColors);
    drawNotes(this.rightRhythm, this.rightLaneYs, this.rightColors);

    // Draw Feedbacks
    this.feedbacks.forEach(fb => {
        ctx.globalAlpha = fb.life;
        ctx.fillStyle = fb.color;
        ctx.font = 'bold 16px Arial';
        ctx.fillText(fb.text, fb.x - 10, fb.y);
        ctx.globalAlpha = 1.0;
    });
  }

  public getScore(): string {
    return `${this.score} / ${this.attempts}`;
  }
}
