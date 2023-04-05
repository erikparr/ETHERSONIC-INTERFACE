

var width = 800;
var height = 600;
const keys = [];
const displayNotes = [];
const displayMidiValues = [];
const positionsX = [];
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
let selectedChordType;
let colorList =
{
    whitekey: 'grey',
    blackkey: "#000000",
    chord: '#bc4964',
    active: '#d2e467',
    keyNotes: '#79bbd9',
    root: '#fb194e'
};

let keyTriads = [];
let currentKeyColor = [];
const numKeys = 61;
let displayKeyMidi = [];
let displayKey = false;
let genBtPressed = false;
let chordBtPressed = false;

const chordTypes = [
    { name: 'Major', intervals: [0, 4, 7] },
    { name: 'Minor', intervals: [0, 3, 7] },
    { name: 'Major 7th', intervals: [0, 4, 7, 11] },
    { name: 'Minor 7th', intervals: [0, 3, 7, 10] },
    { name: 'Dominant 7th', intervals: [0, 4, 7, 10] },
    { name: 'Diminished', intervals: [0, 3, 6] },
    { name: 'Diminished 7th', intervals: [0, 3, 6, 9] },
    { name: 'Half Diminished 7th', intervals: [0, 3, 6, 10] },
    { name: 'Augmented', intervals: [0, 4, 8] },
    { name: 'Augmented 7th', intervals: [0, 4, 8, 10] },
    { name: 'Suspended 2nd', intervals: [0, 2, 7] },
    { name: 'Suspended 4th', intervals: [0, 5, 7] },
    { name: '9th', intervals: [0, 4, 7, 10, 14] },
    { name: 'Major 9th', intervals: [0, 4, 7, 11, 14] },
    { name: 'Minor 9th', intervals: [0, 3, 7, 10, 14] },
    { name: '11th', intervals: [0, 4, 7, 10, 14, 17] },
    { name: 'Major 11th', intervals: [0, 4, 7, 11, 14, 17] },
    { name: 'Minor 11th', intervals: [0, 3, 7, 10, 14, 17] },
    { name: '13th', intervals: [0, 4, 7, 10, 14, 17, 21] },
    { name: 'Major 13th', intervals: [0, 4, 7, 11, 14, 17, 21] },
    { name: 'Minor 13th', intervals: [0, 3, 7, 10, 14, 17, 21] },
];

// Define an object to map note names to MIDI numbers
const noteMap = { C: 36, "C#": 37, D: 38, "D#": 39, E: 40, F: 41, "F#": 42, G: 43, "G#": 44, A: 45, "A#": 46, B: 47 };

