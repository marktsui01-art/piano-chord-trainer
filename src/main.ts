import './style.css';
import { InputManager } from './modules/input';
import { VirtualPiano } from './modules/virtual-piano';
import { AudioManager } from './modules/audio';
import { NotationRenderer } from './modules/notation';
import { DrillManager } from './modules/drill';
import { DrillResult } from './modules/drills/DrillStrategy';
import { NoteName } from './modules/content';
import { KEYS, KeyMode } from './modules/keys';
import { StateManager, AppState, ChordModule } from './modules/state';
import { LessonManager } from './modules/lesson';
import './pwa';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <div class="container">
    <button id="btn-mobile-menu" class="btn-icon" title="Menu">☰</button>

    <div id="app-header" class="app-header">
      <div class="header-top">
        <h1>Piano Chord Trainer</h1>
        <button id="btn-close-menu" class="btn-icon close-menu" title="Close Menu">✕</button>
      </div>
      
      <div id="loading-indicator" class="loading-indicator">Loading Piano Sounds...</div>
      
      <div class="nav-bar">
        <button id="nav-lesson" class="nav-btn active">Lesson Mode</button>
        <button id="nav-drill" class="nav-btn">Drill Mode</button>
      </div>

      <div class="module-selector">
        <select id="module-select" class="module-select">
          <option value="triads">C Major: Triads</option>
          <option value="sevenths">C Major: 7th Chords</option>
          <option value="speed">Speed Note Drill</option>
          <option value="interval">Interval Recognition</option>
          <option value="melody">Melodic Sight-Reading</option>
        </select>
        
        <div class="clef-selector-container" style="margin-left: 1rem; display: inline-block;">
          <label for="clef-select" style="margin-right: 0.5rem;">Clef:</label>
          <select id="clef-select" class="module-select" style="margin-bottom: 0; padding: 0.4rem;">
            <option value="treble">Treble</option>
            <option value="bass">Bass</option>
          </select>
        </div>
      </div>

      <div id="key-settings" class="key-settings" style="display: none; margin-top: 1rem; text-align: center;">
          <div style="display: inline-block; margin-right: 1rem;">
             <label for="key-select">Key:</label>
             <select id="key-select" class="module-select" style="width: auto;"></select>
          </div>
          <div id="mode-select-container" style="display: inline-block;">
             <label for="mode-select">Mode:</label>
             <select id="mode-select" class="module-select" style="width: auto;">
                 <option value="Major">Major (Ionian)</option>
                 <option value="Minor">Minor (Aeolian)</option>
                 <option value="Dorian">Dorian</option>
                 <option value="Mixolydian">Mixolydian</option>
             </select>
          </div>
      </div>

      <div id="drill-settings" class="drill-settings" style="display: none; margin-bottom: 1rem; text-align: center;">
        <label style="margin-right: 1rem;">
          <input type="checkbox" id="chk-inversions" /> Inversions
        </label>
        <label>
          <input type="checkbox" id="chk-wide-range" /> Wide Range (Ledger Lines)
        </label>
      </div>
    </div>

    <!-- Lesson Mode UI -->
    <div id="lesson-container" class="mode-container active">
      <div class="lesson-card">
        <div id="lesson-notation" class="notation-box"></div>
        
        <div class="lesson-info-side">
          <h2 id="lesson-chord-name">C Major</h2>
          <div id="lesson-chord-notes" class="chord-notes">C - E - G</div>
          
          <div class="lesson-controls">
            <button id="btn-prev-chord" class="btn-nav">←</button>
            <button id="btn-play-lesson" class="btn-play">▶ Play</button>
            <button id="btn-next-chord" class="btn-nav">→</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Drill Mode UI -->
    <div id="drill-container" class="mode-container">
      <div id="drill-notation" class="notation-box"></div>

      <div class="drill-right-panel">
        <div class="drill-controls-side">
          <div class="interaction-area">
            <div id="question-text">Press Start to Begin</div>
            <div id="feedback-text" class="feedback-text"></div>
            <div id="score-display" class="score-display">Score: 0 / 0</div>
          </div>

          <div class="input-controls">
            <input type="text" id="text-input" placeholder="Type notes (e.g. C E G)" />
            <button id="btn-submit">Submit Answer</button>
          </div>

          <div class="virtual-piano-controls">
             <button id="btn-toggle-piano" class="btn-secondary">🎹 Show Piano</button>
          </div>
          <div id="virtual-piano-container" style="display: none;"></div>
          
          <div class="mic-controls">
            <button id="btn-mic" class="btn-mic">🎤 Enable Mic</button>
            <div id="input-monitor" class="input-monitor">Detected: <span id="detected-notes"></span></div>
          </div>
        </div>

        <button id="btn-next-drill" style="margin-top: 1rem;">Next Question</button>
      </div>
    </div>
    
    <button id="btn-fullscreen" title="Toggle Fullscreen">⛶</button>
  </div>
