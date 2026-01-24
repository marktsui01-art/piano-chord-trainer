import './style.css';
import { InputManager } from './modules/input';
import { VirtualPiano } from './modules/virtual-piano';
import { AudioManager } from './modules/audio';
import { NotationRenderer } from './modules/notation';
import { DrillManager } from './modules/drill';
import { DrillResult } from './modules/drills/DrillStrategy';
import { NoteName } from './modules/content';
import { ALL_ROOTS, KeyMode } from './modules/keys';
import { StateManager, AppState, ChordModule } from './modules/state';
import { LessonManager } from './modules/lesson';
import { TextInputHandler } from './modules/TextInputHandler';
import { RhythmGame } from './modules/rhythm-game';
import './pwa';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <div class="container">
    <button id="btn-mobile-menu" class="btn-icon" title="Menu" aria-label="Menu">☰</button>

    <div id="app-header" class="app-header">
      <div class="header-top">
        <h1>Piano Chord Trainer</h1>
        <button id="btn-close-menu" class="btn-icon close-menu" title="Close Menu" aria-label="Close Menu">✕</button>
      </div>
      
      <div id="loading-indicator" class="loading-indicator">Loading Piano Sounds...</div>
      
      <div class="nav-bar">
        <button id="nav-lesson" class="nav-btn active">Lesson Mode</button>
        <button id="nav-drill" class="nav-btn">Drill Mode</button>
      </div>

      <div class="module-selector">
        <select id="module-select" class="module-select">
          <option value="triads">Triads</option>
          <option value="sevenths">7th Chords</option>
          <option value="speed">Speed Note Drill</option>
          <option value="interval">Interval Recognition</option>
          <option value="melody">Melodic Sight-Reading</option>
          <option value="rhythm">Polyrhythm (2 vs 3)</option>
        </select>
        
        <div class="clef-selector-container" style="margin-left: 1rem; display: inline-block;">
          <label for="clef-select" style="margin-right: 0.5rem;">Clef:</label>
          <select id="clef-select" class="module-select" style="margin-bottom: 0; padding: 0.4rem;">
            <option value="treble">Treble</option>
            <option value="bass">Bass</option>
          </select>
        </div>
      </div>

      <div id="key-settings" class="key-settings" style="margin-top: 1rem; text-align: center;">
          <div style="display: inline-block; margin-right: 1rem;">
             <label for="key-select">Key:</label>
             <select id="key-select" class="module-select" style="width: auto;"></select>
          </div>
          <div id="mode-select-container" style="display: inline-block;">
             <label for="mode-select">Mode:</label>
             <select id="mode-select" class="module-select" style="width: auto;">
                 <option value="Major">Major (Ionian)</option>
                 <option value="Minor">Minor (Natural/Aeolian)</option>
                 <option value="Harmonic Minor">Harmonic Minor</option>
                 <option value="Melodic Minor">Melodic Minor</option>
                 <option value="Dorian">Dorian</option>
                 <option value="Mixolydian">Mixolydian</option>
                 <option value="Chromatic">Chromatic</option>
             </select>
          </div>
      </div>

      <div id="drill-settings" class="drill-settings" style="display: none; margin-bottom: 1rem; text-align: center;">
        <label style="margin-right: 1rem;">
          <input type="checkbox" id="chk-inversions" /> Inversions
        </label>
        <div style="display: inline-block;">
           <label for="range-select">Range:</label>
           <select id="range-select" class="module-select" style="width: auto; padding: 0.2rem;">
               <option value="default">Normal</option>
               <option value="low">Low (-1 Oct)</option>
               <option value="high">High (+1 Oct)</option>
               <option value="wide">Wide (Random)</option>
           </select>
        </div>
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
            <button id="btn-prev-chord" class="btn-nav" aria-label="Previous Chord">←</button>
            <button id="btn-play-lesson" class="btn-play">▶ Play</button>
            <button id="btn-next-chord" class="btn-nav" aria-label="Next Chord">→</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Drill Mode UI -->
    <div id="drill-container" class="mode-container">
      <!-- Standard Drill Views -->
      <div id="drill-notation" class="notation-box"></div>

      <div class="drill-right-panel">
        <div class="drill-controls-side">
          <div class="virtual-piano-controls">
             <button id="btn-toggle-piano" class="btn-secondary">🎹 Show Piano</button>
          </div>
          <div id="virtual-piano-container" style="display: none;"></div>
          
          <div class="interaction-area">
            <div id="question-text">Press Start to Begin</div>
            <div id="feedback-text" class="feedback-text"></div>
            <div id="score-display" class="score-display">Score: 0 / 0</div>
          </div>

          <div class="input-controls">
            <input type="text" id="text-input" placeholder="Type notes (e.g. C E G)" aria-label="Type notes answer" />
            <button id="btn-submit">Submit Answer</button>
            <button id="btn-reveal" class="btn-secondary" style="margin-left: 0.5rem; display: none;">Reveal Answer</button>
          </div>

          <div class="mic-controls">
            <button id="btn-mic" class="btn-mic">🎤 Enable Mic</button>
            <div id="input-monitor" class="input-monitor">Detected: <span id="detected-notes"></span></div>
          </div>
        </div>

        <button id="btn-next-drill" style="margin-top: 1rem;">Next Question</button>
      </div>
    </div>
    
    <!-- Rhythm Game Mode UI -->
    <div id="rhythm-container" class="mode-container">
      <canvas id="rhythm-canvas" style="width: 100%; height: 350px; background: #222; border-radius: 8px; margin-bottom: 1rem;"></canvas>

      <div class="rhythm-settings" style="margin-bottom: 1rem; display: flex; gap: 1rem; justify-content: center; align-items: center; flex-wrap: wrap;">
          <label style="color: #fff; cursor: pointer;">
             <input type="checkbox" id="chk-rhythm-metronome" checked> Metronome
          </label>
          <label style="color: #fff; cursor: pointer;">
             <input type="checkbox" id="chk-rhythm-demo"> Demo Mode
          </label>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
              <label for="sel-rhythm-difficulty">Difficulty:</label>
              <select id="sel-rhythm-difficulty" class="module-select" style="padding: 0.2rem; width: auto;">
                  <option value="easy">Easy (1 Button)</option>
                  <option value="hard">Hard (3 Buttons)</option>
              </select>
          </div>
      </div>

      <div class="rhythm-controls-container" style="display: flex; gap: 1rem; justify-content: center; align-items: flex-start; flex-wrap: wrap;">
          <!-- Left Hand -->
          <div class="hand-controls left" style="display: flex; flex-direction: column; align-items: center;">
              <h3 style="margin: 0 0 0.5rem 0;">Left Hand</h3>
              <div class="button-group" style="display: flex; gap: 0.5rem;">
                  <button id="btn-rhythm-l0" class="btn-rhythm left-0" aria-label="Left 1 (A)">A</button>
                  <button id="btn-rhythm-l1" class="btn-rhythm left-1" aria-label="Left 2 (S)">S</button>
                  <button id="btn-rhythm-l2" class="btn-rhythm left-2" aria-label="Left 3 (D)">D</button>
              </div>
          </div>

          <!-- Center Controls -->
          <div class="center-controls" style="display: flex; flex-direction: column; gap: 0.5rem; align-items: center; justify-content: center; margin: 0 1rem;">
              <button id="btn-rhythm-start" class="btn-primary" style="min-width: 80px;">Start</button>
              <button id="btn-rhythm-stop" class="btn-secondary" style="min-width: 80px;">Stop</button>
              <div id="rhythm-score-display" style="font-size: 1.2rem; font-weight: bold; margin-top: 0.5rem;">Score: 0</div>
          </div>

          <!-- Right Hand -->
          <div class="hand-controls right" style="display: flex; flex-direction: column; align-items: center;">
              <h3 style="margin: 0 0 0.5rem 0;">Right Hand</h3>
              <div class="button-group" style="display: flex; gap: 0.5rem;">
                  <button id="btn-rhythm-r0" class="btn-rhythm right-0" aria-label="Right 1 (J)">J</button>
                  <button id="btn-rhythm-r1" class="btn-rhythm right-1" aria-label="Right 2 (K)">K</button>
                  <button id="btn-rhythm-r2" class="btn-rhythm right-2" aria-label="Right 3 (L)">L</button>
              </div>
          </div>
      </div>
    </div>

    <button id="btn-fullscreen" title="Toggle Fullscreen" aria-label="Toggle Fullscreen">⛶</button>
  </div>
