import { useEffect, useState } from "react";
import { GATE_EVENT, gateOpen, unlockGate } from "@/lib/dojo/gate";
import { useDojo } from "@/lib/dojo/store";

export function useDoor() {
  const [door, setDoor] = useState<"wait" | "locked" | "open">("wait");
  useEffect(() => {
    const sync = () => setDoor(gateOpen() ? "open" : "locked");
    sync();
    window.addEventListener(GATE_EVENT, sync);
    window.addEventListener("storage", sync);
    const timer = window.setInterval(sync, 30_000);
    return () => {
      window.removeEventListener(GATE_EVENT, sync);
      window.removeEventListener("storage", sync);
      window.clearInterval(timer);
    };
  }, []);
  return door;
}

export function AccessGate() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const enter = () => {
    setBusy(true);
    const opened = unlockGate(code);
    setBusy(false);
    if (!opened) setError("That code doesn't open the dojo.");
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8">
      <img src="/art/cave.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-bg-deep/80" />
      <form
        className="relative z-10 w-full max-w-md rounded-lg border-4 border-accent bg-bg/90 p-5 text-center shadow-xl"
        onSubmit={(event) => {
          event.preventDefault();
          enter();
        }}
      >
        <div className="flex items-end justify-center gap-2">
          <img
            src="/art/sprites/greet/idle-1.png"
            alt=""
            className="h-28 w-auto"
            style={{ imageRendering: "pixelated" }}
          />
          <img
            src="/art/sprites/rosie/walk-1.png"
            alt=""
            className="mb-1 h-16 w-auto"
            style={{ imageRendering: "pixelated" }}
          />
        </div>
        <p className="mt-3 font-pixel text-pixel text-accent">BLOCKDOJO</p>
        <h1 className="mt-2 text-2xl font-extrabold">Enter the dojo</h1>
        <p className="mt-1 text-sm font-bold text-muted">One cave for the whole center. This code lasts until midnight.</p>
        <label className="mt-4 block text-left text-sm font-extrabold" htmlFor="access-code">
          Access code
        </label>
        <input
          id="access-code"
          value={code}
          autoCapitalize="characters"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          onChange={(event) => {
            setCode(event.target.value.toUpperCase());
            setError("");
          }}
          className="mt-2 min-h-14 w-full rounded-md border-4 border-accent bg-bg px-3 text-center text-2xl font-extrabold tracking-[0.2em] uppercase"
        />
        <button
          type="submit"
          disabled={busy || code.trim().length < 4}
          className="mt-3 min-h-14 w-full rounded-md border-4 border-accent bg-accent text-lg font-extrabold text-accent-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          Open the cave
        </button>
        <p className="mt-2 min-h-5 text-sm font-extrabold text-primary" role="status">
          {error}
        </p>
      </form>
    </main>
  );
}

export function PhoneLink() {
  const linkPhone = useDojo((state) => state.linkPhone);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8">
      <img src="/art/cave.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-bg-deep/80" />
      <form
        className="relative z-10 w-full max-w-md rounded-lg border-4 border-accent bg-bg/90 p-5 text-center shadow-xl"
        onSubmit={(event) => {
          event.preventDefault();
          setBusy(true);
          void linkPhone(code).then((result) => {
            setBusy(false);
            if (!result.ok) setError(result.reason);
          });
        }}
      >
        <p className="font-pixel text-pixel text-accent">BLOCKDOJO</p>
        <h1 className="mt-2 text-2xl font-extrabold">Phone code</h1>
        <p className="mt-1 text-sm font-bold text-muted">Read the code on the cave TV. It changes every hour. Other phones can use the same one.</p>
        <label className="mt-4 block text-left text-sm font-extrabold" htmlFor="phone-code">
          Code on the TV
        </label>
        <input
          id="phone-code"
          value={code}
          autoCapitalize="characters"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          maxLength={4}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4));
            setError("");
          }}
          className="mt-2 min-h-14 w-full rounded-md border-4 border-accent bg-bg px-3 text-center text-3xl font-extrabold tracking-[0.3em] uppercase"
        />
        <button
          type="submit"
          disabled={busy || code.length < 4}
          className="mt-3 min-h-14 w-full rounded-md border-4 border-accent bg-accent text-lg font-extrabold text-accent-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          Link this phone
        </button>
        <p className="mt-2 min-h-5 text-sm font-extrabold text-primary" role="status">
          {error}
        </p>
      </form>
    </main>
  );
}
