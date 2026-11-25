import { useEffect, useRef, useState } from "react";
import { CharacterSelect } from "@/components/dojo/character-select";
import { RankScroll, ResultsScroll } from "@/components/dojo/game-scrolls";
import { TypingRun } from "@/components/dojo/typing-run";
import { TypeMeRun } from "@/components/dojo/type-me-run";
import { ninjaBoardFn, ninjaFinishFn, ninjaQueueCloseFn, ninjaQueueLockFn, ninjaQueuePollFn, ninjaQueueReadyFn, ninjaRosterFn, ninjaStartFn } from "@/lib/dojo/api";
import { beltAllows, turnCopy, type ActiveRun, type GameBadge, type NinjaCard, type RankRow, type TurnNote } from "@/lib/dojo/games";
import { beltToken, type Belt } from "@/lib/dojo/types";

const CODE_KEY = "blockdojo-ninja-code";
const WHO_KEY = "blockdojo-ninja-id";

const TILES: { id: "typing" | "typeme" | "belts" | "rosie"; title: string; open: boolean; line: string; minBelt: Belt | null; art?: string }[] = [
  { id: "typing", title: "Typing", open: true, minBelt: "White", line: "Catch the ore carts before the dark takes them." },
  { id: "typeme", title: "Type Me If You Can", open: true, minBelt: "Yellow", line: "Type the call. Land the hit before the rival does.", art: "/art/typeme-card.jpg" },
  { id: "belts", title: "Belt Match", open: false, minBelt: null, line: "Painted shut." },
  { id: "rosie", title: "Rosie's Path", open: false, minBelt: null, line: "Painted shut." },
];

type Gate = "arm" | "queue" | null;
type QueueMode = "search" | "found" | "bot";
type QueueView = {
  ok: true;
  status: "waiting" | "bot" | "matched";
  queueId: string;
  readyAt: number;
  youLocked: boolean;
  youFighter: string;
  foeLocked: boolean;
  foeFighter: string;
  foeName: string;
  go: boolean;
  match?: { matchId: string; side: "a" | "b"; foeName: string };
};
type FightLink = { phone: string; studentId: string; matchId: string; side: "a" | "b"; foeName: string };
type Haul = { words: number; coins: number; exp: number; badges: GameBadge[]; ranks: RankRow[]; game: "typing" | "typeme" };
type Fly = "in" | "hold" | "out";