`;

// Initialize Modules
console.log('Initializing modules...');
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

const rhythmGame = new RhythmGame(audioManager);

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
const rangeSelect = document.getElementById('range-select') as HTMLSelectElement;

// Rhythm UI
const rhythmContainer = document.getElementById('rhythm-container')!;
const btnRhythmStart = document.getElementById('btn-rhythm-start')!;
const btnRhythmStop = document.getElementById('btn-rhythm-stop')!;
const chkRhythmMetronome = document.getElementById('chk-rhythm-metronome') as HTMLInputElement;
const selRhythmDifficulty = document.getElementById('sel-rhythm-difficulty') as HTMLSelectElement;
const chkRhythmDemo = document.getElementById('chk-rhythm-demo') as HTMLInputElement;

// Lesson UI
const lessonNameEl = document.getElementById('lesson-chord-name')!;
const lessonNotesEl = document.getElementById('lesson-chord-notes')!;

// Drill UI
const feedbackEl = document.getElementById('feedback-text')!;
const scoreEl = document.getElementById('score-display')!;
const questionEl = document.getElementById('question-text')!;
const textInput = document.getElementById('text-input') as HTMLInputElement;
const btnReveal = document.getElementById('btn-reveal')!;
const btnMic = document.getElementById('btn-mic')!;
const detectedNotesEl = document.getElementById('detected-notes')!;

// Populate Key Select with root notes only
ALL_ROOTS.forEach((k) => {
  const opt = document.createElement('option');
  opt.value = k.id;
  opt.text = k.id;
  keySelect.add(opt);
});

// Initialize Text Input Handler
const textInputHandler = new TextInputHandler((notes) => {
  if (stateManager.getState().mode === 'drill') {
    const result = handleDrillInput(notes);

    // Clear input if correct or continue
    if (result === 'correct' || result === 'continue') {
      textInput.value = '';
    }

    // For sequential drills, if they type a wrong note, clear it.
    if (drillManager.isSequential && result === 'incorrect') {
      textInput.value = '';
      feedbackEl.textContent = 'Try Again';
      feedbackEl.style.color = '#f44336';
      audioManager.playIncorrect();
    }
  }
});

// --- State Management ---

stateManager.subscribe((state: AppState) => {
  updateUI(state);
});

function updateUI(state: AppState) {
  // Update Nav Buttons
  // Reset containers
  lessonContainer.classList.remove('active');
  drillContainer.classList.remove('active');
  rhythmContainer.classList.remove('active');

  if (state.mode === 'lesson') {
    navLesson.classList.add('active');
    navDrill.classList.remove('active');
    lessonContainer.classList.add('active');
    drillSettings.style.display = 'none';

    // Show key settings in lesson mode now (User Requirement)
    keySettings.style.display = 'block';

    if (['triads', 'sevenths', 'melody', 'speed', 'interval'].includes(state.module)) {
      modeSelectContainer.style.display = 'inline-block';
    } else {
      modeSelectContainer.style.display = 'none';
    }

    // Toggle Chromatic option visibility based on module
    const chromaticOption = modeSelect.querySelector('option[value="Chromatic"]');
    if (chromaticOption) {
      if (['speed', 'interval'].includes(state.module)) {
        (chromaticOption as HTMLOptionElement).style.display = 'block';
        (chromaticOption as HTMLOptionElement).disabled = false;
      } else {
        (chromaticOption as HTMLOptionElement).style.display = 'none';
        (chromaticOption as HTMLOptionElement).disabled = true;
      }
    }

    renderLesson();
  } else {
    navLesson.classList.remove('active');
    navDrill.classList.add('active');

    keySettings.style.display = 'block';

    if (['triads', 'sevenths', 'melody', 'speed', 'interval'].includes(state.module)) {
      modeSelectContainer.style.display = 'inline-block';
    } else {
      modeSelectContainer.style.display = 'none';
    }

    // Toggle Chromatic option visibility based on module
    const chromaticOption = modeSelect.querySelector('option[value="Chromatic"]');
    if (chromaticOption) {
      if (['speed', 'interval'].includes(state.module)) {
        (chromaticOption as HTMLOptionElement).style.display = 'block';
        (chromaticOption as HTMLOptionElement).disabled = false;
      } else {
        (chromaticOption as HTMLOptionElement).style.display = 'none';
        (chromaticOption as HTMLOptionElement).disabled = true;
      }
    }

    // Handle Rhythm Module UI vs Standard Drill UI
    if (state.module === 'rhythm') {
      rhythmContainer.classList.add('active');
      drillSettings.style.display = 'none'; // Rhythm has own settings
      rhythmGame.init('rhythm-canvas');
    } else {
      drillContainer.classList.add('active');
      drillSettings.style.display = 'block';
      rhythmGame.stop(); // Ensure rhythm game stops if we switch away

      // Set Piano Interaction Mode
      // For melodic/speed/interval drills -> trigger
      // For Chords -> toggle
      if (['melody', 'speed', 'interval'].includes(state.module)) {
        virtualPiano.setInteractionType('trigger');
      } else {
        virtualPiano.setInteractionType('toggle');
      }

      // Re-render drill chord if switching to drill mode
      const chord = drillManager.getCurrentChord();
      if (chord) renderDrillChord();
    }
  }

  // Show/Hide Reveal Button
  if (['triads', 'sevenths'].includes(state.module)) {
    btnReveal.style.display = 'inline-block';
  } else {
    btnReveal.style.display = 'none';
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

  // Safety check: If switching to a module that doesn't support Chromatic, reset to Major
  const currentState = stateManager.getState();
  if (currentState.selectedMode === 'Chromatic' && !['speed', 'interval'].includes(module)) {
    stateManager.setKeyMode('Major');
    // Update select UI immediately to reflect change
    modeSelect.value = 'Major';
  }

  stateManager.setModule(module);
  lessonManager.setModule(module);
  drillManager.setModule(module);

  // Sync Lesson Manager with current key/mode
  const state = stateManager.getState();
  lessonManager.setKeyContext(state.selectedKeyId, state.selectedMode);

  if (state.mode === 'drill') {
    nextDrillQuestion();
  } else {
    renderLesson();
  }
});

keySelect.addEventListener('change', (e) => {
  const keyId = (e.target as HTMLSelectElement).value;
  stateManager.setKey(keyId);

  const state = stateManager.getState();
  lessonManager.setKeyContext(keyId, state.selectedMode);
  virtualPiano.setKeyContext(keyId, state.selectedMode);

  if (state.mode === 'drill') {
    nextDrillQuestion();
  } else {
    renderLesson();
  }
});

modeSelect.addEventListener('change', (e) => {
  const mode = (e.target as HTMLSelectElement).value as KeyMode;
  stateManager.setKeyMode(mode);

  const state = stateManager.getState();
  lessonManager.setKeyContext(state.selectedKeyId, mode);
  virtualPiano.setKeyContext(state.selectedKeyId, mode);

  if (state.mode === 'drill') {
    nextDrillQuestion();
  } else {
    renderLesson();
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
  const range = rangeSelect.value as 'default' | 'low' | 'high' | 'wide';
  drillManager.setOptions(chkInversions.checked, range);
  // Only generate new question if we are currently in drill mode to avoid unnecessary updates
  if (stateManager.getState().mode === 'drill') {
    nextDrillQuestion();
  }
}

chkInversions.addEventListener('change', updateDrillSettings);
rangeSelect.addEventListener('change', updateDrillSettings);

// Helper to get current octave based on clef
function getCurrentOctave(): number {
  return clefSelect.value === 'bass' ? 3 : 4;
}

// --- Lesson Mode Logic ---

function renderLesson() {
  const chord = lessonManager.getCurrentChord();
  if (!chord) {
    lessonNameEl.textContent = 'No Chords Available';
    lessonNotesEl.textContent = '';
    lessonNotation.render([], clefSelect.value as any);
    return;
  }

  lessonNameEl.textContent = chord.name;
  lessonNotesEl.textContent = chord.notes.join(' - ');

  const clef = clefSelect.value as 'treble' | 'bass';
  const octave = getCurrentOctave();
  const vexNotes = chord.notes.map((n) => `${n}/${octave}`);

  const state = stateManager.getState();
  // Construct VexFlow key signature (e.g., "Eb" for Eb Major, "Ebm" for Eb Minor)
  let keySig = state.selectedKeyId;
  if (
    state.selectedMode === 'Minor' ||
    state.selectedMode === 'Harmonic Minor' ||
    state.selectedMode === 'Melodic Minor'
  ) {
    keySig += 'm';
  }
  // For other modes (Dorian, Mixolydian), VexFlow doesn't have direct support, so we use the root
  lessonNotation.render(vexNotes, clef, false, 0, keySig);
}

document.getElementById('btn-prev-chord')?.addEventListener('click', () => {
  lessonManager.previous();
  renderLesson();
  const chord = lessonManager.getCurrentChord();
  if (chord) audioManager.playChord(chord.notes, '2n', getCurrentOctave());
});

document.getElementById('btn-next-chord')?.addEventListener('click', () => {
  lessonManager.next();
  renderLesson();
  const chord = lessonManager.getCurrentChord();
  if (chord) audioManager.playChord(chord.notes, '2n', getCurrentOctave());
});

document.getElementById('btn-play-lesson')?.addEventListener('click', async () => {
  await audioManager.start();
  const chord = lessonManager.getCurrentChord();
  if (chord) audioManager.playChord(chord.notes, '2n', getCurrentOctave());
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
  if (
    stateManager.getState().module === 'melody' ||
    stateManager.getState().module === 'speed' ||
    stateManager.getState().module === 'interval'
  ) {
    // Trigger mode
    if (active) {
      handleDrillInput([note]);
    }
  } else {
    // Toggle mode (standard)
    inputManager.toggleNote(note, active);
  }
});
virtualPiano.render('virtual-piano-container');
// Set initial key context
const initialState = stateManager.getState();
virtualPiano.setKeyContext(initialState.selectedKeyId, initialState.selectedMode);

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
  if (inputManager.isMicrophoneEnabled()) {
    inputManager.disableMicrophone();
    btnMic.classList.remove('active');
    btnMic.textContent = '🎤 Enable Mic';
  } else {
    try {
      await inputManager.enableMicrophone();
      btnMic.classList.add('active');
      btnMic.textContent = '🎤 Mic On';
    } catch (err) {
      alert('Could not access microphone. Please check permissions.');
    }
  }
});

function handleDrillInput(notes: NoteName[]): DrillResult | null {
  if (stateManager.getState().mode === 'drill') {
    console.log(`[Main] handleDrillInput called with notes: ${JSON.stringify(notes)}`);
    const result = drillManager.checkAnswer(notes);
    console.log(`[Main] checkAnswer result: ${result}`);

    // Visual feedback for Virtual Piano in Trigger Mode
    if (['melody', 'speed', 'interval'].includes(stateManager.getState().module)) {
      notes.forEach((n) => {
        // If correct/continue -> Green flash
        // If incorrect -> Red flash
        if (result === 'correct' || result === 'continue') {
          virtualPiano.flashKey(n, 'correct', 500);
        } else {
          virtualPiano.flashKey(n, 'incorrect', 500);
        }
      });
    }

    if (result === 'correct') {
      feedbackEl.textContent = 'Correct!';
      feedbackEl.style.color = '#4caf50'; // Green

      // Play audio feedback based on drill type
      try {
        const octave = getCurrentOctave();
        const module = stateManager.getState().module;
        const isChordModule = ['triads', 'sevenths'].includes(module);

        if (isChordModule) {
          // For Chords: Play the last note (completion), Pause, then Play Full Chord
          const lastNote = drillManager.getLastCorrectNote(octave);
          if (lastNote) {
            audioManager.playNotes([lastNote], '4n');
          }

          // Pause then full chord
          setTimeout(() => {
            const pitches = drillManager.getCurrentPitches(octave);
            console.log(`[Main] Playing full chord after pause: ${pitches}`);
            audioManager.playNotes(pitches, '2n');
          }, 600);
        } else {
          // For Melodic/Speed/Interval: Only play the last note (feedback for completion).
          // Do NOT play the full sequence/chord at the end.
          const lastNote = drillManager.getLastCorrectNote(octave);
          if (lastNote) {
            console.log(`[Main] Playing last note of sequence/drill: ${lastNote}`);
            audioManager.playNotes([lastNote], '4n');
          } else {
            // Fallback if no last note logic (e.g. should not happen usually)
            audioManager.playCorrect();
          }
        }
      } catch (e) {
        console.error('[Main] Error playing audio feedback:', e);
        audioManager.playCorrect();
      }

      scoreEl.textContent = `Score: ${drillManager.getScore()}`;

      // Reset input (important for accumulated audio notes)
      inputManager.resetInput(false); // Silent reset to keep feedback visible
      virtualPiano.clear();

      // Delay next question to allow feedback to be heard
      // For chords, we have a 600ms pause + playback time ~1s -> 2s total wait
      // For melody, just the note ~0.5s -> 1s wait
      const delay = ['triads', 'sevenths'].includes(stateManager.getState().module) ? 2000 : 1000;
      setTimeout(nextDrillQuestion, delay);
    } else if (result === 'incorrect') {
      // ...
      feedbackEl.textContent = 'Try Again'; // Immediate feedback
      feedbackEl.style.color = '#f44336';
    } else if (result === 'continue') {
      // Re-render to show progress (e.g. cursor advancement)
      renderDrillChord();

      feedbackEl.textContent = ''; // Clear "Try Again" if they get back on track

      // Play the note that was just hit correctly
      const lastNote = drillManager.getLastCorrectNote(getCurrentOctave());
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

  // Construct VexFlow key signature (e.g., "Eb" for Eb Major, "Ebm" for Eb Minor)
  let keySig = state.selectedKeyId;
  if (
    state.selectedMode === 'Minor' ||
    state.selectedMode === 'Harmonic Minor' ||
    state.selectedMode === 'Melodic Minor'
  ) {
    keySig += 'm';
  }
  // Pass the selected key to the notation renderer
  drillNotation.render(vexNotes, clef, drillManager.isSequential, currentIndex, keySig);
}

document.getElementById('btn-next-drill')?.addEventListener('click', nextDrillQuestion);

// Rhythm Controls
btnRhythmStart.addEventListener('click', () => rhythmGame.start());
btnRhythmStop.addEventListener('click', () => rhythmGame.stop());

chkRhythmMetronome.addEventListener('change', () => {
  rhythmGame.setMetronome(chkRhythmMetronome.checked);
});

selRhythmDifficulty.addEventListener('change', () => {
  rhythmGame.setDifficulty(selRhythmDifficulty.value as 'easy' | 'hard');
});

chkRhythmDemo.addEventListener('change', () => {
  rhythmGame.setDemoMode(chkRhythmDemo.checked);
});

const bindRhythmBtn = (id: string, hand: 'left' | 'right', lane: number) => {
  const btn = document.getElementById(id);
  if (!btn) return;
  const trigger = () => rhythmGame.handleInput(hand, lane);
  btn.addEventListener('mousedown', trigger);
  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    trigger();
  });
};

// Left Hand Buttons
bindRhythmBtn('btn-rhythm-l0', 'left', 0);
bindRhythmBtn('btn-rhythm-l1', 'left', 1);
bindRhythmBtn('btn-rhythm-l2', 'left', 2);

// Right Hand Buttons
bindRhythmBtn('btn-rhythm-r0', 'right', 0);
bindRhythmBtn('btn-rhythm-r1', 'right', 1);
bindRhythmBtn('btn-rhythm-r2', 'right', 2);

// Global Key Handler for Rhythm
document.addEventListener('keydown', (e) => {
  if (stateManager.getState().module === 'rhythm') {
    if (e.repeat) return;
    const key = e.key.toLowerCase();

    // Left Hand
    if (key === 'a') rhythmGame.handleInput('left', 0);
    else if (key === 's') rhythmGame.handleInput('left', 1);
    else if (key === 'd') rhythmGame.handleInput('left', 2);
    // Right Hand
    else if (key === 'j') rhythmGame.handleInput('right', 0);
    else if (key === 'k') rhythmGame.handleInput('right', 1);
    else if (key === 'l') rhythmGame.handleInput('right', 2);
  }
});

// Handle Text Input Submission (Legacy button still works, but textInputHandler handles typing)
const submitAnswer = () => {
  // If we are in "Chord" mode, we should process the raw input value
  if (['triads', 'sevenths'].includes(stateManager.getState().module)) {
    const text = textInput.value;
    const notes = inputManager.processTextInput(text);
    const result = handleDrillInput(notes);

    if (result === 'incorrect' || (result === null && notes.length > 0)) {
      feedbackEl.textContent = 'Try Again';
      feedbackEl.style.color = '#f44336';
      audioManager.playIncorrect();
    }
  } else {
    // For sequential drills, we assume TextInputHandler handled it.
    // But if the user clicks submit with partial buffer?
    textInputHandler.flush();
  }
};

document.getElementById('btn-submit')?.addEventListener('click', submitAnswer);

btnReveal.addEventListener('click', () => {
  const state = stateManager.getState();
  // Only relevant for chord modules
  if (['triads', 'sevenths'].includes(state.module)) {
    const chord = drillManager.getCurrentChord();
    if (chord) {
      feedbackEl.textContent = `Answer: ${chord.notes.join(' - ')}`;
      feedbackEl.style.color = '#2196F3'; // Blue
      textInput.focus();
    }
  }
});

// Replace 'input' event with TextInputHandler, BUT ONLY FOR SEQUENTIAL DRILLS
textInput.addEventListener('input', (e: Event) => {
  // Check if current module needs smart input (melody, speed, interval)
  const module = stateManager.getState().module;
  if (['melody', 'speed', 'interval'].includes(module)) {
    const inputEvent = e as InputEvent;
    if (inputEvent.data) {
      textInputHandler.handleInput(inputEvent.data);
    }
  }
});

// We should prevent Enter from submitting form if we want TextInputHandler to do it.
textInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault(); // Prevent default form submit behavior

    // Check module
    const module = stateManager.getState().module;
    if (['melody', 'speed', 'interval'].includes(module)) {
      textInputHandler.flush();
    } else {
      // For Chords, manually submit
      submitAnswer();
    }
  }
});

// Initial Render
// Initialize lesson manager with default state (reuse initialState from above)
lessonManager.setKeyContext(initialState.selectedKeyId, initialState.selectedMode);
renderLesson();

// Initialize Drill with a question so it's not empty if they switch immediately
nextDrillQuestion();

// --- Mobile Enhancements ---

// 1. Fullscreen Toggle
const btnFullscreen = document.getElementById('btn-fullscreen');
btnFullscreen?.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
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
document.body.addEventListener(
  'click',
  async () => {
    if (!wakeLock) {
      await requestWakeLock();
    }
  },
  { once: true }
);
