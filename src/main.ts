import './style.css';
import { InputManager } from './modules/input';
import { AudioManager } from './modules/audio';
import { NotationRenderer } from './modules/notation';
import { DrillManager } from './modules/drill';
import { NoteName } from './modules/content';
import { StateManager, AppState, ChordModule } from './modules/state';
import { LessonManager } from './modules/lesson';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <div class="container">
    <h1>Piano Chord Trainer</h1>
    <div id="loading-indicator" class="loading-indicator">Loading Piano Sounds...</div>
    
    <div class="nav-bar">
      <button id="nav-lesson" class="nav-btn active">Lesson Mode</button>
      <button id="nav-drill" class="nav-btn">Drill Mode</button>
    </div>

    <div class="module-selector">
      <select id="module-select" class="module-select">
        <option value="triads">C Major: Triads</option>
        <option value="sevenths">C Major: 7th Chords</option>
      </select>
      
      <div class="clef-selector-container" style="margin-left: 1rem; display: inline-block;">
        <label for="clef-select" style="margin-right: 0.5rem;">Clef:</label>
        <select id="clef-select" class="module-select" style="margin-bottom: 0; padding: 0.4rem;">
          <option value="treble">Treble</option>
          <option value="bass">Bass</option>
        </select>
      </div>
    </div>

    <!-- Lesson Mode UI -->
    <div id="lesson-container" class="mode-container active">
      <div class="lesson-card">
        <h2 id="lesson-chord-name">C Major</h2>
        <div id="lesson-chord-notes" class="chord-notes">C - E - G</div>
        
        <div id="lesson-notation" class="notation-box"></div>
        
        <div class="lesson-controls">
          <button id="btn-prev-chord" class="btn-nav">←</button>
          <button id="btn-play-lesson" class="btn-play">▶ Play</button>
          <button id="btn-next-chord" class="btn-nav">→</button>
        </div>
      </div>
    </div>

    <!-- Drill Mode UI -->
    <div id="drill-container" class="mode-container">
      <div id="drill-notation" class="notation-box"></div>

      <div class="interaction-area">
        <div id="question-text">Press Start to Begin</div>
        <div id="feedback-text" class="feedback-text"></div>
        <div id="score-display" class="score-display">Score: 0 / 0</div>
      </div>

      <div class="input-controls">
        <input type="text" id="text-input" placeholder="Type notes (e.g. C E G)" />
        <button id="btn-submit">Submit Answer</button>
      </div>
      
      <button id="btn-next-drill" style="margin-top: 1rem;">Next Question</button>
    </div>
  </div>
