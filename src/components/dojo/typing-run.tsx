import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { caveAudio } from "@/lib/dojo/audio";
import { GAME_TURN_MS } from "@/lib/dojo/games";

const WORDS = [
  ["bug", "bit", "run", "key", "hop", "fix", "log", "tag", "app", "pop", "add", "win", "box", "map", "yes", "hit", "say", "zip", "dot", "pet", "fun", "cat", "sun", "row", "try", "set", "get", "end"],
  ["code", "loop", "jump", "move", "hide", "show", "spin", "grow", "play", "true", "else", "math", "tile", "belt", "game", "life", "hero", "coin", "star", "flag", "data", "list", "walk", "turn", "draw", "save", "byte", "dojo"],
  ["sprite", "event", "score", "start", "lives", "pixel", "spawn", "debug", "array", "while", "float", "input", "music", "scene", "mouse", "craft", "robot", "clone", "block", "quest", "sound", "white", "green", "click", "ninja"],
  ["button", "player", "update", "repeat", "random", "string", "number", "canvas", "script", "return", "health", "motion", "impact", "arcade", "yellow", "orange"],
  ["boolean", "collide", "costume", "forever", "physics", "overlap", "integer", "console", "project", "variable", "function", "sequence", "operator", "argument", "tilemap", "equality", "property", "keyboard", "velocity"],
  ["animation", "parameter", "condition", "collision", "broadcast", "debugging", "variables", "functions", "operators", "javascript", "coordinate", "projectile", "conditional"],
];

const TRAVEL = [8.5, 7.6, 6.8, 6, 5.2, 4.4];
const MISS_MS = 5_000;
const MISS_LIMIT = 3;
const BAR_BLOCKS = 10;

type Cart = { word: string; golden: boolean };
type Perf = { t0: number; letters: number; misses: number; words: number; drops: number };

function tuneTier(tier: number, perf: Perf) {
  const seconds = Math.max(1, (Date.now() - perf.t0) / 1000);
  const typed = perf.letters + perf.misses;
  const accuracy = typed === 0 ? 0 : perf.letters / typed;
  const perMinute = (perf.words / seconds) * 60;
  let step = 0;
  if (perf.words === 0 || accuracy < 0.6 || perMinute < 3 || perf.drops > perf.words) step = -1;
  else if (accuracy >= 0.9 && perMinute >= 12 && perf.drops === 0) step = 2;
  else if (accuracy >= 0.78 && perMinute >= 6) step = 1;
  return Math.max(0, Math.min(WORDS.length - 1, tier + step));
}

function nextCart(tier: number, count: number, previous: string): Cart {
  const pile = WORDS[tier] ?? WORDS[0];
  let word = pile[Math.floor(Math.random() * pile.length)] ?? "bug";
  if (pile.length > 1 && word === previous) word = pile[(pile.indexOf(word) + 1) % pile.length];
  return { word, golden: count > 0 && count % 6 === 0 };
}

function levelOf(endsAt: number, extra = 0, now = Date.now()) {
  const elapsed = Math.min(GAME_TURN_MS, Math.max(0, now - (endsAt - GAME_TURN_MS)) + extra);
  const level = Math.min(10, Math.floor(elapsed / 60_000) + 1);
  const left = elapsed >= GAME_TURN_MS ? 0 : Math.max(0, level * 60_000 - elapsed);
  return { level, left, session: Math.max(0, endsAt - now), done: elapsed >= GAME_TURN_MS };
}

function comboOf(streak: number) {
  if (streak >= 12) return 4;
  if (streak >= 8) return 3;
  if (streak >= 4) return 2;
  return 1;
}

function trainSize(len: number) {
  if (len <= 3) return { lead: 176, car: 118, letter: 52, gap: 4 };
  if (len <= 5) return { lead: 142, car: 96, letter: 42, gap: 3 };
  if (len <= 8) return { lead: 112, car: 72, letter: 34, gap: 2 };
  return { lead: 88, car: 54, letter: 26, gap: 2 };
}

