import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { DojoLoading } from "@/components/dojo/join-screen";
import { AccessGate, useDoor } from "@/components/dojo/access-gate";
import { MineStage } from "@/components/dojo/mine-stage";
import { SoundToggle } from "@/components/dojo/sound-toggle";
import { caveAudio } from "@/lib/dojo/audio";
import { useDojo } from "@/lib/dojo/store";
import { beltClip, beltToken, displayName, type Achievement, type BeltCeremony, type DojoEvent, type ShopItem, type Student } from "@/lib/dojo/types";

function eventLine(event: DojoEvent) {
  if (event.kind === "redeem") return `${event.studentName} redeemed ${event.detail}`;
  if (event.kind === "welcome") return event.detail === "rename" ? `${event.studentName} has a new name` : `${event.studentName} joined the dojo`;
  if (event.kind === "belt") return `${event.studentName} reached ${event.detail}`;
  if (event.kind === "shop") return event.line || `Shop update: ${event.detail}`;
  if (event.kind === "undo") return event.line;
  if (event.kind === "return") return event.line;
  if (event.kind === "rest") return `${event.studentName} is resting`;
  if (event.kind === "pocket") return "";
  return `${event.studentName} earned ${event.detail}`;
}

function BeltShow({ ceremony }: { ceremony: BeltCeremony }) {
  const dismissCeremony = useDojo((state) => state.dismissCeremony);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    caveAudio.armMusic(false);
    const video = videoRef.current;
    let armed = false;
    const armTimer = window.setTimeout(() => {
      armed = true;
    }, 400);
    const dismiss = (event: Event) => {
      if (!armed) return;
      const target = event.target;
      if (target instanceof Element && target.closest("[data-sound-toggle]")) return;
      void dismissCeremony(ceremony.id);
    };
    window.addEventListener("pointerdown", dismiss, true);
    window.addEventListener("keydown", dismiss, true);
    const start = async () => {
      if (!video) return;
      video.muted = caveAudio.snapshot() === "off";
      try {
        await video.play();
      } catch {
        video.muted = true;
        try {
          await video.play();
        } catch {
          /* autoplay still blocked */
        }
      }
    };
    void start();
    return () => {
      window.clearTimeout(armTimer);
      window.removeEventListener("pointerdown", dismiss, true);
      window.removeEventListener("keydown", dismiss, true);
      caveAudio.armMusic(true);
    };
  }, [ceremony.id, dismissCeremony]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black"
      role="dialog"
      aria-modal="true"
      aria-label={`${ceremony.studentName}, ${ceremony.belt} belt`}
    >
      {failed ? (
        <div className="px-6 text-center">
          <p className="text-xl font-extrabold text-fg">
            {ceremony.studentName} tied on a {ceremony.belt} belt.
          </p>
          <p className="mt-2 text-sm font-bold text-white/70">Tap to return to the mine.</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={beltClip(ceremony.belt)}
          className="h-full w-full object-contain"
          autoPlay
          loop
          playsInline
          preload="auto"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function ShopBoard({ onClose }: { onClose: () => void }) {
  const items = useDojo((state) => state.items);
  const coins = items
    .filter((item) => item.currency !== "exp")
    .sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
  const exp = items
    .filter((item) => item.currency === "exp")
    .sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
  const sections = [
    { title: "Coins", list: coins },
    { title: "EXP", list: exp },
  ].filter((section) => section.list.length > 0);

  return (
    <section
      className="absolute inset-x-3 top-[11.5rem] bottom-[4.25rem] z-30 flex flex-col overflow-hidden rounded-lg border-4 border-accent bg-bg/92 shadow-2xl backdrop-blur-sm sm:inset-x-[8%] sm:top-44 sm:bottom-[5.25rem]"
      role="dialog"
      aria-label="Shop"
    >
      <div className="flex items-center justify-between gap-3 border-b-2 border-line px-3 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="font-pixel text-pixel text-accent">SHOP</p>
          <p className="mt-1 text-sm font-extrabold text-muted sm:text-base">Ask the Sensei to claim one.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 shrink-0 rounded-md border-2 border-border bg-surface px-3 font-extrabold"
        >
          Close
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-auto px-3 py-3 sm:px-5">
        {sections.length === 0 ? (
          <p className="py-6 text-center text-base font-extrabold text-muted">Nothing in the shop yet.</p>
        ) : (
          sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-pixel text-pixel text-accent">{section.title}</h3>
              <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {section.list.map((item) => (
                  <li key={item.id} className="flex flex-col rounded-md border-2 border-line bg-surface/80 p-2">
                    <img src={item.image} alt="" className="h-24 w-full rounded-md object-cover sm:h-32" />
                    <p className="mt-2 text-base leading-snug font-extrabold break-words sm:text-lg">{item.name}</p>
                    <p className="mt-1 text-lg font-extrabold text-accent tabular-nums sm:text-xl">
                      {item.price.toLocaleString()} {item.currency === "exp" ? "EXP" : "coins"}
                    </p>
                    <p className="text-xs font-bold text-muted sm:text-sm">
                      {item.currency === "exp" ? "Once" : item.stock > 0 ? `${item.stock} left` : "Out"}
                      {item.minBelt ? ` · ${item.minBelt} belt` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function ExpPath({ onClose }: { onClose: () => void }) {
  const students = useDojo((state) => state.students);
  const items = useDojo((state) => state.items);
  const [query, setQuery] = useState("");
  const prizes = useMemo(
    () => items.filter((item) => item.currency === "exp").sort((a, b) => a.price - b.price || a.name.localeCompare(b.name)),
    [items],
  );
  const goal = prizes.at(-1);
  const needle = query.trim().toLowerCase();
  const roster = useMemo(() => {
    const active = students.filter((student) => !student.archived);
    active.sort((a, b) => displayName(a).localeCompare(displayName(b), undefined, { sensitivity: "base" }));
    if (!needle) return active;
    return active.filter((student) => displayName(student).toLowerCase().includes(needle));
  }, [students, needle]);

  return (
    <section
      className="absolute inset-x-3 top-[11.5rem] bottom-[4.25rem] z-30 flex flex-col overflow-hidden rounded-lg border-4 border-accent bg-bg/92 shadow-2xl backdrop-blur-sm sm:inset-x-[8%] sm:top-44 sm:bottom-[5.25rem]"
      role="dialog"
      aria-label="EXP path"
    >
      <div className="flex items-start justify-between gap-3 border-b-2 border-line px-3 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="font-pixel text-pixel text-accent">EXP PATH</p>
          {goal ? (
            <p className="mt-1 text-lg leading-tight font-extrabold sm:text-2xl">
              {goal.name}
              <span className="text-accent"> · {goal.price.toLocaleString()} EXP</span>
            </p>
          ) : (
            <p className="mt-1 text-base font-extrabold">No EXP prizes in the shop yet.</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 shrink-0 rounded-md border-2 border-border bg-surface px-3 font-extrabold"
        >
          Close
        </button>
      </div>
      <div className="px-3 pt-3 sm:px-5">
        <label className="sr-only" htmlFor="exp-search">
          Find a ninja
        </label>
        <input
          id="exp-search"
          value={query}
          autoComplete="off"
          placeholder="Find a ninja"
          onChange={(event) => setQuery(event.target.value)}
          className="min-h-12 w-full"
        />
      </div>
      <ul className="mt-2 min-h-0 flex-1 space-y-2 overflow-auto px-3 pb-4 sm:px-5">
        {roster.length === 0 ? (
          <li className="py-6 text-center text-base font-extrabold text-muted">
            {needle ? "No ninja by that name." : "No ninjas in the cave yet."}
          </li>
        ) : (
          roster.map((student) => <ExpRow key={student.id} student={student} prizes={prizes} goal={goal} />)
        )}
      </ul>
    </section>
  );
}

function QuestCards({ quests }: { quests: Achievement[] }) {
  return (
    <div className="flex flex-col gap-2 pb-2">
      {(["daily", "weekly"] as const).map((cadence) => {
        const group = quests.filter((quest) => quest.cadence === cadence);
        if (!group.length) return null;
        return (
          <div key={cadence} className="flex flex-col gap-2">
            <p className="font-pixel text-pixel text-accent" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.9)" }}>
              {cadence === "daily" ? "Daily" : "Weekly"}
            </p>
            {group.map((quest) => (
              <article
                key={quest.id}
                className="flex items-center gap-2 rounded-md border border-white/25 bg-black/25 px-2 py-1.5"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.85)" }}
              >
                <img src={quest.image} alt="" className="size-10 shrink-0 rounded object-cover" />
                <div className="min-w-0">
                  <p className="text-sm leading-tight font-extrabold text-white">{quest.name}</p>
                  <p className="mt-0.5 text-xs font-extrabold text-accent tabular-nums">+{quest.coins} coins</p>
                </div>
              </article>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function QuestLog() {
  const achievements = useDojo((state) => state.achievements);
  const frameRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [looping, setLooping] = useState(false);
  const quests = useMemo(
    () => achievements.filter((quest) => quest.cadence === "daily" || quest.cadence === "weekly"),
    [achievements],
  );

  useEffect(() => {
    const frame = frameRef.current;
    const list = listRef.current;
    if (!frame || !list) return;
    const check = () => setLooping(list.scrollHeight > frame.clientHeight + 4);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(frame);
    observer.observe(list);
    return () => observer.disconnect();
  }, [quests]);

  if (!quests.length) return null;
  const seconds = Math.max(16, quests.length * 4.5);

  return (
    <aside
      className="pointer-events-none absolute top-40 right-[max(0.75rem,env(safe-area-inset-right))] bottom-[7.75rem] z-10 w-[min(15rem,42vw)] sm:top-24"
      aria-label="Quests"
    >
      <div ref={frameRef} className="h-full overflow-hidden">
        <div className={looping ? "quest-rise" : undefined} style={looping ? { ["--quest-rise" as string]: `${seconds}s` } : undefined}>
          <div ref={listRef}>
            <QuestCards quests={quests} />
          </div>
          {looping ? (
            <div aria-hidden>
              <QuestCards quests={quests} />
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

function ExpRow({ student, prizes, goal }: { student: Student; prizes: ShopItem[]; goal?: ShopItem }) {
  const exp = student.exp ?? 0;
  const width = goal && goal.price > 0 ? Math.max(0, Math.min(100, (exp / goal.price) * 100)) : 0;
  return (
    <li className="rounded-md border-2 border-line bg-surface/80 px-3 py-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-base font-extrabold sm:text-xl">{displayName(student)}</p>
        <p className="shrink-0 text-base font-extrabold text-accent tabular-nums sm:text-xl">{exp.toLocaleString()} EXP</p>
      </div>
      {goal ? (
        <div className="relative mt-2 h-3 overflow-hidden rounded-full border border-line bg-bg-deep" aria-hidden>
          <div className="h-full bg-accent" style={{ width: `${width}%` }} />
          {prizes
            .filter((prize) => prize.price < goal.price)
            .map((prize) => (
              <span
                key={prize.id}
                className="absolute top-0 h-full w-0.5 bg-fg/80"
                style={{ left: `${(prize.price / goal.price) * 100}%` }}
              />
            ))}
        </div>
      ) : null}
    </li>
  );
}

export function TvScreen() {
  const students = useDojo((state) => state.students);
  const events = useDojo((state) => state.events);
  const hydrated = useDojo((state) => state.hydrated);
  const code = useDojo((state) => state.code);
  const vault = useDojo((state) => state.vault);
  const senseiSeen = useDojo((state) => state.senseiSeen);
  const ceremony = useDojo((state) => state.ceremony);
  const phoneCode = useDojo((state) => state.phoneCode);
  const phoneUntil = useDojo((state) => state.phoneUntil);
  const door = useDoor();
  const [minersOpen, setMinersOpen] = useState(false);
  const [expOpen, setExpOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const active = students.filter((student) => !student.archived);
  const leaders = [...active].sort((a, b) => b.coins - a.coins || displayName(a).localeCompare(displayName(b))).slice(0, 4);
  const feed = events.filter((event) => event.kind !== "pocket").slice(0, 8);
  const loop = feed.length ? [...feed, ...feed] : [];

  if (door === "locked") return <AccessGate />;
  if (door !== "open" || !hydrated || !code) return <DojoLoading />;

  return (
    <main className="relative h-dvh overflow-hidden bg-bg-deep text-fg">
      <div className="absolute inset-0">
        <MineStage />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, color-mix(in srgb, var(--color-bg-deep) 72%, transparent) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute top-[18%] left-[28%] h-24 w-40 rounded-full blur-2xl"
        style={{ background: "var(--color-accent)", animation: "lantern 3.4s ease-in-out infinite" }}
      />

      <header className="absolute inset-x-0 top-0 z-40 flex flex-col gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(0.75rem,env(safe-area-inset-left))] sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="flex items-start justify-between gap-2 sm:contents">
          <div className="min-w-0 rounded-md border-2 border-border bg-bg/85 px-3 py-2 shadow-lg backdrop-blur-sm">
            <p className="font-pixel text-pixel text-accent">BLOCKDOJO</p>
            <p className="mt-1 truncate text-sm font-extrabold text-fg">The mine is open</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:order-3">
            <SoundToggle />
            <Link
              to="/sensei"
              className={`inline-flex min-h-11 items-center rounded-md border-2 border-border bg-bg/85 px-3 font-extrabold text-fg shadow-lg ${
                senseiSeen ? "lg:hidden" : ""
              }`}
            >
              Desk
            </Link>
          </div>
        </div>
        <div className="rounded-md border-4 border-accent bg-bg/95 px-3 py-1 text-center shadow-lg sm:order-2 sm:px-4 sm:py-1.5">
          <p className="text-[10px] font-extrabold tracking-wide text-muted uppercase">
            Phone code{phoneUntil ? ` · until ${phoneUntil}` : ""}
          </p>
          <p className="font-mono text-3xl font-black tracking-[0.28em] text-accent sm:text-4xl">{phoneCode || "····"}</p>
        </div>
      </header>

      {expOpen ? <ExpPath onClose={() => setExpOpen(false)} /> : null}
      {shopOpen ? <ShopBoard onClose={() => setShopOpen(false)} /> : null}
      {expOpen || shopOpen ? null : <QuestLog />}

      <aside
        className={`${minersOpen && !expOpen && !shopOpen ? "block" : "hidden"} absolute bottom-[max(3.25rem,calc(env(safe-area-inset-bottom)+2.75rem))] left-[max(0.75rem,env(safe-area-inset-left))] z-10 w-64 max-w-[calc(100%-1.5rem)] rounded-lg border-2 border-border bg-surface/90 p-3 shadow-xl backdrop-blur-sm lg:hidden`}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="font-pixel text-pixel text-accent">COINS</p>
          <button type="button" onClick={() => setMinersOpen(false)} className="text-sm font-extrabold text-muted lg:hidden">
            Close
          </button>
        </div>
        <p className="mt-2 text-xs font-bold tracking-wide text-muted uppercase lg:text-sm">Same coins as the desk</p>
        <ol className="mt-2 space-y-1.5">
          {leaders.map((student, index) => (
            <li key={student.id} className="flex items-center gap-2 text-sm font-extrabold lg:text-lg">
              <span className="w-5 text-accent tabular-nums">{index + 1}</span>
              <span
                className="size-2.5 shrink-0 rounded-full border border-fg/30 lg:size-3.5"
                style={{ background: `var(--color-${beltToken(student.belt)})` }}
              />
              <span className="min-w-0 flex-1 truncate">{displayName(student)}</span>
              <span className="tabular-nums text-accent">{student.coins}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 border-t border-line pt-2 text-sm font-extrabold lg:text-base">
          Dojo vault <span className="float-right text-accent tabular-nums">{vault}</span>
        </p>
      </aside>

      <button
        type="button"
        onClick={() => setMinersOpen(true)}
        className={`${minersOpen || expOpen || shopOpen ? "hidden" : ""} absolute bottom-[max(3.25rem,calc(env(safe-area-inset-bottom)+2.75rem))] left-[max(0.75rem,env(safe-area-inset-left))] z-10 min-h-11 rounded-md border-2 border-border bg-surface/90 px-3 font-extrabold shadow-lg lg:hidden`}
      >
        Coins
      </button>

      <div className="absolute right-[max(0.75rem,env(safe-area-inset-right))] bottom-[max(3.25rem,calc(env(safe-area-inset-bottom)+2.75rem))] z-20 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setExpOpen(false);
            setShopOpen(true);
          }}
          className={`${shopOpen || expOpen ? "hidden" : ""} min-h-11 rounded-md border-2 border-accent bg-surface/90 px-3 font-extrabold text-accent shadow-lg`}
        >
          Shop
        </button>
        <button
          type="button"
          onClick={() => {
            setShopOpen(false);
            setExpOpen(true);
          }}
          className={`${expOpen || shopOpen ? "hidden" : ""} min-h-11 rounded-md border-2 border-accent bg-surface/90 px-3 font-extrabold text-accent shadow-lg`}
        >
          EXP
        </button>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 z-10 hidden border-t border-line bg-bg/80 px-3 py-1 backdrop-blur-sm lg:block"
        style={{ bottom: "max(2.35rem, calc(env(safe-area-inset-bottom) + 1.85rem))" }}
      >
        <div className="flex items-center gap-3 overflow-hidden text-sm font-extrabold">
          <span className="shrink-0 font-pixel text-pixel text-accent">COINS</span>
          <ol className="flex min-w-0 flex-1 items-center gap-4 overflow-hidden">
            {leaders.map((student, index) => (
              <li key={student.id} className="flex min-w-0 items-center gap-1.5">
                <span className="text-accent tabular-nums">{index + 1}</span>
                <span
                  className="size-2 shrink-0 rounded-full border border-fg/30"
                  style={{ background: `var(--color-${beltToken(student.belt)})` }}
                />
                <span className="max-w-36 truncate">{displayName(student)}</span>
                <span className="tabular-nums text-accent">{student.coins}</span>
              </li>
            ))}
          </ol>
          <span className="shrink-0">
            Vault <span className="text-accent tabular-nums">{vault}</span>
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 border-t-2 border-accent bg-bg/90 px-3 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        <div className="hidden overflow-hidden sm:block">
          {loop.length ? (
            <div className="flex w-max gap-8" style={{ animation: "ticker-slide 28s linear infinite" }}>
              {loop.map((event, index) => (
                <span key={`${event.id}-${index}`} className="font-extrabold whitespace-nowrap text-fg">
                  {eventLine(event)}
                </span>
              ))}
            </div>
          ) : (
            <p className="font-extrabold">Quiet cave. Coins land here when the desk pays them out.</p>
          )}
        </div>
        <p className="truncate font-extrabold sm:hidden">{feed[0] ? eventLine(feed[0]) : "Waiting for the first payout."}</p>
      </div>
      {ceremony ? <BeltShow key={ceremony.id} ceremony={ceremony} /> : null}
    </main>
  );
}
