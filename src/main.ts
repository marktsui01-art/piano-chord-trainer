import './style.css'
import { InputManager } from './modules/input';
import { AudioManager } from './modules/audio';
import { NotationRenderer } from './modules/notation';
import { DrillManager } from './modules/drill';
import { NoteName } from './modules/content';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <div class="container">
    <h1>Piano Chord Trainer</h1>
    
    <div class="controls">
      <button id="btn-lesson">Lesson Mode</button>
      <button id="btn-drill">Drill Mode</button>
    </div>

    <div id="notation-container" class="notation-box"></div>

    <div class="interaction-area">
      <div id="question-text">Press Start to Begin</div>
      <div id="feedback-text"></div>
      <div id="score-display">Score: 0 / 0</div>
    </div>

    <div class="input-controls">
      <input type="text" id="text-input" placeholder="Type notes (e.g. C E G)" />
      <button id="btn-submit">Submit Answer</button>
    </div>
    
    <button id="btn-next">Next Question</button>
  </div>
`;

const notation = new NotationRenderer('notation-container');
const audio = new AudioManager();
const drill = new DrillManager();

let currentMode = 'drill'; // Default

const feedbackEl = document.getElementById('feedback-text')!;
const scoreEl = document.getElementById('score-display')!;
const questionEl = document.getElementById('question-text')!;
const textInput = document.getElementById('text-input') as HTMLInputElement;

// Initialize Input
const inputManager = new InputManager((notes) => {
  console.log('Input received:', notes);
  handleInput(notes);
});

// Start Audio Context on first interaction
document.body.addEventListener('click', async () => {
  await audio.start();
}, { once: true });

function handleInput(notes: NoteName[]) {
  if (currentMode === 'drill') {
    const isCorrect = drill.checkAnswer(notes);
    if (isCorrect) {
      feedbackEl.textContent = "Correct!";
      feedbackEl.style.color = "green";
      audio.playCorrect();
      scoreEl.textContent = `Score: ${drill.getScore()}`;
      setTimeout(nextQuestion, 1000);
    } else {
      feedbackEl.textContent = "Try Again";
      feedbackEl.style.color = "red";
      audio.playIncorrect();
    }
  }
}

function nextQuestion() {
  const chord = drill.getQuestion();
  questionEl.textContent = `Play: ${chord.name}`;
  feedbackEl.textContent = "";
  textInput.value = "";

  // Render the chord on staff (for identification drill) or just empty staff?
  // For "Play this chord", we might show just the name, or the notes.
  // Let's show the notes for now as a hint, or maybe just the clef.
  // For V1, let's show the target notes so the user can learn reading.
  const vexNotes = chord.notes.map(n => `${n}/4`); // Default to octave 4
  notation.render(vexNotes);

  // Play the chord sound
  audio.playChord(chord.notes);
}

document.getElementById('btn-next')?.addEventListener('click', nextQuestion);

document.getElementById('btn-submit')?.addEventListener('click', () => {
  const text = textInput.value;
  const notes = inputManager.processTextInput(text);
  handleInput(notes);
});

// Initial render
notation.render([]);
