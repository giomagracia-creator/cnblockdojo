import { useEffect, useRef, useState } from "react";
import { caveAudio } from "@/lib/dojo/audio";
import { ninjaMatchStateFn, ninjaMatchTypeFn } from "@/lib/dojo/api";
import { RosieMovie, type RosieClip } from "@/components/dojo/character-select";
import type { FightSnap, MoveKind, MoveWord } from "@/lib/dojo/games";
import { botDelay, botLetter, createLive, movesOf, poseNow, press, type LiveState } from "@/lib/dojo/fight-live";

export type FightLink = { phone: string; studentId: string; matchId: string; side: "a" | "b"; foeName: string };

type Pose = "idle" | "run" | "attack" | "hurt" | "down";
type Phase = "intro" | "fight" | "ko" | "match";

type View = {
  phase: Phase;
  youHp: number;
  foeHp: number;
  youRounds: number;
  foeRounds: number;
  round: number;
  youPos: number;
  foePos: number;
  youMoves: MoveWord[];
  foeMoves: MoveWord[];
  youPose: Pose;
  foePose: Pose;
  banner: string;
  turn: number;
};

type Sim = {
  phase: Phase;
  until: number;
  introAt: number;
  live: LiveState;
  youRounds: number;
  foeRounds: number;
  round: number;
  match: number;
  hits: number;
  clean: number;
  banner: string;
  clash: boolean;
  botAt: number;
};

const INTRO_MS = 2800;

