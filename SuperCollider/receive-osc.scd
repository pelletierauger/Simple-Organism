s.boot;
s.quit;

(
SynthDef.new(\pulseTest, {
    arg freq = 220;
    var sig1, sig2, lfo, lfo2, env;
    env = XLine.kr(0.05, 0.001, 3, 1, 0, 2);
    lfo = SinOsc.kr(3);
    lfo2 = SinOsc.kr(ExpRand(20,800), mul: 0.75, add:1);
    env = env * lfo;
    sig1 = LFTri.ar((freq + 1)) * env;
    sig2 = LFTri.ar(freq) * env;
    sig1 = FreeVerb.ar(sig1, mix: 0.3, room: 0.95, damp: 0.15, mul: 1, add: 0);
	sig2 = FreeVerb.ar(sig2, mix: 0.3, room: 0.95, damp: 0.15, mul: 1, add: 0);
    Out.ar(0, sig1);
    Out.ar(1, sig2);
}).add;
)

(
~fundamental = 220;
~degrees = [0, 4, 7];
)

(
~fundamental = 246.94;
~degrees = [0, 3, 7];
)

(
OSCdef.new(
    \fromnode,
    {
        arg msg, time, addr, port;
        // [msg, time, addr, port].postln;
        // msg[1].postln;
        ~octave = [ 0.5, 1, 2 ].wchoose([0.01, 0.45, 0.45].normalizeSum);
        e = ~degrees.choose.midiratio * ~fundamental * ~octave;
        f = exprand(0.15, 6);
        if (~octave == 0.5, {
            l = exprand(0.5, 2.0);
        }, {
            l = exprand(0.01, 0.05);
        });

        // d = Synth.new(\pinkTest, [\frequency, msg[1] * 2]);
		d = Synth.new(\bubble, [\freq, e, \lfoFreq, f, \lon, l, \amp, 12, \out, ~reverbBus]);
        ~piano = Synth.new(\bpfbuff,
            [\rate, e / 220,
                \lfoFreq, f,
                \lon, l,
                \amp, 7,
                \out, ~reverbBus,
                \pan, rrand(-1.0, 1.0)
        ]);
    },
    '/hello/from/oscjs'
);
)