function trainPlace(laneW: number, trainW: number, progress: number) {
  return laneW - progress * (laneW + trainW);
}

function paceBoost(taps: { ok: boolean; at: number }[]) {
  const good = taps.filter((tap) => tap.ok);
  if (good.length < 2 || good.length / taps.length < 0.75) return 1;
  const gaps: number[] = [];
  for (let i = 1; i < good.length; i += 1) {
    const gap = good[i].at - good[i - 1].at;
    if (gap > 0 && gap < 2500) gaps.push(gap);
  }
  if (!gaps.length) return 1;
  const gap = gaps.reduce((sum, value) => sum + value, 0) / gaps.length;
  const fast = Math.max(0, Math.min(1, (1050 - gap) / 750));
  return 1 + fast * 1.2;
}

function clock(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

const ART = "/art/typing";

type CartRig = {
  src: string;
  wheel: "wheel-gray" | "wheel-gold" | null;
  axles: number[];
  axleTop: string;
  letters: string;
  ore: string | null;
  crystal: string | null;
};

function oreFor(level: number, golden: boolean) {
  if (level < 3) return null;
  if (golden) return "ore-gold";
  if (level <= 4) return "ore-ice";
  if (level <= 6) return "ore-lava";
  if (level <= 8) return "ore-amethyst";
  return "ore-gems";
}

function crystalFor(level: number, golden: boolean) {
  if (golden || level < 3) return null;
  if (level <= 4) return "crystal-ice";
  if (level >= 7 && level <= 8) return "crystal-amethyst";
  return null;
}
function cartRig(level: number, golden: boolean): CartRig {
  const ore = oreFor(level, golden);
  const crystal = crystalFor(level, golden);
  if (level >= 3) {
    return {
      src: `${ART}/cart-body.png?v=kit3`,
      wheel: golden ? "wheel-gold" : "wheel-gray",
      axles: [32.7, 77.2],
      axleTop: "85%",
      letters: "top-[2%] right-[12%] left-[32%]",
      ore,
      crystal,
    };
  }
  if (!golden) {
    return {
      src: `${ART}/cart-coal-body.png?v=kit3`,
      wheel: "wheel-gray",
      axles: [34.8, 78.6],
      axleTop: "91%",
      letters: "top-[6%] right-[8%] left-[34%]",
      ore: null,
      crystal: null,
    };
  }
  return {
    src: `${ART}/cart-gold.png?v=kit3`,
    wheel: null,
    axles: [],
    axleTop: "0%",
    letters: "top-[50%] right-[8%] left-[28%]",
    ore: null,
    crystal: null,
  };
}

export function TypingRun({ endsAt, onFinish }: { endsAt: number; onFinish: (stats: { words: number; golden: number }) => void }) {
  const start = levelOf(endsAt);
  const stats = useRef({ words: 0, golden: 0 });
  const streak = useRef(0);
  const count = useRef(0);
  const typed = useRef("");
  const levelRef = useRef(start.level);
  const tierRef = useRef(0);
  const perf = useRef<Perf>({ t0: Date.now(), letters: 0, misses: 0, words: 0, drops: 0 });
  const cart = useRef<Cart>(nextCart(0, 0, ""));
  const progress = useRef(0);
  const restUntil = useRef(Date.now() + 1200);
  const done = useRef(false);
  const node = useRef<HTMLDivElement>(null);
  const roll = useRef(0);
  const rollX = useRef<number | null>(null);
  const penalty = useRef(0);
  const phase = useRef<"roll" | "exit">("roll");
  const wordMisses = useRef(0);
  const swing = useRef<{ id: number; kind: "hit" | "bounce" } | null>(null);
  const swingId = useRef(0);
  const bars = useRef(Math.ceil((start.left / 60_000) * BAR_BLOCKS));
  const chipId = useRef(0);
  const track = useRef<HTMLDivElement>(null);
  const taps = useRef<{ ok: boolean; at: number }[]>([]);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  const [round, setRound] = useState({ word: cart.current.word, typed: "", golden: cart.current.golden, swing: null as { id: number; kind: "hit" | "bounce" } | null, misses: 0 });
  const [hud, setHud] = useState({ level: start.level, left: start.left, session: start.session, words: 0, combo: 1 });
  const [cheer, setCheer] = useState<{ id: number; text: string } | null>({ id: 0, text: "Level 1" });
  const [card, setCard] = useState<{ level: number; praise: boolean } | null>(
    start.left > 58_000 ? { level: start.level, praise: start.level > 1 } : null,
  );
  const [pop, setPop] = useState<{ id: number; kind: "tnt" | "burst" } | null>(null);
  const [chip, setChip] = useState(0);
  const cheerId = useRef(0);
  const popId = useRef(0);

  const praise = (text: string) => {
    cheerId.current += 1;
    const id = cheerId.current;
    setCheer({ id, text });
    window.setTimeout(() => setCheer((prev) => (prev?.id === id ? null : prev)), 1600);
  };

  const paintWord = () => {
    setRound({ word: cart.current.word, typed: typed.current, golden: cart.current.golden, swing: swing.current, misses: wordMisses.current });
  };

  const finish = () => {
    if (done.current) return;
    done.current = true;
    finishRef.current(stats.current);
  };

  const commit = () => {
    phase.current = "roll";
    wordMisses.current = 0;
    swing.current = null;
    count.current += 1;
    cart.current = nextCart(tierRef.current, count.current, cart.current.word);
    typed.current = "";
    progress.current = 0;
    rollX.current = null;
    paintWord();
    setHud((prev) => ({ ...prev, words: stats.current.words, combo: comboOf(streak.current) }));
  };

  const leave = (missed: boolean) => {
    if (phase.current === "exit" || done.current) return;
    phase.current = "exit";
    if (!missed) {
      stats.current.words += 1;
      perf.current.words += 1;
      streak.current += 1;
      if (cart.current.golden) stats.current.golden += 1;
      const combo = comboOf(streak.current);
      praise(combo > 1 ? `Great job typing!  x${combo}` : "Great job typing!");
      popId.current += 1;
      const id = popId.current;
      setPop({ id, kind: "burst" });
      window.setTimeout(() => setPop((prev) => (prev?.id === id ? null : prev)), 700);
      caveAudio.cue(cart.current.golden ? "award" : "hit");
    } else {
      perf.current.drops += 1;
      streak.current = 0;
      popId.current += 1;
      const id = popId.current;
      setPop({ id, kind: "tnt" });
      window.setTimeout(() => setPop((prev) => (prev?.id === id ? null : prev)), 700);
    }
    setHud((prev) => ({ ...prev, words: stats.current.words, combo: comboOf(streak.current) }));
  };

  const leaveRef = useRef(leave);
  leaveRef.current = leave;
  const commitRef = useRef(commit);
  commitRef.current = commit;
  const paintRef = useRef(paintWord);
  paintRef.current = paintWord;

  useLayoutEffect(() => {
    const lane = track.current;
    const cartNode = node.current;
    if (!lane || !cartNode) return;
    cartNode.style.transform = `translate3d(${trainPlace(lane.clientWidth, cartNode.offsetWidth, progress.current)}px, 0, 0)`;
  }, [round.word]);

  useEffect(() => {
    const stop = window.setTimeout(finish, Math.max(0, endsAt - Date.now()));
    const clockTimer = window.setInterval(() => {
      const now = levelOf(endsAt, penalty.current);
      const blocks = Math.ceil((now.left / 60_000) * BAR_BLOCKS);
      if (blocks < bars.current) {
        chipId.current += 1;
        setChip(chipId.current);
      }
      bars.current = blocks;
      setHud((prev) => ({ ...prev, level: now.level, left: now.left, session: now.session, combo: comboOf(streak.current) }));
      if (now.done) finish();
      else if (now.level !== levelRef.current) {
        tierRef.current = tuneTier(tierRef.current, perf.current);
        perf.current = { t0: Date.now(), letters: 0, misses: 0, words: 0, drops: 0 };
        levelRef.current = now.level;
        const combo = comboOf(streak.current);
        setCard({ level: now.level, praise: true });
        praise(combo > 1 ? `Great job typing!  x${combo}` : "Great job typing!");
        restUntil.current = Date.now() + 1600;
        phase.current = "roll";
        wordMisses.current = 0;
        swing.current = null;
        cart.current = nextCart(tierRef.current, count.current, cart.current.word);
        typed.current = "";
        progress.current = 0;
        rollX.current = null;
        paintRef.current();
        window.setTimeout(() => setCard(null), 1600);
      }
    }, 200);
    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const resting = Date.now() < restUntil.current;
      const lane = track.current;
      const cartNode = node.current;
      const laneW = lane?.clientWidth ?? 0;
      const trainW = cartNode?.offsetWidth ?? 0;
      const distance = Math.max(1, laneW + trainW);
      if (!resting && phase.current === "exit") {
        progress.current += (1100 * dt) / distance;
        if (progress.current >= 1) commitRef.current();
      } else if (!resting && laneW > 0) {
        const travel = TRAVEL[tierRef.current] ?? 6;
        const speed = (laneW / travel) * paceBoost(taps.current);
        progress.current += (speed * dt) / distance;
        if (progress.current >= 1) leaveRef.current(true);
      }
      if (lane && cartNode && laneW > 0) {
        const x = trainPlace(laneW, trainW, progress.current);
        cartNode.style.transform = `translate3d(${x}px, 0, 0)`;
        const wheels = cartNode.querySelectorAll<HTMLImageElement>("[data-wheel]");
        if (wheels.length) {
          const prev = rollX.current;
          rollX.current = x;
          if (prev != null && Math.abs(x - prev) < 220) {
            const radius = Math.max(8, wheels[0].offsetWidth / 2);
            roll.current += (x - prev) / radius;
          }
          const turn = `translate(-50%, -50%) rotate(${roll.current}rad)`;
          wheels.forEach((wheel) => {
            wheel.style.transform = turn;
          });
        }
      }
      if (Date.now() - (endsAt - GAME_TURN_MS) + penalty.current >= GAME_TURN_MS) finish();
      else frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);
    const open = window.setTimeout(() => setCard(null), 1200);
    return () => {
      window.clearTimeout(stop);
      window.clearTimeout(open);
      window.clearInterval(clockTimer);
      window.cancelAnimationFrame(frame);
    };
  }, [endsAt]);

  const press = (letter: string) => {
    if (done.current || phase.current === "exit" || Date.now() < restUntil.current) return;
    const next = cart.current.word[typed.current.length];
    if (!next || letter !== next) {
      penalty.current += MISS_MS;
      perf.current.misses += 1;
      wordMisses.current += 1;
      taps.current = [...taps.current, { ok: false, at: Date.now() }].slice(-8);
      swingId.current += 1;
      swing.current = { id: swingId.current, kind: "bounce" };
      const now = levelOf(endsAt, penalty.current);
      const blocks = Math.ceil((now.left / 60_000) * BAR_BLOCKS);
      bars.current = blocks;
      chipId.current += 1;
      setChip(chipId.current);
      setHud((prev) => ({ ...prev, level: now.level, left: now.left, session: now.session }));
      paintRef.current();
      const swingNow = swingId.current;
      window.setTimeout(() => {
        if (swing.current?.id === swingNow) {
          swing.current = null;
          paintRef.current();
        }
      }, 340);
      caveAudio.cue("tip");
      if (now.done) finish();
      else if (wordMisses.current >= MISS_LIMIT) leaveRef.current(true);
      return;
    }
    typed.current += letter;
    perf.current.letters += 1;
    taps.current = [...taps.current, { ok: true, at: Date.now() }].slice(-8);
    swingId.current += 1;
    swing.current = { id: swingId.current, kind: "hit" };
    paintRef.current();
    const swingNow = swingId.current;
    window.setTimeout(() => {
      if (swing.current?.id === swingNow) {
        swing.current = null;
        paintRef.current();
      }
    }, 440);
    if (typed.current === cart.current.word) leaveRef.current(false);
  };
  const pressRef = useRef(press);
  pressRef.current = press;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Backspace") return;
      if (/^[a-zA-Z]$/.test(event.key)) {
        event.preventDefault();
        pressRef.current(event.key.toLowerCase());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
  const rig = cartRig(hud.level, round.golden);
  const size = trainSize(round.word.length);
  const faceFor = (index: number) => {
    const active = index === round.typed.length;
    if (active && round.swing?.kind === "bounce") return "block-lava";
    if (round.golden) return "block-gold";
    return "block-ice";
  };
  return (
    <div className="relative z-10 flex h-dvh flex-col px-3 py-3 text-fg">
      <div className="grid grid-cols-[minmax(0,8.6rem)_minmax(4.5rem,1fr)_minmax(0,6.4rem)] items-center gap-2">
        <div className="relative h-20 w-full">
          <img src={`${ART}/sign.png?v=kit3`} alt="" className="absolute inset-0 h-full w-full object-fill" />
          <div className="relative flex h-full items-center gap-1 px-2 text-[#2a1c08]">
            <img src={`${ART}/clock.png?v=kit3`} alt="" className="clock-tick h-9 w-9 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase">Level {hud.level} of 10</p>
              <p className="text-2xl font-extrabold leading-none">{hud.words}</p>
              <p className="truncate text-[10px] font-extrabold uppercase">{clock(hud.session)} left</p>
            </div>
          </div>
        </div>
        <div className="relative h-12 w-full">
          <img src={`${ART}/frame-track.png?v=kit3`} alt="" className="absolute inset-0 h-full w-full object-fill" />
          <div className="absolute inset-y-[22%] right-[4%] left-[4%] [container-type:size]">
            <div className="h-full overflow-hidden" style={{ width: `${Math.max(0, Math.min(1, hud.left / 60_000)) * 100}%` }}>
              <img src={`${ART}/bar-gold.png?v=kit3`} alt="" className="h-full max-w-none object-fill" style={{ width: "100cqi" }} />
            </div>
            {chip ? (
              <img
                key={chip}
                src={`${ART}/bar-gold.png?v=kit3`}
                alt=""
                className="bar-break pointer-events-none absolute top-0 h-full w-8 object-cover object-right"
                style={{ left: `calc(${Math.max(0, Math.min(1, hud.left / 60_000)) * 100}% - 1.4rem)` }}
              />
            ) : null}
          </div>
          <p className="pointer-events-none absolute inset-0 grid place-items-center text-base font-extrabold text-[#2a1c08] tabular-nums">{clock(hud.left)}</p>
        </div>
        <div className="relative h-20 w-full">
          <img src={`${ART}/sign.png?v=kit3`} alt="" className="absolute inset-0 h-full w-full object-fill" />
          <div className="relative flex h-full flex-col items-center justify-center text-[#2a1c08]">
            <p className="text-[10px] font-extrabold uppercase">Combo</p>
            <p className="text-2xl font-extrabold leading-none">x{hud.combo}</p>
          </div>
        </div>
      </div>
      <div ref={track} className="relative mt-2 min-h-56 flex-1 overflow-hidden">
        <img src={`${ART}/frame-track.png?v=kit3`} alt="" className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full object-fill" />
        <div ref={node} className="absolute bottom-1 left-0 flex items-end will-change-transform">
          <div className="relative shrink-0" style={{ width: size.lead }}>
            <img src={rig.src} alt="" className="h-auto w-full" />
            {rig.ore ? <img src={`${ART}/${rig.ore}.png?v=kit3`} alt="" className="ore-shimmer pointer-events-none absolute top-0 left-[26%] w-[48%]" /> : null}
            {rig.crystal ? <img src={`${ART}/${rig.crystal}.png?v=kit3`} alt="" className="crystal-sway pointer-events-none absolute -top-[18%] left-[14%] w-[14%]" /> : null}
            {rig.wheel
              ? rig.axles.map((axle) => (
                  <img
                    key={axle}
                    data-wheel=""
                    src={`${ART}/${rig.wheel}.png?v=kit3`}
                    alt=""
                    className="mine-wheel absolute w-[28%]"
                    style={{ left: `${axle}%`, top: rig.axleTop }}
                  />
                ))
              : null}
          </div>
          {round.word.split("").map((letter, index) => {
            const broken = index < round.typed.length;
            const justBroke = broken && index === round.typed.length - 1 && round.swing?.kind === "hit";
            const pickOn = round.swing?.kind === "hit" ? round.typed.length - 1 : round.typed.length;
            return (
              <div key={`${round.word}-${index}`} className="relative shrink-0" style={{ width: size.car, marginLeft: size.gap }}>
                <img src={`${ART}/cart-body.png?v=kit3`} alt="" className="h-auto w-full" />
                {[32.7, 77.2].map((axle) => (
                  <img
                    key={axle}
                    data-wheel=""
                    src={`${ART}/wheel-gray.png?v=kit3`}
                    alt=""
                    className="mine-wheel absolute w-[28%]"
                    style={{ left: `${axle}%`, top: "85%" }}
                  />
                ))}
                {!broken || justBroke ? (
                  <div className="absolute left-[18%] z-20" style={{ bottom: "58%", width: size.letter }}>
                    <div className={justBroke ? "letter-break" : ""}>
                      <span className="relative grid place-items-center" style={{ width: size.letter, height: size.letter }}>
                        <img src={`${ART}/${faceFor(index)}.png?v=kit3`} alt="" className="absolute inset-0 h-full w-full object-contain" />
                        <span
                          className={`letter-ink relative font-extrabold uppercase ${faceFor(index) === "block-lava" ? "text-[#fff8ea]" : "text-[#2a1c08]"}`}
                          style={{ fontSize: Math.round(size.letter * 0.55) }}
                        >
                          {letter}
                        </span>
                        {justBroke ? (
                          <span className="pick-chips" aria-hidden>
                            <i />
                            <i />
                            <i />
                            <i />
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </div>
                ) : null}
                {index === pickOn ? (
                  <img
                    key={round.swing?.id ?? "ready"}
                    src={`${ART}/pickaxe.png?v=kit3`}
                    alt=""
                    className={`pick-axe pointer-events-none absolute z-10 ${round.swing ? (round.swing.kind === "hit" ? "pick-hit" : "pick-bounce") : "pick-ready"}`}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
        {pop ? (
          <div key={pop.id} className="pointer-events-none absolute top-1 right-3">
            <img src={`${ART}/${pop.kind}.png?v=kit3`} alt="" className="fx-pop h-16 w-16" />
          </div>
        ) : null}
        {cheer ? (
          <p key={cheer.id} className="type-cheer pointer-events-none absolute inset-x-0 top-1 text-center text-xl font-extrabold text-accent">
            {cheer.text}
          </p>
        ) : null}
        {card ? (
          <div className="absolute inset-0 z-30 grid place-items-center">
            <div className="relative w-[min(34rem,94%)]">
              <img src={`${ART}/frame-wood.png?v=kit3`} alt="" className="h-auto w-full" />
              <img src={`${ART}/lantern.png?v=kit3`} alt="" className="lantern-flicker absolute -top-6 -left-1 h-14 w-10" />
              <div className="absolute inset-[24%_16%] flex flex-col items-center justify-center rounded-md bg-[#f4e6cf] text-center text-[#2a1c08] shadow-md">
                <p className="text-2xl font-extrabold leading-none">Level {card.level}</p>
                <p className="mt-1 text-base font-extrabold">{card.praise ? "Great job typing!" : "Type the letters."}</p>
                <p className="text-base font-extrabold">Combo x{hud.combo}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <div className="mx-auto w-full max-w-3xl space-y-2 pb-2">
        {rows.map((row) => (
          <div key={row} className="flex justify-center gap-1.5">
            {row.split("").map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => pressRef.current(letter)}
                className="min-h-12 min-w-8 flex-1 rounded-md border-2 border-border bg-surface text-lg font-extrabold text-[#fff8ea] uppercase"
              >
                {letter}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
