import type { DojoKind } from "@/lib/dojo/types";

type Bus = GainNode;

const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

class CaveAudio {
  private ctx: AudioContext | null = null;
  private master: Bus | null = null;
  private music: Bus | null = null;
  private sfx: Bus | null = null;
  private musicOn = false;
  private timer = 0;
  private step = 0;
  private muted = false;
  private unlocked = false;
  private engaged = false;

  constructor() {
    if (typeof window === "undefined") return;
    try {
      this.muted = localStorage.getItem("blockdojo-muted") === "1";
    } catch {
      this.muted = false;
    }
  }

  subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  snapshot = () => (this.muted ? "off" : this.unlocked ? "on" : "waiting");

  private bound = false;

  bind() {
    if (this.bound || typeof window === "undefined") return;
    this.bound = true;
    const unlock = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-sound-toggle]")) return;
      this.resume();
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") this.resume();
    });
  }

  armMusic(on: boolean) {
    this.musicOn = on;
    if (on) this.resume();
    else this.stopMusicLoop();
  }

  press() {
    const starting = !this.engaged;
    this.engaged = true;
    this.muted = starting ? false : !this.muted;
    try {
      localStorage.setItem("blockdojo-muted", this.muted ? "1" : "0");
    } catch {
      /* private mode */
    }
    this.resume();
    this.applyMute();
    notify();
  }

  toggle() {
    this.press();
  }

  cue(kind: DojoKind | "hit" | "step" | "hop" | "sleep" | "tip" | "quest") {
    const ctx = this.resume();
    if (!ctx || !this.sfx || this.muted) return;
    const now = ctx.currentTime + 0.01;
    if (kind === "hit") this.hit(now);
    else if (kind === "step") this.blip(now, 180, 0.05, 0.04);
    else if (kind === "hop") this.blip(now, 620, 0.09, 0.06);
    else if (kind === "sleep") this.blip(now, 196, 0.2, 0.03, "sine");
    else if (kind === "tip") this.blip(now, 880, 0.06, 0.035);
    else if (kind === "quest" || kind === "pocket") {
      this.blip(now, 98, 0.45, 0.08, "triangle", -28);
      this.arp(now + 0.24, [196, 262, 330], 0.16);
    } else if (kind === "award") this.arp(now, [659, 880, 1174], 0.09);
    else if (kind === "welcome") this.arp(now, [523, 659, 784, 1046], 0.11);
    else if (kind === "redeem") this.arp(now, [392, 523, 784, 988], 0.12);
    else if (kind === "belt") this.arp(now, [440, 554, 659, 880], 0.12);
    else if (kind === "shop") this.arp(now, [740, 988], 0.08);
    else if (kind === "rest") this.blip(now, 330, 0.28, 0.05, "triangle", -180);
  }

  private resume() {
    if (typeof window === "undefined") return null;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!this.ctx) {
      this.ctx = new AC({ latencyHint: "interactive" });
      this.master = this.ctx.createGain();
      this.music = this.ctx.createGain();
      this.sfx = this.ctx.createGain();
      this.music.gain.value = 0.16;
      this.sfx.gain.value = 0.55;
      this.music.connect(this.master);
      this.sfx.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.applyMute();
    }
    if (this.ctx.state === "running") {
      this.markReady();
    } else if (this.ctx.state === "suspended") {
      void this.ctx.resume().then(() => this.markReady());
    }
    return this.ctx;
  }

  private markReady() {
    if (!this.unlocked) {
      this.unlocked = true;
      notify();
    }
    if (this.musicOn) this.startMusicLoop();
  }

  private applyMute() {
    if (!this.ctx || !this.master) return;
    const level = this.muted ? 0.0001 : 0.9;
    this.master.gain.setTargetAtTime(level, this.ctx.currentTime, 0.03);
  }

  private startMusicLoop() {
    if (this.timer || !this.ctx || this.muted) return;
    this.step = 0;
    this.timer = window.setInterval(() => this.tickMusic(), 360);
    this.tickMusic();
  }

  private stopMusicLoop() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = 0;
  }

  private tickMusic() {
    const ctx = this.ctx;
    const bus = this.music;
    if (!ctx || !bus || !this.musicOn || this.muted || ctx.state !== "running") return;
    const melody = [523, 587, 659, 784, 659, 587, 523, 494, 440, 494, 523, 392];
    const bass = [110, 110, 164.8, 130.8];
    const now = ctx.currentTime + 0.05;
    const note = melody[this.step % melody.length]!;
    this.voice(bus, now, note, 0.28, 0.05, "triangle");
    if (this.step % 4 === 0) this.voice(bus, now, bass[(this.step / 4) % bass.length]!, 0.7, 0.04, "square");
    this.step += 1;
  }

  private hit(when: number) {
    if (!this.ctx || !this.sfx) return;
    this.voice(this.sfx, when, 140 + Math.random() * 40, 0.09, 0.12, "square");
    this.voice(this.sfx, when, 520 + Math.random() * 80, 0.05, 0.05, "triangle");
    const duration = 0.08;
    const length = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, when);
    source.connect(gain);
    gain.connect(this.sfx);
    source.start(when);
    source.stop(when + duration);
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
    };
  }

  private blip(when: number, freq: number, dur: number, gain: number, type: OscillatorType = "square", slide = 0) {
    if (!this.sfx) return;
    this.voice(this.sfx, when, freq, dur, gain, type, slide);
  }

  private arp(when: number, notes: number[], dur: number) {
    notes.forEach((note, index) => this.blip(when + index * dur * 0.85, note, dur, 0.07, "square"));
  }

  private voice(bus: Bus, when: number, freq: number, dur: number, level: number, type: OscillatorType, slide = 0) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    if (slide) osc.frequency.linearRampToValueAtTime(Math.max(40, freq + slide), when + dur);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(level, when + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(gain);
    gain.connect(bus);
    osc.start(when);
    osc.stop(when + dur + 0.02);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }
}

export const caveAudio = new CaveAudio();