function clock(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function rosieClip(pose: Pose, phase: Phase): RosieClip {
  if (pose === "attack") return "attack";
  if (pose === "hurt" || pose === "down") return "hurt";
  if (pose === "run" || phase === "intro") return "run";
  return "idle";
}

function rosieFlip(clip: RosieClip, side: "you" | "foe") {
  const facesRight = side === "you";
  if (clip === "run") return !facesRight;
  if (clip === "attack" || clip === "hurt") return facesRight;
  return !facesRight;
}

function rosieRate(clip: RosieClip) {
  if (clip === "attack") return 2.2;
  if (clip === "hurt") return 2;
  return 1;
}

function useRosieSounds(clips: RosieClip[]) {
  const key = [...new Set(clips)].sort().join(",");
  useEffect(() => {
    const unique = key ? (key.split(",") as RosieClip[]) : [];
    const tracks = unique.map((clip) => {
      const audio = new Audio(`/art/typeme/rosie/${clip}.mp3`);
      audio.loop = clip === "idle" || clip === "run";
      audio.volume = clip === "idle" ? 0.42 : clip === "run" ? 0.58 : 0.82;
      audio.playbackRate = rosieRate(clip);
      return audio;
    });
    let dead = false;
    const sync = () => {
      if (dead) return;
      const off = caveAudio.snapshot() === "off";
      for (const audio of tracks) {
        if (off) audio.pause();
        else void audio.play().catch(() => {});
      }
    };
    const unsub = caveAudio.subscribe(sync);
    window.addEventListener("pointerdown", sync);
    window.addEventListener("keydown", sync);
    sync();
    return () => {
      dead = true;
      unsub();
      window.removeEventListener("pointerdown", sync);
      window.removeEventListener("keydown", sync);
      for (const audio of tracks) {
        audio.pause();
        audio.src = "";
      }
    };
  }, [key]);
}

function moveLabel(kind: MoveKind, mini: boolean) {
  if (mini) return kind === "attack" ? "Hit" : kind;
  if (kind === "forward") return "Forward";
  if (kind === "back") return "Back";
  return "Attack";
}

function MoveCard({ move, hot, shake, mini }: { move: MoveWord; hot?: boolean; shake?: boolean; mini?: boolean }) {
  return (
    <div className={`tm-move tm-move-${move.kind} ${hot ? "tm-move-hot" : ""} ${mini ? "tm-move-mini" : ""} ${shake ? "tm-shake" : ""}`}>
      <p className="tm-move-label">{moveLabel(move.kind, Boolean(mini))}</p>
      <p className="tm-move-word">
        {move.word.split("").map((letter, index) => (
          <span key={`${move.kind}-${move.word}-${index}`} className={index < move.typed.length ? "text-accent" : ""}>
            {letter}
          </span>
        ))}
      </p>
    </div>
  );
}

export function TypeMeRun({
  endsAt,
  onFinish,
  match = null,
  youFighter = "rosie",
  foeFighter = "rosie",
}: {
  endsAt: number;
  onFinish: (stats: { words: number; golden: number; lost?: boolean }) => void;
  match?: FightLink | null;
  youFighter?: string;
  foeFighter?: string;
}) {
  const sim = useRef<Sim>({
    phase: "intro",
    until: Date.now() + INTRO_MS,
    introAt: Date.now(),
    live: createLive(),
    youRounds: 0,
    foeRounds: 0,
    round: 1,
    match: 1,
    hits: 0,
    clean: 0,
    banner: "TYPE ME IF YOU CAN",
    clash: false,
    botAt: 0,
  });
  const done = useRef(false);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const [shakeKind, setShakeKind] = useState<MoveKind | "">("");
  const [callout, setCallout] = useState("");
  const flashRef = useRef<(text: string) => void>(() => {});
  const shakeRef = useRef<(kind: MoveKind) => void>(() => {});
  flashRef.current = (text) => {
    setCallout(text);
    window.setTimeout(() => setCallout((current) => (current === text ? "" : current)), 520);
  };
  shakeRef.current = (kind) => {
    setShakeKind(kind);
    window.setTimeout(() => setShakeKind((current) => (current === kind ? "" : current)), 180);
  };
  const [view, setView] = useState<View>({
    phase: "intro",
    youHp: 100,
    foeHp: 100,
    youRounds: 0,
    foeRounds: 0,
    round: 1,
    youPos: 0,
    foePos: 0,
    youMoves: [],
    foeMoves: [],
    youPose: "run",
    foePose: "run",
    banner: "TYPE ME IF YOU CAN",
    turn: Math.max(0, endsAt - Date.now()),
  });
  const pressRef = useRef<(letter: string) => void>(() => {});

  useEffect(() => {
    if (match) return;
    const simNow = sim.current;

    const beginRound = () => {
      simNow.live = createLive();
      simNow.clash = false;
      simNow.phase = "intro";
      simNow.introAt = Date.now();
      simNow.until = Date.now() + INTRO_MS;
      simNow.banner = "TYPE ME IF YOU CAN";
      simNow.botAt = 0;
    };

    const openKo = () => {
      if (simNow.phase !== "fight") return;
      const youDead = simNow.live.a.hp <= 0;
      const foeDead = simNow.live.b.hp <= 0;
      if (youDead && foeDead) {
        simNow.clash = true;
        simNow.banner = "CLASH";
        simNow.phase = "ko";
        simNow.until = Date.now() + 1500;
        return;
      }
      const youWin = foeDead;
      if (youWin) {
        simNow.youRounds += 1;
        if (!simNow.live.a.hurt) simNow.clean += 1;
        caveAudio.cue("award");
      } else {
        simNow.foeRounds += 1;
      }
      simNow.banner = youWin ? "YOU WIN THE ROUND" : "ROUND LOST";
      simNow.phase = "ko";
      simNow.until = Date.now() + 1500;
    };

    const advance = () => {
      if (simNow.phase === "intro") {
        simNow.phase = "fight";
        simNow.banner = "";
        simNow.botAt = Date.now() + botDelay(simNow.round);
        return;
      }
      if (simNow.phase === "ko") {
        if (simNow.youRounds >= 2 || simNow.foeRounds >= 2) {
          simNow.banner = simNow.youRounds >= 2 ? "YOU WIN" : "NEXT MATCH";
          simNow.phase = "match";
          simNow.until = Date.now() + 1600;
        } else if (simNow.clash) {
          beginRound();
        } else {
          simNow.round += 1;
          beginRound();
        }
        return;
      }
      if (simNow.phase === "match") {
        simNow.match += 1;
        simNow.round = 1;
        simNow.youRounds = 0;
        simNow.foeRounds = 0;
        beginRound();
      }
    };

    const finish = () => {
      if (done.current) return;
      done.current = true;
      finishRef.current({ words: simNow.hits, golden: simNow.clean, lost: simNow.foeRounds > simNow.youRounds });
    };

    pressRef.current = (letter: string) => {
      if (done.current || simNow.phase !== "fight") return;
      const result = press(simNow.live, "a", letter, Date.now());
      if (result.miss) {
        shakeRef.current(result.miss);
        caveAudio.cue("tip");
      }
      if (result.note === "hit") {
        simNow.hits += 1;
        caveAudio.cue("hit");
        flashRef.current("HIT");
      } else if (result.note === "whiff") {
        flashRef.current("TOO FAR");
      } else if (result.note === "trade") {
        caveAudio.cue("tip");
        flashRef.current("CLASH");
      }
      if (result.ko) openKo();
    };

    let frame = 0;
    const loop = () => {
      const now = Date.now();
      if (now >= endsAt) {
        finish();
        return;
      }
      if (now >= simNow.until && simNow.phase !== "fight") advance();
      if (simNow.phase === "fight" && simNow.botAt > 0 && now >= simNow.botAt) {
        const letter = botLetter(simNow.live.b, simNow.live.a);
        if (letter) {
          const result = press(simNow.live, "b", letter, now);
          if (result.note === "hit") {
            caveAudio.cue("tip");
            flashRef.current("OUCH");
          } else if (result.note === "trade") {
            flashRef.current("CLASH");
          }
          if (result.ko) openKo();
        }
        const pause = Math.random() < 0.12 ? botDelay(simNow.round) : 0;
        simNow.botAt = now + botDelay(simNow.round) + pause;
      }
      if (simNow.phase === "intro") {
        const elapsed = now - simNow.introAt;
        simNow.banner = elapsed < 1100 ? "TYPE ME IF YOU CAN" : elapsed < 2000 ? `ROUND ${simNow.round}` : "FIGHT";
      }
      const you = simNow.live.a;
      const foe = simNow.live.b;
      const fighting = simNow.phase === "fight";
      setView({
        phase: simNow.phase,
        youHp: you.hp,
        foeHp: foe.hp,
        youRounds: simNow.youRounds,
        foeRounds: simNow.foeRounds,
        round: simNow.round,
        youPos: you.pos,
        foePos: foe.pos,
        youMoves: fighting ? movesOf(you) : [],
        foeMoves: fighting ? movesOf(foe) : [],
        youPose: simNow.phase === "intro" ? "run" : poseNow(you, now),
        foePose: simNow.phase === "intro" ? "run" : poseNow(foe, now),
        banner: simNow.banner,
        turn: Math.max(0, endsAt - now),
      });
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);

    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (/^[a-zA-Z]$/.test(event.key)) {
        event.preventDefault();
        pressRef.current(event.key.toLowerCase());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
    };
  }, [endsAt, match]);

  useEffect(() => {
    if (!match) return;
    let stop = false;
    let lastPose = "";
    const stats = { hits: 0, clean: 0, youRounds: 0, foeRounds: 0 };
    const finish = () => {
      if (done.current) return;
      done.current = true;
      finishRef.current({ words: stats.hits, golden: stats.clean, lost: stats.foeRounds > stats.youRounds });
    };
    const paint = (viewSnap: FightSnap) => {
      stats.hits = viewSnap.hits;
      stats.clean = viewSnap.clean;
      stats.youRounds = viewSnap.youRounds;
      stats.foeRounds = viewSnap.foeRounds;
      const hurt = viewSnap.youPose === "hurt" && lastPose !== "hurt";
      lastPose = viewSnap.youPose;
      setView({
        phase: viewSnap.phase === "stop" ? "fight" : viewSnap.phase,
        youHp: viewSnap.youHp,
        foeHp: viewSnap.foeHp,
        youRounds: viewSnap.youRounds,
        foeRounds: viewSnap.foeRounds,
        round: viewSnap.round,
        youPos: viewSnap.youPos,
        foePos: viewSnap.foePos,
        youMoves: viewSnap.youMoves,
        foeMoves: viewSnap.foeMoves,
        youPose: viewSnap.youPose,
        foePose: viewSnap.foePose,
        banner: viewSnap.banner,
        turn: Math.max(0, endsAt - Date.now()),
      });
      return hurt;
    };
    const pull = async () => {
      const result = await ninjaMatchStateFn({ data: { phone: match.phone, studentId: match.studentId, matchId: match.matchId } });
      if (stop || !result.ok) return;
      if (Date.now() >= endsAt) finish();
      if (paint(result.view)) {
        caveAudio.cue("tip");
        flashRef.current("OUCH");
      }
    };
    pressRef.current = (letter: string) => {
      if (done.current) return;
      void ninjaMatchTypeFn({
        data: { phone: match.phone, studentId: match.studentId, matchId: match.matchId, letter },
      }).then((result) => {
        if (stop || !result.ok) return;
        const hurt = paint(result.view);
        if (result.shake) {
          shakeRef.current(result.shake);
          caveAudio.cue("tip");
        }
        if (result.note === "hit") {
          caveAudio.cue("hit");
          flashRef.current("HIT");
        } else if (result.note === "whiff") {
          flashRef.current("TOO FAR");
        } else if (result.note === "trade") {
          caveAudio.cue("tip");
          flashRef.current("CLASH");
        } else if (hurt) {
          caveAudio.cue("tip");
          flashRef.current("OUCH");
        }
      });
    };
    const timer = window.setInterval(() => void pull(), 160);
    void pull();
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (/^[a-zA-Z]$/.test(event.key)) {
        event.preventDefault();
        pressRef.current(event.key.toLowerCase());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      stop = true;
      window.clearInterval(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [endsAt, match]);

  const rows = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
  const youClip = rosieClip(view.youPose, view.phase);
  const foeClip = rosieClip(view.foePose, view.phase);
  useRosieSounds(youFighter === "rosie" || foeFighter === "rosie" ? [youClip, foeClip] : []);
  const pips = (count: number, end: boolean) => (
    <span className={`mt-1 flex gap-1 ${end ? "justify-end" : ""}`}>
      {[0, 1].map((pip) => (
        <span key={pip} className={`h-2.5 w-2.5 rounded-full border border-[#fff8ea]/70 ${pip < count ? "bg-accent" : "bg-transparent"}`} />
      ))}
    </span>
  );

  return (
    <div className="relative z-10 flex h-dvh flex-col px-3 pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-[#fff8ea]">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 drop-shadow-[0_2px_0_#1a120c]">
        <div>
          <p className="text-[10px] font-extrabold uppercase">You</p>
          <div className="h-4 overflow-hidden rounded-sm border-2 border-[#2a1c08] bg-black/50">
            <div className="h-full bg-[#3ecf6e]" style={{ width: `${view.youHp}%` }} />
          </div>
          {pips(view.youRounds, false)}
        </div>
        <div className="text-center">
          <p className="font-pixel text-pixel text-accent">TYPE ME</p>
          <p className="text-xl font-extrabold tabular-nums">{clock(view.turn)}</p>
        </div>
        <div>
          <p className="text-right text-[10px] font-extrabold uppercase">{match?.foeName ?? "Rival"}</p>
          <div className="h-4 overflow-hidden rounded-sm border-2 border-[#2a1c08] bg-black/50">
            <div className="ml-auto h-full bg-[#e04b3a]" style={{ width: `${view.foeHp}%` }} />
          </div>
          {pips(view.foeRounds, true)}
        </div>
      </div>
      <div className="relative mt-2 min-h-0 flex-1">
        <div className={`tm-fighter tm-you tm-lane-${view.youPos} tm-pose-${view.youPose} ${youFighter === "rosie" ? "tm-rosie" : ""} ${view.phase === "intro" && youFighter === "rosie" ? "tm-runin" : ""} ${view.youPose === "idle" && youFighter !== "rosie" ? "tm-idle" : ""}`}>
          {youFighter === "rosie" ? (
            <RosieMovie clip={youClip} flip={rosieFlip(youClip, "you")} rate={rosieRate(youClip)} />
          ) : (
            <img src={`/art/typeme/you-${view.youPose === "run" ? "idle" : view.youPose}.png`} alt="" />
          )}
        </div>
        <div className={`tm-fighter tm-foe tm-lane-${view.foePos} tm-pose-${view.foePose} ${foeFighter === "rosie" ? "tm-rosie" : ""} ${view.phase === "intro" && foeFighter === "rosie" ? "tm-runin" : ""} ${view.foePose === "idle" && foeFighter !== "rosie" ? "tm-idle" : ""}`}>
          {foeFighter === "rosie" ? (
            <RosieMovie clip={foeClip} flip={rosieFlip(foeClip, "foe")} rate={rosieRate(foeClip)} />
          ) : (
            <img src={`/art/typeme/foe-${view.foePose === "run" ? "idle" : view.foePose}.png`} alt="" />
          )}
        </div>
        {view.phase === "fight" ? (
          <>
            <div className="tm-moves">
              {view.youMoves.map((move) => (
                <MoveCard key={move.kind} move={move} hot={move.typed.length > 0} shake={shakeKind === move.kind} />
              ))}
            </div>
            <div className="tm-foe-moves">
              {view.foeMoves.map((move) => (
                <MoveCard key={move.kind} move={move} mini hot={move.typed.length > 0} />
              ))}
            </div>
            {callout ? <p className="tm-hit">{callout}</p> : null}
          </>
        ) : null}
        {view.banner && view.phase !== "fight" ? (
          <p key={view.banner} className="tm-banner">
            {view.banner}
          </p>
        ) : null}
      </div>
      <div className="mx-auto w-full max-w-3xl space-y-1.5 rounded-lg bg-black/35 px-1.5 py-2 backdrop-blur-[2px]">
        {rows.map((row) => (
          <div key={row} className="flex justify-center gap-1.5">
            {row.split("").map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => pressRef.current(letter)}
                className="min-h-11 min-w-8 flex-1 rounded-md border-2 border-[#5a3d2a] bg-black/55 text-lg font-extrabold text-[#fff8ea] uppercase"
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
