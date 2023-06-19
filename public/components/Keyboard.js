export default class Keyboard {
    constructor(two, displayMidiValues, displayNotes, displayKeyMidi, displayKey, currentKey, socket, getNotesInChord) {
        this.two = two;
        this.displayMidiValues = displayMidiValues;
        this.displayNotes = displayNotes;
        this.displayKeyMidi = displayKeyMidi;
        this.displayKey = displayKey;
        this.currentKey = currentKey;
        this.socket = socket;
        this.keys = [];
        this.positionsX = [];
        this.getNotesInChord = getNotesInChord;

        // Define colorList in the constructor
        this.colorList = {
            whitekey: 'grey',
            blackkey: "#000000",
            chord: '#bc4964',
            active: '#d2e467',
            keyHighlight: '#79bbd9',
            root: '#fb194e'
        };


        // Define the number of keys on the keyboard
        this.numKeys = 61;

    }


    createKeyboard(x, y) {
        // var rect = this.two.makeRectangle(this.two.width / 2, this.two.height / 2, 50, 200);
        let numWhite = 36;
        let whiteKeyWidth = 35;
        let whiteKeyHeight = 200;
        // Calculate the width of each black key
        var blackKeyWidth = 0.6 * whiteKeyWidth;
        // Calculate the height of each black key
        var blackKeyHeight = 0.6 * whiteKeyHeight;
        let centerKeyboardX = x + (this.two.width / 2 - ((numWhite * whiteKeyWidth) / 2));
        let centerKeyboardY = y + this.two.height / 2;
        let blackKeyOffsetY = blackKeyHeight / 3;
        //groups for render order
        var blackKeys = this.two.makeGroup();
        var whiteKeys = this.two.makeGroup();
        // Create the white keys and add them to the this.two.js instance
        let count = 0;
        var isBlackKey = false;
        var keyX = 0;
        var key;
        for (var i = 0; i < this.numKeys; i++) {
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
                    key: this.two.makeRectangle(keyX, centerKeyboardY, whiteKeyWidth, whiteKeyHeight),
                    color: this.colorList.whitekey
                };
                // Set the fill color of the key
                key.key.fill = key.color;
                // Add the key to the Two.js instance
                whiteKeys.add(key.key);
                count++;

                const textMidi = this.two.makeText("", keyX, centerKeyboardY + 55);
                var textNote = this.two.makeText("", keyX, centerKeyboardY + 35);
                textNote.size = 22;
                textMidi.fill = '#000';
                textNote.fill = '#000';
                this.displayMidiValues.push(textMidi);
                this.displayNotes.push(textNote);
                whiteKeys.add(textMidi);
                whiteKeys.add(textNote);

            } else {
                // Calculate the x position of the key
                keyX = (count * whiteKeyWidth) - (whiteKeyWidth / 2) + centerKeyboardX;
                // Create a new Two.js shape for the key
                key =
                {
                    key: this.two.makeRectangle(keyX, centerKeyboardY - blackKeyOffsetY, blackKeyWidth, blackKeyHeight),
                    color: this.colorList.blackkey
                };
                // Set the fill color of the key
                key.key.fill = key.color;
                // Add the key to the Two.js instance
                blackKeys.add(key.key);

                // add text
                const textMidi = this.two.makeText("", keyX, centerKeyboardY - 35);
                var textNote = this.two.makeText("", keyX, centerKeyboardY - 15);
                textNote.size = 20;
                textMidi.fill = '#000';
                textNote.fill = '#000';
                this.displayMidiValues.push(textMidi);
                this.displayNotes.push(textNote);
                blackKeys.add(textMidi);
                blackKeys.add(textNote);

            }
            this.keys.push(key);
            this.positionsX.push(keyX);

        }
        this.two.add(whiteKeys);
        this.two.add(blackKeys);

    }

    resetKeyboardColors() {
        this.displayKeyMidi = [];
        for (let key = 0; key < this.numKeys; key++) {

            let isBlackKey = (key % 12 === 1 || key % 12 === 3 || key % 12 === 6 || key % 12 === 8 || key % 12 === 10);
            if (isBlackKey) {
                this.keys[key].key.fill = this.colorList.blackkey;
            } else {
                this.keys[key].key.fill = this.colorList.whitekey;
            }

        }
        this.updateKeyboardDisplay();
    }

    updateKeyboardDisplay(displayKeys = null) {
        // displayKeyMidi needs to be updated as an argument
        if (displayKeys != null) {
            console.log("displayKeys: " + displayKeys);

            this.displayKeyMidi = displayKeys;
        }
        console.log("displayKeyMidi: " + this.displayKeyMidi);
        console.log("this.displayKeyMidi.length: " + this.displayKeyMidi.length);
        // If there is a key to display, display it on the keyboard
        if (this.displayKeyMidi.length > 0 && this.displayKey) {
            const midiStart = 36; // The midi value of the first key on the keyboard display
            for (let key = 0; key < this.displayKeyMidi.length; key++) {
                const keyIndex = this.displayKeyMidi[key] - midiStart;
                // Change the fill color to blue
                if (keyIndex >= 0 && keyIndex < this.keys.length) {
                    console.log("keyIndex: " + keyIndex)
                    let isBlackKey = (keyIndex % 12 === 1 || keyIndex % 12 === 3 || keyIndex % 12 === 6 || keyIndex % 12 === 8 || keyIndex % 12 === 10);
                    this.keys[keyIndex].color = this.colorList.keyHighlight; // remember color
                    this.keys[keyIndex].key.fill = this.keys[keyIndex].color; // set color
                }
            }
        }
    }

    // renderChords(selectedKey, selectedChord) {
    //     console.log("selectedChord: " + selectedChord);
    //     const midiStart = 36; // The midi value of the first key on the keyboard display        
    //     const notesInChord = this.getNotesInChord(selectedKey, selectedChord); // Need to define this method

    //     this.updateKeyboardDisplay();

    //     let notesList = [];

    //     this.keys.forEach((key, i) => {
    //         const note = i % 12;
    //         const isBlackKey = [1, 3, 6, 8, 10].includes(note);

    //         const noteInChord = notesInChord.find(nc => nc.midiNote % 12 === note);

    //         if (noteInChord) {
    //             notesList.push(i + 36);
    //             key.color = this.colorList.chord;
    //             key.key.fill = key.color;

    //             if (noteInChord.isRoot) {
    //                 console.log("root");
    //                 key.color = this.colorList.root;
    //                 key.key.fill = key.color;
    //             }
    //         }
    //     });

    //     this.socket.emit('update-gen-notes', { notes: notesList }); // Need to define socket

    //     this.updateKeyboardDisplay();
    // }


    displayChord(chordNotes) {
        this.updateKeyboardDisplay();

        chordNotes.forEach((key, i) => {
            key = key - 36;
            let isBlackKey = false;
            isBlackKey = (key % 12 === 1 || key % 12 === 3 || key % 12 === 6 || key % 12 === 8 || key % 12 === 10);
            this.keys[key].key.fill = this.colorList.chord;

            if (i === 0) {
                console.log("root");
                // this.keys[key].color = this.colorList.root;
                this.keys[key].key.fill = this.colorList.root;
            }
        });


    }


    createCircleFifths(x, y) {
        let that = this; // Capture the context

        // Create a circle
        const circle = this.two.makeCircle(x, y, 100);

        // Set the style of the circle
        circle.fill = '#1F51FF';
        circle.stroke = '#000';
        circle.linewidth = 2;

        // Add the circle to the scene
        this.two.add(circle);

        // Create an array of the names of the notes in the circle of fifths
        const notes = [
            'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F', 'C', 'G', 'D',
        ];
        // Create groups to hold the text labels, circles, and invisible button
        const group = this.two.makeGroup();
        const circles = this.two.makeGroup();
        const buttonGroup = this.two.makeGroup();
        const labelGroup = this.two.makeGroup();

        // Add the text labels, circles, and invisible button to their respective groups
        for (let i = 0; i < notes.length; i++) {
            const px = x + 100 * Math.cos(2 * Math.PI * i / notes.length);
            const py = y + 100 * Math.sin(2 * Math.PI * i / notes.length);

            // Create a circle shape for each note
            const circle = this.two.makeCircle(px, py, 20);
            circle.fill = '#1e1e20';
            circle.stroke = 'grey';
            circle.linewidth = 1;

            // Create a text label for each note
            const label = this.two.makeText(notes[i], px, py);
            label.size = 24;
            label.alignment = 'center';
            label.fill = '#fff';

            // Add both the circle and the label to the group
            circles.add(circle);
            labelGroup.add(label);

            // Create an invisible button for each note
            const button = this.two.makeCircle(px, py, 20);
            button.noFill();
            button.linewidth = 0;

            // Use requestAnimationFrame to add the click listener after the next repaint of the browser
            requestAnimationFrame(() => {
                // Add a click listener to the button
                button._renderer.elem.addEventListener('click', function () {
                    that.resetKeyboardColors();
                    if (circle.fill == '#4b0587') {
                        circle.fill = '#1e1e20';
                        return;
                    }
                    // Set the fill of the circle underneath the button to blue
                    circle.fill = '#5959de';
                    that.currentKey = notes[i];
                    // Send a message to the server
                    that.socket.emit('setKeyNotes', { key: that.currentKey });

                    console.log(`You clicked the ${notes[i]} button!`);

                    // Loop through all other buttons and set the fill of their corresponding circles back to grey
                    for (let j = 0; j < notes.length; j++) {
                        if (j !== i) {
                            circles.children[j].fill = '#1e1e20';
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
        this.two.add(group);
    }


    createStaff(x, y) {
        // Create a new group to hold the staff lines
        const staff = this.two.makeGroup();
        const numLines = 5;
        const height = 90;
        const width = 100;
        // Use a loop to draw the lines of the staff
        for (let i = 0; i < numLines; i++) {
            // Calculate the y position of the current line
            const yPos = y + (height / (numLines + 1) * (i + 1));

            // Create a new line using the Two.js `line` method and set its position and length
            const line = this.two.makeLine(x, yPos, width + x, yPos);

            // Add the line to the Two.js scene
            staff.add(line);
        }
        this.two.add(staff);
    }


}

// export default Keyboard;
