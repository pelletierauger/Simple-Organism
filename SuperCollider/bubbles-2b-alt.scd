s.quit;
s.boot;
s.plotTree;

(
~sourceGroup = Group.new;
~fxGroup = Group.after(~sourceGroup);
~reverbBus = Bus.audio(s, 2);
~wahwahBus = Bus.audio(s, 2);
)

e = NumRunningSynths.ir;
e;

(
SynthDef.new(\bubble, {
    arg out, freq = 220, lon = 3, lfoFreq = 6, amp = 1;
    var sig, sig2, lin, lin2, lfo, linUp;
    lin = XLine.kr(1, 0.0001, lon, doneAction: 2);
    linUp = XLine.kr(0.0001, 1, lon * 0.5, doneAction: 0);
    // lin2 = Line.kr(1, 0, lon, don
    lfo = SinOsc.kr(lfoFreq);
    lin2 = XLine.kr(0.001, 0.1, 0.5, doneAction: 0);
    freq = freq * max(1, linUp + 0.99);
    sig = LFTri.ar([freq/2, freq/2+2]) * (12 / lon);
    sig2 = SinOsc.ar([freq*1.01, freq*1.01+2]) * (12 / lon);
    sig = (sig /2) + (sig2/2);
    sig = sig * lin * lin2 * lfo;
    sig = sig * amp;
    Out.ar(out, sig);
}).add;
)


(
SynthDef.new(\reverb, {
    arg in, out = 0;
    var sig, del;
    sig = In.ar(in, 2);
    del = CombC.ar(in: sig,
        maxdelaytime: 0.5,
        delaytime: [0.25, 0.26],
        decaytime: 20,
        mul: 1, add: 0);
    sig = sig + (del * 0.25);
    // sig = FreeVerb.ar(sig, 0.5, 0.8, 0.001);
    Out.ar(out, sig);
}).add;
)
y.free;
y = Synth.new(\reverb, [\in, ~reverbBus], ~fxGroup);

~b1 = Buffer.read(s, "/Users/guillaumepelletier/Desktop/Dropbox/Création musicale/Max/Piano/Samples/21055__samulis__vsco-2-ce-keys-upright-piano/374289__samulis__upright-piano-c-5-player-dyn1-rr1-026.wav");
~b0 = Buffer.read(s, "/Users/guillaumepelletier/Desktop/Dropbox/Création musicale/Max/Piano/Samples/21055__samulis__vsco-2-ce-keys-upright-piano/374286__samulis__upright-piano-c-4-player-dyn1-rr1-020.wav");

(
SynthDef(\bpfbuff, {
    arg out = 0, buf = ~b1,
    rate = 1, spos = 0,
    pan = 1, amp = 1, lon = 0.75,
    atk = 0.01;
    var sig, env, lfo;
    var a = rate < 0.5;
    buf = Select.kr(rate < 0.5, [~b1, ~b0]);
    amp = Select.kr(rate < 0.5, [amp, amp * 2]);
    rate = Select.kr(rate < 0.5, [rate, rate * 2]);
    env = EnvGen.kr(Env.new([0, 1, 0.5, 0], [atk, 0.15, lon]), doneAction: 2);
    sig = PlayBuf.ar(2, buf, rate * BufRateScale.ir(buf), startPos: spos);
    sig = sig * env * amp;
    sig = Balance2.ar(sig[0], sig[1], pan, 1);
    Out.ar(out, sig);
}).add;
)

~vol = PatternProxy(Pn(0.001, inf));
~vol.source = Pn(3.5, inf);

~pFund = PatternProxy(Pn(220, inf));
~pFund.source = Pn(220), inf);

(
p.stop;
p = Pbind(
    \instrument, \bubble,
    \out, ~reverbBus,
    \dur, Pseq([5, 0.125, 0.0125], inf),
    \freq, Prand([ 0, 2, 3, 5, 7, 8, 10 ], inf).midiratio * ~pFund * Prand([1, 2, 4], inf),
    \lon, Pwhite(0.15, 12, inf),
    \amp, Pseq([~vol], inf),
    \lfoFreq, Pwhite(0.15, 6, inf)
).play;
)


Scale.minor.degrees;