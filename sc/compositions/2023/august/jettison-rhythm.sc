
(
c= 0.15;
e = Env([2,1,0.1],[5,10], \sin);
// e = Env([50.rrand(60),50.rrand(60),50.rrand(60),50.rrand(60),50.rrand(60),50.rrand(60)],[5,5,5,5,5]);

a = Env([0.5*c,0.5*c,2*c,0.5*c,0.5*c],[2,5,2,15]);
d = e.duration; // duration, "loop time"

~chordBurst = Task({
	var stTime = Main.elapsedTime;
	inf.do{
		var now = Main.elapsedTime - stTime;
		 var waittime = e.at(now);
		var ranNote = 0.rrand(1);
		var attack = e.at(now);
		var z;

		~vsti.midi.noteOn(0, 45, 70.rrand(100));
		~vsti.midi.noteOn(0, 48, 70.rrand(100));
		~vsti.midi.noteOn(0, 52, 70.rrand(100));
		~vsti.midi.noteOn(0, 55, 70.rrand(100));
		// m.sendMsg(second, attack); // note off (velocity set to 0)
		// m.sendMsg(third, attack); // note on (velocity set to 100)
		if (now > d) {
			now = now - d;
			stTime = Main.elapsedTime - now;
		};
		postf(" waiting %\n ", waittime);
		waittime.wait;
		~vsti.midi.noteOff(0, 45, 0);
		~vsti.midi.noteOff(0, 48, 0);
		~vsti.midi.noteOff(0, 52, 0);
		~vsti.midi.noteOff(0, 55, 0);
	}
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

