"use client";

/**
 * Background ambience.
 *
 * Spec: starts ONLY after the user presses ENTER (gesture-allowed), begins at
 * volume 0.7, fades linearly to 0 across 30 seconds (wall-clock), then stops.
 * Does NOT loop.
 *
 * Source priority:
 *   1. If public/audio/ambience.mp3 exists → play it.
 *   2. Otherwise → synthesize a dark cinematic drone via Web Audio so there is
 *      ALWAYS audio (no silent room while you source a track).
 *
 * Drop your track at: public/audio/ambience.mp3
 */

const SRC = "/audio/ambience.mp3";
const PEAK = 0.7;
const FADE_MS = 30_000;

let started = false;
let muted = false;
let decided = false;

// mp3 path
let el: HTMLAudioElement | null = null;
let fadeTimer: ReturnType<typeof setInterval> | null = null;

// synth path
let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muteGain: GainNode | null = null;
let voices: OscillatorNode[] = [];
let stopTimer: ReturnType<typeof setTimeout> | null = null;

export function startVoidAmbience(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  // Create the AudioContext synchronously inside the gesture so the synth
  // fallback is allowed to make sound even though we decide async.
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (AC) {
      ctx = new AC();
      if (ctx.state === "suspended") void ctx.resume();
    }
  } catch {
    ctx = null;
  }

  const pickMp3 = () => {
    if (decided) return;
    decided = true;
    teardownSynth();
    startMp3();
  };
  const pickSynth = () => {
    if (decided) return;
    decided = true;
    if (el) {
      try {
        el.pause();
        el.src = "";
      } catch {
        /* ignore */
      }
      el = null;
    }
    startSynth();
  };

  // Probe the MP3. Success = it actually starts playing ('playing' / play() resolves).
  // Failure = 'error' (missing/decode). We give a generous grace period so a large
  // file on a slow connection is NOT preempted by the synth fallback.
  try {
    el = new Audio(SRC);
    el.loop = false;
    el.preload = "auto";
    el.muted = muted;
    el.volume = PEAK;
    el.addEventListener("playing", pickMp3, { once: true });
    el.addEventListener("error", pickSynth, { once: true });
    const p = el.play();
    if (p && typeof p.then === "function") {
      p.then(() => pickMp3()).catch(() => {
        /* gesture ok but blocked/missing → 'error' event or the timer decides */
      });
    }
  } catch {
    pickSynth();
  }

  // Only fall back to the synth if the MP3 truly never starts.
  setTimeout(() => pickSynth(), 4500);
}

function startMp3(): void {
  if (!el) return;
  el.volume = PEAK;
  el.muted = muted;
  void el.play().catch(() => {});
  const start = performance.now();
  fadeTimer = setInterval(() => {
    if (!el) return;
    const t = Math.min(1, (performance.now() - start) / FADE_MS);
    el.volume = Math.max(0, PEAK * (1 - t));
    if (t >= 1) stopVoidAmbience();
  }, 120);
}

function startSynth(): void {
  if (!ctx) return;
  const now = ctx.currentTime;

  masterGain = ctx.createGain();
  muteGain = ctx.createGain();
  muteGain.gain.value = muted ? 0 : 1;

  // Fade automation: quick fade-in (no click) at 0.7, then linear to 0 by 30s.
  masterGain.gain.setValueAtTime(0.0001, now);
  masterGain.gain.linearRampToValueAtTime(PEAK, now + 1.0);
  masterGain.gain.linearRampToValueAtTime(0.0001, now + FADE_MS / 1000);

  // Dark, muffled tone.
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 520;
  filter.Q.value = 0.9;

  // Slow filter sweep for movement.
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.06;
  lfoGain.gain.value = 180;
  lfo.connect(lfoGain).connect(filter.frequency);
  lfo.start();
  voices.push(lfo);

  // Detuned low drone voices (A1, A2, a tense fifth).
  const specs: [number, OscillatorType, number, number][] = [
    [55, "sine", 0.26, -4],
    [110, "sine", 0.2, 5],
    [164.81, "triangle", 0.12, -6],
    [82.41, "sine", 0.16, 3],
  ];
  for (const [freq, type, gain, detune] of specs) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    const g = ctx.createGain();
    g.gain.value = gain;
    osc.connect(g).connect(filter);
    osc.start();
    voices.push(osc);
  }

  // Filtered noise "air".
  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuf;
  noise.loop = true;
  const noiseBand = ctx.createBiquadFilter();
  noiseBand.type = "bandpass";
  noiseBand.frequency.value = 900;
  noiseBand.Q.value = 0.7;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.06;
  noise.connect(noiseBand).connect(noiseGain).connect(filter);
  noise.start();

  filter.connect(masterGain).connect(muteGain).connect(ctx.destination);

  // Hard stop at 30s (no loop).
  stopTimer = setTimeout(stopVoidAmbience, FADE_MS + 400);
}

export function stopVoidAmbience(): void {
  if (fadeTimer) {
    clearInterval(fadeTimer);
    fadeTimer = null;
  }
  if (el) {
    try {
      el.pause();
      el.currentTime = 0;
    } catch {
      /* ignore */
    }
    el = null;
  }
  teardownSynth();
}

function teardownSynth(): void {
  if (stopTimer) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }
  for (const v of voices) {
    try {
      v.stop();
    } catch {
      /* ignore */
    }
  }
  voices = [];
  if (ctx) {
    try {
      void ctx.close();
    } catch {
      /* ignore */
    }
    ctx = null;
  }
  masterGain = null;
  muteGain = null;
}

/** HUD sound toggle — works for both the MP3 and the synth path. */
export function setAmbienceMuted(value: boolean): void {
  muted = value;
  if (el) el.muted = value;
  if (muteGain) muteGain.gain.value = value ? 0 : 1;
}

export function isAmbienceMuted(): boolean {
  return muted;
}
