import Keyboard from './components/Keyboard.js';

var width = 800;
var height = 600;
const keys = [];
const displayNotes = [];
const displayMidiValues = [];
const positionsX = [];
let displayChordNotes = [];
const numChannels = 10;
let notesList
/// Define an array of notes, starting with C0 and ending with C8
const notes = ['C0', 'C#0', 'D0', 'D#0', 'E0', 'F0', 'F#0', 'G0', 'G#0', 'A0',
    'A#0', 'B0', 'C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1',
    'A#1', 'B1', 'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2',
    'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3',
    'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4',
    'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5',
    'A#5', 'B5', 'C6', 'C#6', 'D6', 'D#6', 'E6', 'F6', 'F#6', 'G6', 'G#6', 'A6',
    'A#6', 'B6', 'C7', 'C#7', 'D7', 'D#7', 'E7', 'F7', 'F#7', 'G7', 'G#7', 'A7',
    'A#7', 'B7', 'C8',];
const noteLetters = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];
// Major scale intervals
const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11];
let currentKey = 'C';
let selectedNote = currentKey;
let selectedChordType = null; // default Major triad
let numChan = 0;
let keyTriads = [];
let displayKeyMidi = [];
let displayKey = false;
let genBtPressed = false;
let chordBtPressed = false;
let glissandoMode = false;
let numNotesPlaying = 0;

const chordTypes = [
    { name: 'maj', intervals: [0, 4, 7] },
    { name: 'min', intervals: [0, 3, 7] },
    { name: 'maj7', intervals: [0, 4, 7, 11] },
    { name: 'min7', intervals: [0, 3, 7, 10] },
    { name: '7', intervals: [0, 4, 7, 10] },
    { name: 'dim', intervals: [0, 3, 6] },
    { name: 'dim7', intervals: [0, 3, 6, 9] },
    { name: 'm7b5', intervals: [0, 3, 6, 10] },
    { name: 'maj7#5', intervals: [0, 4, 8, 11] },
    { name: 'aug', intervals: [0, 4, 8] },
    { name: '7#5', intervals: [0, 4, 8, 10] },
    { name: 'sus2', intervals: [0, 2, 7] },
    { name: 'sus4', intervals: [0, 5, 7] },
    { name: '9', intervals: [0, 4, 7, 10, 14] },
    { name: 'maj9', intervals: [0, 4, 7, 11, 14] },
    { name: 'min9', intervals: [0, 3, 7, 10, 14] },
    { name: '11', intervals: [0, 4, 7, 10, 14, 17] },
    { name: 'maj11', intervals: [0, 4, 7, 11, 14, 17] },
    { name: 'min11', intervals: [0, 3, 7, 10, 14, 17] },
    { name: '13', intervals: [0, 4, 7, 10, 14, 17, 21] },
    { name: 'maj13', intervals: [0, 4, 7, 11, 14, 17, 21] },
    { name: 'min13', intervals: [0, 3, 7, 10, 14, 17, 21] },
];

// Define an object to map note names to MIDI numbers
const noteMap = { C: 36, "C#": 37, D: 38, "D#": 39, E: 40, F: 41, "F#": 42, G: 43, "G#": 44, A: 45, "A#": 46, B: 47 };