function readSaved(key: string) {
  try {
    return sessionStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

export function NinjaHall() {
  const [code, setCode] = useState("");
  const [savedCode, setSavedCode] = useState("");
  const [ninjas, setNinjas] = useState<NinjaCard[]>([]);
  const [ninja, setNinja] = useState<NinjaCard | null>(null);
  const [note, setNote] = useState<TurnNote>(null);
  const [ranks, setRanks] = useState<RankRow[]>([]);
  const [run, setRun] = useState<ActiveRun | null>(null);
  const [haul, setHaul] = useState<Haul | null>(null);
  const [step, setStep] = useState<"code" | "names" | "wall" | "play" | "results" | "ranks">("code");
  const [fly, setFly] = useState<Fly>("in");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [gate, setGate] = useState<Gate>(null);
  const [queueId, setQueueId] = useState("");
  const [readyAt, setReadyAt] = useState(0);
  const [tick, setTick] = useState(0);
  const [match, setMatch] = useState<FightLink | null>(null);
  const [cursor, setCursor] = useState("rosie");
  const [lockedFighter, setLockedFighter] = useState("");
  const [queueMode, setQueueMode] = useState<QueueMode>("search");
  const [foePick, setFoePick] = useState({ name: "", locked: false, fighter: "" });
  const [youFighter, setYouFighter] = useState("");
  const [foeFighter, setFoeFighter] = useState("");
  const going = useRef(false);
  const lockSent = useRef(false);

  const openBoard = async (phone: string, studentId: string) => {
    const result = await ninjaBoardFn({ data: { phone, studentId } });
    if (!result.ok) {
      setError(result.reason);
      setStep("code");
      return;
    }
    setNinja(result.ninja);
    setNote(result.note);
    setRanks(result.ranks);
    setRun(result.active);
    setStep(result.active ? "play" : "wall");
  };

  useEffect(() => {
    const phone = readSaved(CODE_KEY);
    const studentId = readSaved(WHO_KEY);
    if (!phone) return;
    setSavedCode(phone);
    void ninjaRosterFn({ data: { phone } }).then((result) => {
      if (!result.ok) return;
      setNinjas(result.ninjas);
      if (studentId && result.ninjas.some((card) => card.id === studentId)) void openBoard(phone, studentId);
      else setStep("names");
    });
  }, []);

  useEffect(() => {
    if (step !== "results" && step !== "ranks") return;
    const enter = window.setTimeout(() => setFly("hold"), 900);
    const leave = window.setTimeout(() => setFly("out"), step === "results" ? 5200 : 6400);
    const next = window.setTimeout(() => {
      if (step === "results") {
        setStep("ranks");
        setFly("in");
      } else {
        setStep("wall");
        setFly("in");
      }
    }, step === "results" ? 6000 : 7200);
    return () => {
      window.clearTimeout(enter);
      window.clearTimeout(leave);
      window.clearTimeout(next);
    };
  }, [step]);

  const submitCode = async () => {
    setBusy(true);
    setError("");
    const result = await ninjaRosterFn({ data: { phone: code } });
    setBusy(false);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    try {
      sessionStorage.setItem(CODE_KEY, code);
    } catch {
      /* private mode */
    }
    setSavedCode(code);
    setNinjas(result.ninjas);
    setStep("names");
  };

  const choose = async (card: NinjaCard) => {
    setBusy(true);
    setError("");
    try {
      sessionStorage.setItem(WHO_KEY, card.id);
    } catch {
      /* private mode */
    }
    await openBoard(savedCode, card.id);
    setBusy(false);
  };

  const start = async (game: "typing" | "typeme") => {
    if (!ninja) return;
    setBusy(true);
    const result = await ninjaStartFn({ data: { phone: savedCode, studentId: ninja.id, game } });
    setBusy(false);
    if (!result.ok) {
      setNote("note" in result && result.note ? result.note : "week");
      setError("");
      return;
    }
    setRun({ ...result.run, game: result.run.game === "typeme" ? "typeme" : "typing" });
    setGate(null);
    setStep("play");
  };

  const enterMatch = (info: { matchId: string; side: "a" | "b"; foeName: string }) => {
    if (!ninja) return;
    setMatch({ phone: savedCode, studentId: ninja.id, matchId: info.matchId, side: info.side, foeName: info.foeName });
  };

  const applyQueue = async (result: { ok: boolean; reason?: string }) => {
    if (!result.ok || !("status" in result)) return;
    const view = result as QueueView;
    if (view.youLocked && view.youFighter) setLockedFighter(view.youFighter);
    if (view.status === "waiting") setQueueMode("search");
    if (view.status === "bot") {
      setQueueMode("bot");
      setFoePick({ name: "", locked: false, fighter: "" });
    }
    if (view.status === "matched") {
      setQueueMode("found");
      setFoePick({ name: view.foeName, locked: view.foeLocked, fighter: view.foeFighter });
    }
    if (!view.go || going.current) return;
    going.current = true;
    setYouFighter(view.youFighter || "rosie");
    setFoeFighter(view.foeFighter || "rosie");
    if (view.status === "matched" && view.match) enterMatch(view.match);
    else setMatch(null);
    await start("typeme");
  };

  const ready = async () => {
    if (!ninja) return;
    setBusy(true);
    setError("");
    const result = await ninjaQueueReadyFn({ data: { phone: savedCode, studentId: ninja.id } });
    setBusy(false);
    if (!result.ok) {
      setError(result.reason);
      setGate(null);
      return;
    }
    going.current = false;
    lockSent.current = false;
    setLockedFighter("");
    setCursor("rosie");
    setQueueMode(result.status === "matched" ? "found" : result.status === "bot" ? "bot" : "search");
    setFoePick({ name: "", locked: false, fighter: "" });
    setQueueId(result.queueId);
    setReadyAt(result.readyAt);
    setGate("queue");
    await applyQueue(result);
  };

  const lockIn = async (fighter: string) => {
    if (!ninja || !queueId || lockSent.current || lockedFighter) return;
    lockSent.current = true;
    const result = await ninjaQueueLockFn({ data: { phone: savedCode, studentId: ninja.id, queueId, fighter } });
    if (!result.ok) {
      lockSent.current = false;
      setError(result.reason);
      return;
    }
    setLockedFighter(fighter);
    await applyQueue(result);
  };

  const closeGate = async () => {
    if (queueId && ninja) void ninjaQueueCloseFn({ data: { phone: savedCode, studentId: ninja.id, queueId } });
    going.current = false;
    lockSent.current = false;
    setLockedFighter("");
    setQueueMode("search");
    setFoePick({ name: "", locked: false, fighter: "" });
    setGate(null);
    setQueueId("");
  };

  useEffect(() => {
    if (gate !== "queue") return;
    const clock = window.setInterval(() => setTick((value) => value + 1), 250);
    return () => window.clearInterval(clock);
  }, [gate]);

  useEffect(() => {
    if (gate !== "queue" || !queueId || !ninja) return;
    let stop = false;
    const look = async () => {
      const result = await ninjaQueuePollFn({ data: { phone: savedCode, studentId: ninja.id, queueId } });
      if (stop || !result.ok) return;
      await applyQueue(result);
    };
    const timer = window.setInterval(() => void look(), 500);
    void look();
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [gate, queueId, ninja, savedCode]);

  useEffect(() => {
    if (gate !== "queue" || !readyAt || lockSent.current || lockedFighter) return;
    if (Date.now() - readyAt < 30_000) return;
    void lockIn("rosie");
  }, [tick, gate, readyAt, lockedFighter, queueId]);

  const finish = async (stats: { words: number; golden: number; lost?: boolean }) => {
    if (!ninja || !run) return;
    const game = run.game === "typeme" ? "typeme" : "typing";
    const result = await ninjaFinishFn({
      data: { phone: savedCode, studentId: ninja.id, runId: run.id, words: stats.words, golden: stats.golden, lost: Boolean(stats.lost) },
    });
    if (!result.ok) {
      setError(result.reason);
      setStep("wall");
      return;
    }
    setHaul({ words: result.words, coins: result.coins, exp: result.exp, badges: result.badges, ranks: result.ranks, game: result.game === "typeme" ? "typeme" : game });
    setRanks(result.ranks);
    const board = await ninjaBoardFn({ data: { phone: savedCode, studentId: ninja.id } });
    if (board.ok) setNote(board.note);
    setRun(null);
    setMatch(null);
    setFly("in");
    setStep("results");
  };

  const arena = Boolean(gate) || (step === "play" && run?.game === "typeme") || ((step === "results" || step === "ranks") && haul?.game === "typeme");

  return (
    <main className="relative min-h-dvh overflow-hidden text-fg">
      {arena ? (
        <video className="absolute inset-0 h-full w-full object-cover object-[center_72%]" src="/art/arena-loop.mp4" autoPlay muted loop playsInline />
      ) : (
        <img src="/art/cave.jpg?v=winter" alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      {arena ? null : <div className="absolute inset-0 bg-bg-deep/72" />}
      {step === "code" ? (
        <form
          className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submitCode();
          }}
        >
          <div className="rounded-lg border-4 border-accent bg-bg/90 p-5 text-center shadow-xl">
            <p className="font-pixel text-pixel text-accent">BLOCKDOJO</p>
            <h1 className="mt-2 text-2xl font-extrabold">Ninja games</h1>
            <p className="mt-1 text-sm font-bold text-muted">Read the 4-character code on the cave.</p>
            <input
              value={code}
              autoCapitalize="characters"
              autoComplete="off"
              maxLength={4}
              aria-label="Code on the cave"
              onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))}
              className="mt-4 w-full text-center text-3xl font-extrabold tracking-[0.3em] uppercase"
            />
            <button
              type="submit"
              disabled={busy || code.length < 4}
              className="mt-3 min-h-12 w-full rounded-md border-4 border-accent bg-accent font-extrabold text-accent-ink disabled:opacity-60"
            >
              {busy ? "Opening…" : "Enter"}
            </button>
            <p className="mt-2 min-h-5 text-sm font-extrabold text-primary" role="status">
              {error}
            </p>
          </div>
        </form>
      ) : null}

      {step === "names" ? (
        <section className="relative z-10 mx-auto max-w-5xl px-4 py-6">
          <p className="font-pixel text-pixel text-accent">WHO IS TRAINING?</p>
          <div className="mt-4 columns-1 gap-3 sm:columns-2 lg:columns-3">
            {ninjas.map((card) => (
              <button
                key={card.id}
                type="button"
                disabled={busy}
                onClick={() => void choose(card)}
                className="mb-3 flex w-full break-inside-avoid items-center gap-3 rounded-lg border-4 border-border bg-bg/90 p-3 text-left shadow-lg"
              >
                <span className="h-14 w-3 rounded-full" style={{ background: `var(--color-${beltToken(card.belt)})` }} />
                <span>
                  <span className="block text-lg font-extrabold">{card.name}</span>
                  <span className="text-sm font-bold text-muted">{card.belt} belt</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {step === "wall" && ninja && gate === "arm" ? (
        <section className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 pb-8">
          <img src="/art/typeme-title.webp?v=2" alt="Type Me If You Can" className="title-float w-[min(40rem,94vw)] drop-shadow-[0_16px_16px_rgba(0,0,0,0.5)]" />
          <div className="mt-2 grid w-[min(22rem,88vw)] grid-cols-2 gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => void ready()}
                className="min-h-12 rounded-md border-4 border-accent bg-accent font-extrabold text-accent-ink disabled:opacity-60"
              >
                Ready
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void closeGate()}
                className="min-h-12 rounded-md border-4 border-border bg-bg font-extrabold"
              >
                Close
              </button>
            </div>
        </section>
      ) : null}

      {step === "wall" && ninja && gate === "queue" ? (
            <CharacterSelect
              belt={ninja.belt}
              cursor={cursor}
              locked={Boolean(lockedFighter)}
              searchLabel={
                queueMode === "bot"
                  ? "Training rival is ready"
                  : queueMode === "found"
                    ? foePick.name
                      ? `${foePick.name} found`
                      : "Ninja found"
                    : `Looking for a ninja… ${Math.max(0, Math.ceil((30_000 - (Date.now() - readyAt)) / 1000))}`
              }
              lockLeft={lockedFighter ? 0 : Math.max(0, Math.ceil((30_000 - (Date.now() - readyAt)) / 1000))}
              foeLine={
                queueMode === "found"
                  ? foePick.locked
                    ? `${foePick.name} locked in`
                    : `${foePick.name} is choosing`
                  : lockedFighter && queueMode === "search"
                    ? "Locked. Still looking…"
                    : queueMode === "bot" && !lockedFighter
                      ? "Lock in to fight"
                      : ""
              }
              onCursor={setCursor}
              onLock={(id) => void lockIn(id)}
              onClose={() => void closeGate()}
            />
      ) : null}

      {step === "wall" && ninja && !gate ? (
        <section className="relative z-10 mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-pixel text-pixel text-accent">GAME WALL</p>
              <h1 className="mt-2 text-2xl font-extrabold">{ninja.name}</h1>
              <p className="text-sm font-bold text-muted">{ninja.belt} belt</p>
            </div>
            <button
              type="button"
              onClick={() => {
                try {
                  sessionStorage.removeItem(WHO_KEY);
                } catch {
                  /* private mode */
                }
                setNinja(null);
                setStep("names");
              }}
              className="min-h-11 rounded-md border-2 border-border bg-bg/85 px-3 font-extrabold"
            >
              Switch ninja
            </button>
          </div>
          {note ? (
            <p className="float-card fixed top-6 left-1/2 z-30 w-[min(36rem,calc(100%-2rem))] rounded-lg border-4 border-accent bg-bg/95 px-4 py-3 text-center text-lg font-extrabold shadow-xl">
              {turnCopy(note)}
            </p>
          ) : null}
          <div className="mt-4 columns-1 gap-4 sm:columns-2">
            {TILES.map((tile) => {
              const allowed = !tile.minBelt || beltAllows(ninja.belt, tile.minBelt);
              return (
              <article key={tile.id} className="mb-4 break-inside-avoid overflow-hidden rounded-lg border-4 border-border bg-bg/88 shadow-xl">
                {tile.id === "typeme" ? (
                  <div className="relative aspect-[16/9] overflow-hidden bg-black">
                    <video className="absolute inset-0 h-full w-full object-cover" src="/art/arena-loop.mp4" autoPlay muted loop playsInline />
                    <img src="/art/typeme-title.png?v=2" alt={tile.title} className="relative z-10 w-full" />
                    {tile.minBelt ? (
                      <span className="absolute top-2 right-2 z-20 flex items-center gap-2 rounded-md border-2 border-black/40 bg-bg/90 px-2 py-1 text-sm font-extrabold">
                        <span
                          className="h-4 w-10 rounded-full border-2 border-black/40"
                          style={{ background: `var(--color-${beltToken(tile.minBelt)})` }}
                        />
                        {tile.minBelt} belt and up
                      </span>
                    ) : null}
                  </div>
                ) : tile.art ? (
                  <div className="relative">
                    <img src={tile.art} alt={tile.title} className="aspect-[16/9] w-full object-cover" />
                    {tile.minBelt ? (
                      <span className="absolute top-2 right-2 flex items-center gap-2 rounded-md border-2 border-black/40 bg-bg/90 px-2 py-1 text-sm font-extrabold">
                        <span
                          className="h-4 w-10 rounded-full border-2 border-black/40"
                          style={{ background: `var(--color-${beltToken(tile.minBelt)})` }}
                        />
                        {tile.minBelt} belt and up
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 px-4 pt-4">
                    <p className="font-pixel text-pixel text-accent">{tile.title}</p>
                    {tile.minBelt ? (
                      <span className="flex items-center gap-2 text-sm font-extrabold">
                        <span
                          className="h-4 w-10 rounded-full border-2 border-black/40"
                          style={{ background: `var(--color-${beltToken(tile.minBelt)})` }}
                        />
                        {tile.minBelt} belt and up
                      </span>
                    ) : null}
                  </div>
                )}
                <div className="p-4">
                <p className={tile.art ? "min-h-12 text-lg font-extrabold" : "mt-3 min-h-16 text-lg font-extrabold"}>{tile.line}</p>
                {tile.open ? (
                  <button
                    type="button"
                    disabled={busy || Boolean(note) || !allowed}
                    onClick={() => {
                      if (tile.id === "typeme") {
                        setGate("arm");
                        return;
                      }
                      void start("typing");
                    }}
                    className="mt-3 min-h-12 w-full rounded-md border-4 border-accent bg-accent font-extrabold text-accent-ink disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {!allowed && tile.minBelt ? `Needs a ${tile.minBelt} belt` : note ? "Resting" : "Play"}
                  </button>
                ) : (
                  <p className="mt-3 text-sm font-extrabold text-muted">Soon</p>
                )}
                </div>
              </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {step === "play" && run ? (
        <div className="relative z-10">
          {run.game === "typeme" ? (
            <TypeMeRun endsAt={run.endsAt} match={match} youFighter={youFighter} foeFighter={foeFighter} onFinish={(stats) => void finish(stats)} />
          ) : (
            <TypingRun endsAt={run.endsAt} onFinish={(stats) => void finish(stats)} />
          )}
        </div>
      ) : null}

      {step === "results" && haul ? (
        <ResultsScroll phase={fly} words={haul.words} coins={haul.coins} exp={haul.exp} badges={haul.badges} />
      ) : null}
      {step === "ranks" && haul ? (
        <RankScroll
          phase={fly}
          ranks={haul.ranks.length ? haul.ranks : ranks}
          you={ninja?.id ?? ""}
          heading={haul.game === "typeme" ? "TOP FIGHTER" : "TOP TYPER"}
        />
      ) : null}
      {error && step !== "code" ? <p className="relative z-20 px-4 py-2 text-center font-extrabold text-primary">{error}</p> : null}
    </main>
  );
}
