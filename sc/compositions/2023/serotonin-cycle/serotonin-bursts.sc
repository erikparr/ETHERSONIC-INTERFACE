
// PIGMENTS MACRO CONTROL
// param reference: param 1 = Macro 1, 2 = Macro 2, 3 = Macro 3, 4 = Macro 4
// ~vsti.gui

~ctrl1 = Bus.control;
~lfo = {Out.kr(~ctrl1, SinOsc.kr(5, 0, 0.5, 0.5))}.play;
~lfo = {Out.kr(~ctrl1, EnvGen.kr(Env([0,1,1],[0.125,0.1], \sin)))}.play;
~vsti.map(4, ~ctrl1); // find the number of the parameter you want to control and set it to the control bus
~vsti.unmap(1); // find the number of the parameter you want to control and set it to the control bus
~lfo.free;
~ctrl1.free;



// Start the task
~task.start;
)

// Stop the task when done
~task.stop;



~currentNotes = [45, 48, 52, 55];
~currentNotes = [41, 45, 52, 55];
(
~vsti.midi.noteOn(0, ~currentNotes[0], 70.rrand(100));
~vsti.midi.noteOn(0, ~currentNotes[1], 70.rrand(100));
~vsti.midi.noteOn(0, ~currentNotes[2], 70.rrand(100));
~vsti.midi.noteOn(0, ~currentNotes[3], 70.rrand(100));
)
~vsti.midi.allNotesOff(0) // turn all notes off

(
// apex-sc-CTRL
~notes1 = [45, 48, 52, 55];
~notes2 = [41, 45, 52, 55];

//make sure notes are off
e = Env([3,3,2,0.1,1.0],[2,4,10,2], \sin);
~vsti.midi.noteOn(0, ~notes1[0], 70.rrand(100));
~vsti.midi.noteOn(0, ~notes1[1], 70.rrand(100));
~vsti.midi.noteOn(0, ~notes1[2], 70.rrand(100));
~vsti.midi.noteOn(0, ~notes1[3], 70.rrand(100));

~chordBurst = Task({
	var count = 0;
	var	startTime = SystemClock.seconds;
	var	duration = e.duration; // duration, "loop time"
	var stTime = Main.elapsedTime;

	1.wait;
	loop({
		var now = Main.elapsedTime - stTime;
		var waittime = e.at(now);
		var attack = (e.at(now))/4;
		var sus = (e.at(now))/2;

		~lfo = {Out.kr(~ctrl1, EnvGen.kr(Env([0,1,1,0],[attack,sus,attack], \sin)))}.play;

		if (now > duration) {
			count = count+1;
			now = now - duration;
			stTime = Main.elapsedTime - now;
			~vsti.midi.allNotesOff(0); // turn all notes off
			1.wait;
			if((count%2==0),{
				~vsti.midi.noteOn(0, ~notes1[0], 70.rrand(100));
				~vsti.midi.noteOn(0, ~notes1[1], 70.rrand(100));
				~vsti.midi.noteOn(0, ~notes1[2], 70.rrand(100));
				~vsti.midi.noteOn(0, ~notes1[3], 70.rrand(100));
				0.5.wait;
			},{
				~vsti.midi.noteOn(0, ~notes2[0], 70.rrand(100));
				~vsti.midi.noteOn(0, ~notes2[1], 70.rrand(100));
				~vsti.midi.noteOn(0, ~notes2[2], 70.rrand(100));
				~vsti.midi.noteOn(0, ~notes2[3], 70.rrand(100));
				0.5.wait;
			});


		};
		postf(" waiting %\n ", waittime);
		waittime.wait;
	});
});
)

~vsti.midi.allNotesOff(0) // turn all notes off
~lfo.free;

