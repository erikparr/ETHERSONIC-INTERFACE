

// PIGMENTS MACRO CONTROL
// param reference: param 1 = Macro 1, 2 = Macro 2, 3 = Macro 3, 4 = Macro 4
// ~vsti.gui
~ctrl1 = Bus.control;
~lfo = {Out.kr(~ctrl1, SinOsc.kr(5, 0, 0.5, 0.5))}.play;
~vsti.map(4, ~ctrl1); // find the number of the parameter you want to control and set it to the control bus
~vsti.unmap(1); // find the number of the parameter you want to control and set it to the control bus
~lfo.free;



~glissandoMode = false;

~f1 = MIDIFunc.noteOn({arg veloc, pitch, chan;
	chan = 0;
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
		if(~glissandoMode == true, {
		n.sendMsg('/glissOff', chan, pitch);
	},{
    ~vsti.midi.noteOff(chan, pitch, veloc);
		n.sendMsg('/keyOff', chan, pitch);
	});

});

~f3 = MIDIFunc.cc({arg ...args;
			n.sendMsg('/transpose', 0);

}, 49); // match cc 49


~f4 = MIDIFunc.bend({ arg bendval, channel;
	channel =0;
	bendval.postln;
    ~vsti.midi.bend(channel, bendval);
});

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
// OSCdef(\glissandoMode).clear; // remove all functions

// OSCdef(\onPlay).clear; // remove all functions
// OSCdef(\onBend).clear; // remove all functions
// OSCdef(\offPlay).clear; // remove all functions
// ~f1.free;
// ~f2.free;
