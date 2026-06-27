/**
 * Tiny Web Audio sound engine. No audio files, no external assets: every effect
 * is synthesized from short oscillator envelopes (with brief filtered noise for
 * the fizzle/poof), kept soft and brief.
 *
 * Sound effects are always on. Browsers still require a user gesture before audio
 * can start, so the AudioContext is unlocked on the first pointer/key interaction;
 * nothing plays before then.
 */

export type SoundName =
  | "correct"
  | "wrong"
  | "badge"
  | "wizard"
  | "meow"
  | "tower"
  | "complete"
  | "thinking";

let armed = false;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Arm a one-time gesture unlock so the AudioContext can start (autoplay policy). */
function arm(): void {
  if (armed || !isBrowser()) return;
  armed = true;
  const unlock = () => ensureContext();
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock, { passive: true });
}

function ensureContext(): AudioContext | null {
  if (!isBrowser()) return null;
  if (!ctx) {
    const AC: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.18; // soft master ceiling
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

interface ToneOpts {
  freq: number;
  type?: OscillatorType;
  dur?: number;
  delay?: number;
  gain?: number;
  /** Glide the pitch to this frequency over the note (a soft bend). */
  slideTo?: number;
  attack?: number;
  /** Optional lowpass cutoff to warm up harsh waveforms (e.g. sawtooth). */
  lowpass?: number;
}

function tone(c: AudioContext, dest: GainNode, o: ToneOpts): void {
  const t0 = c.currentTime + (o.delay ?? 0);
  const dur = o.dur ?? 0.2;
  const peak = o.gain ?? 0.5;
  const attack = o.attack ?? 0.008;

  const osc = c.createOscillator();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.slideTo), t0 + dur);

  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

  let head: AudioNode = osc;
  if (o.lowpass) {
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = o.lowpass;
    osc.connect(lp);
    head = lp;
  }
  head.connect(g);
  g.connect(dest);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

/** Short noise burst through a sweeping lowpass: a soft "fizzle". */
function noiseFizzle(c: AudioContext, dest: GainNode): void {
  const t0 = c.currentTime;
  const dur = 0.22;
  const src = c.createBufferSource();
  src.buffer = getNoiseBuffer(c);
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(1400, t0);
  lp.frequency.exponentialRampToValueAtTime(280, t0 + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(lp);
  lp.connect(g);
  g.connect(dest);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

/** Tiny airy noise puff. */
function noisePoof(c: AudioContext, dest: GainNode): void {
  const t0 = c.currentTime;
  const dur = 0.16;
  const src = c.createBufferSource();
  src.buffer = getNoiseBuffer(c);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1300;
  bp.Q.value = 0.6;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.13, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(bp);
  bp.connect(g);
  g.connect(dest);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

/**
 * A cute pixel-cat "mew". A harmonically rich sawtooth is shaped by two sweeping
 * vocal formants (a bandpass + a peaking resonance) so it sounds like an animal
 * voice, not a beep. The pitch chirps up then falls, the vowel opens then closes,
 * and a little vibrato fades in. Total ~0.44s, soft.
 */
function catMeow(c: AudioContext, dest: GainNode): void {
  const t0 = c.currentTime;
  const dur = 0.44;

  const osc = c.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(560, t0);
  osc.frequency.exponentialRampToValueAtTime(880, t0 + 0.12); // chirp up
  osc.frequency.exponentialRampToValueAtTime(440, t0 + 0.42); // fall to the "ow"

  // Vibrato fades in for a lively, animal feel.
  const lfo = c.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 24;
  const lfoDepth = c.createGain();
  lfoDepth.gain.setValueAtTime(0, t0);
  lfoDepth.gain.linearRampToValueAtTime(18, t0 + 0.16);
  lfo.connect(lfoDepth);
  lfoDepth.connect(osc.frequency);

  // Vowel-like formant sweep ("ee" -> "ow"): the key to sounding catlike.
  const f1 = c.createBiquadFilter();
  f1.type = "bandpass";
  f1.Q.value = 5;
  f1.frequency.setValueAtTime(800, t0);
  f1.frequency.exponentialRampToValueAtTime(1900, t0 + 0.12);
  f1.frequency.exponentialRampToValueAtTime(760, t0 + 0.42);

  const f2 = c.createBiquadFilter();
  f2.type = "peaking";
  f2.Q.value = 6;
  f2.gain.value = 9;
  f2.frequency.setValueAtTime(1500, t0);
  f2.frequency.exponentialRampToValueAtTime(2600, t0 + 0.12);
  f2.frequency.exponentialRampToValueAtTime(1300, t0 + 0.42);

  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.24, t0 + 0.03); // short attack
  g.gain.exponentialRampToValueAtTime(0.16, t0 + 0.22);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); // smooth decay

  osc.connect(f1);
  f1.connect(f2);
  f2.connect(g);
  g.connect(dest);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
  lfo.start(t0);
  lfo.stop(t0 + dur + 0.03);
}

const RECIPES: Record<SoundName, (c: AudioContext, d: GainNode) => void> = {
  // Excited rising chime with a high sparkle on top.
  correct: (c, d) => {
    tone(c, d, { freq: 784, type: "triangle", dur: 0.12, gain: 0.42 });
    tone(c, d, { freq: 1047, type: "triangle", dur: 0.14, delay: 0.08, gain: 0.42 });
    tone(c, d, { freq: 1568, type: "sine", dur: 0.22, delay: 0.16, gain: 0.26 });
  },
  // Soft low fizzle: a gentle dip plus a quiet noise wash.
  wrong: (c, d) => {
    tone(c, d, { freq: 200, type: "sine", dur: 0.2, gain: 0.32, slideTo: 130 });
    noiseFizzle(c, d);
  },
  // Bright four-note arpeggio fanfare.
  badge: (c, d) => {
    [523, 659, 784, 1047].forEach((f, i) =>
      tone(c, d, { freq: f, type: "triangle", dur: 0.18, delay: i * 0.09, gain: 0.4 })
    );
  },
  // Small poof with a rising chime: the wizard appears.
  wizard: (c, d) => {
    noisePoof(c, d);
    tone(c, d, { freq: 880, type: "sine", dur: 0.26, delay: 0.04, gain: 0.3, slideTo: 1320 });
  },
  // Cute pixel-cat mew (see catMeow). Prefer playCatMeow() for the cooldown.
  meow: (c, d) => catMeow(c, d),
  // Soft magical hum with a faint sparkle tick (the wizard is thinking).
  thinking: (c, d) => {
    tone(c, d, { freq: 330, type: "sine", dur: 0.5, gain: 0.16, slideTo: 360 });
    tone(c, d, { freq: 660, type: "sine", dur: 0.5, gain: 0.05 });
    tone(c, d, { freq: 1400, type: "sine", dur: 0.08, delay: 0.2, gain: 0.1 });
  },
  // Battle/flight start: a low thump under a brassy ascending call.
  tower: (c, d) => {
    tone(c, d, { freq: 150, type: "sine", dur: 0.36, gain: 0.5, slideTo: 64 });
    tone(c, d, { freq: 392, type: "sawtooth", dur: 0.14, gain: 0.22, lowpass: 2200 });
    tone(c, d, { freq: 523, type: "sawtooth", dur: 0.14, delay: 0.12, gain: 0.22, lowpass: 2200 });
    tone(c, d, { freq: 659, type: "sawtooth", dur: 0.52, delay: 0.24, gain: 0.24, lowpass: 2400 });
  },
  // Short triumphant motif.
  complete: (c, d) => {
    [523, 659, 784].forEach((f, i) =>
      tone(c, d, { freq: f, type: "triangle", dur: 0.16, delay: i * 0.1, gain: 0.42 })
    );
    tone(c, d, { freq: 1047, type: "triangle", dur: 0.3, delay: 0.3, gain: 0.42 });
  },
};

export function playSound(name: SoundName): void {
  arm();
  const c = ensureContext();
  if (!c || !master) return;
  try {
    RECIPES[name](c, master);
  } catch {
    /* ignore audio failures */
  }
}

let lastMeowAt = 0;
const MEOW_COOLDOWN_MS = 150;

/** Play the cute cat mew, with a small cooldown so rapid clicks do not spam it. */
export function playCatMeow(): void {
  arm();
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - lastMeowAt < MEOW_COOLDOWN_MS) return;
  lastMeowAt = now;
  const c = ensureContext();
  if (!c || !master) return;
  try {
    catMeow(c, master);
  } catch {
    /* ignore audio failures */
  }
}

/* ---------------- avatar aura sounds ---------------- */

export type AuraKind = "hearts" | "lightning" | "circles" | "orbit" | "starburst" | "rune-ring";

/** Each aura sound is ~4s (2s swell up, 2s down) and loops continuously. */
const AURA_CYCLE_MS = 4000;

/**
 * A whip crack to the ground: a quick rising air "swish" (the whip slicing
 * through the air) that snaps into a razor-sharp bright crack. No bass. `when`
 * offsets it within the cycle so several can fire in a row.
 */
function whipCrack(c: AudioContext, dest: GainNode, when: number): void {
  const t0 = c.currentTime + when;
  const swishDur = 0.12;

  // Swish: rising bandpassed noise, building toward the snap.
  const swish = c.createBufferSource();
  swish.buffer = getNoiseBuffer(c);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 1.2;
  bp.frequency.setValueAtTime(700, t0);
  bp.frequency.exponentialRampToValueAtTime(4200, t0 + swishDur);
  const sg = c.createGain();
  sg.gain.setValueAtTime(0.0001, t0);
  sg.gain.exponentialRampToValueAtTime(0.2, t0 + swishDur * 0.7);
  sg.gain.exponentialRampToValueAtTime(0.0001, t0 + swishDur + 0.01);
  swish.connect(bp);
  bp.connect(sg);
  sg.connect(dest);
  swish.start(t0);
  swish.stop(t0 + swishDur + 0.04);

  // CRACK: a razor-sharp, bright snap right at the end of the swish.
  const ct = t0 + swishDur;
  const crack = c.createBufferSource();
  crack.buffer = getNoiseBuffer(c);
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 3500;
  const cg = c.createGain();
  cg.gain.setValueAtTime(0.0001, ct);
  cg.gain.exponentialRampToValueAtTime(0.68, ct + 0.001); // instant, loud snap
  cg.gain.exponentialRampToValueAtTime(0.0001, ct + 0.07);
  crack.connect(hp);
  hp.connect(cg);
  cg.connect(dest);
  crack.start(ct);
  crack.stop(ct + 0.09);

  // A bright zap edge to sharpen the snap.
  const zap = c.createOscillator();
  zap.type = "sawtooth";
  zap.frequency.setValueAtTime(3000, ct);
  zap.frequency.exponentialRampToValueAtTime(1100, ct + 0.04);
  const zg = c.createGain();
  zg.gain.setValueAtTime(0.0001, ct);
  zg.gain.exponentialRampToValueAtTime(0.22, ct + 0.001);
  zg.gain.exponentialRampToValueAtTime(0.0001, ct + 0.05);
  zap.connect(zg);
  zg.connect(dest);
  zap.start(ct);
  zap.stop(ct + 0.07);

  // Booming low-mid impact for weight and loudness (punchy, not deep bass).
  const boom = c.createOscillator();
  boom.type = "sine";
  boom.frequency.setValueAtTime(180, ct);
  boom.frequency.exponentialRampToValueAtTime(80, ct + 0.18);
  const bg = c.createGain();
  bg.gain.setValueAtTime(0.0001, ct);
  bg.gain.exponentialRampToValueAtTime(0.45, ct + 0.004);
  bg.gain.exponentialRampToValueAtTime(0.0001, ct + 0.26);
  boom.connect(bg);
  bg.connect(dest);
  boom.start(ct);
  boom.stop(ct + 0.3);

  const body = c.createBufferSource();
  body.buffer = getNoiseBuffer(c);
  const blp = c.createBiquadFilter();
  blp.type = "lowpass";
  blp.frequency.value = 380;
  const bog = c.createGain();
  bog.gain.setValueAtTime(0.0001, ct);
  bog.gain.exponentialRampToValueAtTime(0.3, ct + 0.006);
  bog.gain.exponentialRampToValueAtTime(0.0001, ct + 0.24);
  body.connect(blp);
  blp.connect(bog);
  bog.connect(dest);
  body.start(ct);
  body.stop(ct + 0.28);
}

/** A swelling pad note (slow attack, hold, release) for warm/holy/deep auras. */
function pad(
  c: AudioContext,
  dest: GainNode,
  freq: number,
  opts: { type?: OscillatorType; dur: number; gain: number; delay?: number; attack?: number; release?: number }
): void {
  const t0 = c.currentTime + (opts.delay ?? 0);
  const dur = opts.dur;
  const peak = opts.gain;
  const atk = opts.attack ?? 0.3;
  const rel = opts.release ?? 0.4;
  const o = c.createOscillator();
  o.type = opts.type ?? "sine";
  o.frequency.value = freq;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + atk);
  g.gain.setValueAtTime(peak, t0 + Math.max(atk, dur - rel));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g);
  g.connect(dest);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