`;

// Initialize Modules
// Initialize Modules
const stateManager = new StateManager();
const lessonManager = new LessonManager();
const drillManager = new DrillManager();
const audioManager = new AudioManager(() => {
  const loader = document.getElementById('loading-indicator');
  if (loader) {
    loader.textContent = '✓ Sounds Ready';
    loader.classList.add('loaded');
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }, 2000);
  }
});

// We need two notation renderers because they are in different divs and might need different sizes/contexts
const lessonNotation = new NotationRenderer('lesson-notation');
const drillNotation = new NotationRenderer('drill-notation');

// UI Elements
const navLesson = document.getElementById('nav-lesson')!;
const navDrill = document.getElementById('nav-drill')!;
const moduleSelect = document.getElementById('module-select') as HTMLSelectElement;
const clefSelect = document.getElementById('clef-select') as HTMLSelectElement;
const lessonContainer = document.getElementById('lesson-container')!;
const drillContainer = document.getElementById('drill-container')!;

// Lesson UI
const lessonNameEl = document.getElementById('lesson-chord-name')!;
const lessonNotesEl = document.getElementById('lesson-chord-notes')!;

// Drill UI
const feedbackEl = document.getElementById('feedback-text')!;
const scoreEl = document.getElementById('score-display')!;
const questionEl = document.getElementById('question-text')!;
const textInput = document.getElementById('text-input') as HTMLInputElement;

// --- State Management ---

stateManager.subscribe((state: AppState) => {
  updateUI(state);
});

function updateUI(state: AppState) {
  // Update Nav Buttons
  if (state.mode === 'lesson') {
    navLesson.classList.add('active');
    navDrill.classList.remove('active');
    lessonContainer.classList.add('active');
    drillContainer.classList.remove('active');
    renderLesson();
  } else {
    navLesson.classList.remove('active');
    navDrill.classList.add('active');
    lessonContainer.classList.remove('active');
    drillContainer.classList.add('active');

    // Re-render drill chord if switching to drill mode
    const chord = drillManager.getCurrentChord();
    if (chord) renderDrillChord(chord);
  }

  // Update Module Selector
  moduleSelect.value = state.module;
}
// --- Event Listeners ---

navLesson.addEventListener('click', () => stateManager.setMode('lesson'));
navDrill.addEventListener('click', () => stateManager.setMode('drill'));

moduleSelect.addEventListener('change', (e) => {
  const module = (e.target as HTMLSelectElement).value as ChordModule;
  stateManager.setModule(module);
  lessonManager.setModule(module);
  drillManager.setModule(module);

  if (stateManager.getState().mode === 'drill') {
    nextDrillQuestion();
  }

  renderLesson();
});

clefSelect.addEventListener('change', () => {
  // Re-render current view based on mode
  if (stateManager.getState().mode === 'lesson') {
    renderLesson();
  } else {
    const chord = drillManager.getCurrentChord();
    if (chord) {
      renderDrillChord(chord);
    }
  }
});

// Helper to get current octave based on clef
function getCurrentOctave(): number {
  return clefSelect.value === 'bass' ? 3 : 4;
}

// --- Lesson Mode Logic ---

function renderLesson() {
  const chord = lessonManager.getCurrentChord();
  lessonNameEl.textContent = chord.name;
  lessonNotesEl.textContent = chord.notes.join(' - ');

  const clef = clefSelect.value as 'treble' | 'bass';
  const octave = getCurrentOctave();
  const vexNotes = chord.notes.map((n) => `${n}/${octave}`);
  lessonNotation.render(vexNotes, clef);
}

document.getElementById('btn-prev-chord')?.addEventListener('click', () => {
  lessonManager.previous();
  renderLesson();
  audioManager.playChord(lessonManager.getCurrentChord().notes, '2n', getCurrentOctave());
});

document.getElementById('btn-next-chord')?.addEventListener('click', () => {
  lessonManager.next();
  renderLesson();
  audioManager.playChord(lessonManager.getCurrentChord().notes, '2n', getCurrentOctave());
});

document.getElementById('btn-play-lesson')?.addEventListener('click', async () => {
  await audioManager.start();
  audioManager.playChord(lessonManager.getCurrentChord().notes, '2n', getCurrentOctave());
});

// --- Drill Mode Logic ---

// Initialize Input
const inputManager = new InputManager((notes) => {
  console.log('Input received:', notes);
  handleDrillInput(notes);
});

// Start Audio Context on first interaction (global)
document.body.addEventListener(
  'click',
  async () => {
    await audioManager.start();
  },
  { once: true }
);

function handleDrillInput(notes: NoteName[]) {
  if (stateManager.getState().mode === 'drill') {
    const isCorrect = drillManager.checkAnswer(notes);
    if (isCorrect) {
      feedbackEl.textContent = 'Correct!';
      feedbackEl.style.color = '#4caf50'; // Green

      // Play the actual chord instead of just a beep
      const currentChord = drillManager.getCurrentChord();
      if (currentChord) {
        audioManager.playChord(currentChord.notes, '2n', getCurrentOctave());
      } else {
        audioManager.playCorrect();
      }

      scoreEl.textContent = `Score: ${drillManager.getScore()}`;
      setTimeout(nextDrillQuestion, 1500); // Slightly longer delay to hear the chord
    } else {
      feedbackEl.textContent = 'Try Again';
      feedbackEl.style.color = '#f44336'; // Red
      audioManager.playIncorrect();
    }
  }
}

function nextDrillQuestion() {
  const chord = drillManager.getQuestion();
  questionEl.textContent = `Play: ${chord.name}`;
  feedbackEl.textContent = '';
  textInput.value = '';

  renderDrillChord(chord);
}

function renderDrillChord(chord: any) {
  const clef = clefSelect.value as 'treble' | 'bass';
  const octave = getCurrentOctave();

  const vexNotes = chord.notes.map((n: string) => `${n}/${octave}`);
  drillNotation.render(vexNotes, clef);
}

document.getElementById('btn-next-drill')?.addEventListener('click', nextDrillQuestion);

// Handle Text Input Submission
const submitAnswer = () => {
  const text = textInput.value;
  const notes = inputManager.processTextInput(text);
  handleDrillInput(notes);
};

document.getElementById('btn-submit')?.addEventListener('click', submitAnswer);

textInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    submitAnswer();
  }
});

// Initial Render
renderLesson();
// Initialize Drill with a question so it's not empty if they switch immediately
nextDrillQuestion();
