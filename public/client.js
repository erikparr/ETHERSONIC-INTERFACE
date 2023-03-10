

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
let currentKey = 'C';
const numKeys = 61;
let displayKeyMidi = [];
let displayKey = false;
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
        }
    });
    createKeyboard();
    createCircleFifths(250, 150);
    createStaff(200, 100);
    two.bind('update', function () {
        // rect.rotation += 0.001;
    });

    function createKeyboard() {
        // var rect = two.makeRectangle(two.width / 2, two.height / 2, 50, 200);
        let numWhite = 36;
        let whiteKeyWidth = 25;
        whiteKeyHeight = 100;
        // Calculate the width of each black key
        var blackKeyWidth = 0.6 * whiteKeyWidth;
        // Calculate the height of each black key
        var blackKeyHeight = 0.6 * whiteKeyHeight;
        let centerKeyboardX = (two.width / 2 - ((numWhite * whiteKeyWidth) / 2));
        let centerKeyboardY = two.height / 2;
        let blackKeyOffsetY = blackKeyHeight / 3;
        //groups for render order
        var blackKeys = two.makeGroup();
        var whiteKeys = two.makeGroup();


        // Create the white keys and add them to the Two.js instance
        let count = 0;
        var isBlackKey = false;
        var keyX = 0;
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
                var key = two.makeRectangle(keyX, centerKeyboardY, whiteKeyWidth, whiteKeyHeight);
                key.fill = "grey"

                // Add the key to the Two.js instance
                whiteKeys.add(key);
                count++;

                // add text
                const textMidi = two.makeText("", keyX, centerKeyboardY + 35);
                var textNote = two.makeText("", keyX, centerKeyboardY + 25);
                textMidi.fill = '#A439F5';
                textNote.fill = '#A439F5';
                displayMidiValues.push(textMidi);
                displayNotes.push(textNote);
                blackKeys.add(textMidi);
                blackKeys.add(textNote);

            } else {
                // Calculate the x position of the key
                keyX = (count * whiteKeyWidth) - (whiteKeyWidth / 2) + centerKeyboardX;
                // Create a new Two.js shape for the key
                key = two.makeRectangle(keyX, centerKeyboardY - blackKeyOffsetY, blackKeyWidth, blackKeyHeight);

                // Set the fill color of the key
                key.fill = 'black';

                // Add the key to the Two.js instance
                blackKeys.add(key);

                // add text
                const textMidi = two.makeText("", keyX, centerKeyboardY - 25);
                var textNote = two.makeText("", keyX, centerKeyboardY - 15);
                textMidi.fill = '#A439F5';
                textNote.fill = '#A439F5';
                displayMidiValues.push(textMidi);
                displayNotes.push(textNote);
                blackKeys.add(textMidi);
                blackKeys.add(textNote);

            }

            two.add(whiteKeys);
            two.add(blackKeys);
            keys.push(key);
            positionsX.push(keyX);

        }
    }

    function resetKeyboardColors() {
        displayKeyMidi = [];
        for (let key = 0; key < numKeys; key++) {

            let isBlackKey = (key % 12 === 1 || key % 12 === 3 || key % 12 === 6 || key % 12 === 8 || key % 12 === 10);
            if (isBlackKey) {
                keys[key].fill = "black";
            } else {
                keys[key].fill = "grey";
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
                    if (isBlackKey) {
                        keys[keyIndex].fill = '#79bbd9';
                    } else {
                        keys[keyIndex].fill = '#aacddd';
                    }
                }
            }
        }
    }
    // This function is called when a MIDI message is received
    function onMIDIMessage(message) {
        let midi = message.args[0];
        let address = message.address;
        let key = midi - 36;
        // Print the MIDI values to the console

        // delayed release note
        // const release = setTimeout(function () { releaseNote(key); }, 1000);
        if (address == "/keyOn") {
            //display midi value on keyboard
            keys[key].fill = "#d2e467";
            displayNotes[key].value = midi;
            displayMidiValues[key].value = midiToNote(midi);
        } else if (address == "/keyOff") {
            releaseNote(key);


        }
        //release note
        function releaseNote(key) {
            displayNotes[key].value = "";
            displayMidiValues[key].value = ""
            let keyMidiVal = key + 36;
            let isBlackKey = (key % 12 === 1 || key % 12 === 3 || key % 12 === 6 || key % 12 === 8 || key % 12 === 10);
            if (isBlackKey) {
                if (displayKeyMidi.includes(keyMidiVal)) {
                    keys[key].fill = '#79bbd9';
                } else {
                    keys[key].fill = "black";
                }
            } else {
                if (displayKeyMidi.includes(keyMidiVal)) {
                    keys[key].fill = '#aacddd';
                } else {
                    keys[key].fill = "grey";
                }
            }

        }


        // keys.forEach((element, i) => {
        //     isBlackKey = (i % 12 === 1 || i % 12 === 3 || i % 12 === 6 || i % 12 === 8 || i % 12 === 10);
        //     if(isBlackKey){element.fill = "#000"};
        // }
        // )
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
            'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'
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
    });

    const arpeggioBt = document.getElementById('arpeggio-button');
    arpeggioBt.addEventListener('click', () => {
        // Code to display the current key
        arpeggioBt.classList.toggle('button-pressed');
    });

}