const AURA: Record<AuraKind, (c: AudioContext, d: GainNode) => void> = {
  // Sweet, warm music-box melody that rises then settles (loving).
  hearts: (c, d) => {
    pad(c, d, 261.63, { type: "sine", dur: 4, gain: 0.05, attack: 1.6, release: 2 }); // warm bed
    [392, 523, 659, 784, 659, 523, 440, 523].forEach((f, i) =>
      tone(c, d, { freq: f, type: "triangle", dur: 0.55, delay: i * 0.5, gain: 0.08 })
    );
  },
  // Booming whip cracks: 4 in quick succession, then a pause (the cycle repeats).
  lightning: (c, d) => {
    [0, 0.3, 0.6, 0.92].forEach((t) => whipCrack(c, d, t));
  },
  // A warm, glowing chord (a fifth + octave).
  circles: (c, d) => {
    pad(c, d, 196.0, { type: "triangle", dur: 4, gain: 0.1, attack: 2, release: 2 });
    pad(c, d, 293.66, { type: "triangle", dur: 4, gain: 0.07, attack: 2, release: 2 });
    pad(c, d, 392.0, { type: "sine", dur: 4, gain: 0.06, attack: 2, release: 2 });
  },
  // Slow melodic twinkles rising then falling.
  orbit: (c, d) => {
    [880, 1046, 1318, 1568, 1760, 1568, 1318, 1046].forEach((f, i) =>
      tone(c, d, { freq: f, type: "sine", dur: 0.5, delay: i * 0.5, gain: 0.07 })
    );
  },
  // Holy, choir/organ-like major chord that swells.
  starburst: (c, d) => {
    pad(c, d, 130.81, { type: "sine", dur: 4, gain: 0.06, attack: 2, release: 2 });
    pad(c, d, 261.63, { type: "triangle", dur: 4, gain: 0.08, attack: 2, release: 2 });
    pad(c, d, 329.63, { type: "triangle", dur: 4, gain: 0.07, attack: 2, release: 2 });
    pad(c, d, 392.0, { type: "triangle", dur: 4, gain: 0.07, attack: 2, release: 2 });
    pad(c, d, 523.25, { type: "sine", dur: 4, gain: 0.04, attack: 2.2, release: 1.8 });
  },
  // Deep and mysterious: a dark drone with a tritone.
  "rune-ring": (c, d) => {
    pad(c, d, 49, { type: "sine", dur: 4, gain: 0.14, attack: 2, release: 2 });
    pad(c, d, 98, { type: "sine", dur: 4, gain: 0.1, attack: 2, release: 2 });
    pad(c, d, 138.59, { type: "sine", dur: 4, gain: 0.07, attack: 2.2, release: 1.8 });
  },
};

