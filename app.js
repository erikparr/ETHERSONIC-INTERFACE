const http = require('http');
const socketIo = require('socket.io');
const osc = require('osc');
const webmidi = require('webmidi');
const express = require('express');
const app = express();

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

  // Listen for incoming OSC messages
  const udpPort = new osc.UDPPort({
    localAddress: '0.0.0.0',
    localPort: 57121,
    metadata: true
  });

  udpPort.on('message', function (message) {
    console.log('Received OSC message:', message);
    socket.emit('osc', message);
  });

  udpPort.open();

  // Enable WEBMIDI.js and trigger the onEnabled() function when ready
  // webmidi
  //   .enable()
  //   .then(onEnabled)
  //   .catch(err => alert(err));

  // Function triggered when WEBMIDI.js is ready
  // function onEnabled() {

  //   // Display available MIDI input devices
  //   if (webmidi.inputs.length < 1) {
  //     console.log( "No device detected.");
  //   } else {
  //     webmidi.inputs.forEach((device, index) => {
  //       console.log( `${index}: ${device.name}`);
  //     });
  //   }

  // }

  // Handle disconnections
  socket.on('disconnect', function () {
    console.log('Client disconnected:', socket.id);
    udpPort.close();
  });
});
