const http = require('http');
const socketIo = require('socket.io');
const osc = require('osc');
const express = require('express');
const app = express();
const tonal = require("tonal");

// Define an array for storing OSC message events with timestamps
const numPianoKeys = 61;
let events = [];
let isPlaying = false;
let isRecording = false;
let midiKeyNotes = [];
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

  //  midiKeyNotes = generateMidiNotesForKey("C");
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
    socket.emit('osc', message);
    onMIDIMessage(message);
  });

  udpPort.open();

  // Handle disconnections
  socket.on('disconnect', function () {
    console.log('Client disconnected:', socket.id);
    udpPort.close();
  });


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
    // Emit the list of MIDI notes to the client
    socket.emit('displayKeyNotes', generateMidiNotesForKey(data.key));

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

  // This function is called when a MIDI message is received
  function onMIDIMessage(message) {
    console.log("...onMIDIMessage");
    let midi = message.args[0].value;
    let address = message.address;
    let key = midi - 24;

    if ((address == "/keyOn" || address == "/keyOff") && isRecording) {
      // Push the message object with a timestamp to the events array
      events.push({ address: message.address, args: message.args, timestamp: Date.now() });
    }
    // Play back events using web-midi-player with loop option and onMidiEvent callback
  }

  function generateMidiNotesForKey(rootNote) {
    // Use the tonal library to generate an array of MIDI notes for the default key
    const notes = tonal.Scale.get(rootNote + " major").notes;

    // Create an empty array to store the MIDI note numbers
    const midiNotes = [];

    // Loop through each octave from MIDI notes 0 to 8 (inclusive)
    for (let octave = 0; octave <= 8; octave++) {
      // Loop through each note in the scale
      notes.forEach(note => {
        // Convert the note name to a MIDI note number using the current octave
        const midiNote = tonal.Note.midi(`${note}${octave}`);

        // If the MIDI note number is within the range of MIDI notes 36 to 96, push it to the array
        if (midiNote >= 36 && midiNote <= 96) {
          midiNotes.push(midiNote);
        }
      });
    }

    return midiNotes;
  }


});

