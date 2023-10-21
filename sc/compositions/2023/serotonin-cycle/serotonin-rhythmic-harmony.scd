
//CHORD RHYTHM
(
e = Env([2,1,0.1,1.5],[5,10,3], \sin);



~chordRhythm = Task({
	var	duration = 200; // duration, "loop time"

	var notes1 = [45, 52, 55];
	var notes2 = [41, 52, 55];
	var currentNotes = notes1; // Start with the first set of notes
	var stTime = Main.elapsedTime;
	var count = 0;
	var first = true;
	var waittime = 0.33;
	~vsti.midi.allNotesOff(0); // turn all notes off

	0.25.wait;
	inf.do{

		// change chord after 8
		(count % 8).postln;
		if ((count % 16)==0 && (first == false)) {
			currentNotes = if(currentNotes == notes1) { notes2 } { notes1 };
		};


		currentNotes.do { |note, index|
			~vsti.midi.noteOn(0, note, 70.rrand(100));
		};

		waittime.wait;
		currentNotes.do { |note, index|
			~vsti.midi.noteOff(0, note, 0);
		};
		count=count+1;
		first = false;
	}
}).stop;
)

~chordRhythm.play;
~chordRhythm.stop;
~chordRhythm.reset;
~vsti.midi.allNotesOff(0) // turn all notes off
