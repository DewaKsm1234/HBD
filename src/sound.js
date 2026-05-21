let ctx;
let muted =
  typeof window !== "undefined" && localStorage.getItem("hbd-muted") === "1";

const listeners = new Set();

export function isMuted() {
  return muted;
}

export function setMuted(v) {
  muted = !!v;
  if (typeof window !== "undefined") {
    localStorage.setItem("hbd-muted", muted ? "1" : "0");
  }
  listeners.forEach((l) => l(muted));
}

export function subscribeMute(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function ensureCtx() {
  if (muted) return null;
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

function envelope(g, c, peak, attack, decay) {
  const t = c.currentTime;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

export function tap() {
  const c = ensureCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(900, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(420, c.currentTime + 0.05);
  envelope(g, c, 0.16, 0.001, 0.08);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + 0.12);
}

export function swipe() {
  const c = ensureCtx();
  if (!c) return;
  const duration = 0.35;
  const buffer = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 0.7;
  filter.frequency.setValueAtTime(300, c.currentTime);
  filter.frequency.exponentialRampToValueAtTime(2400, c.currentTime + duration);
  const g = c.createGain();
  envelope(g, c, 0.28, 0.01, duration - 0.02);
  src.connect(filter).connect(g).connect(c.destination);
  src.start();
  src.stop(c.currentTime + duration);
}

export function pop() {
  const c = ensureCtx();
  if (!c) return;

  // Confetti burst (filtered noise, fast decay)
  const burstDur = 0.25;
  const buffer = c.createBuffer(1, c.sampleRate * burstDur, c.sampleRate);
  const d = buffer.getChannelData(0);
  for (let i = 0; i < d.length; i++) {
    const decay = Math.pow(1 - i / d.length, 2);
    d[i] = (Math.random() * 2 - 1) * decay;
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 900;
  const bg = c.createGain();
  bg.gain.value = 0.45;
  src.connect(hp).connect(bg).connect(c.destination);
  src.start();

  // Ascending arpeggio C5 E5 G5 C6 E6
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
  notes.forEach((freq, i) => {
    const startT = c.currentTime + 0.05 + i * 0.07;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(freq, startT);
    g.gain.setValueAtTime(0, startT);
    g.gain.linearRampToValueAtTime(0.22, startT + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, startT + 0.35);
    o.connect(g).connect(c.destination);
    o.start(startT);
    o.stop(startT + 0.4);
  });
}

export function chime() {
  const c = ensureCtx();
  if (!c) return;
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    const startT = c.currentTime + i * 0.08;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(freq, startT);
    g.gain.setValueAtTime(0, startT);
    g.gain.linearRampToValueAtTime(0.18, startT + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, startT + 0.45);
    o.connect(g).connect(c.destination);
    o.start(startT);
    o.stop(startT + 0.5);
  });
}

export function buzz() {
  const c = ensureCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(180, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(80, c.currentTime + 0.2);
  envelope(g, c, 0.18, 0.005, 0.25);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + 0.3);
}

export function nope() {
  const c = ensureCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(440, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(180, c.currentTime + 0.18);
  envelope(g, c, 0.22, 0.005, 0.2);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + 0.25);
}

export function tick() {
  const c = ensureCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "square";
  o.frequency.value = 1100;
  envelope(g, c, 0.08, 0.001, 0.05);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + 0.06);
}
