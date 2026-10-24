import { useState } from "react";
import { useDojo } from "@/lib/dojo/store";
import type { DojoRole } from "@/lib/dojo/types";

export function JoinScreen({ role }: { role: DojoRole }) {
  const openDojo = useDojo((state) => state.openDojo);
  const joinDojo = useDojo((state) => state.joinDojo);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const format = (value: string) => {
    const raw = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    return raw.length > 4 ? `${raw.slice(0, 4)}-${raw.slice(4)}` : raw;
  };

  const join = async () => {
    setBusy(true);
    const result = await joinDojo(role, code);
    setBusy(false);
    if (!result.ok) setError(result.reason);
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-8">
      <p className="font-pixel text-pixel text-accent">BLOCKDOJO</p>
      <h1 className="mt-2 text-3xl font-extrabold">{role === "display" ? "This screen is the cave." : "This screen is the desk."}</h1>
      <p className="mt-2 font-bold text-muted">
        One code ties the TV and the phone together. Open it on the first screen, then type it on the other.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          void openDojo(role).then((result) => {
            setBusy(false);
            if (!result.ok) setError(result.reason);
          });
        }}
        className="mt-6 min-h-14 rounded-md border-4 border-accent bg-accent px-4 text-lg font-extrabold text-accent-ink"
      >
        Open this dojo
      </button>
      <form
        className="mt-4 rounded-lg border-4 border-border bg-surface p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void join();
        }}
      >
        <label className="text-sm font-extrabold" htmlFor="dojo-code">
          Join with a code
        </label>
        <input
          id="dojo-code"
          value={code}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          placeholder="AB3K-9PQ2"
          onChange={(event) => {
            setCode(format(event.target.value));
            setError("");
          }}
          className="mt-2 min-h-14 w-full rounded-md border-4 border-accent bg-bg px-3 text-center text-2xl font-extrabold tracking-[0.3em] uppercase"
        />
        <button type="submit" disabled={busy || code.replace("-", "").length < 8} className="mt-3 min-h-12 w-full rounded-md border-2 border-primary bg-primary font-extrabold text-fg">
          Join dojo
        </button>
        <p className="mt-2 min-h-5 text-center text-sm font-extrabold text-primary" role="status">
          {error}
        </p>
      </form>
    </main>
  );
}

export function CodeBanner({ code, hint }: { code: string; hint: string }) {
  const leaveDojo = useDojo((state) => state.leaveDojo);
  return (
    <div className="border-4 border-accent bg-bg px-4 py-3 text-center shadow-xl">
      <p className="font-pixel text-pixel text-accent">DOJO CODE</p>
      <p className="mt-1 text-3xl font-extrabold tracking-[0.25em]">{code}</p>
      <p className="mt-1 text-sm font-extrabold">{hint}</p>
      <button type="button" onClick={() => leaveDojo()} className="mt-2 text-sm font-bold text-muted underline">
        Leave this dojo
      </button>
    </div>
  );
}

export function DojoLoading() {
  return (
    <main className="grid min-h-dvh place-items-center">
      <p className="font-extrabold">Opening the cave…</p>
    </main>
  );
}
