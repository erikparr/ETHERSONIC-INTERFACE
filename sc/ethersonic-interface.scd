

// PIGMENTS MACRO CONTROL
// param reference: param 1 = Macro 1, 2 = Macro 2, 3 = Macro 3, 4 = Macro 4
// ~vsti.gui
// ~ctrl1 = Bus.control;
// ~lfo = {Out.kr(~ctrl1, SinOsc.kr(5, 0, 0.5, 0.5))}.play;
// ~vsti.map(4, ~ctrl1); // find the number of the parameter you want to control and set it to the control bus
// ~vsti.unmap(1); // find the number of the parameter you want to control and set it to the control bus
// ~lfo.free;
//


~glissandoMode = false;
~glissandoNoteMode = false;


// Envelope control


// BendEnvelope1 defined in startup file

~bendSynth1 = Synth(\BendEnvelope1);

// Setup OSCFunc to listen for trigger messages
~oscFunc = OSCFunc({ |msg|
    var envValue = msg[3];
    ~vsti.midi.bend(0, envValue);
}, '/tr', s.addr);



~f1 = MIDIFunc.noteOn({arg veloc, pitch, chan;
	chan = 0;

	// play glissando note mode
	if (~glissandoNoteMode) {
~bendSynth1.set(\gate, 1, \start, 0, \end, 8192, \dur, 0.3.rrand(0.4));
	};

	// play midi note and send osc to ethersonic, if glissando mode don't play note just glissssss
	if(~glissandoMode == true, {
		n.sendMsg('/glissOn', chan, pitch);
	},{
		~vsti.midi.noteOn(chan, pitch, veloc);
		n.sendMsg('/keyOn', chan, pitch);
	});
	pitch.postln;
});

~f2 = MIDIFunc.noteOff({arg veloc, pitch, chan;
	var freq = pitch.midicps; // Convert MIDI note number to frequency
	chan =0;
	~vsti.midi.noteOff(chan, pitch, 0);
	n.sendMsg('/keyOff', chan, pitch);
});

~f3 = MIDIFunc.cc({arg ...args;
	n.sendMsg('/transpose', 0);

}, 49); // match cc 49


~f4 = MIDIFunc.bend({ arg bendval, channel;
	channel =0;
	bendval.postln;
	~vsti.midi.bend(channel, bendval);
});


~knob1 = MIDIFunc.cc({|val, ccNum, chan, src|
	n.sendMsg('/knob1', val);

}, 20); // match cc 20
~knob2 = MIDIFunc.cc({|val, ccNum, chan, src|
	n.sendMsg('/knob2', val);

}, 21); // match cc 21
~knob3 = MIDIFunc.cc({|val, ccNum, chan, src|
	n.sendMsg('/knob3', val);

}, 22); // match cc 22
~knob4 = MIDIFunc.cc({|val, ccNum, chan, src|
	n.sendMsg('/knob4', val);

}, 23); // match cc 23

// Query all incoming MIDI CC messages
// MIDIFunc.cc({ |val, ccNum, chan, src|
// 	"CC Number: %, Value: %, Channel: %".format(ccNum, val, chan).postln;
// });

// turn off a specifc note
// ~vsti.midi.noteOff(1, 71, 0);


~captureNotes = [];
OSCdef(\onPlay, {
	arg msg;
	~vsti.midi.noteOn(msg[1], msg[2], 100);
}, '/keyOnPlay', n);
OSCdef(\offPlay, {
	arg msg;
	~vsti.midi.noteOff(msg[1], msg[2], 0);
}, '/keyOffPlay', n);
OSCdef(\onBend, {
	arg msg;
	msg[2].postln;
	~vsti.midi.bend(msg[1].asInteger, msg[2].asInteger);
}, '/onBend', n);
OSCdef(\captureNotes, {
	arg msg;
	msg.postln;
	~captureNotes = msg.drop(1).asInteger;
	("capture notes: " + ~captureNotes ).postln;
}, '/noteCapture', n);
OSCdef(\glissandoMode, {
	arg msg;
	msg.postln;
	if(msg[1].asInteger == 1,{ ~glissandoMode = true; "true".postln},{ ~glissandoMode = false});
}, '/glissando', n);

OSCdef(\glissandoNoteMode, {
	arg msg;
	msg.postln;
	if(msg[1].asInteger == 1,{ ~glissandoNoteMode = true; "true".postln},{ ~glissandoNoteMode = false});
}, '/glissandoNote', n);

// ~vsti.midi.bend(0, ~bend1.getSynchronous);

// OSCdef(\playBend, {
// 	arg msg;
// 	msg.postln;
// 	~bendSynth1.set(\gate, 1, \start, 0, \end, 8192);
// 	~vsti.midi.bend(channel, ~bend1);
// 	~vsti.midi.noteOn(msg[1], msg[2], 100);
// }, '/glissando', n);

// OSCdef(\glissandoMode).clear; // remove all functions

// OSCdef(\onPlay).clear; // remove all functions
// OSCdef(\onBend).clear; // remove all functions
// OSCdef(\offPlay).clear; // remove all functions
// ~f1.free;
// ~f2.free;
// ~vsti.midi.allNotesOff(0) // turn all notes off
