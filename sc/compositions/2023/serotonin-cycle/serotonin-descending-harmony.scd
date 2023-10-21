// PIGMENTS MACRO CONTROL
// param reference: param 1 = Macro 1, 2 = Macro 2, 3 = Macro 3, 4 = Macro 4
// ~vsti.gui
// ~lfo = {arg env=0; Out.kr(~ctrl1, env)}.play;
// ~lft.set(\env, EnvGen.kr(Env([0,1,1],[0.125,0.1], \sin)));
// ~lfo = {Out.kr(~ctrl1, EnvGen.kr(Env([0,1,1],[0.125,0.1], \sin)))}.play;

~ctrl1 = Bus.control;
~vsti.map(4, ~ctrl1); // find the number of the parameter you want to control and set it to the control bus
// ~vsti.unmap(4); // find the number of the parameter you want to control and set it to the control bus
// ~lfo.free;
// ~ctrl1.free;
(
SynthDef(\PigmentsMacro4, {
	arg start = 0, end = 1, dur = 1;
	var env;
	env = EnvGen.kr(
		Env([start,start,end], [(dur*0.01),dur*0.99], \sin),
		gate: \gate.tr,  // Responds to trigger impulses
		doneAction: 0
	);
	Out.kr(~ctrl1, env);
}).add;
)
// Create a Synth instance from the SynthDef
~macro4 = Synth(\PigmentsMacro4);
~macro4.set(\gate, 1, \start, 1.0, \end, 0.0);
~macro4.free;

(
// DESCENDING HARMONY

~chordDescending = Task({
	var	duration = 120; // duration, "loop time"
	var noteDur = 2.6;
	var notesList = [[45, 52, 55],[41, 52, 55],[38, 52, 55],[36, 52, 55]];
	var durList = [noteDur,noteDur,noteDur,noteDur];
	var stTime = Main.elapsedTime;
	var lastTarget = 1; // keep track of the previous waitTime and use it to set the envelope
	var chordIndex = 0;
	var durIndex = 0;
	~vsti.midi.allNotesOff(0); // turn all notes off

	1.wait;
	loop({
		var now = Main.elapsedTime - stTime;
		var waittime = durList[durIndex];
		var dur = waittime;
		var target = (waittime).clip(0.01,1); // set target attack to 2/3 of waittime
		(notesList[chordIndex]).postln;
		"chord index: " + chordIndex.postln;

		~macro4.set(\gate, 1, \start, lastTarget, \end, target, \dur, dur);


		notesList[chordIndex].do { |note, index|
			~vsti.midi.noteOn(0, note, 70.rrand(100));
		};


		postf(" waiting %\n ", waittime);
		waittime.wait;
		lastTarget = target;
		notesList[chordIndex].do { |note, index|
			~vsti.midi.noteOff(0, note, 70.rrand(100));
		};
		chordIndex = (chordIndex + 1) % notesList.size;
		durIndex = (durIndex + 1)% durList.size;
	});
});
)


~chordDescending.play;
~chordDescending.stop;
~chordDescending.reset;
~vsti.midi.allNotesOff(0) // turn all notes off