~chordBurst.play;
~chordBurst.stop;
~chordBurst.reset;
(
// CHORD BRURST INTRO
e = Env([4,4,2,0.1,1.0],[8,10,9,3], \sin);
//part 2
// e = Env([0.1,0.55],[10], \sin);


i = 0;
~chordBurst = Task({
	var	duration = e.duration; // duration, "loop time"

	var notes1 = [45, 48, 52, 55];
	var notes2 = [41, 45, 52, 55];
	var currentNotes = notes1; // Start with the first set of notes
	//tendency
	var tendDur;
	var	startTime = SystemClock.seconds;
	var tend = Pfunc({arg timeIn = 0;
		Tendency.new(
			Env([4,4,2,0.1,0.125,0.125],[8,10,9,5,60], \sin),
			Env([4,4,2,0.1,0.09,0.08],[8,10,9,5,60], \sin), defDist:\betaRand).at(timeIn)
	}).asStream;
	// Tendency.new(
	// 	Env([0.1, 0.145], [45], \sin),
	// Env([0.1,0.1], [45], \sin), defDist:\betaRand).at(timeIn)
	// }).asStream;

	var stTime = Main.elapsedTime;
	0.25.wait;
	loop({
		var now = Main.elapsedTime - stTime;
		var waittime = e.at(now);
		var attack = e.at(now);
		tendDur = tend.next(now);


		currentNotes.do { |note, index|
			~vsti.midi.noteOn(0, note, 70.rrand(100));
		};

		if (now > duration) {
			i = i+1;

			now = now - duration;
			stTime = Main.elapsedTime - now;

			// change durations after 8
			if (i == 8) {
				duration = 90;
				waittime = tendDur;
				//				e = Env([4,4,2,0.1,1.0],[2,10,9,3], \sin);
			};

			// Switch to the other set of notes
			// currentNotes = if(currentNotes == notes1) { notes2 } { notes1 };
			// e = Env([4,4,2,0.1,1.0],[2,10,9,3], \sin);

		};
		postf(" waiting %\n ", waittime);
		waittime.wait;
		// tendDur.wait;
		currentNotes.do{|note| ~vsti.midi.noteOff(0, note, 0); }
	});
});
)


~chordBurst.play;
~chordBurst.stop;
~chordBurst.reset;

// formants

(
// part 1
e = Env([0.7,0.3],[10], \sin);
//part 2
// e = Env([0.1,0.55],[10], \sin);


i = 0;
~chordBurst = Task({
	var	duration = e.duration; // duration, "loop time"

	var notes1 = [45, 48, 52, 55];
	var notes2 = [41, 45, 52, 55];
	var currentNotes = notes1; // Start with the first set of notes
	//tendency
	var tendDur;
	var	startTime = SystemClock.seconds;
	var tend = Pfunc({arg timeIn = 0;
		var times = [1,4.5,2.5,10];
		Tendency.new(
			Env([0.1,0.1,0.125,0.125],times, \sin),
			Env([0.1,0.1,0.09,0.08],times, \sin), defDist:\betaRand).at(timeIn)
	}).asStream;
	// Tendency.new(
	// 	Env([0.1, 0.145], [45], \sin),
	// Env([0.1,0.1], [45], \sin), defDist:\betaRand).at(timeIn)
	// }).asStream;

	var stTime = Main.elapsedTime;
	var dLow = 10; // dynamics
	var dHigh = 20;
	0.25.wait;
	loop({
		var now = Main.elapsedTime - stTime;
		var waittime = e.at(now);
		var attack = e.at(now);
		tendDur = tend.next(now);

		~vsti.midi.noteOn(0, currentNotes[0], dLow.rrand(dHigh));
		~vsti.midi.noteOn(0, currentNotes[1], dLow.rrand(dHigh));
		~vsti.midi.noteOn(0, currentNotes[2], dLow.rrand(dHigh));
		~vsti.midi.noteOn(0, currentNotes[3], dLow.rrand(dHigh));

		if (now > duration) {
			i = i+1;

			now = now - duration;
			stTime = Main.elapsedTime - now;

			// change durations after 8
			if (i == 8) {
				duration = 90;
				waittime = tendDur;
				//				e = Env([4,4,2,0.1,1.0],[2,10,9,3], \sin);
			};

			// Switch to the other set of notes
			// currentNotes = if(currentNotes == notes1) { notes2 } { notes1 };
			// e = Env([4,4,2,0.1,1.0],[2,10,9,3], \sin);

		};
		postf(" waiting %\n ", waittime);
		waittime.wait;
		// tendDur.wait;
		currentNotes.do{|note| ~vsti.midi.noteOff(0, note, 0); }
	});
});
)


~chordBurst.play;
~chordBurst.stop;
~chordBurst.reset;


(
~tendency = Task({
	var dur;
	// looping Tendency mask
	var	wordStart = SystemClock.seconds;
	var looptime=10;
	var tend = Pfunc({arg timeIn = 0;
		Tendency.new(
			Env([0.1,0.5,0.05], [looptime/2, looptime/2], \sin),
			Env([0.1,0.1,0.01], [looptime/2, looptime/2], \sin), defDist:\betaRand).at(timeIn)
	}).asStream;
	loop ({
		dur = tend.next((SystemClock.seconds - wordStart) % 10.0).postln;
		~vsti.midi.noteOn(0, 60.rrand(61), 25.rrand(100));
		dur.wait;
	});

});
)
~tendency.play;
~tendency.stop;
~tendency.reset;
~tendency.free

