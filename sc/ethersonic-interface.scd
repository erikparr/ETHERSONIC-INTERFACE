ServerOptions.devices; // all devices
Server.default.options.outDevice_("MixPre-6");
MIDIClient.init;
MIDIIn.connectAll;//connect the Midi keyboard

(
//Define your synth
SynthDef(\insert, { arg bus ;
    ReplaceOut.ar(bus, VSTPlugin.ar(In.ar(bus, 2), 2));
}).add;
)
// set current program number==
~vsti = VSTPluginController(Synth(\insert, [\bus, 0])).open("Kontakt", editor: true);
~vsti = VSTPluginController(Synth(\insert, [\bus, 0])).open("Omnisphere", editor: true);
~vsti.editor; // open the editor window
(
n = NetAddr("127.0.0.1", 57121); // local machine

~f1 = MIDIFunc.noteOn({arg veloc, pitch, chan;
	chan = 0;
    ~vsti.midi.noteOn(chan, pitch, veloc);
	pitch.postln;
	pitch.midinote.postln;
	n.sendMsg('/keyOn', pitch);
	// ~vsti2.midi.noteOn(chan, pitch, veloc);
});
~f2 = MIDIFunc.noteOff({arg veloc, pitch, chan;
	    var freq = pitch.midicps; // Convert MIDI note number to frequency
	chan =0;
    ~vsti.midi.noteOff(chan, pitch, veloc);
		n.sendMsg('/keyOff', pitch);
});
~f3 = MIDIFunc.cc({arg ...args;
			n.sendMsg('/transpose', 0);

}, 49); // match cc 1
)

~captureNotes = [];
OSCdef(\onPlay, {
  arg msg;
	msg[1].postln;
	~vsti.midi.noteOn(0, msg[1], 100);
}, '/keyOnPlay', n);
OSCdef(\offPlay, {
  arg msg;
	~vsti.midi.noteOff(0, msg[1], 0);
}, '/keyOffPlay', n);
OSCdef(\captureNotes, {
  arg msg;
	msg.postln;
	~captureNotes = msg.drop(1).asInteger;
("capture notes: " + ~captureNotes ).postln;
}, '/noteCapture', n);
)
	OSCdef(\captureNotes).clear; // remove all functions

~f1.free;
~f2.free;



(
var bpm = 88;
var notes = [ 48, 50, 51, 53, 55, 53, 51, 50 ];
var dur = 1/4;

// Initialize captureNotes with the default notes
~captureNotes = notes;

~pattern = Pseq([
    Pfunc({ ~captureNotes }, 6),
    Pfunc({ ~captureNotes }, 6),
    Pfunc({ ~captureNotes }, 6),
    Pfunc({ ~captureNotes }, 6),
], inf);


// Store the pattern in Pdef
w = Pdef(\pattern,  Pfunc({ ~captureNotes }, 6));

// Pbind object to play the melody
~rhythm1 = Pbind(
    \type, \vst_midi,
    \vst, ~vsti,
    \midinote, Pdef(\pattern), // Access the pattern stored in Pdef
    \dur, dur * 60 / bpm,
    \legato, 1,
    \amp, 1,
    \pan, Pstutter(2, Pwhite(-1, 1, inf))
).play;
)

~ rhythm1.stop










(
var bpm = 88;
var notes = [ 48, 50, 51, 53, 55, 53, 51, 50 ];
var dur = 1/4;



// Transpose pattern for the melody
~pattern = Pseq([
    Pseq(notes, 6),
	Pseq(~captureNotes, 6),
    Pseq(~captureNotes, 6),
    Pseq(~captureNotes, 6),
], inf);

// Pbind object to play the melody
~rhythm1 = Pbind(
	\type, \vst_midi,
	\vst, ~vsti,
	\midinote, ~pattern,
	\dur, dur * 60 / bpm,
	\legato, 1,
	\amp, 1,
	\pan, Pstutter(2, Pwhite(-1, 1, inf))
).play;
)
~rhythm1.stop;
