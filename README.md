# **Project: Piano Chord Trainer - V1.0 Requirements**

## **1.0 Overview**

### **1.1 Project Purpose**

A web-based piano chord trainer designed to help intermediate players master chord theory, recognition, and sight-reading in a practical, drill-based format.

### **1.2 Target Audience**

Intermediate piano players. This user is assumed to have basic note-reading skills but wants to build fluency in identifying and playing chords, voicings, and inversions quickly.

## **2.0 Core Features**

### **2.1 Navigation**

* The app will be a single-page application (SPA).  
* There will be no user login or saved progress. All content is available on load.  
* The main navigation will allow the user to freely select between "Lesson Mode" and "Drill Mode" for any available module.

### **2.2 Lesson Mode**

* The user can select a content module (e.g., "C Major: Triads").  
* The app will display a series of "flashcards" for the user to review.  
* Each flashcard **must** display:  
  1. **Chord Name:** e.g., "G Major" or "Am7"  
  2. **Note Letters:** e.g., G - B - D  
  3. **Staff Notation:** The chord's notes rendered on a musical staff.  
  4. **Audio Button:** A "Play" button that plays the chord using the Web Audio API.

### **2.3 Drill Mode**

* The user selects a module to be quizzed on (e.g., "C Major: Triads & 7th Chords").  
* The app will generate a continuous stream of randomized quiz questions.  
* The drill engine **must** randomize questions based on:  
  * **Chord:** Any chord from the selected module (e.im., C, Dm, Em...).  
  * **Inversion:** Root position, 1st inversion, 2nd inversion, etc.  
  * **Clef:** Treble Clef or Bass Clef.  
  * **Octave:** The chord may be rendered in different octaves on the staff.  
* Two drill types will be available:  
  * **2.3.1 Drill: Identification**  
  * **App Shows:** A chord on the musical staff.  
    * **User Action:** Selects the correct chord name from a multiple-choice list.  
    * **Feedback:** Instant "Correct" or "Incorrect" visual feedback.  
  * **2.3.2 Drill: Sight-Reading / Playing**  
    * **App Shows:** A chord on the musical staff and/or its name (e.g., "Play G Major / B").  
    * **User Action (Primary):** Play the correct notes on a connected MIDI keyboard.  
    * **User Action (Fallback 1):** Type the note letters into a text input box (e.g., "G B D"). The app's parser must be able to handle enharmonic equivalents (e.g., "A#" vs. "Bb").  
    * **User Action (Fallback 2):** Select the correct note letters (e.g., G - B - D) from a multiple-choice list that shows the correct answer and incorrect alternatives.  
    * **Feedback:** Instant "Correct" or "Incorrect" visual feedback.

### **2.4 Scoring & Feedback**

* The app will not save progress between sessions.  
* During a drill session, the app will keep a simple score (e.g., "15 / 20 Correct").  
* The user can reset this score at any time.

### **2.5 Audio**

* The app **must** produce sound.  
* **Lesson Mode:** A "Play" button for each chord.  
* **Drill Mode:**  
  * A "Correct" sound effect (e.g., "ding").  
  * An "Incorrect" sound effect (e.g., "buzz").

## **3.0 Technical Requirements**

* **Platform:** Web Application (HTML, CSS, JavaScript).  
* **Input (Primary):** Web MIDI API (to listen for MIDI keyboard input).  
* **Input (Fallbacks):** Standard HTML <input type="text"> and multiple-choice UI elements.  
* **Audio Output:** Web Audio API (for playing synthesized chord tones and sound effects).  
* **Notation Rendering:** A JavaScript library will be used to render musical notation to a <canvas> or as SVG (e.g., VexFlow, ABC.js, or similar).

## **4.0 Content for Version 1.0**

The initial release will focus exclusively on the key of C Major.

* **Module 1: C Major - Diatonic Triads**  
  * **Lesson:** Covers the 7 triads: C (I), Dm (ii), Em (iii), F (IV), G (V), Am (vi), Bdim (vii°).  
  * **Drill:** Quizzes all 7 triads and their inversions (root, 1st, 2nd).  
* **Module 2: C Major - Diatonic 7th Chords**  
  * **Lesson:** Covers the 7th chords: CMaj7, Dm7, Em7, FMaj7, G7, Am7, Bm7b5.  
  * **Drill:** Quizzes all 7th chords and their inversions.

## **5.0 Out of Scope (for V1.0)**

* User accounts, login, or saving progress.  
* Any keys other than C Major.  
* "Unlocking" content; all modules are available from the start.  
* Rhythmic exercises (this is purely a harmony/note trainer).  
* A clickable on-screen virtual keyboard (deferring to text input as the fallback).