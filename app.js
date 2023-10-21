const http = require('http');
const socketIo = require('socket.io');
const osc = require('osc');
const express = require('express');
const app = express();
const cors = require('cors');
const tonal = require("tonal");
const { Note, Scale, Transpose, Chord } = require("tonal");
const Distance = require("tonal-distance");
const TWEEN = require('@tweenjs/tween.js')

// Define an array for storing OSC message events with timestamps
const numPianoKeys = 61;
let events = [];
let isPlaying = false;
let isRecording = false;
let midiGenNotes = [];
let isCapturingNotes = false;
let isCapturingChord1 = false;
let isCapturingChord2 = false;
let captureNotes = []; // manually add midi notes to a list
let captureChords = [[], []]; // add midi notes to a chord list
let ratioChords = [[]];
let currentKey = 'C';

app.use(cors());
// This should come after initializing socket.io
app.use(express.static('public'));
const server = http.createServer(app);

// Create a WebSocket server
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"]
  }

});

// Start the server
server.listen(8080, function () {
  console.log('Server running on port 8080');
});


// Listen for incoming WebSockets connections
io.on('connection', function (socket) {

  console.log('Client connected:', socket.id);
  const udpPort = new osc.UDPPort({
    localAddress: '0.0.0.0',
    localPort: 57121,
    remoteAddress: "localhost",
    remotePort: 57120 // adjust as necessary
  });


  udpPort.on('message', function (message) {
    console.log('Received OSC message:', message);
    socket.emit('osc', message); // transmit message to frontend via websockets
    onOSCMessage(message);
  });

  udpPort.open();


  // Handle disconnections
  socket.on('disconnect', function () {
    console.log('Client disconnected:', socket.id);
    udpPort.close();
  });

  // Handle update midiGenNotes
  socket.on('update-gen-notes', function (message) {
    midiGenNotes = message.notes;
    console.log('new generative note list:', midiGenNotes);

  });
  // Listen for incoming chord request messages
  socket.on('getChord', function (message) {
    // let event = { address: "/keyOnPlay", args: [message.channel, message.note] };
    socket.emit('gotChord', { midiChord: getMidiChord(message.rootNote, message.chordType) });

  });

  // Listen for
  socket.on('whatChord', function (message) {
    socket.emit('foundChord', { chordName: findChord(message.midiNotes) });
  });

  // listen for speech durations and send to Supercollider
  socket.on('speechData', function (message) {
    console.log("message.duration: " + message.duration);
    console.log("message.startTime: " + message.startTime);
    let event = { address: "/onPlaySpeech", args: [message.duration, message.startTime] };
    udpPort.send(event); // send to SC
  });

  socket.on('noteOn', function (message) {
    console.log('noteOn:', message.note + " " + message.channel);
    let event = { address: "/keyOnPlay", args: [message.channel, message.note] };
    udpPort.send(event); // send to SC
    socket.emit('osc', event); // display on keyboard

  });
  socket.on('noteBend', function (message) {
    console.log('noteBend:', message.channel + " " + message.amount);

    let event = { address: "/onBend", args: [message.channel, message.amount] };
    udpPort.send(event); // send to SC
    socket.emit('osc', event); // display on keyboard

  });
  socket.on('noteOff', function (message) {
    console.log('noteOff:', message.note + " " + message.channel);
    let event = { address: "/keyOffPlay", args: [message.channel, message.note] };
    udpPort.send(event); // send to SC
    socket.emit('osc', event); // display on keyboard

  });
  socket.on('glissOff', function (message) {
    console.log('glissOff:', message.note + " " + message.channel);
    let event = { address: "/keyOffPlay", args: [message.channel, message.note] };
    udpPort.send(event); // send to SC
  });


  // Handle update addMidiNotesToList
  socket.on('noteCapture', function (message) {
    isCapturingNotes = !isCapturingNotes;
    console.log('capturing notes: ' + isCapturingNotes);
    if (isCapturingNotes === false) {
      console.log("send capture to osc: " + captureNotes);
      // when toggled off send notes to supercollider
      let event = { address: "/noteCapture", args: captureNotes };
      // socket.emit('noteCapture', event); // display on keyboard
      console.log(event.args);
      udpPort.send(event);
    }
  });

  socket.on('clearNoteCapture', function (message) {
    isCapturingNotes = false;
    captureNotes = [];
    console.log('cleared capture notes: ' + captureNotes.length);
    // let event = { address: "/onBend", args: [Math.random(1)*8000] };
    // udpPort.send(event); // send to SC
    // socket.emit('osc', event); // display on keyboard


  });

  socket.on('getNoteRatio', function (message) {
    const midi1 = message.midiStart;
    const midi2 = message.midiEnd;
    console.log('get note Ratio');
    const ratio = getNoteRatio(midi1, midi2);

    // Print the notes and the ratio to the console
    socket.emit('noteRatio', { midiStart: midi1, midiEnd: midi2, ratio: ratio });
  })

  // manually play morph-chord
  socket.on('chord-capture-play', function (message) {
    console.log('chord-capture-play');
    // process chords and trigger play message to client
    if (message.play = true) {
      // check if both chords have notes
      if (captureChords[0].length > 0 && captureChords[1].length > 0) {
        processChords(captureChords);
      } else {
        // reset chord capture if no notes
        resetMorphChords();
        stopAllNotes();
      }
    }
  })

  socket.on('chord-capture-reset', function (message) {
    let numChan = message.numChannels;
    resetMorphChords();
    stopAllNotes(numChan);
  })

  function calculateNoteRatio(midi1 = -1, midi2 = -1) {
    // Generate random MIDI values if necessary
    if (midi1 === -1 && midi2 === -1) {
      midi1 = Math.floor(Math.random() * (96 - 36 + 1)) + 36;
      do {
        midi2 = Math.floor(Math.random() * (96 - 36 + 1)) + 36;
      } while (Math.abs(midi2 - midi1) > 12);
    } else if (Math.abs(midi2 - midi1) > 12) {
      console.log("The second argument is out of range.");
      return;
    }

    // Convert MIDI values to note names
    const note1 = Note.fromMidi(midi1);
    const note2 = Note.fromMidi(midi2);

    // Calculate the ratio between the two notes
    const ratio = (midi2 - midi1) / 12;

    // Print the notes and the ratio to the console
    console.log(`${note1} and ${note2} is ${ratio}`);
  }

  // Calculate the ratio between two MIDI notes
  function getNoteRatio(midi1, midi2) {
    let range = 12;
    // Generate random MIDI values if necessary
    if (midi1 === -1 && midi2 === -1) {
      midi1 = Math.floor(Math.random() * (96 - 36 + 1)) + 36;
      do {
        midi2 = Math.floor(Math.random() * (96 - 36 + 1)) + 36;
      } while (Math.abs(midi2 - midi1) > range);
    } else if (Math.abs(midi2 - midi1) > range) {
      console.log("The midi notes as out of set transform range.");
      return;
    }

    // Convert MIDI values to note names
    const note1 = Note.fromMidi(midi1);
    const note2 = Note.fromMidi(midi2);

    // Calculate the ratio between the two notes
    return parseFloat((midi2 - midi1) / 12);
  }

  // Find the chord with the given notes
  function findChord(midiNotes) {
    // convert to notes
    let notes = midiNotes.map(Note.fromMidi);
    // Find the chord
    let chord = Chord.detect(notes);
    console.log('chord: ', chord);
    // If no chord is found, return an empty string
    if (chord.length === 0) {
      return '';
    }
    // Otherwise, return the chord name
    return Chord.detect(notes);
  }

  // Find the notes in a chord
  function getMidiChord(rootNote, chordType, inversion = 0) {
    console.log('chordType: ', chordType);
    // Convert root note from MIDI to note name AND remove octave number
    const rootName = Note.fromMidi(rootNote).replace(/[0-9]/g, '');
    // Combine the root note and chord type to get the chord name
    const chordName = rootName + chordType;
    console.log('chordName: ', chordName)
    // Get the notes in the chord
    const chordNotes = Chord.get(chordName).notes;
    console.log('chordNotes: ', chordNotes)
    // Convert all the notes to MIDI
    const chromaValues = chordNotes.map(Note.chroma)
    console.log('chordNotes: ', chordNotes);
    console.log('chromaValues: ', chromaValues);

    // this way the root note is always the first note
    // unless inversion is set
    chromaValues.forEach((item, i) => {
      if (inversion == 0) {
        if (item < chromaValues[0]) {
          chromaValues[i] = item + 12;
        }
      }
    });
    // add root note to chord
    const chordResult = chromaValues.map(item => (item - chromaValues[0]) + rootNote);
    console.log(chordResult);
    return chordResult

  }
  // Example usage

  // calculateNoteRatio(60, 69); // C4 and C5 is 1
  // calculateNoteRatio(60, 48); // C4 and C3 is -1

  // Define a function for playing back an event array using a loop and a callback
  function playEvents(eventArray, callback) {
    // Set an initial index and time offset
    let index = 0;
    let offset = 0;

    // Define a recursive function for playing back each event with accurate timing
    function playNextEvent() {
      // Get the current event object from the array
      let event = eventArray[index];

      // Calculate the delay time based on the timestamp difference and offset
      let delay = index === 0 ? 0 : event.timestamp - eventArray[index - 1].timestamp - offset;


      // Set a timeout for sending the OSC message after the delay time
      setTimeout(function () {
        if (event.address != "/wait") {
          // Send the OSC message with its address and args using port.send method
          udpPort.send({
            address: event.address + "Play",
            args: event.args,
          });
          // Send to client app to display
          socket.emit('osc', event);
        } else {
          console.log("waiting: " + event.timestamp);
        }
        // Invoke the callback function with the event object as argument if provided
        if (callback) {
          callback(event);
        }

        // Increment the index by one or reset it to zero if loop is true and end of array is reached 
        index = (index + 1) % eventArray.length;
        if (index === 0 && isPlaying) {
          // Adjust the offset by subtracting the total duration of one loop cycle 
          //  offset = Date.now() - eventArray[0].timestamp;
          // Call playNextEvent again to start a new loop cycle 
          playNextEvent();
        } else if (index > 0) {
          // Call playNextEvent again to continue playing back events 
          playNextEvent();
        }
      }, delay);
    }
    // Call playNextEvent for the first time 
    playNextEvent();
  }
  // Listen for keypress messages
  socket.on('setKeyNotes', (data) => {
    currentKey = data.key;
    // Emit the list of MIDI notes to the client
    socket.emit('displayKeyNotes', generateMidiNotesForKey(currentKey));

  });


  // Listen for generateRandom messages
  socket.on('generateRandom', (data) => {
    console.log('generate notes: ' + data.key);
    generateNotes(data.key);
  });
  // Listen for keypress messages
  socket.on('keypress', (data) => {
    if (data.key == "space") {
      if (!isPlaying) {
        playEvents(events, function (event) {
          console.log(event);
        });
      }
      isPlaying = !isPlaying;
    } else if (data.key == "enter") {
      isPlaying = false;
      if (!isRecording) {
        events = [];
      } else if (isRecording) {
        // when done recording put a timestamp at the end
        events.push({ address: '/wait', args: 0, timestamp: Date.now() });
      }
      isRecording = !isRecording;
    }
  });

  socket.on('glissando', (data) => {
    let event = { address: "/glissando", args: data.active };
    udpPort.send(event);

  })
  socket.on('glissandoNote', (data) => {
    let event = { address: "/glissandoNote", args: data.active };
    udpPort.send(event);

  })

  // chord 1 capture 
  socket.on('chord-capture-1', (data) => {
    console.log("Play chord 1 notes to capture");
    if (data.active == 1) {
      isCapturingChord1 = true;
      setTimeout(() => {
        isCapturingChord1 = false;
      }, 2000);
    } else {
      captureChords[0] = [];
    }
  })
  // chord 2 capture 

  socket.on('chord-capture-2', (data) => {
    console.log("Play chord 2 notes to capture");
    if (data.active == 1) {
      isCapturingChord2 = true;
      setTimeout(() => {
        isCapturingChord2 = false;
        processChords(captureChords);
      }, 2000);
    } else {
      captureChords[1] = [];
    }

  })

  let isGeneratingNotes = false;
  let noteDuration = 500; // milliseconds
  let playingNotes = [];
  let loopId;

  function generateNotes(isGenerating) {
    console.log("isGenerating: " + isGenerating);
    let randomNote = midiGenNotes[Math.floor(Math.random() * midiGenNotes.length)];
    console.log("randomNote: " + randomNote);
    let channel = 0;
    if (!isGenerating && loopId) {
      clearInterval(loopId);
      loopId = null;
      isGeneratingNotes = false;
      // Turn off any currently playing notes
      playingNotes.forEach(({ note }) => {
        let event = { address: "/keyOffPlay", args: [channel, note] };
        udpPort.send(event);
        socket.emit('osc', event);
      });
      playingNotes = [];
      return;
    }

    if (isGeneratingNotes) {
      return;
    }

    isGeneratingNotes = true;
    let bpm = 80;
    let beatTime = 60000 / bpm; // calculate the time between beats in milliseconds

    function playNote() {
      let randomNote = midiGenNotes[Math.floor(Math.random() * midiGenNotes.length)];
      let channel = 0;
      console.log("randomNote: " + randomNote);
      let event = { address: "/keyOnPlay", args: [channel, randomNote] };
      udpPort.send(event); // send to SC
      socket.emit('osc', event); // display on keyboard

      playingNotes.push({ note: randomNote, startTime: Date.now() });

      // Schedule a note off message after the duration
      setTimeout(() => {
        let event = { address: "/keyOffPlay", args: [channel, randomNote] };
        udpPort.send(event);
        socket.emit('osc', event); // display on keyboard
        // Remove the note from the playingNotes array
        playingNotes = playingNotes.filter(n => n.note !== randomNote);
      }, noteDuration);
    }

    function loop() {
      playNote();
      loopId = setTimeout(loop, beatTime);
    }

    loop();
  }


  // This function is called when a OSC message is received
  function onOSCMessage(message) {
    console.log("osc message: " + message.args)
    let address = message.address;
    if (address == '/keyOn' || address == '/keyOff') {
      let channel = parseInt(message.args[0]);
      let midi = parseInt(message.args[1]);
      let key = midi - 24;
    }
    if ((address == "/keyOn" || address == "/keyOff") && isRecording) {
      // Push the message object with a timestamp to the events array
      events.push({ address: message.address, args: message.args, timestamp: Date.now() });
    } else if (address == '/keyOn' && isCapturingNotes) {
      captureNotes.push(midi);
      console.log("captureNote: " + midi);
    } else if ((address == '/keyOn' || address == '/keyOff') && isCapturingChord1) {
      captureChords[0].push(midi);
    } else if ((address == '/keyOn' || address == '/keyOff') && isCapturingChord2) {
      captureChords[1].push(midi);
    } else if (address == '/transpose') {
      let transposed = transposeNotes(captureNotes, -2, currentKey);
      let event = { address: "/noteCapture", args: transposed };
      udpPort.send(event);
    } else if (address == '/requestSpeech') {
      console.log("requestSpeech");
      socket.emit('requestSpeech', { value: 1 });
    } else if (address == '/knob1') {
      let knobValue = parseFloat(message.args[0]);
      console.log("1: ", knobValue);
      socket.emit('knob1', { value: knobValue });
    }else if (address == '/knob2') {
      let knobValue = parseFloat(message.args[0]);
      console.log("2: ", knobValue);
      socket.emit('knob2', { value: knobValue });
    }else if (address == '/knob3') {
      let knobValue = parseFloat(message.args[0]);
      console.log("3: ", knobValue);
      socket.emit('knob3', { value: knobValue });
    }else if (address == '/knob4') {
      let knobValue = parseFloat(message.args[0]);
      console.log("4: ", knobValue);
      socket.emit('knob4', { value: knobValue });
    }
  }

  // remove any duplicate notes and sort
  function processChords(chords) {
    let chord1 = chords[0].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b); // Note: Added sorting function for numbers
    let chord2 = chords[1].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b); // Note: Added sorting function for numbers

    console.log("chord1: " + chord1);
    console.log("chord2: " + chord2);

    for (let i = 0; i < captureChords.length - 1; i++) {
      const currentArray = captureChords[i].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
      const nextArray = captureChords[i + 1].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
      console.log("touched for the very " + (i + 1) + " time");

      if (currentArray.length > 0 && nextArray.length > 0 && currentArray.length === nextArray.length) {
        console.log(`capture chords success!`);
        console.log("currentArray length: " + currentArray.length);

        // calculate the ratio between the two chords and store in array
        for (let j = 0; j < currentArray.length; j++) {
          console.log("getnoteRatio " + j);
          ratioChords[0].push(getNoteRatio(currentArray[j], nextArray[j]));
        }
        console.log("currentArray: " + currentArray);
        console.log("nextArray: " + nextArray);
        // send play message to client
        socket.emit('morphChord', { midiStartChord: currentArray, midiEndChord: nextArray, ratio: ratioChords[0] });
        console.log("ratioChords: " + ratioChords[0]);
      } else {
        console.log(`the chords do not have the same number of notes!`);
        return;
      }
    }

    // let event = { address: "/chordCapture", args: [chord1, chord2] };
    // udpPort.send(event);
    // socket.emit('osc', event); // display on keyboard
  }

  function resetMorphChords() {
    ratioChords = [[]];
    captureChords = [[], []];
    socket.emit('reset-morph-chords', 0);
  }

  function generateMidiNotesForKey(rootNote) {
    // Use the tonal library to generate an array of MIDI notes for the default key
    const notes = tonal.Scale.get(rootNote + " major").notes;

    // Create an empty array to store the MIDI note numbers
    midiGenNotes = [];
    // Loop through each octave from MIDI notes 0 to 8 (inclusive)
    for (let octave = 0; octave <= 8; octave++) {
      // Loop through each note in the scale
      notes.forEach(note => {
        // Convert the note name to a MIDI note number using the current octave
        const midiNote = tonal.Note.midi(`${note}${octave}`);

        // If the MIDI note number is within the range of MIDI notes 36 to 96, push it to the array
        if (midiNote >= 36 && midiNote <= 96) {
          midiGenNotes.push(midiNote);
        }
      });
    }

    return midiGenNotes;
  }

  // Custom helper function to find the closest note in the scale

  function findClosestNote(scale, noteName) {
    let minDistance = Infinity;
    let closestNoteIndex = -1;

    const noteChroma = tonal.Note.chroma(noteName);

    scale.forEach((scaleNote, index) => {
      const scaleNoteChroma = tonal.Note.chroma(scaleNote);
      const distance = Math.abs(noteChroma - scaleNoteChroma);

      if (distance < minDistance) {
        minDistance = distance;
        closestNoteIndex = index;
      }
    });

    return closestNoteIndex;
  }


  function midiKeysInKey(key, scaleType = "major", keyboardSize = 61) {
    const lowestMidi = keyboardSize === 61 ? 36 : 21; // MIDI note for C2 (36) and C0 (21)
    const highestMidi = keyboardSize === 61 ? 96 : 108; // MIDI note for C7 (96) and C9 (108)
    const scale = tonal.Scale.get(`${key} ${scaleType}`).notes;
    const midiKeys = [];

    for (let i = lowestMidi; i <= highestMidi; i++) {
      const note = tonal.Note.fromMidi(i);
      const degree = tonal.Scale.degrees(scale, note);
      if (degree) {
        midiKeys.push(i);
      }
    }

    return midiKeys;
  }

  function transposeNotes(notes, interval, key, scaleType = "major") {
    const keyboardSize = 61;
    const result = []; // Initialize the result array
    const midiKeys = midiKeysInKey(key, scaleType, keyboardSize);

    // Iterate through the input notes
    for (const note of notes) {
      const noteIndex = midiKeys.indexOf(note);

      if (noteIndex !== -1) {
        const transposedIndex = noteIndex + interval;
        if (transposedIndex >= 0 && transposedIndex < midiKeys.length) {
          result.push(midiKeys[transposedIndex]);
        }
      }
    }

    // Return the result array with transposed MIDI values
    return result;
  }

  function stopAllNotes(channel = 0) {
    for (let i = 36; i < 36 + numPianoKeys; i++) {
      let event = { address: "/keyOffPlay", args: [channel, i] };
      udpPort.send(event); // send to SC
      socket.emit('osc', event); // display on keyboard
    }

    for (let i = 0; i < 10; i++) {
      //  reset bend to 8192
      let event = { address: "/onBend", args: [i, 8192] };
      udpPort.send(event); // send to SC
    }
  }

  // To gracefully shutdown the udpPort when your server shuts down
  process.on('exit', function () {
    if (udpPort.state === "open") {
      udpPort.close();
    }
  });

  process.on('SIGINT', function () {
    process.exit();
  });


});

