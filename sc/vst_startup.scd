// Define a function that initializes the SuperCollider server
Server.killAll;
Server.default = Server.local;
s.options.sampleRate = 48000;
s = Server.default;

// Set the SuperCollider server output device
ServerOptions.devices; // all devices
// Server.default.options.outDevice_("Babyface Pro");
//enable when routing to loopback:
Server.default.options.outDevice_("SC Route");

// Wait for the server to finish booting
s.waitForBoot {

    // Initialize the MIDI client and connect to all MIDI inputs
    MIDIClient.init;
    MIDIIn.connectAll;

    // Define your synth
    SynthDef(\insert, { arg bus ;
        ReplaceOut.ar(bus, VSTPlugin.ar(In.ar(bus, 2), 2));
    }).add;
0.5.wait;
        // Set the current program number for the VST plugin controller
	// ~vsti = VSTPluginController(Synth(\insert, [\bus, 0])).open("Komplete Kontrol", editor: true);
	// ~vsti = VSTPluginController(Synth(\insert, [\bus, 0])).open("Kontakt", editor: true);
	~vsti = VSTPluginController(Synth(\insert, [\bus, 0])).open("Pigments", editor: true);
	// ~vsti = VSTPluginController(Synth(\insert, [\bus, 0])).open("Omnisphere", editor: true);

	//envelope vst control
~bend1 = Bus.control;
SynthDef(\BendEnvelope1, {
    arg start = 0, end = 1, dur = 1;
    var env;
    env = EnvGen.kr(
        Env([start, start, end], [(dur*0.01), dur*0.99], \sin),
        gate: \gate.tr,
        doneAction: 0
    );
    SendTrig.kr(Impulse.kr(64), 0, env);  // Send triggers at a control rate of 64 Hz
    Out.kr(~bend1, env);
}).add;

5.wait;
	// Open the editor window for the VST plugin controller
        ~vsti.editor;

n = NetAddr("127.0.0.1", 57121); // local machine

	// Replace "example.scd" with the path to your .scd file
"/Users/erikparr/Documents/_Prototypes/keyboard-composer/sc/ethersonic-interface.scd".load;

	//
	// ~f1 = MIDIFunc.noteOn({arg veloc, pitch, chan;
	// 	chan = 0;
	// 	~vsti.midi.noteOn(chan, pitch, veloc);
	// 	pitch.postln;
	// 	pitch.midinote.postln;
	// 	n.sendMsg('/keyOn', chan, pitch);
	// 	// ~vsti2.midi.noteOn(chan, pitch, veloc);
	// });
	// ~f2 = MIDIFunc.noteOff({arg veloc, pitch, chan;
	// 	var freq = pitch.midicps; // Convert MIDI note number to frequency
	// 	chan =0;
	// 	~vsti.midi.noteOff(chan, pitch, veloc);
	// 	n.sendMsg('/keyOff', chan, pitch);
	// });
	// ~f4 = MIDIFunc.bend({ arg bendval, channel;
	// 	channel =0;
	// 	~vsti.midi.bend(channel, bendval);
	// });

    // Load SynthDef and sample files here
    // loadSynthDef("/path/to/synthDef.scsyndef");
    // loadSample("/path/to/sample.wav");

    // Print a message to indicate that the startup file has finished loading
    "Startup file loaded".postln;
};
