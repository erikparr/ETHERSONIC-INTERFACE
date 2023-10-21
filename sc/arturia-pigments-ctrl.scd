// Pigments control
~vsti.editor

~vsti.gui
// param reference: param 1 = Macro 1, 2 = Macro 2, 3 = Macro 3, 4 = Macro 4
~ctrl1 = Bus.control;
~lfo = {Out.kr(~ctrl1, SinOsc.kr(5, 0, 0.5, 0.5))}.play;
~vsti.map(1, ~ctrl1); // find the number of the parameter you want to control and set it to the control bus
~vsti.unmap(1); // find the number of the parameter you want to control and set it to the control bus
~lfo.free;
