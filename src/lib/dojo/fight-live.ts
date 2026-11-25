import type { MoveKind, MoveWord } from "@/lib/dojo/games";

export const HIT_DAMAGE = 18;
export const TRADE_DAMAGE = 8;
export const TIE_MS = 90;
export const LOCK_MS = 450;
export const SWING_MS = 1200;
export const HURT_MS = 900;
export const STEP_MS = 360;

const KINDS: MoveKind[] = ["forward", "back", "attack"];

const MOVE = [
  "bug", "run", "hop", "fix", "key", "bit", "log", "map", "zip", "bot", "app", "tab", "git", "web", "pin", "aim",
  "tag", "set", "add", "end", "top", "pad", "cat", "jam", "net", "orb", "fog", "wax", "ink", "cue", "dry", "elf",
  "gap", "hub", "joy", "kit", "mud", "nod", "owl", "pry", "rib", "sky", "urn", "vow", "yap", "dim", "icy",
];

const ATTACK = [
  "code", "loop", "jump", "mine", "belt", "coin", "hero", "star", "byte", "chip", "data", "file", "game", "hack",
  "icon", "node", "open", "play", "save", "test", "void", "walk", "yarn", "zoom", "rust", "quiz", "link", "kind",
  "java", "user", "edit", "true", "else", "func", "grid", "html", "json", "list", "math", "null", "pack", "read",
  "sync", "type", "unit", "wrap", "keys", "bool", "cast", "draw",
];

export type LivePose = "idle" | "run" | "attack" | "hurt" | "down";
export type PressNote = "" | "hit" | "whiff" | "trade";

export type Slot = { word: string; typed: string };

export type Fighter = {
  pos: number;
  slots: Record<MoveKind, Slot>;
  active: MoveKind | "";
  lockUntil: number;
  pose: LivePose;
  poseUntil: number;
  swingAt: number;
  connectedAt: number;
  spareUntil: number;
  taken: number;
  hurt: boolean;
  hits: number;
  hp: number;
};

export type LiveState = { a: Fighter; b: Fighter };

export type PressResult = { miss: MoveKind | ""; note: PressNote; ko: boolean };

function pile(kind: MoveKind) {
  return kind === "attack" ? ATTACK : MOVE;
}

function pickWord(kind: MoveKind, avoidWord: string, avoidFirst: string[]) {
  const source = pile(kind);
  const open = source.filter((word) => word !== avoidWord && !avoidFirst.includes(word[0] ?? ""));
  const pool = open.length ? open : source.filter((word) => word !== avoidWord);
  return pool[Math.floor(Math.random() * pool.length)] ?? source[0] ?? "bug";
}

function refill(fighter: Fighter, kind: MoveKind) {
  const avoid = KINDS.filter((other) => other !== kind)
    .map((other) => fighter.slots[other].word[0] ?? "")
    .filter(Boolean);
  fighter.slots[kind] = { word: pickWord(kind, fighter.slots[kind].word, avoid), typed: "" };
}

function blank(): Fighter {
  return {
    pos: 0,
    slots: {
      forward: { word: "", typed: "" },
      back: { word: "", typed: "" },
      attack: { word: "", typed: "" },
    },
    active: "",
    lockUntil: 0,
    pose: "idle",
    poseUntil: 0,
    swingAt: 0,
    connectedAt: 0,
    spareUntil: 0,
    taken: 0,
    hurt: false,
    hits: 0,
    hp: 100,
  };
}

export function createFighter(): Fighter {
  const fighter = blank();
  refill(fighter, "forward");
  refill(fighter, "back");
  refill(fighter, "attack");
  return fighter;
}

export function createLive(): LiveState {
  return { a: createFighter(), b: createFighter() };
}

export function movesOf(fighter: Fighter): MoveWord[] {
  return KINDS.map((kind) => ({ kind, word: fighter.slots[kind].word, typed: fighter.slots[kind].typed }));
}

export function poseNow(fighter: Fighter, now: number): LivePose {
  if (fighter.hp <= 0) return "down";
  if (now < fighter.poseUntil) return fighter.pose;
  return "idle";
}

function clearActive(fighter: Fighter, keepLastAttack = false) {
  if (!fighter.active) return;
  const slot = fighter.slots.attack;
  const keep = keepLastAttack && fighter.active === "attack" && slot.typed.length === slot.word.length - 1;
  if (keep) return;
  fighter.slots[fighter.active].typed = "";
  fighter.active = "";
}