let auraTimer: number | null = null;

/** Play one aura sound (~4s, slow swell up and down) — e.g. when selected or tapped. */
export function playAura(kind: AuraKind): void {
  arm();
  const c = ensureContext();
  if (!c || !master) return;
  try {
    AURA[kind](c, master);
  } catch {
    /* ignore audio failures */
  }
}

/** Loop the aura sound continuously while hovering (each ~4s, swelling up/down). */
export function startAuraLoop(kind: AuraKind): void {
  stopAuraLoop();
  playAura(kind);
  if (typeof window === "undefined") return;
  auraTimer = window.setInterval(() => playAura(kind), AURA_CYCLE_MS);
}

/** Stop the looping aura sound (e.g. when the cursor leaves the preview). */
export function stopAuraLoop(): void {
  if (auraTimer !== null) {
    clearInterval(auraTimer);
    auraTimer = null;
  }
}

/* ---------------- looping battle music (tower) ---------------- */

const TEMPO = 132;
const SECONDS_PER_BEAT = 60 / TEMPO;
const STEP_DUR = SECONDS_PER_BEAT / 2; // eighth notes
const STEPS_PER_BAR = 8;

// A short, driving minor progression (i - VI - III - VII in A minor) with an
// arpeggio over each chord. Frequencies in Hz.
const BARS: { bass: number; arp: [number, number, number] }[] = [
  { bass: 110.0, arp: [220.0, 261.63, 329.63] }, // Am
  { bass: 87.31, arp: [174.61, 220.0, 261.63] }, // F
  { bass: 130.81, arp: [261.63, 329.63, 392.0] }, // C
  { bass: 98.0, arp: [196.0, 246.94, 293.66] }, // G
];
const TOTAL_STEPS = BARS.length * STEPS_PER_BAR;
const ARP_SEQ = [0, 1, 2, 1, 0, 1, 2, 1];

