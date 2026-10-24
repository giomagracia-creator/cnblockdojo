import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DojoLoading } from "@/components/dojo/join-screen";
import { AccessGate, PhoneLink, useDoor } from "@/components/dojo/access-gate";
import { PinPad } from "@/components/dojo/pin-pad";
import { SoundToggle } from "@/components/dojo/sound-toggle";
import { caveAudio } from "@/lib/dojo/audio";
import { CODE_KEY, useDojo } from "@/lib/dojo/store";
import { DAILY_MAX, ITEM_PRICE_MAX, PAYOUT_MAX, PRICE_MAX, STOCK_MAX, WELCOME_MAX, earnedToday, periodKey } from "@/lib/dojo/rules";
import { BELTS, beltToken, BELT_RANK, displayName, nextBelt, type Achievement, type Belt, type ShopItem, type Student } from "@/lib/dojo/types";

type Notice = { tone: "ok" | "no"; text: string } | null;

const field = "w-full min-w-0";

function CoinMark() {
  return (
    <img
      src="/art/sprites/props/prop-1.png"
      alt=""
      className="inline-block size-5 object-contain align-text-bottom"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

function BeltDot({ belt }: { belt: Belt }) {
  return (
    <span
      className="inline-block size-2.5 shrink-0 rounded-full border border-fg/25"
      style={{ background: `var(--color-${beltToken(belt)})` }}
      aria-hidden
    />
  );
}

async function fileToIcon(file: File) {
  if (file.size > 8_000_000) throw new Error("Use an image under 8 MB.");
  const bitmap = await createImageBitmap(file);
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that image.");
  const scale = Math.max(size / bitmap.width, size / bitmap.height);
  const width = bitmap.width * scale;
  const height = bitmap.height * scale;
  ctx.drawImage(bitmap, (size - width) / 2, (size - height) / 2, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

function canRedeem(student: Student | undefined, item: ShopItem, claimed: boolean) {
  if (!student || student.archived) return "Pick a ninja first.";
  if (item.minBelt && BELT_RANK[student.belt] < BELT_RANK[item.minBelt]) {
    return `Needs ${item.minBelt} belt.`;
  }
  if (item.currency === "exp") {
    if (claimed) return "Already claimed.";
    if ((student.exp ?? 0) < item.price) return "Not enough EXP.";
    return null;
  }
  if (item.stock <= 0) return "Out of stock.";
  if (student.coins < item.price) return "Not enough coins.";
  return null;
}

export function SenseiDesk() {
  const students = useDojo((state) => state.students);
  const items = useDojo((state) => state.items);
  const awardCoins = useDojo((state) => state.awardCoins);
  const callPocket = useDojo((state) => state.callPocket);
  const redeem = useDojo((state) => state.redeem);
  const addStudent = useDojo((state) => state.addStudent);
  const updateStudent = useDojo((state) => state.updateStudent);
  const addItem = useDojo((state) => state.addItem);
  const updateItem = useDojo((state) => state.updateItem);
  const removeItem = useDojo((state) => state.removeItem);
  const restoreDemo = useDojo((state) => state.restoreDemo);
  const directorUntil = useDojo((state) => state.directorUntil);
  const lockDirector = useDojo((state) => state.lockDirector);
  const hydrated = useDojo((state) => state.hydrated);
  const code = useDojo((state) => state.code);
  const displaySeen = useDojo((state) => state.displaySeen);
  const hero = useDojo((state) => state.hero);
  const vault = useDojo((state) => state.vault);
  const setHero = useDojo((state) => state.setHero);
  const undo = useDojo((state) => state.undo);
  const undoLast = useDojo((state) => state.undoLast);
  const achievements = useDojo((state) => state.achievements);
  const claims = useDojo((state) => state.claims);
  const weekStarted = useDojo((state) => state.weekStarted);
  const claimAchievement = useDojo((state) => state.claimAchievement);
  const addAchievement = useDojo((state) => state.addAchievement);
  const updateAchievement = useDojo((state) => state.updateAchievement);
  const removeAchievement = useDojo((state) => state.removeAchievement);
  const promoteBelt = useDojo((state) => state.promoteBelt);
  const dayLedger = useDojo((state) => state.dayLedger);
  const phoneLocked = useDojo((state) => state.phoneLocked);
  const expClaims = useDojo((state) => state.expClaims);
  const door = useDoor();
  const [clock, setClock] = useState(() => Date.now());
  const [pinOpen, setPinOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const savedCode = localStorage.getItem(CODE_KEY);
      return savedCode ? (localStorage.getItem(`blockdojo-ninja:${savedCode}`) ?? "") : "";
    } catch {
      return "";
    }
  });
  const [searching, setSearching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [achieveOpen, setAchieveOpen] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [custom, setCustom] = useState("");
  const [belting, setBelting] = useState(false);
  const [savingDay, setSavingDay] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [rosterQuery, setRosterQuery] = useState("");
  const [studentForm, setStudentForm] = useState<null | { mode: "add" } | { mode: "edit"; id: string }>(null);
  const [itemForm, setItemForm] = useState<null | { mode: "add" } | { mode: "edit"; id: string }>(null);
  const [achieveForm, setAchieveForm] = useState<null | { mode: "add" } | { mode: "edit"; id: string }>(null);

  useEffect(() => {
    caveAudio.bind();
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const director = directorUntil > clock;
  const needDirector = () => {
    if (directorUntil > Date.now()) return true;
    setPinOpen(true);
    return false;
  };

  const active = students.filter((student) => !student.archived);
  const selected = students.find((student) => student.id === selectedId && !student.archived) ?? active[0];
  const upcoming = selected ? nextBelt(selected.belt) : null;

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const pool = active.filter((student) => {
      if (!needle) return true;
      return displayName(student).toLowerCase().includes(needle) || student.firstName.toLowerCase().startsWith(needle);
    });
    return pool.slice(0, 8);
  }, [active, query]);

  const roster = students.filter((student) => {
    if (!showArchived && student.archived) return false;
    const needle = rosterQuery.trim().toLowerCase();
    if (!needle) return true;
    return displayName(student).toLowerCase().includes(needle);
  });

  const chooseNinja = (id: string) => {
    setSelectedId(id);
    setQuery("");
    setSearching(false);
    if (!code) return;
    try {
      localStorage.setItem(`blockdojo-ninja:${code}`, id);
    } catch {
      /* private mode */
    }
  };

  const flash = (next: Notice) => {
    setNotice(next);
    window.setTimeout(() => setNotice(null), 2400);
  };

  const pay = async (amount: number) => {
    if (!selected) return;
    const result = await awardCoins(selected.id, amount);
    flash(result.ok ? { tone: "ok", text: `${displayName(selected)} +${amount}` } : { tone: "no", text: result.reason });
  };

  const pocket = async () => {
    if (!selected) return;
    const name = displayName(selected);
    const result = await callPocket(selected.id);
    flash(result.ok ? { tone: "ok", text: `${name}'s pocket is on the TV.` } : { tone: "no", text: result.reason });
  };

  const checkout = async (item: ShopItem) => {
    if (!selected) return;
    const result = await redeem(selected.id, item.id);
    flash(
      result.ok
        ? {
            tone: "ok",
            text:
              item.currency === "exp"
                ? `${displayName(selected)} claimed ${item.name}. It’s on the TV.`
                : `${displayName(selected)} redeemed ${item.name}. It’s on the TV.`,
          }
        : { tone: "no", text: result.reason },
    );
  };

  const claimed = (achievement: Achievement) =>
    Boolean(
      selected &&
        claims.some(
          (claim) =>
            claim.achievementId === achievement.id &&
            claim.studentId === selected.id &&
            claim.periodKey === periodKey(achievement.cadence, weekStarted, clock),
        ),
    );

  const give = async (achievement: Achievement) => {
    if (!selected) return;
    const result = await claimAchievement(selected.id, achievement.id);
    flash(
      result.ok
        ? { tone: "ok", text: `${displayName(selected)} +${achievement.coins} · ${achievement.name}` }
        : { tone: "no", text: result.reason },
    );
  };

  const saveTheDay = async () => {
    if (savingDay) return;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setSavingDay(true);
    try {
      const result = await dayLedger(timeZone);
      if (!result.ok) {
        flash({ tone: "no", text: result.reason });
        return;
      }
      const bytes = Uint8Array.from(atob(result.file), (char) => char.charCodeAt(0));
      const url = URL.createObjectURL(
        new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      flash({ tone: "ok", text: "Day file downloaded." });
    } finally {
      setSavingDay(false);
    }
  };

  if (door === "locked") return <AccessGate />;
  if (door === "wait" || !hydrated) return <DojoLoading />;
  if (phoneLocked) return <PhoneLink />;
  if (!code) return <DojoLoading />;

  return (
    <main className="mx-auto min-h-dvh max-w-6xl px-3 py-4 sm:px-6 sm:py-6">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-pixel text-pixel text-accent">BLOCKDOJO</p>
            <h1 className="mt-1 text-2xl font-extrabold">Sensei desk</h1>
            <p className="text-sm font-bold text-muted">{displaySeen ? "Same cave as the TV" : "Waiting for the TV"}</p>
          </div>
          <button
            type="button"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex min-h-11 shrink-0 items-center rounded-md border-2 border-border bg-surface px-4 font-extrabold"
          >
            {menuOpen ? "Close" : "Desk"}
          </button>
        </div>
        <div className="flex max-w-lg gap-2">
          <button
            type="button"
            disabled={savingDay}
            onClick={() => void saveTheDay()}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border-2 border-accent bg-surface px-3 font-extrabold disabled:cursor-not-allowed disabled:text-muted"
          >
            {savingDay ? "Exporting…" : "Save the day"}
          </button>
          <div className="flex min-h-11 shrink-0 items-center gap-2 rounded-md border-2 border-border bg-surface px-3 font-extrabold">
            <CoinMark />
            <span className="tabular-nums">{vault}</span>
            <span className="text-xs font-bold text-muted uppercase">vault</span>
          </div>
        </div>
        {menuOpen ? (
          <div className="max-w-lg rounded-lg border-2 border-border bg-surface p-3">
            <p className="text-[10px] font-bold tracking-wide text-muted uppercase">TV ninja</p>
            <div className="mt-1 flex overflow-hidden rounded-md border-2 border-border" role="group" aria-label="Cave ninja">
              <button
                type="button"
                aria-pressed={hero === "boy"}
                onClick={() => void setHero("boy")}
                className={`min-h-11 flex-1 font-extrabold ${hero === "boy" ? "bg-accent text-accent-ink" : "bg-surface text-fg"}`}
              >
                Boy
              </button>
              <button
                type="button"
                aria-pressed={hero === "girl"}
                onClick={() => void setHero("girl")}
                className={`min-h-11 flex-1 border-l-2 border-border font-extrabold ${hero === "girl" ? "bg-accent text-accent-ink" : "bg-surface text-fg"}`}
              >
                Girl
              </button>
            </div>
            <div className="mt-2 [&_button]:w-full [&_button]:justify-center [&_button]:shadow-none">
              <SoundToggle />
            </div>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                if (director) lockDirector();
                else setPinOpen(true);
              }}
              className={`mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-md border-2 px-4 font-extrabold ${
                director ? "border-accent bg-surface text-accent" : "border-border bg-surface text-fg"
              }`}
            >
              {director ? "Lock director" : "Director pin"}
            </button>
            <Link
              to="/"
              className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-md border-2 border-accent bg-accent px-4 font-extrabold text-accent-ink"
            >
              Open TV
            </Link>
          </div>
        ) : null}
      </header>

      {notice ? (
        <p
          className={`mt-4 rounded-md border-2 px-3 py-2 font-extrabold ${
            notice.tone === "ok" ? "border-accent bg-surface text-accent" : "border-primary bg-surface text-fg"
          }`}
          role="status"
        >
          {notice.text}
        </p>
      ) : null}

      <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <div className="z-10 -mx-3 border-b-2 border-border bg-bg px-3 py-3 sm:-mx-6 sm:px-6 lg:sticky lg:top-4 lg:z-20 lg:mx-0 lg:self-start lg:border-0 lg:bg-transparent lg:p-0">
        <div className="rounded-lg border-2 border-border bg-surface p-3">
          <label className="font-pixel text-pixel text-accent" htmlFor="ninja-search">
            Ninja
          </label>
          <input
            id="ninja-search"
            className={`${field} mt-2`}
            placeholder="Type a name…"
            value={query}
            autoComplete="off"
            onFocus={() => setSearching(true)}
            onBlur={() => window.setTimeout(() => setSearching(false), 150)}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearching(true);
            }}
          />
          {searching || query.trim() ? (
          <ul className="mt-2 max-h-40 space-y-1 overflow-auto" role="listbox" aria-label="Ninjas">
            {matches.length === 0 ? (
              <li className="px-2 py-3 text-sm font-bold text-muted">No match. Add them on the roster.</li>
            ) : (
              matches.map((student) => {
                const on = student.id === selected?.id;
                return (
                  <li key={student.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={on}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => chooseNinja(student.id)}
                      className={`flex min-h-11 w-full items-center gap-2 rounded-md border-2 px-2 text-left font-extrabold ${
                        on ? "border-accent bg-surface-2" : "border-transparent bg-bg-deep"
                      }`}
                    >
                      <BeltDot belt={student.belt} />
                      <span className="min-w-0 flex-1 truncate">{displayName(student)}</span>
                      <span className="text-xs font-bold text-muted">{student.belt}</span>
                      <span className="tabular-nums text-accent">{student.coins}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          ) : null}

          {selected ? (
            <div className="mt-3 rounded-md border-2 border-line bg-bg-deep p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="min-w-0 truncate text-lg font-extrabold">{displayName(selected)}</p>
                <p className="shrink-0 text-sm font-bold text-muted">{selected.belt}</p>
              </div>
              <p className="mt-1 flex items-center gap-2 text-3xl font-extrabold text-accent tabular-nums">
                <CoinMark />
                {selected.coins}
                <span className="text-sm font-bold text-muted">coins</span>
              </p>
              <p className="mt-1 text-sm font-extrabold tabular-nums">{selected.exp ?? 0} EXP</p>
              <p className="mt-1 text-xs font-bold text-muted">
                {earnedToday(selected)}/{DAILY_MAX} earned today · {PAYOUT_MAX} max each payout
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[5, 10, 25].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => pay(amount)}
                    className="min-h-11 rounded-md border-2 border-accent bg-accent font-extrabold text-accent-ink"
                  >
                    +{amount}
                  </button>
                ))}
              </div>
              <form
                className="mt-2 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const amount = Number(custom);
                  if (!amount) return;
                  pay(amount);
                  setCustom("");
                }}
              >
                <input
                  className={field}
                  inputMode="numeric"
                  aria-label="Custom coin amount"
                  placeholder="Custom"
                  value={custom}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/[^\d]/g, "").slice(0, 2);
                    const amount = Number(digits);
                    setCustom(!digits || amount <= PAYOUT_MAX ? digits : String(PAYOUT_MAX));
                  }}
                />
                <button type="submit" className="min-h-11 shrink-0 rounded-md border-2 border-border bg-surface-2 px-3 font-extrabold">
                  Add
                </button>
              </form>
              <button
                type="button"
                onClick={() => void pocket()}
                className="mt-2 min-h-11 w-full rounded-md border-2 border-accent bg-bg px-3 font-extrabold"
              >
                Pocket
              </button>
              <button
                type="button"
                disabled={!upcoming || belting}
                onClick={() => {
                  if (!selected || !upcoming || belting) return;
                  const name = displayName(selected);
                  const belt = upcoming;
                  setBelting(true);
                  void (async () => {
                    const result = await promoteBelt(selected.id);
                    flash(
                      result.ok
                        ? { tone: "ok", text: `${name} is up for ${belt}. It’s on the TV.` }
                        : { tone: "no", text: result.reason },
                    );
                    setBelting(false);
                  })();
                }}
                className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-md border-2 border-accent bg-bg px-3 font-extrabold text-fg disabled:cursor-not-allowed disabled:border-border disabled:text-muted"
              >
                {upcoming ? (
                  <>
                    <BeltDot belt={upcoming} />
                    Belt up to {upcoming}
                  </>
                ) : (
                  "Gold belt"
                )}
              </button>
              <button
                type="button"
                disabled={!undo}
                onClick={() => {
                  void (async () => {
                    const result = await undoLast();
                    flash(result.ok ? { tone: "ok", text: "Last step undone." } : { tone: "no", text: result.reason });
                  })();
                }}
                className="mt-2 min-h-11 w-full rounded-md border-2 border-border bg-surface px-3 font-extrabold disabled:cursor-not-allowed disabled:text-muted"
              >
                {undo ? `${undo.label} · ${undo.count}/5` : "Nothing to undo"}
              </button>
            </div>
          ) : null}
        </div>
        </div>

        <div>
          <div className="mb-2 flex items-end justify-between gap-2">
            <h2 className="font-pixel text-pixel text-accent">Shop</h2>
            <p className="text-xs font-bold text-muted uppercase">One tap redeems</p>
          </div>
          <ul className="grid grid-cols-2 gap-2 xl:grid-cols-3">
            {items.map((item) => {
              const taken =
                item.currency === "exp" &&
                Boolean(selected && expClaims.some((claim) => claim.studentId === selected.id && claim.itemId === item.id));
              const block = canRedeem(selected, item, taken);
              return (
                <li key={item.id} className="flex flex-col rounded-lg border-2 border-border bg-surface p-2">
                  <p className="text-base leading-snug font-extrabold break-words">{item.name}</p>
                  <img
                    src={item.image}
                    alt=""
                    className="mt-2 h-16 w-full rounded-md object-cover sm:h-20"
                    style={{ imageRendering: "pixelated" }}
                  />
                  <p className="mt-1 flex items-center gap-1 text-sm font-extrabold text-accent tabular-nums">
                    {item.currency === "exp" ? (
                      <>
                        <span>{item.price} EXP</span>
                        <span className="ml-auto text-xs font-bold text-muted">once</span>
                      </>
                    ) : (
                      <>
                        <CoinMark />
                        {item.price}
                        <span className="ml-auto text-xs font-bold text-muted">{item.stock} left</span>
                      </>
                    )}
                  </p>
                  {item.minBelt ? (
                    <p className="mt-1 flex items-center gap-1 text-xs font-bold text-muted">
                      <BeltDot belt={item.minBelt} />
                      {item.minBelt}+
                    </p>
                  ) : (
                    <p className="mt-1 text-xs font-bold text-muted">Any belt</p>
                  )}
                  <button
                    type="button"
                    disabled={Boolean(block)}
                    onClick={() => checkout(item)}
                    className="mt-2 min-h-11 rounded-md border-2 border-primary bg-primary px-2 text-sm leading-tight font-extrabold text-fg disabled:cursor-not-allowed disabled:border-line disabled:bg-bg-deep disabled:text-muted"
                  >
                    {block ?? (item.currency === "exp" ? "Claim" : "Redeem")}
                  </button>
                </li>
              );
            })}
          </ul>
          {items.length === 0 ? <p className="mt-4 font-bold text-muted">The shop is empty. Add a prize below.</p> : null}
        </div>
      </section>

      <section className="mt-6">
        <button
          type="button"
          aria-expanded={achieveOpen}
          onClick={() => setAchieveOpen((open) => !open)}
          className="flex min-h-11 w-full items-center justify-between rounded-md border-2 border-border bg-surface px-4 font-extrabold"
        >
          <span>Achievements · {achievements.length}</span>
          <span className="text-muted">{achieveOpen ? "Hide" : "Show"}</span>
        </button>
        {achieveOpen ? (
          <div className="mt-3 rounded-lg border-2 border-border bg-surface p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="max-w-xl text-sm font-bold text-muted">
                Daily and weekly bonuses skip the 25-coin payout and the 75-a-day cap. Each ninja can earn one once.
                {selected ? ` Paying ${displayName(selected)}` : " Pick a ninja first."}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!needDirector()) return;
                  setAchieveForm({ mode: "add" });
                }}
                className="min-h-11 rounded-md border-2 border-primary bg-primary px-3 font-extrabold text-fg"
              >
                Add achievement
              </button>
            </div>
            {(["daily", "weekly"] as const).map((cadence) => {
              const group = achievements.filter((achievement) => achievement.cadence === cadence);
              return (
                <div key={cadence} className="mt-4">
                  <h3 className="font-pixel text-pixel text-accent">{cadence === "daily" ? "Daily" : "Weekly"}</h3>
                  {group.length === 0 ? <p className="mt-2 text-sm font-bold text-muted">None yet.</p> : null}
                  <ul className="mt-2 space-y-2">
                    {group.map((achievement) => {
                      const given = claimed(achievement);
                      return (
                        <li key={achievement.id} className="rounded-md border-2 border-line bg-bg-deep p-3">
                          <p className="text-base leading-snug font-extrabold">{achievement.name}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-3">
                            <img
                              src={achievement.image}
                              alt=""
                              className="size-14 shrink-0 rounded-md object-cover"
                              style={{ imageRendering: "pixelated" }}
                            />
                            <p className="flex items-center gap-1 text-sm font-extrabold text-accent tabular-nums">
                              <CoinMark />
                              {achievement.coins}
                            </p>
                            <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
                              <button
                                type="button"
                                disabled={!selected || given}
                                onClick={() => void give(achievement)}
                                className="min-h-11 flex-1 rounded-md border-2 border-accent bg-accent px-3 font-extrabold whitespace-nowrap text-accent-ink disabled:cursor-not-allowed disabled:border-line disabled:bg-bg disabled:text-muted sm:flex-none"
                              >
                                {given ? (cadence === "daily" ? "Already given today" : "Already given this week") : "Give"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!needDirector()) return;
                                  setAchieveForm({ mode: "edit", id: achievement.id });
                                }}
                                className="min-h-11 shrink-0 rounded-md border-2 border-border px-3 font-extrabold"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="mt-6 space-y-3">
        <button
          type="button"
          aria-expanded={rosterOpen}
          onClick={() => setRosterOpen((open) => !open)}
          className="flex min-h-11 w-full items-center justify-between rounded-md border-2 border-border bg-surface px-4 font-extrabold"
        >
          <span>Roster · {active.length} {active.length === 1 ? "ninja" : "ninjas"}</span>
          <span className="text-muted">{rosterOpen ? "Hide" : "Show"}</span>
        </button>

        {rosterOpen || active.length === 0 ? (
          <div className="mt-3 rounded-lg border-2 border-border bg-surface p-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                className="min-w-0 flex-1"
                placeholder="Search roster"
                value={rosterQuery}
                onChange={(event) => setRosterQuery(event.target.value)}
                aria-label="Search roster"
              />
              <button
                type="button"
                onClick={() => setShowArchived((value) => !value)}
                className="min-h-11 rounded-md border-2 border-border bg-bg-deep px-3 font-extrabold"
              >
                {showArchived ? "Hide archived" : "Show archived"}
              </button>
              <button
                type="button"
                onClick={() => setStudentForm({ mode: "add" })}
                className="min-h-11 rounded-md border-2 border-primary bg-primary px-3 font-extrabold text-fg"
              >
                Add ninja
              </button>
            </div>
            <ul className="mt-3 space-y-2">
              {roster.length === 0 ? (
                <li className="rounded-md border-2 border-dashed border-line px-3 py-4 text-sm font-bold text-muted">
                  No ninjas yet. Add the first one.
                </li>
              ) : null}
              {roster.map((student) => (
                <li
                  key={student.id}
                  className="flex flex-wrap items-center gap-2 rounded-md border-2 border-line bg-bg-deep px-3 py-2"
                >
                  <BeltDot belt={student.belt} />
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold">
                      {displayName(student)}
                      {student.archived ? <span className="ml-2 text-xs text-muted">Archived</span> : null}
                    </p>
                    <p className="text-xs font-bold text-muted">
                      {student.belt} belt · week {student.weekCoins}
                    </p>
                  </div>
                  <p className="font-extrabold text-accent tabular-nums">{student.coins}</p>
                  {!student.archived ? (
                    <div className="flex gap-1">
                      {[5, 10].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => {
                            chooseNinja(student.id);
                            void (async () => {
                              const result = await awardCoins(student.id, amount);
                              flash(result.ok ? { tone: "ok", text: `${displayName(student)} +${amount}` } : { tone: "no", text: result.reason });
                            })();
                          }}
                          className="min-h-11 rounded-md border-2 border-border px-2 font-extrabold"
                        >
                          +{amount}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setStudentForm({ mode: "edit", id: student.id })}
                    className="min-h-11 rounded-md border-2 border-border px-3 font-extrabold"
                  >
                    Edit
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                if (!needDirector()) return;
                if (window.confirm("Replace this dojo’s ninjas and shop with the sample set? The TV will follow.")) void restoreDemo();
              }}
              className="mt-4 text-sm font-bold text-muted underline decoration-border underline-offset-4"
            >
              Restore sample dojo
            </button>
          </div>
        ) : null}

        <button
          type="button"
          aria-expanded={stockOpen}
          onClick={() => setStockOpen((open) => !open)}
          className="flex min-h-11 w-full items-center justify-between rounded-md border-2 border-border bg-surface px-4 font-extrabold"
        >
          <span>Stock · {items.length} {items.length === 1 ? "prize" : "prizes"}</span>
          <span className="text-muted">{stockOpen ? "Hide" : "Show"}</span>
        </button>

        {stockOpen ? (
          <div className="mt-3 rounded-lg border-2 border-border bg-surface p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-muted">
                {director ? "Director desk is open for 10 minutes." : "Prices, stock, and new prizes need the director pin."}
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!needDirector()) return;
                  setItemForm({ mode: "add" });
                }}
                className="min-h-11 rounded-md border-2 border-primary bg-primary px-3 font-extrabold text-fg"
              >
                Add prize
              </button>
            </div>
            <ul className="mt-3 space-y-2">
              {items.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center gap-3 rounded-md border-2 border-line bg-bg-deep p-2">
                  <img src={item.image} alt="" className="size-14 rounded-md object-cover" style={{ imageRendering: "pixelated" }} />
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold">{item.name}</p>
                    <p className="text-xs font-bold text-muted">
                      {item.currency === "exp"
                        ? `${item.price} EXP · once · ${item.minBelt ? `${item.minBelt}+` : "Any belt"}`
                        : `${item.price} coins · ${item.minBelt ? `${item.minBelt}+` : "Any belt"}`}
                    </p>
                  </div>
                  {item.currency === "exp" ? (
                    <span className="text-xs font-extrabold tracking-wide text-accent uppercase">EXP</span>
                  ) : (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Decrease stock of ${item.name}`}
                      onClick={() => {
                        if (!needDirector()) return;
                        updateItem(item.id, { stock: item.stock - 1 });
                      }}
                      className="min-h-11 min-w-11 rounded-md border-2 border-border font-extrabold"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-extrabold tabular-nums">{item.stock}</span>
                    <button
                      type="button"
                      aria-label={`Increase stock of ${item.name}`}
                      onClick={() => {
                        if (!needDirector()) return;
                        updateItem(item.id, { stock: item.stock + 1 });
                      }}
                      className="min-h-11 min-w-11 rounded-md border-2 border-border font-extrabold"
                    >
                      +
                    </button>
                  </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (!needDirector()) return;
                      setItemForm({ mode: "edit", id: item.id });
                    }}
                    className="min-h-11 rounded-md border-2 border-border px-3 font-extrabold"
                  >
                    Edit
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {studentForm ? (
        <StudentDialog
          key={studentForm.mode === "edit" ? studentForm.id : "new"}
          mode={studentForm}
          director={director}
          student={studentForm.mode === "edit" ? students.find((entry) => entry.id === studentForm.id) : undefined}
          onClose={() => setStudentForm(null)}
          onSave={(value) => {
            void (async () => {
              if (studentForm.mode === "add") {
                const result = await addStudent(value);
                if (!result.ok) {
                  flash({ tone: "no", text: result.reason });
                  return;
                }
                chooseNinja(result.id);
                flash({ tone: "ok", text: `${displayName(value)} joined the dojo.` });
              } else if (studentForm.mode === "edit") {
                const result = await updateStudent(studentForm.id, value);
                flash(result.ok ? { tone: "ok", text: "Ninja updated." } : { tone: "no", text: result.reason });
                if (!result.ok) return;
              }
              setStudentForm(null);
            })();
          }}
        />
      ) : null}

      {itemForm ? (
        <ItemDialog
          key={itemForm.mode === "edit" ? itemForm.id : "new-item"}
          item={itemForm.mode === "edit" ? items.find((entry) => entry.id === itemForm.id) : undefined}
          onClose={() => setItemForm(null)}
          onRemove={
            itemForm.mode === "edit"
              ? () => {
                  void (async () => {
                    const result = await removeItem(itemForm.id);
                    if (!result.ok) {
                      flash({ tone: "no", text: result.reason });
                      return;
                    }
                    setItemForm(null);
                    flash({ tone: "ok", text: "Prize removed." });
                  })();
                }
              : undefined
          }
          onSave={(value) => {
            void (async () => {
              if (itemForm.mode === "add") {
                const id = await addItem(value);
                if (!id) {
                  flash({ tone: "no", text: "The prize didn't save. Check the director pin." });
                  return;
                }
              } else {
                const result = await updateItem(itemForm.id, value);
                if (!result.ok) {
                  flash({ tone: "no", text: result.reason });
                  return;
                }
              }
              setItemForm(null);
              flash({ tone: "ok", text: itemForm.mode === "add" ? "Prize added." : "Prize updated." });
            })();
          }}
        />
      ) : null}
      {achieveForm ? (
        <AchievementDialog
          key={achieveForm.mode === "edit" ? achieveForm.id : "new-achievement"}
          achievement={achieveForm.mode === "edit" ? achievements.find((entry) => entry.id === achieveForm.id) : undefined}
          onClose={() => setAchieveForm(null)}
          onRemove={
            achieveForm.mode === "edit"
              ? () => {
                  void (async () => {
                    const result = await removeAchievement(achieveForm.id);
                    if (!result.ok) {
                      flash({ tone: "no", text: result.reason });
                      return;
                    }
                    setAchieveForm(null);
                    flash({ tone: "ok", text: "Achievement removed." });
                  })();
                }
              : undefined
          }
          onSave={(value) => {
            void (async () => {
              if (achieveForm.mode === "add") {
                const id = await addAchievement(value);
                if (!id) {
                  flash({ tone: "no", text: "The achievement didn't save. Check the director pin." });
                  return;
                }
              } else {
                const result = await updateAchievement(achieveForm.id, value);
                if (!result.ok) {
                  flash({ tone: "no", text: result.reason });
                  return;
                }
              }
              setAchieveForm(null);
              flash({ tone: "ok", text: achieveForm.mode === "add" ? "Achievement added." : "Achievement updated." });
            })();
          }}
        />
      ) : null}
      {pinOpen ? <PinPad onClose={() => setPinOpen(false)} /> : null}
    </main>
  );
}

function StudentDialog({
  mode,
  student,
  director,
  onClose,
  onSave,
}: {
  mode: { mode: "add" } | { mode: "edit"; id: string };
  student?: Student;
  director: boolean;
  onClose: () => void;
  onSave: (value: { firstName: string; lastInitial: string; belt: Belt; coins: number; archived: boolean }) => void;
}) {
  const [firstName, setFirstName] = useState(student?.firstName ?? "");
  const [lastInitial, setLastInitial] = useState(student?.lastInitial ?? "");
  const [belt, setBelt] = useState<Belt>(student?.belt ?? "White");
  const [coins, setCoins] = useState(String(student?.coins ?? 0));
  const [archived, setArchived] = useState(student?.archived ?? false);
  const [error, setError] = useState("");

  return (
    <dialog open className="fixed inset-0 z-30 m-0 flex h-full w-full items-end justify-center bg-bg-deep/70 p-3 sm:items-center">
      <form
        className="w-full max-w-md rounded-lg border-2 border-border bg-surface p-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (firstName.trim().length < 1) {
            setError("First name is required.");
            return;
          }
          if (!/^[a-z]$/i.test(lastInitial.trim())) {
            setError("Use a single last initial.");
            return;
          }
          onSave({
            firstName,
            lastInitial,
            belt,
            coins: Number(coins) || 0,
            archived,
          });
        }}
      >
        <h2 className="text-xl font-extrabold">{mode.mode === "add" ? "Add ninja" : "Edit ninja"}</h2>
        <label className="mt-3 block text-sm font-extrabold" htmlFor="first-name">
          First name
        </label>
        <input id="first-name" className={`${field} mt-1`} value={firstName} onChange={(event) => setFirstName(event.target.value)} />
        <label className="mt-3 block text-sm font-extrabold" htmlFor="last-initial">
          Last initial
        </label>
        <input
          id="last-initial"
          className={`${field} mt-1`}
          maxLength={1}
          value={lastInitial}
          onChange={(event) => setLastInitial(event.target.value)}
        />
        <label className="mt-3 block text-sm font-extrabold" htmlFor="belt">
          Belt
        </label>
        <select id="belt" className={`${field} mt-1`} value={belt} onChange={(event) => setBelt(event.target.value as Belt)}>
          {BELTS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <label className="mt-3 block text-sm font-extrabold" htmlFor="start-coins">
          {mode.mode === "add" ? `Welcome coins (max ${WELCOME_MAX})` : "Coin balance"}
        </label>
        {mode.mode === "edit" && !director ? (
          <p className="mt-1 text-sm font-bold text-muted">Balance corrections need the director pin. Use the payout buttons for earned coins.</p>
        ) : (
          <input
            id="start-coins"
            className={`${field} mt-1`}
            inputMode="numeric"
            value={coins}
            onChange={(event) => {
              const digits = event.target.value.replace(/[^\d]/g, "");
              const cap = mode.mode === "add" && !director ? WELCOME_MAX : 9999;
              const amount = Number(digits);
              setCoins(!digits || amount <= cap ? digits : String(cap));
            }}
          />
        )}
        {mode.mode === "edit" ? (
          <label className="mt-3 flex min-h-11 items-center gap-2 font-extrabold">
            <input type="checkbox" checked={archived} onChange={(event) => setArchived(event.target.checked)} className="size-5" />
            Archive this ninja
          </label>
        ) : null}
        {error ? <p className="mt-2 font-bold text-primary">{error}</p> : null}
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="min-h-11 rounded-md border-2 border-border px-3 font-extrabold">
            Cancel
          </button>
          <button type="submit" className="min-h-11 rounded-md border-2 border-primary bg-primary px-3 font-extrabold text-fg">
            Save
          </button>
        </div>
      </form>
    </dialog>
  );
}

function ItemDialog({
  item,
  onClose,
  onSave,
  onRemove,
}: {
  item?: ShopItem;
  onClose: () => void;
  onSave: (value: Omit<ShopItem, "id">) => void;
  onRemove?: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [price, setPrice] = useState(String(item?.price ?? 20));
  const [currency, setCurrency] = useState<"coins" | "exp">(item?.currency ?? "coins");
  const [stock, setStock] = useState(String(item?.stock ?? 1));
  const [minBelt, setMinBelt] = useState<Belt | "">(item?.minBelt ?? "");
  const [image, setImage] = useState(item?.image ?? "/art/items/chest.jpg");
  const [error, setError] = useState("");

  return (
    <dialog open className="fixed inset-0 z-30 m-0 flex h-full w-full items-end justify-center overflow-auto bg-bg-deep/70 p-3 sm:items-center">
      <form
        className="w-full max-w-md rounded-lg border-2 border-border bg-surface p-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim().length < 2) {
            setError("Give the prize a name.");
            return;
          }
          const nextPrice = Number(price);
          if (!nextPrice || nextPrice < 1 || nextPrice > ITEM_PRICE_MAX) {
            setError(`Price must be 1 to ${ITEM_PRICE_MAX.toLocaleString()}.`);
            return;
          }
          const nextStock = Number(stock) || 0;
          if (currency === "coins" && nextStock > STOCK_MAX) {
            setError(`Stock stops at ${STOCK_MAX}.`);
            return;
          }
          onSave({
            name,
            price: nextPrice,
            currency,
            stock: currency === "exp" ? 0 : nextStock,
            image,
            minBelt: minBelt || null,
          });
        }}
      >
        <h2 className="text-xl font-extrabold">{item ? "Edit prize" : "Add prize"}</h2>
        <img src={image} alt="" className="mt-3 size-24 rounded-md object-cover" style={{ imageRendering: "pixelated" }} />
        <label className="mt-3 block text-sm font-extrabold" htmlFor="prize-name">
          Name
        </label>
        <input id="prize-name" className={`${field} mt-1`} value={name} onChange={(event) => setName(event.target.value)} />
        <div className="mt-3 flex overflow-hidden rounded-md border-2 border-border" role="group" aria-label="Prize currency">
          <button
            type="button"
            aria-pressed={currency === "coins"}
            onClick={() => setCurrency("coins")}
            className={`min-h-11 flex-1 font-extrabold ${currency === "coins" ? "bg-accent text-accent-ink" : "bg-surface text-fg"}`}
          >
            Coins
          </button>
          <button
            type="button"
            aria-pressed={currency === "exp"}
            onClick={() => setCurrency("exp")}
            className={`min-h-11 flex-1 border-l-2 border-border font-extrabold ${currency === "exp" ? "bg-accent text-accent-ink" : "bg-surface text-fg"}`}
          >
            EXP
          </button>
        </div>
        <p className="mt-2 text-xs font-bold text-muted">
          {currency === "exp"
            ? "Claimed once when a ninja’s EXP reaches this number. EXP is not spent."
            : "Spent from the ninja’s coins. Coins return to the vault."}
        </p>
        <div className={`mt-3 grid gap-2 ${currency === "exp" ? "grid-cols-1" : "grid-cols-2"}`}>
          <div>
            <label className="block text-sm font-extrabold" htmlFor="prize-price">
              {currency === "exp" ? "EXP needed" : "Coin price"}
            </label>
            <input
              id="prize-price"
              className={`${field} mt-1`}
              inputMode="numeric"
              value={price}
              onChange={(event) => setPrice(event.target.value.replace(/[^\d]/g, "").slice(0, 5))}
            />
          </div>
          {currency === "coins" ? (
          <div>
            <label className="block text-sm font-extrabold" htmlFor="prize-stock">
              Stock
            </label>
            <input
              id="prize-stock"
              className={`${field} mt-1`}
              inputMode="numeric"
              value={stock}
              onChange={(event) => setStock(event.target.value.replace(/[^\d]/g, ""))}
            />
          </div>
          ) : null}
        </div>
        <label className="mt-3 block text-sm font-extrabold" htmlFor="prize-belt">
          Belt gate
        </label>
        <select
          id="prize-belt"
          className={`${field} mt-1`}
          value={minBelt}
          onChange={(event) => setMinBelt(event.target.value as Belt | "")}
        >
          <option value="">Any belt</option>
          {BELTS.map((option) => (
            <option key={option} value={option}>
              {option} and above
            </option>
          ))}
        </select>
        <label className="mt-3 block text-sm font-extrabold" htmlFor="prize-image">
          Image
        </label>
        <input
          id="prize-image"
          className={`${field} mt-1`}
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            void fileToIcon(file)
              .then(setImage)
              .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not use that image."));
          }}
        />
        {error ? <p className="mt-2 font-bold text-primary">{error}</p> : null}
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {onRemove ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Remove this prize from the shop?")) onRemove();
              }}
              className="mr-auto min-h-11 rounded-md border-2 border-primary px-3 font-extrabold text-primary"
            >
              Remove
            </button>
          ) : null}
          <button type="button" onClick={onClose} className="min-h-11 rounded-md border-2 border-border px-3 font-extrabold">
            Cancel
          </button>
          <button type="submit" className="min-h-11 rounded-md border-2 border-primary bg-primary px-3 font-extrabold text-fg">
            Save
          </button>
        </div>
      </form>
    </dialog>
  );
}

function AchievementDialog({
  achievement,
  onClose,
  onSave,
  onRemove,
}: {
  achievement?: Achievement;
  onClose: () => void;
  onSave: (value: Omit<Achievement, "id">) => void;
  onRemove?: () => void;
}) {
  const [name, setName] = useState(achievement?.name ?? "");
  const [coins, setCoins] = useState(String(achievement?.coins ?? 10));
  const [cadence, setCadence] = useState<"daily" | "weekly">(achievement?.cadence ?? "daily");
  const [image, setImage] = useState(achievement?.image ?? "/art/achievements/code.png");
  const [error, setError] = useState("");

  return (
    <dialog open className="fixed inset-0 z-30 m-0 flex h-full w-full items-end justify-center overflow-auto bg-bg-deep/70 p-3 sm:items-center">
      <form
        className="w-full max-w-md rounded-lg border-2 border-border bg-surface p-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim().length < 2) {
            setError("Name the achievement.");
            return;
          }
          const nextCoins = Number(coins);
          if (!nextCoins || nextCoins < 1 || nextCoins > PRICE_MAX) {
            setError(`Coins must be 1 to ${PRICE_MAX}.`);
            return;
          }
          onSave({ name, coins: nextCoins, cadence, image });
        }}
      >
        <h2 className="text-xl font-extrabold">{achievement ? "Edit achievement" : "Add achievement"}</h2>
        <img src={image} alt="" className="mt-3 size-24 rounded-md object-cover" style={{ imageRendering: "pixelated" }} />
        <label className="mt-3 block text-sm font-extrabold" htmlFor="achieve-name">
          Name
        </label>
        <input
          id="achieve-name"
          className={`${field} mt-1`}
          maxLength={48}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-extrabold" htmlFor="achieve-coins">
              Ninja coins
            </label>
            <input
              id="achieve-coins"
              className={`${field} mt-1`}
              inputMode="numeric"
              value={coins}
              onChange={(event) => setCoins(event.target.value.replace(/[^\d]/g, ""))}
            />
          </div>
          <div>
            <label className="block text-sm font-extrabold" htmlFor="achieve-cadence">
              Repeats
            </label>
            <select
              id="achieve-cadence"
              className={`${field} mt-1`}
              value={cadence}
              onChange={(event) => setCadence(event.target.value === "weekly" ? "weekly" : "daily")}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
        <label className="mt-3 block text-sm font-extrabold" htmlFor="achieve-image">
          Image
        </label>
        <input
          id="achieve-image"
          className={`${field} mt-1`}
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            void fileToIcon(file)
              .then(setImage)
              .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not use that image."));
          }}
        />
        {error ? <p className="mt-2 font-bold text-primary">{error}</p> : null}
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {onRemove ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Remove this achievement?")) onRemove();
              }}
              className="mr-auto min-h-11 rounded-md border-2 border-primary px-3 font-extrabold text-primary"
            >
              Remove
            </button>
          ) : null}
          <button type="button" onClick={onClose} className="min-h-11 rounded-md border-2 border-border px-3 font-extrabold">
            Cancel
          </button>
          <button type="submit" className="min-h-11 rounded-md border-2 border-primary bg-primary px-3 font-extrabold text-fg">
            Save
          </button>
        </div>
      </form>
    </dialog>
  );
}
