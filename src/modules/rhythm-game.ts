import * as Tone from 'tone';
import { AudioManager } from './audio';

type RhythmNote = {
  time: number; // 0 to 1 (relative to loop)
  lane: number; // 0, 1, 2
};

export class RhythmGame {
  private isRunning: boolean = false;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private audioManager: AudioManager;
  private animationId: number = 0;
  private metronomeEnabled: boolean = true;
  private resizeListener: (() => void) | null = null;

  // Configuration
  private difficulty: 'easy' | 'hard' = 'easy';
  private demoMode: boolean = false;

  // Patterns
  private leftPattern: RhythmNote[] = [];
  private rightPattern: RhythmNote[] = [];

  private loopDuration = 2; // seconds per measure

  // State
  private score = 0;
  private attempts = 0;

  // Visuals
  private noteRadius = 15;
  private trackHeight = 120; // Height allocated for one track (hand)
  private targetX = 100; // X position of the hit target
  private speed = 200; // Pixels per second

  // Feedback
  private feedbacks: { x: number; y: number; text: string; color: string; life: number }[] = [];

  // Colors
  private leftColors = ['#2196F3', '#03A9F4', '#00BCD4']; // Blue shades
  private rightColors = ['#F44336', '#FF9800', '#FFC107']; // Red/Orange/Yellow

  constructor(audioManager: AudioManager) {
    this.audioManager = audioManager;
    this.updatePatterns();
  }

  public setMetronome(enabled: boolean) {
    this.metronomeEnabled = enabled;
  }

  public setDifficulty(level: 'easy' | 'hard') {
    this.difficulty = level;
    this.updatePatterns();
  }

  public setDemoMode(enabled: boolean) {
    this.demoMode = enabled;
  }

  private updatePatterns() {
    if (this.difficulty === 'easy') {
      // Easy: All lane 0
      this.leftPattern = [{ time: 0, lane: 0 }, { time: 0.5, lane: 0 }];
      this.rightPattern = [{ time: 0, lane: 0 }, { time: 1 / 3, lane: 0 }, { time: 2 / 3, lane: 0 }];
    } else {
      // Hard: Distributed lanes
      // Left (2 beats): Lane 0, Lane 1
      this.leftPattern = [{ time: 0, lane: 0 }, { time: 0.5, lane: 1 }];
      // Right (3 beats): Lane 0, Lane 1, Lane 2
      this.rightPattern = [{ time: 0, lane: 0 }, { time: 1 / 3, lane: 1 }, { time: 2 / 3, lane: 2 }];
    }
  }

