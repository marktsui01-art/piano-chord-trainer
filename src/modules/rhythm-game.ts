import * as Tone from 'tone';
import { AudioManager } from './audio';

export class RhythmGame {
  private isRunning: boolean = false;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private audioManager: AudioManager;
  private animationId: number = 0;
  private metronomeEnabled: boolean = true;
  private resizeListener: (() => void) | null = null;

  // Rhythm Configuration (2 vs 3)
  // Positions are relative to the loop duration (0 to 1)
  private leftRhythm = [0, 0.5]; // 2 beats
  private rightRhythm = [0, 1 / 3, 2 / 3]; // 3 beats
  private loopDuration = 2; // seconds per measure (30 BPM equivalent for the measure, or 60BPM for the beat unit?)
  // If we want 60 BPM for the quarter note, and 2 beats per measure -> 2 seconds.

  // State
  private lastHitLeft = -1;
  private lastHitRight = -1;
  private score = 0;
  private attempts = 0;

  // Visuals
  private noteRadius = 15;
  private trackHeight = 100;
  private targetX = 100; // X position of the hit target
  private lookahead = 2; // How many seconds ahead to show notes
  private speed = 200; // Pixels per second

  // Feedback
  private feedbacks: { x: number; y: number; text: string; color: string; life: number }[] = [];

  constructor(audioManager: AudioManager) {
    this.audioManager = audioManager;
  }

  public setMetronome(enabled: boolean) {
    this.metronomeEnabled = enabled;
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
      this.canvas.height = 300; // Fixed height for 2 tracks
    }
  }

  public async start() {
    if (this.isRunning) return;

    await Tone.start();
    Tone.Transport.stop();
    Tone.Transport.cancel();

    // Set Loop
    Tone.Transport.bpm.value = 60; // Base BPM
    // We treat 1 measure as the cycle of the polyrhythm (LCM of 2 and 3 = 6 beats conceptually, or just 1 measure split)
    // Let's say 1 measure = 2 seconds.
    this.loopDuration = 2;
    Tone.Transport.loop = true;
    Tone.Transport.loopStart = 0;
    Tone.Transport.loopEnd = this.loopDuration;

    // Schedule audio clicks for the rhythm (Metronome / Guide)
    if (this.metronomeEnabled) {
      // Left Hand (Low Drum)
      this.leftRhythm.forEach((pos) => {
        Tone.Transport.schedule((time) => {
          this.audioManager.playDrum('C2', '16n');
        }, pos * this.loopDuration);
      });

      // Right Hand (High Drum/Click)
      this.rightRhythm.forEach((pos) => {
        Tone.Transport.schedule((time) => {
          this.audioManager.playDrum('G2', '16n');
        }, pos * this.loopDuration);
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

  public handleInput(hand: 'left' | 'right') {
    if (!this.isRunning) return;

    const transportTime = Tone.Transport.seconds; // Current position in loop (0 to loopDuration)
    // Tone.Transport.seconds is actually total time. We want loop position.
    // Tone.Transport.position gives bars:quarters:sixteenths.
    // We can use Tone.Transport.progress (0-1) * loopDuration.
    const currentTime = Tone.Transport.progress * this.loopDuration;

    const rhythm = hand === 'left' ? this.leftRhythm : this.rightRhythm;
    const tolerance = 0.15; // 150ms window (generous)

    // Check closest target
    let hit = false;
    let bestDiff = Infinity;

    for (const pos of rhythm) {
      const targetTime = pos * this.loopDuration;
      let diff = Math.abs(currentTime - targetTime);

      // Handle wrap-around (e.g. hit at 1.9s for target 0.0s)
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

    // Debounce: Prevent double counting for same target?
    // Simplified for MVP: Just check if hit.

    // Feedback
    const trackY = hand === 'left' ? this.trackHeight / 2 : this.trackHeight * 1.5;

    if (hit) {
      this.score++;
      this.showFeedback(this.targetX, trackY, 'Good!', '#4caf50');
      // Play user feedback sound (different from metronome?)
      // Ideally user tap sounds immediate.
      this.audioManager.playDrum(hand === 'left' ? 'D2' : 'A2', '32n');
    } else {
      this.showFeedback(this.targetX, trackY, 'Miss', '#f44336');
      this.audioManager.playIncorrect();
    }
    this.attempts++;

    // Update Score UI if possible
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

    // Left Track (Top)
    const leftY = this.trackHeight / 2;
    ctx.beginPath();
    ctx.moveTo(0, leftY);
    ctx.lineTo(width, leftY);
    ctx.stroke();
    ctx.fillStyle = '#ccc';
    ctx.font = '16px Arial';
    ctx.fillText('Left Hand (2)', 10, leftY - 20);

    // Right Track (Bottom)
    const rightY = this.trackHeight * 1.5;
    ctx.beginPath();
    ctx.moveTo(0, rightY);
    ctx.lineTo(width, rightY);
    ctx.stroke();
    ctx.fillText('Right Hand (3)', 10, rightY - 20);

    // Draw Target Line
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.targetX, 0);
    ctx.lineTo(this.targetX, height);
    ctx.stroke();

    // Draw Notes
    // We visualize future notes based on Transport progress
    const progress = Tone.Transport.progress; // 0 to 1
    // We want to draw notes that are coming up.
    // X position = TargetX + (NoteTime - CurrentTime) * SpeedPixels
    // NoteTime is relative to loop.

    // Helper to draw notes
    const drawNotes = (rhythm: number[], y: number, color: string) => {
        rhythm.forEach(pos => {
            // We need to render multiple instances of the note to handle the "infinite loop" visual
            // Current loop, Next loop

            const offsets = [0, 1]; // Current loop and next loop

            offsets.forEach(offset => {
                const noteTime = pos + offset; // 0..1, 1..2
                const currentTime = progress;

                // Diff in units (0..1)
                let timeDiff = noteTime - currentTime;

                // If it's too far passed, ignore
                if (timeDiff < -0.2) return;

                // Calculate X
                // We map 1 unit (full loop) to a certain pixel distance
                // Let's say loopDuration * speed = pixels per loop
                const dist = timeDiff * this.loopDuration * this.speed;

                const x = this.targetX + dist;

                if (x < width + 50 && x > -50) {
                    ctx.beginPath();
                    ctx.arc(x, y, this.noteRadius, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
        });
    };

    drawNotes(this.leftRhythm, leftY, '#2196F3'); // Blue
    drawNotes(this.rightRhythm, rightY, '#FF9800'); // Orange

    // Draw Feedback
    this.feedbacks.forEach(fb => {
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