//To ensure that a script is executed after the body has been loaded, you can use the window.onload event or the DOMContentLoaded event to wait for the HTML page to finish loading before executing the script.
window.onload = function () {





    function playAndBendNote(noteInput = -1, noteRatio = 1.0) {
        console.log("noteInput: " + noteInput)
        let noteChannel = numChan;

        let bendDuration = 5000;
        let endBend = remap(noteRatio, -1.0, 1.0, 0, 16383);
        let endAmp = 1;
        let randomNote = displayKeyMidi[Math.floor(Math.random() * displayKeyMidi.length)]
        let note = 0;
        let easing = TWEEN.Easing.Quadratic.In;
        if (noteInput != -1) {
            note = noteInput;
        } else {
            note = randomNote
        }
        // if (noteRatio < 0.0) { easing = TWEEN.Easing.Elastic.Out }

        console.log("bend note: " + note + "endBend: " + endBend);
        socket.emit('noteOn', { note: note, channel: noteChannel });
        setTimeout(() => {

            const bend = { x: 8192, y: 0 } // x = bend amt, y = amplitude
            const tween = new TWEEN.Tween(bend) // Create a new tween that modifies 'coords'.
                .to({ x: endBend, y: endAmp }, bendDuration) // Move to (300, 200) in 1 second.
                .easing(easing) // Use an easing function to make the animation smooth.
                .onUpdate(() => {
                    socket.emit('noteBend', { amount: bend.x, channel: noteChannel });
                    // console.log(bend.x / 8192)
                }).onComplete(() => {
                    socket.emit('noteOff', { note: note, channel: noteChannel });

                })
                .start() // Start the tween immediately.
            // Setup the animation loop.
            function animate(time) {
                tween.update(time)
                requestAnimationFrame(animate)
            }
            requestAnimationFrame(animate)

        }, 100)
        numChan = (numChan + 1) % numChannels;
    }

    // Define a function that takes a MIDI value and returns the corresponding note
    function midiToNote(midiValue) {
        return notes[midiValue];
    }

    // Connect to the server using WebSockets
    var socket = io();

    // Create a Two.js drawing inside the "draw-shapes" div
    var elem = document.getElementById("draw-keyboard");
    // Create an instance of two.js
    var two = new Two({
        fullscreen: true,
        autostart: true
    }).appendTo(document.body);

    function getNotesInChord(selectedKey, selectedChord) {
        console.log("selectedChord: " + selectedChord.name);
        const rootNote = selectedKey + selectedChord.intervals[0];
        return selectedChord.intervals.map((interval, index) => {
            const midiNote = rootNote + interval;
            return { midiNote, isRoot: index === 0 };
        });
    }

    // init keybaord
    let keyboard = new Keyboard(two, displayMidiValues, displayNotes, displayKeyMidi, displayKey, currentKey, socket, getNotesInChord);

    // Listen for incoming OSC messages
    socket.on('osc', function (message) {
        // console.log('Received OSC message:', message);
        onWebsocketMessage(message);
    });

    // Listen for incoming MIDI messages
    socket.on('midi', function (message) {
        console.log('Received MIDI message:', message);
    });

    // Listen for incoming MIDI messages
    socket.on('displayKeyNotes', function (message) {
        console.log('Received MIDI displayKeyNotes:', message);
        displayKeyMidi = message;
        keyboard.updateKeyboardDisplay(displayKeyMidi);
    });

    //listen for noteRatio messages
    socket.on('noteRatio', function (message) {
        playAndBendNote(parseInt(message.midiStart), parseFloat(message.ratio))
        console.log('midiStart: ', message.midiStart, 'midiEnd: ', message.midiEnd, 'ratio: ', message.ratio);
    });

    //listen for gotChord messages
    socket.on('gotChord', function (message) {
        displayChordNotes = message.midiChord;
        keyboard.displayChord(displayChordNotes);
    });



    // Listen for Enter key press
    document.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            // Send a message to the server
            socket.emit('keypress', { key: 'enter' });
        }
    });

    // Listen for Spacebar key press
    document.addEventListener("keydown", function (event) {
        if (event.key === " ") {
            // Send a message to the server
            socket.emit('keypress', { key: 'space' });
        } else if (event.key === 'ArrowDown') { // down arrow
            console.log("note capture");
            socket.emit('noteCapture', { options: 0 });
        } else if (event.key === 'ArrowUp') { // up
            socket.emit('clearNoteCapture', { options: 0 });
        } else if (event.key === 'ArrowLeft') { // left
            playAndBendNote();
        } else if (event.key === 'ArrowRight') {
            createLooper(false, 5);
        }
    });
    keyboard.createKeyboard(0, 100);
    keyboard.createCircleFifths(250, 150);
    keyboard.createStaff(200, 100);
    two.bind('update', function () {
        // rect.rotation += 0.001;
    });
    // displayKeyNotes('C');
    createChordButtons();


    function createLooper(loop, duration) {

        const mainCircle = two.makeCircle(two.width - 400, 240, 100);
        mainCircle.stroke = "darkblue";
        mainCircle.linewidth = 3;
        mainCircle.noFill();

        const pointer = two.makeCircle(mainCircle.translation.x, mainCircle.translation.y - mainCircle.radius, 10);
        pointer.fill = "lightyellow";
        pointer.stroke = "darkblue";
        pointer.linewidth = 2;

        const durationInSeconds = Tone.Time(duration).toSeconds();
        let elapsedTime = 0;

        two.bind("update", () => {
            elapsedTime += two.timeDelta / 1000;
            const progress = elapsedTime / durationInSeconds;
            const angle = -0.5 * Math.PI + progress * 2 * Math.PI;
            pointer.translation.set(
                mainCircle.translation.x + mainCircle.radius * Math.cos(-angle),
                mainCircle.translation.y - mainCircle.radius * Math.sin(-angle)
            );
        });

        const loopEvent = new Tone.Loop((time) => {
            console.log("Loop start");

            if (time >= duration) {
                console.log("Specified time reached");
            }

            if (!loop) {
                loopEvent.stop();
                console.log("Loop finished");
            }
        }, duration);

        loopEvent.start(0);
        Tone.Transport.start();
    }










    // This function is called when a websockets message is received
    function onWebsocketMessage(message) {
        let midi = parseInt(message.args[1]);
        let address = message.address;
        let key = midi - 36;
        // Print the MIDI values to the console
        // delayed release note
        // const release = setTimeout(function () { releaseNote(key); }, 1000);
        if (address == "/keyOn" || address == "/keyOnPlay") {
            //display midi value on keyboard
            keyboard.keys[key].key.fill = keyboard.colorList.active; // set it as color temporarily
            displayNotes[key].value = midiToNote(midi);
            displayMidiValues[key].value = midi;
            // display chord notes
            if (chordBtPressed && (numNotesPlaying === 0) && selectedChordType.name != null) {
                socket.emit('getChord', { rootNote: midi, chordType: selectedChordType.name })
            }
            numNotesPlaying++;

        } else if (address == "/keyOff" || address == "/keyOffPlay") {
            releaseNote(key);
        } else if (address == '/glissOn') {
            console.log("get note ratio...")
            //get note ratio for glissando mode
            socket.emit('getNoteRatio', { midiStart: midi, midiEnd: 60 });
        }
        //release note
        function releaseNote(key) {
            numNotesPlaying--;
            displayNotes[key].value = "";
            displayMidiValues[key].value = ""
            keyboard.keys[key].key.fill = keyboard.keys[key].color;
            displayChordNotes.forEach((note, i) => {
                console.log('note: ', note);
                const keyIndex = note - 36; // 36 is the midi value of C2, the lowest note on the keyboard
                let newColor = keyboard.keys[keyIndex].color;
                // if currently displaying chord, set chord root to red, otherwise reset to default color
                if (numNotesPlaying > 0) {
                    (i === 0) ? newColor = keyboard.colorList.root : newColor = keyboard.colorList.chord;
                }
                keyboard.keys[keyIndex].key.fill = newColor;
            });
        }
    }





    function createChordButtons() {
        const chordContainer = document.getElementById('chord-container');

        chordTypes.forEach((chordType) => {
            const button = document.createElement('button');
            button.classList.add('chord-button');
            button.textContent = chordType.name;
            //click event listener
            button.addEventListener('click', () => {
                //remove any selected chord buttons
                const children = chordContainer.children;
                for (let i = 0; i < children.length; i++) {
                    children[i].classList.remove('button-pressed');
                }
                selectedChordType = chordType;
                console.log("selectedChordType: ", selectedChordType);
                button.classList.toggle('button-pressed');
                // if (chordBtPressed) {
                //     keyboard.resetKeyboardColors();
                //     let noteIndex = noteLetters.indexOf(selectedNote); // renderChords expects a specific note order index
                //     // keyboard.keyboard.renderChord(noteIndex, selectedChordType);
                // }
                // keyboard.updateKeyboardDisplay();

            });

            chordContainer.appendChild(button);
        });
    }




    function displayKeyNotes(rootKey, scaleIntervals = majorScaleIntervals) {
        const rootNoteIndex = noteLetters.indexOf(rootKey);
        console.log("rootNoteIndex: " + rootNoteIndex);
        const notesContainer = document.getElementById('notes-container');
        const notesInKey = scaleIntervals.map(interval => noteLetters[(rootNoteIndex + interval) % 12]);

        notesInKey.forEach((note) => {
            const noteButton = document.createElement('button');
            noteButton.textContent = note;
            noteButton.classList.add('note-button');

            // Add click event listener to update the selectedNote variable
            noteButton.addEventListener('click', () => {
                const children = notesContainer.children;
                for (let i = 0; i < children.length; i++) {
                    children[i].classList.remove('button-pressed');
                }

                selectedNote = note;
                console.log('Selected note:', selectedNote);
                noteButton.classList.toggle('button-pressed');


                if (displayKey) {
                    keyboard.updateKeyboardDisplay();

                } else {
                    keyboard.resetKeyboardColors();
                }

                if (chordBtPressed) {
                    let noteIndex = noteLetters.indexOf(selectedNote); // renderChords expects a specific note order index
                    console.log("selectedChordType.name: " + selectedChordType.name);
                    keyboard.keyboard.renderChords(noteIndex, selectedChordType);
                }

            });

            notesContainer.appendChild(noteButton);
        });
    }

    function setSelectedNote(note) {
        // Set the selected note variable and perform other actions
        selectedNote = note;
        console.log(`Selected note: ${selectedNote}`);
    }


    // Add event listeners to the buttons
    const keyDisplayBt = document.getElementById('key-display-button');
    keyDisplayBt.addEventListener('click', () => {
        // Code to display the current key
        keyDisplayBt.classList.toggle('button-pressed');
        displayKey = !displayKey;
        keyboard.displayKey = displayKey; // update keyboard displayKey variable
        if (displayKey) {
            keyboard.updateKeyboardDisplay();

        } else {
            keyboard.resetKeyboardColors();
        }
    });

    const genNotesBt = document.getElementById('generate-notes-button');
    genNotesBt.addEventListener('click', () => {
        // Code to display the current key
        genNotesBt.classList.toggle('button-pressed');
        genBtPressed = !genBtPressed;
        socket.emit('generateRandom', { key: genBtPressed });

    });

    const chordsBt = document.getElementById('chords-button');
    chordsBt.addEventListener('click', () => {
        //reset previous settings
        if (displayKey) {
            keyboard.updateKeyboardDisplay();

        } else {
            keyboard.resetKeyboardColors();
        }
        // Code to display the current key
        chordsBt.classList.toggle('button-pressed');
        chordBtPressed = !chordBtPressed;
        //        displayTriads(currentKey);
        // keyboard.renderChords(currentKey,chordTypes['Major'] );
        // if (chordBtPressed) {
        //     let noteIndex = noteLetters.indexOf(selectedNote); // renderChords expects a specific note order index
        //     keyboard.renderChords(noteIndex, selectedChordType);
        // }
    });


    const glissandoBt = document.getElementById('glissando-button');
    glissandoBt.addEventListener('click', () => {
        // Code to display the current key
        glissandoBt.classList.toggle('button-pressed');
        glissandoMode = !glissandoMode;
        if (glissandoMode) {
            socket.emit('glissando', { active: 1 });
        } else {
            socket.emit('glissando', { active: 0 });
        }

    });

    function remap(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }

}