  public init(canvasId: string) {
    if (this.canvas) return; // Idempotent

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
      this.canvas.height = 350; // Increased height for lanes
    }
  }

  public async start() {
    if (this.isRunning) return;

    await Tone.start();
    Tone.Transport.stop();
    Tone.Transport.cancel();

    // Set Loop
    Tone.Transport.bpm.value = 60; // Base BPM
    this.loopDuration = 2;
    Tone.Transport.loop = true;
    Tone.Transport.loopStart = 0;
    Tone.Transport.loopEnd = this.loopDuration;

    // Schedule Guide / Metronome
    if (this.metronomeEnabled || this.demoMode) {
      // Left Hand
      this.leftPattern.forEach((note) => {
        Tone.Transport.schedule((_time) => {
          if (this.demoMode) {
             this.audioManager.playRankedNote('left', note.lane as any, '16n');
          } else if (this.metronomeEnabled) {
             // Simple click for metronome
             this.audioManager.playDrum('C2', '16n');
          }
        }, note.time * this.loopDuration);
      });

      // Right Hand
      this.rightPattern.forEach((note) => {
        Tone.Transport.schedule((_time) => {
          if (this.demoMode) {
             this.audioManager.playRankedNote('right', note.lane as any, '16n');
          } else if (this.metronomeEnabled) {
             this.audioManager.playDrum('G2', '16n');
          }
        }, note.time * this.loopDuration);
      });
    }

    Tone.Transport.start();
    this.isRunning = true;
    this.score = 0;
    this.attempts = 0;
    this.loop();
  }

  public stop() {
    this.isRunning = false;
    Tone.Transport.stop();
    cancelAnimationFrame(this.animationId);
  }

  public handleInput(hand: 'left' | 'right', lane: number = 0) {
    if (!this.isRunning) return;

    // In easy mode, ignore lane (treat all input as 0 to match pattern)
    // Actually pattern has lane 0. So mapping input to 0 works.
    const effectiveInputLane = this.difficulty === 'easy' ? 0 : lane;

    // Tone.Transport.progress (0-1) * loopDuration.
    const currentTime = Tone.Transport.progress * this.loopDuration;

    const pattern = hand === 'left' ? this.leftPattern : this.rightPattern;
    const tolerance = 0.15; // 150ms window

    // Check closest target in the specific lane
    let hit = false;
    let bestDiff = Infinity;

    for (const note of pattern) {
      if (note.lane !== effectiveInputLane) continue;

      const targetTime = note.time * this.loopDuration;
      let diff = Math.abs(currentTime - targetTime);

      // Handle wrap-around
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

    // Determine visual feedback Y position
    // Base Y for track
    const trackCenterY = hand === 'left' ? this.trackHeight / 2 : this.trackHeight * 1.5 + 30;
    // Offset based on input lane (for visual feedback alignment)
    const laneOffset = (lane - 1) * 20; // -20, 0, 20
    const feedbackY = trackCenterY + laneOffset;

    if (hit) {
      this.score++;
      this.showFeedback(this.targetX, feedbackY, 'Good!', '#4caf50');

      // Play Feedback Sound
      this.audioManager.playRankedNote(hand, lane as any, '32n');
    } else {
      this.showFeedback(this.targetX, feedbackY, 'Miss', '#f44336');
      this.audioManager.playIncorrect();
    }
    this.attempts++;

    // Update Score UI
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
    // Update feedbacks
    for (let i = this.feedbacks.length - 1; i >= 0; i--) {
      this.feedbacks[i].life -= 0.05;
      this.feedbacks[i].y -= 1; // Float up
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

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw Tracks
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;

    const leftCenterY = this.trackHeight / 2;
    const rightCenterY = this.trackHeight * 1.5 + 30; // Shift down a bit more

    // Left Track Lines
    ctx.beginPath();
    ctx.moveTo(0, leftCenterY);
    ctx.lineTo(width, leftCenterY);
    ctx.stroke();
    ctx.fillStyle = '#ccc';
    ctx.font = '16px Arial';
    ctx.fillText('Left Hand (2)', 10, leftCenterY - 40);

    // Right Track Lines
    ctx.beginPath();
    ctx.moveTo(0, rightCenterY);
    ctx.lineTo(width, rightCenterY);
    ctx.stroke();
    ctx.fillText('Right Hand (3)', 10, rightCenterY - 40);

    // Draw Lanes hints?
    if (this.difficulty === 'hard') {
       ctx.strokeStyle = '#333';
       ctx.lineWidth = 1;
       [-20, 0, 20].forEach(offset => {
          ctx.beginPath();
          ctx.moveTo(0, leftCenterY + offset);
          ctx.lineTo(width, leftCenterY + offset);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(0, rightCenterY + offset);
          ctx.lineTo(width, rightCenterY + offset);
          ctx.stroke();
       });
    }

    // Draw Target Line
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.targetX, 0);
    ctx.lineTo(this.targetX, height);
    ctx.stroke();

    // Helper to draw notes
    const drawNotes = (pattern: RhythmNote[], basePathY: number, colors: string[]) => {
      pattern.forEach((note) => {
        // Calculate offsets
        const loopOffsets = [0, 1]; // Current loop and next loop

        // Vertical Offset for Lane
        // Lane 0 -> -20, Lane 1 -> 0, Lane 2 -> +20
        const laneOffset = (note.lane - 1) * 20;
        const y = basePathY + laneOffset;

        loopOffsets.forEach((offset) => {
          const noteTime = note.time + offset;
          const currentTime = Tone.Transport.progress;

          let timeDiff = noteTime - currentTime;
          if (timeDiff < -0.2) return;

          const dist = timeDiff * this.loopDuration * this.speed;
          const x = this.targetX + dist;

          if (x < width + 50 && x > -50) {
            ctx.beginPath();
            ctx.arc(x, y, this.noteRadius, 0, Math.PI * 2);
            ctx.fillStyle = colors[note.lane] || colors[0];
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });
    };

    drawNotes(this.leftPattern, leftCenterY, this.leftColors);
    drawNotes(this.rightPattern, rightCenterY, this.rightColors);

    // Draw Feedback
    this.feedbacks.forEach((fb) => {
      ctx.globalAlpha = fb.life;
      ctx.fillStyle = fb.color;
      ctx.font = 'bold 24px Arial';
      ctx.fillText(fb.text, fb.x, fb.y);
      ctx.globalAlpha = 1.0;
    });
  }

  public getScore(): string {
    return `${this.score} / ${this.attempts}`;
  }
}
