const http = require('http');
const socketIo = require('socket.io');
const osc = require('osc');
const express = require('express');
const app = express();
const tonal = require("tonal");
const { Note, Scale, Transpose } = require("tonal");
const Distance = require("tonal-distance");
const TWEEN = require('@tweenjs/tween.js')

// Define an array for storing OSC message events with timestamps
const numPianoKeys = 61;
let events = [];
let isPlaying = false;
let isRecording = false;
let midiGenNotes = [];
let isCapturingNotes = false;
let captureNotes = []; // manually add midi notes to a list
let currentKey = 'C';
// This will create an instance of the express app, use the express.static middleware to serve the public directory as a static file directory, and create the HTTP server using the express app
app.use(express.static('public'));
const server = http.createServer(app);

// Start the server
server.listen(8080, function () {
  console.log('Server running on port 8080');
});

// Create a WebSocket server
const io = socketIo(server);

// Listen for incoming WebSockets connections
io.on('connection', function (socket) {
  console.log('Client connected:', socket.id);

  //  midiGenNotes = generateMidiNotesForKey("C");
  // Listen for incoming OSC messages
  const udpPort = new osc.UDPPort({
    localAddress: '0.0.0.0',
    localPort: 57121,
    remoteAddress: "localhost",
    remotePort: 57120
    // metadata: true
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

  socket.on('noteOn', function (message) {
    console.log('noteOn:', message.note + " " + message.channel);
    let event = { address: "/keyOnPlay", args: [ message.channel, message.note] };
    udpPort.send(event); // send to SC
    socket.emit('osc', event); // display on keyboard

  });
  socket.on('noteBend', function (message) {
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

  // Handle update addMidiNotesToList
  socket.on('noteCapture', function (message) {
    isCapturingNotes = !isCapturingNotes;
    console.log('capturing notes: ' + isCapturingNotes);
    if (isCapturingNotes === false) {
      console.log("send capture to osc: " + captureNotes);
      // when toggled off send notes to supercollider
      let event = { address: "/noteCapture", args: captureNotes };
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
        socket.emit('noteRatio', {midiStart: midi1, midiEnd: midi2, ratio: ratio });
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
    let channel = message.args[0].value;
    let midi = message.args[1].value;
    let address = message.address;
    let key = midi - 24;

    if ((address == "/keyOn" || address == "/keyOff") && isRecording) {
      // Push the message object with a timestamp to the events array
      events.push({ address: message.address, args: message.args, timestamp: Date.now() });
    } else if (address == '/keyOn' && isCapturingNotes) {
      captureNotes.push(midi);
    } else if (address == '/transpose') {
      let transposed  = transposeNotes(captureNotes, -2, currentKey);
      let event = { address: "/noteCapture", args: transposed };
      udpPort.send(event);
    }
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



});

