import Keyboard from './components/Keyboard.js';
import VoxView from './components/VoxView.js';

var width = 800;
var height = 600;
const keys = [];
const displayNotes = [];
const displayMidiValues = [];
const positionsX = [];
let displayChordNotes = [];
let pressedKeys = []; // array of midi notes being pressed at a given time
let numChannels = 10;
let notesList;
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
const bendZero = 8192;
let glissandoMode = false;
let glissandoNoteMode = false;
let whatChord = false;
let chordCap1 = false;
let chordCap2 = false;
let morphPlay = false;
let numLoops = 0;
let isMorphLooping = false;
let numMorphs = 0;
let numMorphsComplete = 0;
let isEndLoop = false;
let numNotesPlaying = 0;
let noteChannel = 0;
let holdStartDur = 500;
let holdEndDur = 500;
let bendDur = 500;
const chordTypes = [
    { name: 'maj', intervals: [0, 4, 7] },
    { name: 'min', intervals: [0, 3, 7] },
    { name: 'maj7', intervals: [0, 4, 7, 11] },
    { name: 'min7', intervals: [0, 3, 7, 10] },
    { name: '7', intervals: [0, 4, 7, 10] },
    { name: 'dim', intervals: [0, 3, 6] },
    { name: 'dim7', intervals: [0, 3, 6, 9] },
    { name: '7b5', intervals: [0, 3, 6, 10] },
    { name: 'm#5', intervals: [0, 3, 6, 10] },
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

    function playAndBendNote(noteInput = -1, startRatio = 0.0, endRatio = 1.0, holdDuration1 = 2000, holdDuration2 = 2000, bendDuration = 5000, loopPlay = false, manualRelease = false) {
        console.log("noteInput: " + noteInput + " startRatio: " + startRatio + " ndRatio: " + endRatio + " holdDuration1: " + holdDuration1 + " holdDuration2: " + holdDuration2 + " bendDuration: " + bendDuration + " loopPlay: " + loopPlay);
         noteChannel = numChan;
        // 0 = -1 semitones, 8192 = no bend, 16383 = 1 semitones
        let startBend = remap(startRatio, -1.0, 1.0, 0, 16383);
        let endBend = remap(endRatio, -1.0, 1.0, 0, 16383);
        let endAmp = 1;
        let note = noteInput;
        let easing = TWEEN.Easing.Quadratic.In;

        // turn note on unless already playing in a loop
        if (!isMorphLooping && !isEndLoop) {
            console.log("turn note on channel: " + noteChannel);
            socket.emit('noteOn', { note: note, channel: noteChannel });
        }
        if (!isMorphLooping && isEndLoop) {
            console.log("end loop");
        }
        setTimeout(() => {
            console.log("-- bend note --")
            // 0 = -1 semitones, 8192 = no bend, 16383 = 1 semitones
            const bend = { x: startBend, y: 0 } // x = bend amt, y = amplitude
            const tween = new TWEEN.Tween(bend) // Create a new tween that modifies 'coords'.
                .to({ x: endBend, y: endAmp }, bendDuration) // Move to target in x seconds.
                .easing(easing) // Use an easing function to make the animation smooth.
                .onUpdate(() => {
                    socket.emit('noteBend', { amount: bend.x, channel: noteChannel });
                }).onComplete(() => {
                    console.log("### bend complete ###")
                    // wait to release note
                    if(!manualRelease){
                    setTimeout(() => {
                        if (!isMorphLooping) { // turn note off unless already playing in a loop
                            socket.emit('noteOff', { note: note, channel: noteChannel });
                            // must reset bend to 8192
                            socket.emit('noteBend', { amount: bendZero, channel: noteChannel });
                        }
                        numMorphsComplete++; // keep track of how many morphs have been completed
                    }, holdDuration2);
                }
                })
                .start() // Start the tween immediately.
            // Setup the animation loop.
            function animate(time) {
                tween.update(time)
                requestAnimationFrame(animate)
            }
            requestAnimationFrame(animate)
            if (loopPlay) {
                isMorphLooping = true;
            }
        }, holdDuration1);
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

    //pixi.js setup
    // Create a PixiJS application of type cavas with specify background color and make it resizes to the iframe window
    let pixiApp = new PIXI.Application({ antialias: true, resizeTo: window });
    let pixiGraphics = new PIXI.Graphics();
    let pixiContainer = document.getElementById("pixi-container");
    pixiContainer.appendChild(pixiApp.view);
    // note function
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
    let voxView = new VoxView(two, pixiApp, pixiGraphics);
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
        playAndBendNote(parseInt(message.midiStart), 0.0, parseFloat(message.ratio), holdStartDur, holdEndDur, bendDur, false, true);
        console.log('midiStart: ', message.midiStart, 'midiEnd: ', message.midiEnd, 'ratio: ', message.ratio);
    });

    //listen for gotChord messages
    socket.on('gotChord', function (message) {
        displayChordNotes = message.midiChord;
        keyboard.displayChord(displayChordNotes);
    });

    socket.on('reset-morph-chords', function (message) {
        console.log('reset-morph-chords');
        chordCap1 = false;
        chordCap2 = false;
        morphPlay = false;
        numLoops = 0;
        numNotesPlaying = 0;
        chord1Bt.classList.remove('button-pressed');
        chord2Bt.classList.remove('button-pressed');
        chordPlayBt.classList.remove('button-pressed');
        chordResetBt.classList.remove('button-pressed');
        isMorphLooping = false;
    });

    socket.on('morphChord', function (message) {
        let startChord = message.midiStartChord;
        let endChord = message.midiEndChord;
        let noteRatio = message.ratio;
        let startHoldDur = 4000;
        let endHoldDur = 4000;
        let morphDur = 2000;
        let totalDur = startHoldDur + endHoldDur + morphDur;
        let totalLoops = 4;
        let midichord = startChord;
        let initRatio = Array.from({ length: noteRatio.length }).fill(0.0); // initialize to 0.0 for each note
        let startMorphRatio = initRatio;
        let endMorphRatio = noteRatio;
        let numLoops = 0;
        let intervalId;
        numMorphs = startChord.length; // keep track of how many morphs to be completed
        // make sure numChannels corresponds to the number of notes in the chord
        numChannels = startChord.length;
        numChan = 0;
        // Extract the main logic into a separate function
        function morphingLogic(startLoop = false) {
            console.log("*** numLoops: " + numLoops + " ***")
            console.log("*** morphs " + numMorphsComplete + "/" + numMorphs + " complete ***")
            if (numMorphsComplete === numMorphs) {
                numMorphsComplete = 0;
            }
            // alternate between start and end chord
            if (!startLoop) {
                if (numLoops % 2 == 0) {
                    // midichord = startChord;
                    startMorphRatio = initRatio;
                    endMorphRatio = noteRatio;
                } else {
                    // midichord = endChord;
                    startMorphRatio = endMorphRatio;
                    endMorphRatio = initRatio;
                }
            }
            console.log("startMorphRatio: " + startMorphRatio + " endMorphRatio: " + endMorphRatio);
            // stop after 4 loops
            if (numLoops >= totalLoops - 1) {
                console.log("stop morphing");
                isMorphLooping = false;
                isEndLoop = true;
                clearInterval(intervalId);
            }

            // bend each note in the chord
            midichord.forEach((note, i) => {
                console.log("current morph: " + midichord);
                note = parseInt(note);
                playAndBendNote(note, startMorphRatio[i], endMorphRatio[i], startHoldDur, endHoldDur, morphDur, startLoop);
            });

            numLoops++;
        }

        if (midichord.length > 0) {
            // Execute immediately
            morphingLogic(true); //set as true to start start loop
            console.log("totalDur: " + totalDur)
            // Then execute at regular intervals
            intervalId = setInterval(morphingLogic, totalDur);
        }
    });


    //listen for foundChord messagaes
    socket.on('foundChord', function (message) {
        let element = document.getElementById('chord-name');
        element.innerText = message.chordName;
    });

    //listen for foundChord messagaes
    socket.on('requestSpeech', function (message) {
        console.log("requestSpeech");
        const durations = voxView.randomPhoneme();
        socket.emit('speechData', { duration: durations.phoneDuration, startTime: durations.totalDuration });
    });
    // listen for knob messages
    socket.on('knob1', function (message){
        // console.log("knob1: " + message.value);
          // Map the received MIDI value to our knob's range
            updateKnob('knob1', message.value); 
            holdStartDur = remap(message.value, 0, 127, 0, 2000);
    })

    // listen for knob messages
    socket.on('knob2', function (message){
          // Map the received MIDI value to our knob's range
            updateKnob('knob2', message.value); 
            holdEndDur = remap(message.value, 0, 127, 0, 2000);
    })

    // listen for knob messages
    socket.on('knob3', function (message){
          // Map the received MIDI value to our knob's range
            updateKnob('knob3', message.value); 
            bendDur = remap(message.value, 0, 127, 0, 2000);
    })

    // listen for knob messages
    socket.on('knob4', function (message){
          // Map the received MIDI value to our knob's range
            updateKnob('knob4', message.value); 
    })

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



    let incrementTimeout;
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
            pressedKeys.push(midi);
            keyboard.keys[key].key.fill = keyboard.colorList.active; // set it as color temporarily
            displayNotes[key].value = midiToNote(midi);
            displayMidiValues[key].value = midi;
            // display chord notes
            console.log("numNotesPlaying: ", numNotesPlaying);
            if (chordBtPressed && (numNotesPlaying === 0) && selectedChordType?.name !== null) {
                socket.emit('getChord', { rootNote: midi, chordType: selectedChordType?.name })
            }
            numNotesPlaying++;


            // wait to detect chord
            if (whatChord && numNotesPlaying > 2 && numNotesPlaying < 6) {
                if (incrementTimeout) {
                    clearTimeout(incrementTimeout);
                }
                // start a new timeout
                incrementTimeout = setTimeout(() => {
                    socket.emit('whatChord', { midiNotes: pressedKeys });
                }, 500);
            }

        } else if (address == "/keyOff" || address == "/keyOffPlay") {
            console.log("keyOff: " + key);
            releaseNote(key);
            pressedKeys = pressedKeys.filter(item => item !== midi);
        } else if (address == '/glissOn') {
            console.log("get note ratio...")
            //get note ratio for glissando mode
            socket.emit('getNoteRatio', { midiStart: midi-12, midiEnd: midi });
            releaseNote(key-12);
        }
        //release note
        function releaseNote(key) {
            if (Number.isInteger(key) && key >= 0 && key < displayNotes.length) {
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
        genNotesBt.classList.add('button-pressed');
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

    // find and display chord name
    const whatChordBt = document.getElementById('whatChord-button');
    whatChordBt.addEventListener('click', () => {
        whatChord = !whatChord;
        // toggle button color
        whatChordBt.classList.toggle('button-pressed');
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
    const glissandoNoteBt = document.getElementById('glissando-note-button');
    glissandoNoteBt.addEventListener('click', () => {
        // Code to display the current key
        glissandoNoteBt.classList.toggle('button-pressed');
        glissandoNoteMode = !glissandoNoteMode;
        if (glissandoNoteMode) {
            socket.emit('glissandoNote', { active: 1 });
        } else {
            socket.emit('glissandoNote', { active: 0 });
        }
    });

    // MPE chord morphing
    // capture the notes in the chord
    const chord1Bt = document.getElementById('chord-capture1');
    chord1Bt.addEventListener('click', () => {
        // Code to display the current key
        chord1Bt.classList.toggle('button-pressed');
        chordCap1 = !chordCap1;
        if (chordCap1) {
            socket.emit('chord-capture-1', { active: 1 });
        } else {
            socket.emit('chord-capture-1', { active: 0 });
        }
    });
    // MPE chord morphing
    // capture the notes in the chord
    const chord2Bt = document.getElementById('chord-capture2');
    chord2Bt.addEventListener('click', () => {
        // Code to display the current key
        chord2Bt.classList.toggle('button-pressed');
        chordCap2 = !chordCap2;
        if (chordCap2) {
            socket.emit('chord-capture-2', { active: 1 });
        } else {
            socket.emit('chord-capture-2', { active: 0 });
        }
    });

    // MPE chord morphing
    // start playing the notes in the chord
    const chordPlayBt = document.getElementById('chord-capture-play');
    chordPlayBt.addEventListener('click', () => {
        // Code to display the current key
        chordPlayBt.classList.toggle('button-pressed');
        morphPlay = !morphPlay;
        if (morphPlay) {
            socket.emit('chord-capture-play', { play: 1 });
            chordPlayBt.innerText = '⏹';
        } else {
            socket.emit('chord-capture-play', { play: 0 });
            chordPlayBt.innerText = '▶️';
        }
    });

    // MPE chord morphing
    // reset the notes in the chord
    const chordResetBt = document.getElementById('chord-capture-reset');
    chordResetBt.addEventListener('click', () => {
        // Code to display the current key
        chordResetBt.classList.toggle('button-pressed');
        socket.emit('chord-capture-reset', { numChannels: numChan });
    });


    const knobWrapper = document.querySelector('.knob-wrapper');
    const knobIndicator = document.querySelector('.knob-indicator');
    let isDragging = false;
    let startAngle = 0;
    let currentRotation = 0;
    const knobValueText1 = document.querySelector('#knob1-label');
    const knobValueText2 = document.querySelector('#knob2-label');
    const knobValueText3 = document.querySelector('#knob3-label');
    const knobValueText4 = document.querySelector('#knob4-label');

    function updateKnob(knobId, messageValue) {
        const knobIndicator = document.getElementById(`${knobId}-indicator`);
        const knobValueLabel = document.getElementById(`${knobId}-label`);
        
        const mappedRotation = remap(messageValue, 0, 127, MIN_ANGLE, MAX_ANGLE);
        
        knobIndicator.style.transform = `rotate(${mappedRotation}deg)`;
        
        const parameterValue = Math.round(remap(mappedRotation, MIN_ANGLE, MAX_ANGLE, 0, 100));
        knobValueLabel.textContent = `${parameterValue}`;
    }
    
    socket.on
    
    function getAngle(centerX, centerY, mouseX, mouseY) {
        return Math.atan2(centerY - mouseY, centerX - mouseX) * (180 / Math.PI);
    }

    knobWrapper.addEventListener('mousedown', (e) => {
        isDragging = true;
        const knobRect = knobIndicator.getBoundingClientRect();
        const knobCenterX = knobRect.left + (knobRect.width / 2);
        const knobCenterY = knobRect.top + knobRect.height;
        startAngle = getAngle(knobCenterX, knobCenterY, e.clientX, e.clientY) - currentRotation;
        // Add the no-select class to body when dragging starts
        document.body.classList.add('no-select');
    });

    const MIN_ANGLE = -135; // corresponds to 7 o'clock
    const MAX_ANGLE = 160;   // corresponds to 4 o'clock

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const knobRect = knobIndicator.getBoundingClientRect();
        const knobCenterX = knobRect.left + (knobRect.width / 2);
        const knobCenterY = knobRect.top + knobRect.height;
        const angle = getAngle(knobCenterX, knobCenterY, e.clientX, e.clientY) - startAngle;

        // Constrain the rotation to the defined range
        currentRotation = Math.max(MIN_ANGLE, Math.min(angle, MAX_ANGLE));
        knobIndicator.style.transform = `rotate(${currentRotation}deg)`;

        let parameterValue = Math.round(remap(currentRotation, MIN_ANGLE, MAX_ANGLE, 0, 100));
        // knobValueText.textContent = `${parameterValue}`;
    });


    knobWrapper.addEventListener('mouseup', () => {
        isDragging = false;
        // Remove the no-select class from body when dragging stops
        document.body.classList.remove('no-select');
    });

    // To ensure mouse up works even if user moves mouse out of knob
    document.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.classList.remove('no-select');
    });




    function remap(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }

}