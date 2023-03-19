


ServerOptions.devices; // all devices
Server.default.options.outDevice_("MixPre-6");



//Setup:
//connect the Midi keyboard
MIDIClient.init;
MIDIIn.connectAll;

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

)

(
OSCdef(\onPlay, {
  arg msg;
	msg[1].postln;
	~vsti.midi.noteOn(0, msg[1], 100);
}, '/keyOnPlay', n);
OSCdef(\offPlay, {
  arg msg;
	~vsti.midi.noteOff(0, msg[1], 0);
}, '/keyOffPlay', n);
)

~f1.free;
~f2.free;