//To ensure that a script is executed after the body has been loaded, you can use the window.onload event or the DOMContentLoaded event to wait for the HTML page to finish loading before executing the script.
window.onload = function () {

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


    // Listen for incoming OSC messages
    socket.on('osc', function (message) {
        console.log('Received OSC message:', message);
        onMIDIMessage(message);
    });

    // Listen for incoming MIDI messages
    socket.on('midi', function (message) {
        console.log('Received MIDI message:', message);
    });

    // Listen for incoming MIDI messages
    socket.on('displayKeyNotes', function (message) {
        console.log('Received MIDI displayKeyNotes:', message);
        displayKeyMidi = message;
        updateKeyboardDisplay();
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
            socket.emit('noteCapture', {options: 0});
        } else if (event.key === 'ArrowUp') { // up
            socket.emit('clearNoteCapture', {options: 0});
        }
    });
    createKeyboard(0, 100);
    createCircleFifths(250, 150);
    createStaff(200, 100);
    two.bind('update', function () {
        // rect.rotation += 0.001;
    });
    displayKeyNotes('C');
    createChordButtons();

    function createKeyboard(x, y) {
        // var rect = two.makeRectangle(two.width / 2, two.height / 2, 50, 200);
        let numWhite = 36;
        let whiteKeyWidth = 35;
        whiteKeyHeight = 200;
        // Calculate the width of each black key
        var blackKeyWidth = 0.6 * whiteKeyWidth;
        // Calculate the height of each black key
        var blackKeyHeight = 0.6 * whiteKeyHeight;
        let centerKeyboardX = x + (two.width / 2 - ((numWhite * whiteKeyWidth) / 2));
        let centerKeyboardY = y + two.height / 2;
        let blackKeyOffsetY = blackKeyHeight / 3;
        //groups for render order
        var blackKeys = two.makeGroup();
        var whiteKeys = two.makeGroup();
        // Create the white keys and add them to the Two.js instance
        let count = 0;
        var isBlackKey = false;
        var keyX = 0;
        var key;
        for (var i = 0; i < numKeys; i++) {
            let offsetX = false;
            // get offset based on LAST key value
            offsetX = (isBlackKey ? true : false);
            // Determine the color of the key based on its position
            isBlackKey = (i % 12 === 1 || i % 12 === 3 || i % 12 === 6 || i % 12 === 8 || i % 12 === 10);
            if (!isBlackKey) {
                let offsetXVal = (offsetX ? 0 : (whiteKeyWidth / 2))

                // Calculate the x position of the key
                keyX = (count * whiteKeyWidth) + centerKeyboardX;

                // Create a new Two.js shape for the key
                key =
                {
                    key: two.makeRectangle(keyX, centerKeyboardY, whiteKeyWidth, whiteKeyHeight),
                    color: colorList.whitekey
                };
                // Set the fill color of the key
                key.key.fill = key.color;
                // Add the key to the Two.js instance
                whiteKeys.add(key.key);
                count++;

                // add text
                const textMidi = two.makeText("", keyX, centerKeyboardY + 55);
                var textNote = two.makeText("", keyX, centerKeyboardY + 35);
                textNote.size = 22;
                textMidi.fill = '#A439F5';
                textNote.fill = '#A439F5';
                displayMidiValues.push(textMidi);
                displayNotes.push(textNote);
                whiteKeys.add(textMidi);
                whiteKeys.add(textNote);

            } else {
                // Calculate the x position of the key
                keyX = (count * whiteKeyWidth) - (whiteKeyWidth / 2) + centerKeyboardX;
                // Create a new Two.js shape for the key
                key =
                {
                    key: two.makeRectangle(keyX, centerKeyboardY - blackKeyOffsetY, blackKeyWidth, blackKeyHeight),
                    color: colorList.blackkey
                };
                // Set the fill color of the key
                key.key.fill = key.color;
                // Add the key to the Two.js instance
                blackKeys.add(key.key);

                // add text
                const textMidi = two.makeText("", keyX, centerKeyboardY - 35);
                var textNote = two.makeText("", keyX, centerKeyboardY - 15);
                textNote.size = 20;
                textMidi.fill = '#A439F5';
                textNote.fill = '#A439F5';
                displayMidiValues.push(textMidi);
                displayNotes.push(textNote);
                blackKeys.add(textMidi);
                blackKeys.add(textNote);

            }
            keys.push(key);
            positionsX.push(keyX);

        }
        two.add(whiteKeys);
        two.add(blackKeys);

    }

    function resetKeyboardColors() {
        displayKeyMidi = [];
        for (let key = 0; key < numKeys; key++) {

            let isBlackKey = (key % 12 === 1 || key % 12 === 3 || key % 12 === 6 || key % 12 === 8 || key % 12 === 10);
            if (isBlackKey) {
                keys[key].key.fill = colorList.blackkey;
            } else {
                keys[key].key.fill = colorList.whitekey;
            }

        }
    }
    function updateKeyboardDisplay() {
        if (displayKeyMidi.length > 0 && displayKey) {
            const midiStart = 36; // The midi value of the first key on the keyboard display
            for (let key = 0; key < displayKeyMidi.length; key++) {
                const keyIndex = displayKeyMidi[key] - midiStart;
                // Change the fill color to blue
                if (keyIndex >= 0 && keyIndex < keys.length) {
                    let isBlackKey = (keyIndex % 12 === 1 || keyIndex % 12 === 3 || keyIndex % 12 === 6 || keyIndex % 12 === 8 || keyIndex % 12 === 10);
                    keys[keyIndex].color = colorList.keyNotes; // remember color
                    keys[keyIndex].key.fill = keys[keyIndex].color; // set color
                }
            }
        }
    }

    // Example data for the C major chord in the key of C major

    function renderChords(selectedKey, selectedChord) {
        console.log("selectedChord: " + selectedChord)
        const midiStart = 36; // The midi value of the first key on the keyboard display        
        const notesInChord = getNotesInChord(selectedKey, selectedChord);
        // Send a message to the server

        updateKeyboardDisplay();
        let notesList = [];
        keys.forEach((key, i) => {
            const note = i % 12;
            const isBlackKey = [1, 3, 6, 8, 10].includes(note);

            const noteInChord = notesInChord.find(nc => nc.midiNote % 12 === note);

            if (noteInChord) {
                notesList.push(i + 36);
                // if (isBlackKey) 
                key.color = colorList.chord;
                key.key.fill = key.color;
                if (noteInChord.isRoot) {
                    console.log("root");
                    key.color = colorList.root;
                    key.key.fill = key.color;

                }
            }

        });
        socket.emit('update-gen-notes', { notes: notesList }); // update to generative notes

        updateKeyboardDisplay();
    }

    function getNotesInChord(selectedKey, selectedChord) {
        console.log("selectedChord: " + selectedChord.name);
        const rootNote = selectedKey + selectedChord.intervals[0];
        return selectedChord.intervals.map((interval, index) => {
            const midiNote = rootNote + interval;
            return { midiNote, isRoot: index === 0 };
        });
    }

    // This function is called when a MIDI message is received
    function onMIDIMessage(message) {
        let midi = message.args[0];
        let address = message.address;
        let key = midi - 36;
        // Print the MIDI values to the console
        // delayed release note
        // const release = setTimeout(function () { releaseNote(key); }, 1000);
        if (address == "/keyOn" || address == "/keyOnPlay") {
            //display midi value on keyboard
            keys[key].key.fill = colorList.active; // set it as color temporarily
            displayNotes[key].value = midiToNote(midi);
            displayMidiValues[key].value = midi;
        } else if (address == "/keyOff" || address == "/keyOffPlay") {
            releaseNote(key);
        }
        //release note
        function releaseNote(key) {
            displayNotes[key].value = "";
            displayMidiValues[key].value = ""
            let isBlackKey = (key % 12 === 1 || key % 12 === 3 || key % 12 === 6 || key % 12 === 8 || key % 12 === 10);
            keys[key].key.fill = keys[key].color;

        }
    }
    function createCircleFifths(x, y) {
        // Create a circle
        const circle = two.makeCircle(x, y, 100);

        // Set the style of the circle
        circle.fill = '#00bcd4';
        circle.stroke = '#ffffff';
        circle.linewidth = 2;

        // Add the circle to the scene
        two.add(circle);

        // Create an array of the names of the notes in the circle of fifths
        const notes = [
            'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F', 'C', 'G', 'D',
        ];
        // Create groups to hold the text labels, circles, and invisible button
        const group = two.makeGroup();
        const circles = two.makeGroup();
        const buttonGroup = two.makeGroup();
        const labelGroup = two.makeGroup();

        // Add the text labels, circles, and invisible button to their respective groups
        for (let i = 0; i < notes.length; i++) {
            const px = x + 100 * Math.cos(2 * Math.PI * i / notes.length);
            const py = y + 100 * Math.sin(2 * Math.PI * i / notes.length);

            // Create a circle shape for each note
            const circle = two.makeCircle(px, py, 20);
            circle.fill = 'grey';
            circle.stroke = '#ffffff';
            circle.linewidth = 1;

            // Create a text label for each note
            const label = two.makeText(notes[i], px, py);
            label.size = 24;
            label.alignment = 'center';

            // Add both the circle and the label to the group
            circles.add(circle);
            labelGroup.add(label);

            // Create an invisible button for each note
            const button = two.makeCircle(px, py, 20);
            button.noFill();
            button.linewidth = 0;

            // Use requestAnimationFrame to add the click listener after the next repaint of the browser
            requestAnimationFrame(function () {
                // Add a click listener to the button
                button._renderer.elem.addEventListener('click', function () {
                    resetKeyboardColors();
                    if (circle.fill == '#fff') {
                        circle.fill = 'grey';
                        return;
                    }
                    // Set the fill of the circle underneath the button to green
                    circle.fill = '#fff';
                    currentKey = notes[i];
                    // Send a message to the server
                    socket.emit('setKeyNotes', { key: currentKey });

                    console.log(`You clicked the ${notes[i]} button!`);

                    // Loop through all other buttons and set the fill of their corresponding circles back to grey
                    for (let j = 0; j < notes.length; j++) {
                        if (j !== i) {
                            circles.children[j].fill = 'grey';
                        }
                    }
                });
            });

            // Add the button to its own group
            buttonGroup.add(button);
        }

        // Add the circles, text labels, and button group to the main group
        group.add(circles);
        group.add(labelGroup);
        group.add(buttonGroup);

        // Add the main group to the scene
        two.add(group);
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
                console.log('Selected chord type:', selectedChordType.name);
                button.classList.toggle('button-pressed');
                if (chordBtPressed) {
                    resetKeyboardColors();
                    updateKeyboardDisplay();
                    let noteIndex = noteLetters.indexOf(selectedNote); // renderChords expects a specific note order index
                    console.log("selectedChordType.name: " + selectedChordType.name);
                    renderChords(noteIndex, selectedChordType);
                }

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
                    updateKeyboardDisplay();

                } else {
                    resetKeyboardColors();
                }

                if (chordBtPressed) {
                    let noteIndex = noteLetters.indexOf(selectedNote); // renderChords expects a specific note order index
                    console.log("selectedChordType.name: " + selectedChordType.name);
                    renderChords(noteIndex, selectedChordType);
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


    // Define a function to generate the basic triads of a given major scale key
    function displayTriads(key, triadType = "major") {
        const triads = getTriads(key);
        const notes = triads.major;
        console.log("notes: " + notes)
        const startIndex = noteMap[key] - 36;
        for (let i = 0; i < 61; i++) {
            let isBlackKey = (i % 12 === 1 || i % 12 === 3 || i % 12 === 6 || i % 12 === 8 || i % 12 === 10);
            if (notes.includes(i)) {
                keys[i].key.fill = colorList.chord;
            }
        }
    }

    function getTriads(key) {
        const root = noteMap[key];
        const major = [root, root + 4, root + 7];
        const minor = [root, root + 3, root + 7];
        const augmented = [root, root + 4, root + 8];
        const diminished = [root, root + 3, root + 6];
        console.log("major: " + major);
        return {
            major,
            minor,
            augmented,
            diminished
        };
    }
    function createKeySignature(index, x, y, width, height) {
        const signature = two.makeGroup();
        const lineHeight = (height / 5) * 0.85;
        const offsetX = width / 12;
        const offsetY = 8;
        let symbol = "#";
        //  24 possible key signatures
        switch (index) {
            case 0:
                // 0 = C major / A minor
                break;
            case 1:
                // 1 = G major / E minor
                var sharp1 = two.makeText(symbol, x + (width / 4), y + (lineHeight));
                sharp1.size = 24;
                sharp1.fill = '#000';
                signature.add(sharp1);
                break;
            case 2:
                // 2 = D major / B minor
                var sharp1 = two.makeText(symbol, x + (width / 4), y + (lineHeight));
                sharp1.size = 24;
                sharp1.fill = '#000';
                var sharp2 = two.makeText(symbol, x + (width / 4) + offsetX, y + (lineHeight * 3) - offsetY);
                sharp2.size = 24;
                sharp2.fill = '#000';
                signature.add(sharp1);
                signature.add(sharp2);
                break;
            case 3:
                // 3 = A major / F# minor
                var sharp1 = two.makeText(symbol, x + (width / 4), y + (lineHeight));
                sharp1.size = 24;
                sharp1.fill = '#000';
                var sharp2 = two.makeText(symbol, x + (width / 4) + offsetX, y + (lineHeight * 3) - offsetY);
                sharp2.size = 24;
                sharp2.fill = '#000';
                var sharp3 = two.makeText(symbol, x + (width / 4) + (offsetX * 3), y + (lineHeight) - offsetY);
                sharp3.size = 24;
                sharp3.fill = '#000';
                signature.add(sharp1);
                signature.add(sharp2);
                signature.add(sharp3);
                break;
            case 4:
                // 4 = E major / C# minor
                var sharp1 = two.makeText(symbol, x + (width / 4), y + (lineHeight));
                sharp1.size = 24;
                sharp1.fill = '#000';
                var sharp2 = two.makeText(symbol, x + (width / 4) + offsetX, y + (lineHeight * 3) - offsetY);
                sharp2.size = 24;
                sharp2.fill = '#000';
                var sharp3 = two.makeText(symbol, x + (width / 4) + (offsetX * 3), y + (lineHeight) - offsetY);
                sharp3.size = 24;
                sharp3.fill = '#000';
                var sharp4 = two.makeText(symbol, x + (width / 4) + (offsetX * 4), y + (lineHeight * 2));
                sharp4.size = 24;
                sharp4.fill = '#000';
                signature.add(sharp1);
                signature.add(sharp2);
                signature.add(sharp3);
                signature.add(sharp4);
                break;
            // 5 = B major / G# minor
            case 5:
                var sharp1 = two.makeText(symbol, x + (width / 4), y + (lineHeight));
                sharp1.size = 24;
                sharp1.fill = '#000';
                var sharp2 = two.makeText(symbol, x + (width / 4) + offsetX, y + (lineHeight * 3) - offsetY);
                sharp2.size = 24;
                sharp2.fill = '#000';
                var sharp3 = two.makeText(symbol, x + (width / 4) + (offsetX * 3), y + (lineHeight) - offsetY);
                sharp3.size = 24;
                sharp3.fill = '#000';
                var sharp4 = two.makeText(symbol, x + (width / 4) + (offsetX * 4), y + (lineHeight * 2));
                sharp4.size = 24;
                sharp4.fill = '#000';
                var sharp5 = two.makeText(symbol, x + (width / 4) + (37), y + (lineHeight * 4) - offsetY);
                sharp5.size = 24;
                sharp5.fill = '#000';
                signature.add(sharp1);
                signature.add(sharp2);
                signature.add(sharp3);
                signature.add(sharp4);
                signature.add(sharp5);
                break;
            // 6 = F# major / D# minor
            case 6:
                var sharp1 = two.makeText(symbol, x + (width / 4), y + (lineHeight));
                sharp1.size = 24;
                sharp1.fill = '#000';
                var sharp2 = two.makeText(symbol, x + (width / 4) + offsetX, y + (lineHeight * 3) - offsetY);
                sharp2.size = 24;
                sharp2.fill = '#000';
                var sharp3 = two.makeText(symbol, x + (width / 4) + (offsetX * 3), y + (lineHeight) - offsetY);
                sharp3.size = 24;
                sharp3.fill = '#000';
                var sharp4 = two.makeText(symbol, x + (width / 4) + (offsetX * 4), y + (lineHeight * 2));
                sharp4.size = 24;
                sharp4.fill = '#000';
                var sharp5 = two.makeText(symbol, x + (width / 4) + (offsetX * 5), y + (lineHeight * 4) - offsetY);
                sharp5.size = 24;
                sharp5.fill = '#000';
                var sharp6 = two.makeText(symbol, x + (width / 4) + (offsetX * 6.5), y + (lineHeight * 2) - offsetY);
                sharp6.size = 24;
                sharp6.fill = '#000';
                signature.add(sharp1);
                signature.add(sharp2);
                signature.add(sharp3);
                signature.add(sharp4);
                signature.add(sharp5);
                signature.add(sharp6);
                break;
            // 7 = C# major / A# minor
            case 7:
                var sharp1 = two.makeText(symbol, x + (width / 4), y + (lineHeight));
                sharp1.size = 24;
                sharp1.fill = '#000';
                var sharp2 = two.makeText(symbol, x + (width / 4) + offsetX, y + (lineHeight * 3) - offsetY);
                sharp2.size = 24;
                sharp2.fill = '#000';
                var sharp3 = two.makeText(symbol, x + (width / 4) + (offsetX * 3), y + (lineHeight) - offsetY);
                sharp3.size = 24;
                sharp3.fill = '#000';
                var sharp4 = two.makeText(symbol, x + (width / 4) + (offsetX * 4), y + (lineHeight * 2));
                sharp4.size = 24;
                sharp4.fill = '#000';
                var sharp5 = two.makeText(symbol, x + (width / 4) + (offsetX * 5), y + (lineHeight * 4) - offsetY);
                sharp5.size = 24;
                sharp5.fill = '#000';
                var sharp6 = two.makeText(symbol, x + (width / 4) + (offsetX * 6.5), y + (lineHeight * 2) - offsetY);
                sharp6.size = 24;
                sharp6.fill = '#000';
                var sharp7 = two.makeText(symbol, x + (width / 4) + (offsetX * 7.5), y + (lineHeight * 3));
                sharp7.size = 24;
                sharp7.fill = '#000';
                signature.add(sharp1);
                signature.add(sharp2);
                signature.add(sharp3);
                signature.add(sharp4);
                signature.add(sharp5);
                signature.add(sharp6);
                signature.add(sharp7);
                break;
            // 8 = F major / D minor
            // 9 = Bb major / G minor
            // 10 = Eb major / C minor
            // 11 = Ab major / F minor
            // 12 = Db major / Bb minor
            // 13 = Gb major / Eb minor
            // 14 = Cb major / Ab minor
            // 15 = Gb major / Db minor
            // 16 = Cb major / Gb minor
            // 17 = Fb major / Cb minor
            // 18 = Bbb major / Fb minor
            // 19 = Ebb major / Bbb minor
            // 20 = Abb major / Ebb minor
            // 21 = Dbb major / Abb minor
            // 22 = Gbb major / Dbb minor
            // 23 = Cbb major / Gbb minor

        }
        two.add(signature);
    }

    function createStaff(x, y) {
        // Create a new group to hold the staff lines
        const staff = two.makeGroup();
        const numLines = 5;
        const height = 90;
        const width = 100;
        // Use a loop to draw the lines of the staff
        for (let i = 0; i < numLines; i++) {
            // Calculate the y position of the current line
            const yPos = y + (height / (numLines + 1) * (i + 1));

            // Create a new line using the Two.js `line` method and set its position and length
            const line = two.makeLine(x, yPos, width + x, yPos);

            // Add the line to the Two.js scene
            staff.add(line);

        }
        two.add(staff);
        createKeySignature(7, x, y, width, height);
    }

    // Add event listeners to the buttons
    const keyDisplayBt = document.getElementById('key-display-button');
    keyDisplayBt.addEventListener('click', () => {
        // Code to display the current key
        keyDisplayBt.classList.toggle('button-pressed');
        displayKey = !displayKey;
        if (displayKey) {
            updateKeyboardDisplay();

        } else {
            resetKeyboardColors();
        }
    });

    const genNotesBt = document.getElementById('generate-notes-button');
    genNotesBt.addEventListener('click', () => {
        // Code to display the current key
        genNotesBt.classList.toggle('button-pressed');
        genBtPressed = !genBtPressed;
        socket.emit('generateRandom', { key: genBtPressed });

    });

    const triadChordsBt = document.getElementById('triads-button');
    triadChordsBt.addEventListener('click', () => {
        //reset previous settings
        if (displayKey) {
            updateKeyboardDisplay();

        } else {
            resetKeyboardColors();
        }
        // Code to display the current key
        triadChordsBt.classList.toggle('button-pressed');
        chordBtPressed = !chordBtPressed;
        //        displayTriads(currentKey);
        // renderChords(currentKey,chordTypes['Major'] );
        if (chordBtPressed) {
            let noteIndex = noteLetters.indexOf(selectedNote); // renderChords expects a specific note order index
            renderChords(noteIndex, selectedChordType);
        }
    });

}