function finishMove(state: LiveState, side: "a" | "b", kind: MoveKind, now: number): PressResult {
  const you = state[side];
  const foe = state[side === "a" ? "b" : "a"];
  you.active = "";
  you.spareUntil = 0;
  refill(you, kind);
  if (kind === "forward") {
    you.pos = Math.min(2, you.pos + 1);
    you.pose = "run";
    you.poseUntil = now + STEP_MS;
    return { miss: "", note: "", ko: false };
  }
  if (kind === "back") {
    you.pos = Math.max(0, you.pos - 1);
    you.pose = "idle";
    you.poseUntil = now;
    return { miss: "", note: "", ko: false };
  }
  you.pose = "attack";
  you.poseUntil = now + SWING_MS;
  you.swingAt = now;
  const close = you.pos === 2 && foe.pos === 2;
  if (!close) {
    you.connectedAt = 0;
    return { miss: "", note: "whiff", ko: false };
  }
  if (foe.connectedAt && now - foe.connectedAt <= TIE_MS) {
    you.hp = Math.max(0, Math.min(100, you.hp + you.taken - TRADE_DAMAGE));
    const foeTrade = Math.min(TRADE_DAMAGE, foe.hp);
    foe.hp -= foeTrade;
    you.taken = TRADE_DAMAGE;
    foe.taken = foeTrade;
    foe.hits = Math.max(0, foe.hits - 1);
    you.hurt = true;
    foe.hurt = true;
    you.connectedAt = now;
    you.spareUntil = 0;
    foe.spareUntil = 0;
    clearActive(foe);
    you.lockUntil = now + LOCK_MS;
    foe.lockUntil = now + LOCK_MS;
    you.pose = you.hp <= 0 ? "down" : "hurt";
    foe.pose = foe.hp <= 0 ? "down" : "hurt";
    you.poseUntil = now + HURT_MS;
    foe.poseUntil = now + HURT_MS;
    return { miss: "", note: "trade", ko: you.hp <= 0 || foe.hp <= 0 };
  }
  const dealt = Math.min(HIT_DAMAGE, foe.hp);
  foe.hp -= dealt;
  foe.taken = dealt;
  you.hits += 1;
  you.connectedAt = now;
  foe.hurt = true;
  foe.pose = foe.hp <= 0 ? "down" : "hurt";
  foe.poseUntil = now + HURT_MS;
  foe.lockUntil = now + LOCK_MS;
  const spared = foe.active === "attack" && foe.slots.attack.typed.length === foe.slots.attack.word.length - 1;
  clearActive(foe, true);
  foe.spareUntil = spared ? now + TIE_MS : 0;
  return { miss: "", note: "hit", ko: foe.hp <= 0 };
}

export function press(state: LiveState, side: "a" | "b", letter: string, now: number): PressResult {
  const you = state[side];
  const foe = state[side === "a" ? "b" : "a"];
  const key = letter.toLowerCase();
  if (!/^[a-z]$/.test(key)) return { miss: "", note: "", ko: false };
  if (you.spareUntil && now > you.spareUntil) {
    const dropped = you.active === "attack";
    if (dropped) clearActive(you);
    you.spareUntil = 0;
    if (dropped) return { miss: "", note: "", ko: false };
  }
  const finishing =
    you.active === "attack" &&
    you.slots.attack.word.length > 0 &&
    you.slots.attack.typed.length === you.slots.attack.word.length - 1 &&
    key === you.slots.attack.word.at(-1) &&
    foe.connectedAt > 0 &&
    now - foe.connectedAt <= TIE_MS;
  if ((you.hp <= 0 || now < you.lockUntil) && !finishing) return { miss: "", note: "", ko: false };
  if (!you.active) {
    const hits = KINDS.filter((kind) => you.slots[kind].word[0] === key);
    if (hits.length !== 1) return { miss: "", note: "", ko: false };
    you.active = hits[0] ?? "";
  }
  const kind = you.active;
  if (!kind) return { miss: "", note: "", ko: false };
  const slot = you.slots[kind];
  if (key !== slot.word[slot.typed.length]) return { miss: kind, note: "", ko: false };
  slot.typed += key;
  if (slot.typed !== slot.word) return { miss: "", note: "", ko: false };
  return finishMove(state, side, kind, now);
}

export function botDelay(round: number) {
  return Math.max(240, 400 - (round - 1) * 35);
}

export function botLetter(bot: Fighter, you: Fighter) {
  if (bot.hp <= 0 || bot.pose === "down") return "";
  let kind: MoveKind | "" = bot.active;
  if (!kind) {
    const threatened = you.pos === 2 && you.active === "attack" && you.slots.attack.typed.length >= 2;
    if (bot.pos < 2) kind = "forward";
    else if (threatened && bot.pos > 0) kind = "back";
    else if (you.pos === 2) kind = "attack";
  }
  if (!kind) return "";
  return bot.slots[kind].word[bot.slots[kind].typed.length] ?? "";
}
