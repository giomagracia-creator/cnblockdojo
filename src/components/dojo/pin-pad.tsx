import { useState } from "react";
import { useDojo } from "@/lib/dojo/store";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "OK"] as const;

export function PinPad({ onClose }: { onClose: () => void }) {
  const unlockDirector = useDojo((state) => state.unlockDirector);
  const [digits, setDigits] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const fail = (reason: string) => {
    setDigits("");
    setError(reason);
    setShake(true);
    window.setTimeout(() => setShake(false), 420);
  };

  const submit = (value: string) => {
    if (value.length !== 6) {
      fail("Enter all 6 digits.");
      return;
    }
    void (async () => {
      const result = await unlockDirector(value);
      if (!result.ok) {
        fail(result.reason);
        return;
      }
      onClose();
    })();
  };

  const press = (key: (typeof KEYS)[number]) => {
    if (key === "C") {
      setDigits("");
      setError("");
      return;
    }
    if (key === "OK") {
      submit(digits);
      return;
    }
    const next = `${digits}${key}`.slice(0, 6);
    setDigits(next);
    setError("");
    if (next.length === 6) submit(next);
  };

  return (
    <dialog open className="fixed inset-0 z-40 m-0 flex h-full w-full items-center justify-center bg-bg-deep/80 p-3">
      <div
        className="w-full max-w-xs border-4 border-accent bg-bg px-4 py-4 shadow-2xl"
        style={{ animation: shake ? "pin-shake 420ms linear" : undefined, imageRendering: "pixelated" }}
      >
        <p className="font-pixel text-pixel text-center text-accent">DIRECTOR</p>
        <p className="mt-2 text-center text-sm font-extrabold text-muted">Shop and balance fixes need this pin.</p>
        <div className="mt-4 grid grid-cols-6 gap-1" aria-label="Pin entry">
          {Array.from({ length: 6 }, (_, index) => (
            <span
              key={index}
              className="flex h-10 items-center justify-center border-2 border-accent bg-bg-deep font-extrabold text-accent"
            >
              {digits[index] ? "•" : ""}
            </span>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => press(key)}
              className={`min-h-14 border-4 font-extrabold text-lg ${
                key === "OK"
                  ? "border-accent bg-accent text-accent-ink"
                  : "border-border bg-surface text-fg active:translate-y-0.5"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
        <p className="mt-3 min-h-5 text-center text-sm font-extrabold text-primary" role="status">
          {error}
        </p>
        <button type="button" onClick={onClose} className="mt-1 min-h-11 w-full border-2 border-border font-extrabold">
          Close
        </button>
      </div>
    </dialog>
  );
}
