import assert from "node:assert/strict";
import test from "node:test";
import { HIT_DAMAGE, TRADE_DAMAGE, createFighter, createLive, press } from "./fight-live.ts";

function typeWord(state: ReturnType<typeof createLive>, side: "a" | "b", kind: "forward" | "back" | "attack", now: number) {
  const word = state[side].slots[kind].word;
  let note = "";
  for (const letter of word) {
    note = press(state, side, letter, now).note;
    now += 1;
  }
  return { note, now };
}

test("movement words step in and out, attack only lands up close", () => {
  const state = createLive();
  const starts = [state.a.slots.forward.word[0], state.a.slots.back.word[0], state.a.slots.attack.word[0]];
  assert.equal(new Set(starts).size, 3);
  assert.equal(state.a.slots.forward.word.length, 3);
  assert.equal(state.a.slots.back.word.length, 3);
  assert.equal(state.a.slots.attack.word.length, 4);

  let now = 1_000;
  let typed = typeWord(state, "a", "attack", now);
  now = typed.now;
  assert.equal(typed.note, "whiff");
  assert.equal(state.b.hp, 100);

  typed = typeWord(state, "a", "forward", now);
  typed = typeWord(state, "a", "forward", typed.now);
  typed = typeWord(state, "b", "forward", typed.now);
  typed = typeWord(state, "b", "forward", typed.now);
  now = typed.now;
  assert.equal(state.a.pos, 2);
  assert.equal(state.b.pos, 2);

  const attack = state.b.slots.attack.word;
  for (const letter of attack.slice(0, -1)) press(state, "b", letter, now++);
  typed = typeWord(state, "a", "back", now);
  now = typed.now;
  assert.equal(state.a.pos, 1);
  const swung = press(state, "b", attack.at(-1) ?? "", now);
  assert.equal(swung.note, "whiff");
  assert.equal(state.a.hp, 100);

  typeWord(state, "a", "forward", now + 5);
  const landed = typeWord(state, "a", "attack", now + 20);
  assert.equal(landed.note, "hit");
  assert.equal(state.b.hp, 100 - HIT_DAMAGE);
  assert.equal(state.a.hits, 1);
  assert.equal(state.b.active, "");
});

test("a same-instant attack clashes, a slower one only flinches", () => {
  const state = createLive();
  let now = 5_000;
  now = typeWord(state, "a", "forward", now).now;
  now = typeWord(state, "a", "forward", now).now;
  now = typeWord(state, "b", "forward", now).now;
  now = typeWord(state, "b", "forward", now).now;
  const aWord = state.a.slots.attack.word;
  const bWord = state.b.slots.attack.word;
  for (const letter of aWord.slice(0, -1)) press(state, "a", letter, now++);
  for (const letter of bWord.slice(0, -1)) press(state, "b", letter, now++);
  const first = press(state, "a", aWord.at(-1) ?? "", 8_000);
  assert.equal(first.note, "hit");
  const second = press(state, "b", bWord.at(-1) ?? "", 8_040);
  assert.equal(second.note, "trade");
  assert.equal(state.a.hp, 100 - TRADE_DAMAGE);
  assert.equal(state.b.hp, 100 - TRADE_DAMAGE);
  assert.equal(state.a.hits, 0);

  const late = createLive();
  let clock = 9_000;
  clock = typeWord(late, "a", "forward", clock).now;
  clock = typeWord(late, "a", "forward", clock).now;
  clock = typeWord(late, "b", "forward", clock).now;
  clock = typeWord(late, "b", "forward", clock).now;
  const lateWord = late.b.slots.attack.word;
  for (const letter of lateWord.slice(0, 2)) press(late, "b", letter, clock++);
  typeWord(late, "a", "attack", clock);
  assert.equal(late.b.active, "");
  assert.equal(late.b.hp, 100 - HIT_DAMAGE);
  assert.equal(late.a.hp, 100);
});
