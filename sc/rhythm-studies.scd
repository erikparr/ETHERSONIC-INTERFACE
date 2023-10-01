

(
var bpm = 88;
var notes = [ 48, 50, 51, 53, 55, 53, 51, 50 ];
var dur = 1/4;

// Initialize captureNotes with the default notes
~captureNotes = notes;

// Define a function that returns the current notes
~getCurrentNotes = { ~captureNotes };

// Create a Pfunc that updates the pattern with the current notes
~pattern = Pfunc({ ~captureNotes });

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

// Function to update the captureNotes variable
~updateNotes = {
    arg newNotes;
    ~captureNotes = newNotes;
};
// Call the updateNotes function with new notes to update the melody

)
~rhythm1.stop

~rhythm1.play
~rhythm1.stop



// play all the notes in teh list at once for a chord like rhythmic pattern
(
var bpm = 88;
var notes = [ 48, 50, 51, 53, 55, 53, 51, 50 ];
var dur = 1/4;

// Initialize captureNotes with the default notes
~captureNotes = notes;

~pattern = Pseq([
    Pfunc({ ~captureNotes }, inf),
], inf);


// Store the pattern in Pdef
w = Pdef(\patternX,  Pfunc({ ~captureNotes }, 6));

// Pbind object to play the melody
~rhythm1 = Pbind(
    \type, \vst_midi,
    \vst, ~vsti,
    \midinote, Pdef(\patternX).play, // Access the pattern stored in Pdef
    \dur, dur * 60 / bpm,
    \legato, 1,
    \amp, 1,
    \pan, Pstutter(2, Pwhite(-1, 1, inf))
).play;
)
~rhythm1.stop
~updateNotes = ~captureNotes;
(
var bpm = 88;
var notes = [  50,52 ];
var dur = 1/4;

// Initialize captureNotes with the default notes
~captureNotes = notes;
~pattern = Pseq(~captureNotes, inf);
// Store the pattern in Pdef
Pdef(\pattern, ~pattern);

// Pbind object to play the melody
~rhythm1.stream = Pbind(
    \type, \vst_midi,
    \vst, ~vsti,
    \midinote, Pdef(\pattern), // Access the pattern stored in Pdef
    \dur, dur * 60 / bpm,
    \legato, 1,
    \amp, 1,
    \pan, Pstutter(2, Pwhite(-1, 1, inf))
).asStream;
)

~rhythm1.stop
(
t = Routine({
    arg notes, bpm, dur;
    // Initialize captureNotes with the default notes
    ~captureNotes = notes;
    ~pattern = Pseq(~captureNotes, inf);
    // Store the pattern in Pdef
    Pdef(\pattern, ~pattern);

    // Pbind object to play the melody
    ~rhythm1.stream = Pbind(
        \type, \vst_midi,
        \vst, ~vsti,
        \midinote, Pdef(\pattern), // Access the pattern stored in Pdef
        \dur, dur * 60 / bpm,
        \legato, 1,
        \amp, 1,
        \pan, Pstutter(2, Pwhite(-1, 1, inf))
    ).asStream;

    // Wait for the pattern to finish playing before exiting the task


});
)
t.value([40,58], 88, 1/4);
(
var bpm = 108;
var notes = [
55,
55,
55,
60,
60,
60,
55,
55,
55,
60,
60,
60,
55,
55,
60,
60,
53,
53,
53,
58,
58,
58,
53,
53,
53,
58,
58,
58,
53,
53,
58,
58];
var dur = 1/4;



// Transpose pattern for the melody
~pattern = Pseq([
	Pseq(notes, 4),
	Pseq(~captureNotes, 4),
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