`;

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
const keySelect = document.getElementById('key-select') as HTMLSelectElement;
const modeSelect = document.getElementById('mode-select') as HTMLSelectElement;
const keySettings = document.getElementById('key-settings')!;
const modeSelectContainer = document.getElementById('mode-select-container')!;
const lessonContainer = document.getElementById('lesson-container')!;
const drillContainer = document.getElementById('drill-container')!;
const drillSettings = document.getElementById('drill-settings')!;
const chkInversions = document.getElementById('chk-inversions') as HTMLInputElement;
const chkWideRange = document.getElementById('chk-wide-range') as HTMLInputElement;

// Lesson UI
const lessonNameEl = document.getElementById('lesson-chord-name')!;
const lessonNotesEl = document.getElementById('lesson-chord-notes')!;

// Drill UI
const feedbackEl = document.getElementById('feedback-text')!;
const scoreEl = document.getElementById('score-display')!;
const questionEl = document.getElementById('question-text')!;
const textInput = document.getElementById('text-input') as HTMLInputElement;
const btnMic = document.getElementById('btn-mic')!;
const detectedNotesEl = document.getElementById('detected-notes')!;

// Populate Key Select (Safe sort)
const sortedKeys = [...KEYS].sort((a, b) => a.difficulty - b.difficulty);
sortedKeys.forEach(k => {
    const opt = document.createElement('option');
    opt.value = k.id;
    opt.text = `${k.root} ${k.type} (Level ${k.difficulty})`;
    keySelect.add(opt);
});

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
    drillSettings.style.display = 'none';
    keySettings.style.display = 'none'; // Hide key settings in lesson mode for now
    renderLesson();
  } else {
    navLesson.classList.remove('active');
    navDrill.classList.add('active');
    lessonContainer.classList.remove('active');
    drillContainer.classList.add('active');
    drillSettings.style.display = 'block';

    // Show/Hide Key Settings based on module
    if (['speed', 'interval', 'melody'].includes(state.module)) {
        keySettings.style.display = 'block';

        // Only show Mode selector for Melody drill
        if (state.module === 'melody') {
            modeSelectContainer.style.display = 'inline-block';
        } else {
            modeSelectContainer.style.display = 'none';
        }
    } else {
        keySettings.style.display = 'none';
    }

    // Re-render drill chord if switching to drill mode
    const chord = drillManager.getCurrentChord();
    if (chord) renderDrillChord();
  }

  // Update Module Selector
  moduleSelect.value = state.module;
  keySelect.value = state.selectedKeyId;
  modeSelect.value = state.selectedMode;
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

keySelect.addEventListener('change', (e) => {
    stateManager.setKey((e.target as HTMLSelectElement).value);
    if (stateManager.getState().mode === 'drill') {
        nextDrillQuestion();
    }
});

modeSelect.addEventListener('change', (e) => {
    stateManager.setKeyMode((e.target as HTMLSelectElement).value as KeyMode);
    if (stateManager.getState().mode === 'drill') {
        nextDrillQuestion();
    }
});

clefSelect.addEventListener('change', () => {
  // Re-render current view based on mode
  if (stateManager.getState().mode === 'lesson') {
    renderLesson();
  } else {
    const chord = drillManager.getCurrentChord();
    if (chord) {
      renderDrillChord();
    }
  }
});

// Settings Listeners
function updateDrillSettings() {
  drillManager.setOptions(chkInversions.checked, chkWideRange.checked);
  // Only generate new question if we are currently in drill mode to avoid unnecessary updates
  if (stateManager.getState().mode === 'drill') {
    nextDrillQuestion();
  }
}

chkInversions.addEventListener('change', updateDrillSettings);
chkWideRange.addEventListener('change', updateDrillSettings);

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
  // Update Input Monitor
  detectedNotesEl.textContent = notes.join(' - ');

  handleDrillInput(notes);
});

// Initialize Virtual Piano
const virtualPiano = new VirtualPiano((note, active) => {
  inputManager.toggleNote(note, active);
});
virtualPiano.render('virtual-piano-container');

// Toggle Piano Visibility
const btnTogglePiano = document.getElementById('btn-toggle-piano');
const pianoContainer = document.getElementById('virtual-piano-container');

btnTogglePiano?.addEventListener('click', () => {
  if (pianoContainer) {
    const isHidden = pianoContainer.style.display === 'none';
    pianoContainer.style.display = isHidden ? 'flex' : 'none';
    btnTogglePiano.textContent = isHidden ? '🎹 Hide Piano' : '🎹 Show Piano';
  }
});

// Start Audio Context on first interaction (global)
document.body.addEventListener(
  'click',
  async () => {
    await audioManager.start();
  },
  { once: true }
);

// Mic Button
btnMic.addEventListener('click', async () => {
  try {
    await inputManager.enableMicrophone();
    btnMic.classList.add('active');
    btnMic.textContent = "🎤 Mic On";
  } catch (err) {
    alert("Could not access microphone. Please check permissions.");
  }
});

function handleDrillInput(notes: NoteName[]): DrillResult | null {
  if (stateManager.getState().mode === 'drill') {
    console.log(`[Main] handleDrillInput called with notes: ${JSON.stringify(notes)}`);
    const result = drillManager.checkAnswer(notes);
    console.log(`[Main] checkAnswer result: ${result}`);

    if (result === 'correct') {
      feedbackEl.textContent = 'Correct!';
      feedbackEl.style.color = '#4caf50'; // Green

      // Play the actual chord or melody
      try {
        if (drillManager.isSequential) {
          const pitches = drillManager.getCurrentPitches(getCurrentOctave());
          console.log(`[Main] Playing melody sequence: ${pitches}`);
          audioManager.playNotes(pitches, '2n');
        } else {
          const currentChord = drillManager.getCurrentChord();
          if (currentChord) {
            const pitches = drillManager.getCurrentPitches(getCurrentOctave());
            console.log(`[Main] Playing chord: ${pitches}`);
            audioManager.playNotes(pitches, '2n');
          } else {
            audioManager.playCorrect();
          }
        }
      } catch (e) {
        console.error('[Main] Error playing audio feedback:', e);
        // Fallback to simple beep if something goes wrong
        audioManager.playCorrect();
      }

      scoreEl.textContent = `Score: ${drillManager.getScore()}`;

      // Reset input (important for accumulated audio notes)
      inputManager.resetInput();
      virtualPiano.clear();

      setTimeout(nextDrillQuestion, 1500); // Slightly longer delay to hear the chord
    } else if (result === 'incorrect') {
      // ...
    } else if (result === 'continue') {
      // Re-render to show progress (e.g. cursor advancement)
      renderDrillChord();

      // Play the note that was just hit correctly
      const lastNote = drillManager.getLastCorrectNote();
      if (lastNote) {
        audioManager.playNotes([lastNote], '4n');
      }
    }
    return result;
  }
  return null;
}

function nextDrillQuestion() {
  const state = stateManager.getState();
  const chord = drillManager.getQuestion(state.selectedKeyId, state.selectedMode);

  questionEl.textContent = `Play: ${chord.name}`;
  feedbackEl.textContent = '';
  textInput.value = '';
  inputManager.resetInput(); // Clear any leftover notes
  virtualPiano.clear();
  detectedNotesEl.textContent = '';

  renderDrillChord();
}

function renderDrillChord() {
  const clef = clefSelect.value as 'treble' | 'bass';
  const octave = getCurrentOctave();
  const state = stateManager.getState();

  // Use the new voicing method from DrillManager which handles inversions and octave shifts
  const vexNotes = drillManager.getVexFlowNotes(octave);
  const currentIndex = drillManager.getCurrentIndex();

  // Pass the selected key to the notation renderer
  drillNotation.render(vexNotes, clef, drillManager.isSequential, currentIndex, state.selectedKeyId);
}

document.getElementById('btn-next-drill')?.addEventListener('click', nextDrillQuestion);

// Handle Text Input Submission
const submitAnswer = () => {
  const text = textInput.value;
  const notes = inputManager.processTextInput(text);
  handleDrillInput(notes);

  // If incorrect via text submit, show feedback
  const isCorrect = drillManager.checkAnswer(notes);
  if (!isCorrect) {
    feedbackEl.textContent = 'Try Again';
    feedbackEl.style.color = '#f44336';
    audioManager.playIncorrect();
  }
};

document.getElementById('btn-submit')?.addEventListener('click', submitAnswer);

textInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    submitAnswer();
  }
});

textInput.addEventListener('input', () => {
  if (drillManager.isSequential) {
    const text = textInput.value;
    const notes = inputManager.processTextInput(text);

    if (notes.length > 0) {
      // For sequential drills, we want to process immediately
      const result = handleDrillInput(notes);

      // If the note was accepted (correct or continue), clear the input
      // so the user can type the next note without having to delete.
      if (result === 'correct' || result === 'continue') {
        textInput.value = '';
      }
    }
  }
});

// Initial Render
renderLesson();
// Initialize Drill with a question so it's not empty if they switch immediately
nextDrillQuestion();

// --- Mobile Enhancements ---

// 1. Fullscreen Toggle
const btnFullscreen = document.getElementById('btn-fullscreen');
btnFullscreen?.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.log(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
});

// 2. Mobile Menu Toggle
const btnMobileMenu = document.getElementById('btn-mobile-menu');
const btnCloseMenu = document.getElementById('btn-close-menu');
const appHeader = document.getElementById('app-header');

function toggleMenu() {
  appHeader?.classList.toggle('show-menu');
}

btnMobileMenu?.addEventListener('click', toggleMenu);
btnCloseMenu?.addEventListener('click', toggleMenu);

// Close menu when a module is selected (optional UX improvement)
moduleSelect.addEventListener('change', () => {
  if (appHeader?.classList.contains('show-menu')) {
    toggleMenu();
  }
});

// 3. Keyboard Focus Mode
textInput.addEventListener('focus', () => {
  document.body.classList.add('keyboard-active');
  // Optional: Scroll to top to ensure layout is stable
  window.scrollTo(0, 0);
});

textInput.addEventListener('blur', () => {
  document.body.classList.remove('keyboard-active');
});

// 4. Screen Wake Lock API
let wakeLock: any = null;

async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await (navigator as any).wakeLock.request('screen');
      console.log('Screen Wake Lock active');

      wakeLock.addEventListener('release', () => {
        console.log('Screen Wake Lock released');
      });
    } catch (err: any) {
      console.error(`${err.name}, ${err.message}`);
    }
  }
}

// Re-request wake lock when visibility changes (e.g. switching tabs)
document.addEventListener('visibilitychange', async () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    await requestWakeLock();
  }
});

// Request wake lock on first interaction (similar to audio context)
document.body.addEventListener('click', async () => {
  if (!wakeLock) {
    await requestWakeLock();
  }
}, { once: true });