let musicBus: GainNode | null = null;
let musicTimer: number | null = null;
let musicStep = 0;
let musicNextTime = 0;
let noiseBuffer: AudioBuffer | null = null;

function getNoiseBuffer(c: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const len = Math.max(1, Math.floor(c.sampleRate * 0.2));
  const b = c.createBuffer(1, len, c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < len; i += 1) d[i] = Math.random() * 2 - 1;
  noiseBuffer = b;
  return b;
}

function bassNote(c: AudioContext, bus: GainNode, freq: number, t: number, dur: number): void {
  const osc = c.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(freq, t);
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 600;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(lp);
  lp.connect(g);
  g.connect(bus);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function arpNote(c: AudioContext, bus: GainNode, freq: number, t: number, dur: number): void {
  const osc = c.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, t);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.13, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(bus);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function kick(c: AudioContext, bus: GainNode, t: number): void {
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.32, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  osc.connect(g);
  g.connect(bus);
  osc.start(t);
  osc.stop(t + 0.18);
}

function hat(c: AudioContext, bus: GainNode, t: number): void {
  const src = c.createBufferSource();
  src.buffer = getNoiseBuffer(c);
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 7000;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.05, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  src.connect(hp);
  hp.connect(g);
  g.connect(bus);
  src.start(t);
  src.stop(t + 0.06);
}

function scheduleMusicStep(c: AudioContext, bus: GainNode, step: number, t: number): void {
  const bar = BARS[Math.floor(step / STEPS_PER_BAR)];
  const inBar = step % STEPS_PER_BAR;
  if (inBar === 0 || inBar === 4) {
    bassNote(c, bus, bar.bass, t, SECONDS_PER_BEAT * 0.92);
    kick(c, bus, t);
  }
  arpNote(c, bus, bar.arp[ARP_SEQ[inBar]], t, STEP_DUR * 0.9);
  if (inBar % 2 === 1) hat(c, bus, t);
}

function musicScheduler(): void {
  const c = ctx;
  if (!c || !musicBus) return;
  while (musicNextTime < c.currentTime + 0.12) {
    scheduleMusicStep(c, musicBus, musicStep, musicNextTime);
    musicNextTime += STEP_DUR;
    musicStep = (musicStep + 1) % TOTAL_STEPS;
  }
}

/** Start the looping tower battle music (soft, synthesized, no files). */
export function startBattleMusic(): void {
  arm();
  const c = ensureContext();
  if (!c || musicTimer !== null) return;
  if (!musicBus) {
    musicBus = c.createGain();
    musicBus.gain.value = 0.0001;
    musicBus.connect(c.destination);
  }
  musicBus.gain.cancelScheduledValues(c.currentTime);
  musicBus.gain.setValueAtTime(Math.max(0.0001, musicBus.gain.value), c.currentTime);
  musicBus.gain.exponentialRampToValueAtTime(0.13, c.currentTime + 0.6);
  musicStep = 0;
  musicNextTime = c.currentTime + 0.1;
  musicTimer = window.setInterval(musicScheduler, 25);
}

/** Stop the tower battle music and fade it out. */
export function stopBattleMusic(): void {
  if (musicTimer !== null) {
    clearInterval(musicTimer);
    musicTimer = null;
  }
  if (ctx && musicBus) {
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setValueAtTime(Math.max(0.0001, musicBus.gain.value), ctx.currentTime);
    musicBus.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
  }
}
