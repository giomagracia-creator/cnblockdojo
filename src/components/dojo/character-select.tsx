import { useEffect, useRef } from "react";
import { beltAllows } from "@/lib/dojo/games";
import { beltToken, type Belt } from "@/lib/dojo/types";

export type RosieClip = "idle" | "run" | "attack" | "hurt";

export function RosieMovie({
  clip = "idle",
  flip = false,
  rate = 1,
  className = "",
}: {
  clip?: RosieClip;
  flip?: boolean;
  rate?: number;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const play = () => {
      node.playbackRate = rate;
      void node.play().catch(() => {});
    };
    play();
    node.addEventListener("loadeddata", play);
    return () => node.removeEventListener("loadeddata", play);
  }, [clip, rate]);
  return (
    <video
      ref={ref}
      key={`${clip}-${flip ? "l" : "r"}`}
      src={`/art/typeme/rosie/${clip}.webm`}
      className={`${className} ${flip ? "tm-flip" : ""}`.trim()}
      muted
      loop={clip === "idle" || clip === "run"}
      autoPlay
      playsInline
    />
  );
}

export function RosieIdle({ className = "" }: { className?: string }) {
  return <RosieMovie clip="idle" className={className} />;
}

const ROSTER: { id: string; name: string; title: string; belt: Belt; open: boolean }[] = [
  { id: "rosie", name: "Rosie", title: "Heavy Knight", belt: "Yellow", open: true },
  { id: "orange", name: "Locked", title: "Sealed", belt: "Orange", open: false },
  { id: "green", name: "Locked", title: "Sealed", belt: "Green", open: false },
  { id: "blue", name: "Locked", title: "Sealed", belt: "Blue", open: false },
  { id: "purple", name: "Locked", title: "Sealed", belt: "Purple", open: false },
  { id: "brown", name: "Locked", title: "Sealed", belt: "Brown", open: false },
  { id: "red", name: "Locked", title: "Sealed", belt: "Red", open: false },
  { id: "black", name: "Locked", title: "Sealed", belt: "Black", open: false },
];

export function CharacterSelect({
  belt,
  cursor,
  locked,
  searchLabel,
  lockLeft,
  foeLine,
  onCursor,
  onLock,
  onClose,
}: {
  belt: Belt;
  cursor: string;
  locked: boolean;
  searchLabel: string;
  lockLeft: number;
  foeLine: string;
  onCursor: (id: string) => void;
  onLock: (id: string) => void;
  onClose: () => void;
}) {
  const picked = ROSTER.find((slot) => slot.id === cursor) ?? ROSTER[0];
  const playable = picked.open && beltAllows(belt, picked.belt);
  return (
    <section className="relative z-10 mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-3 py-4 text-[#fff8ea]">
      <div className="flex items-end justify-between gap-3 drop-shadow-[0_2px_0_#1a120c]">
        <p className="font-pixel text-pixel text-accent">{locked ? "LOCKED IN" : `LOCK ${lockLeft}`}</p>
        <p className="text-right text-sm font-extrabold">{searchLabel}</p>
      </div>
      <div className="mt-2 flex flex-1 flex-col items-center justify-center">
        {playable ? (
          <RosieIdle className="h-[min(42vh,20rem)] w-auto object-contain drop-shadow-[0_18px_0_rgba(0,0,0,0.35)]" />
        ) : (
          <div className="grid h-40 w-40 place-items-center rounded-lg border-4 border-[#5a3d2a] bg-black/50 text-4xl font-extrabold">?</div>
        )}
        <h1 className="mt-2 text-3xl font-extrabold uppercase drop-shadow-[0_3px_0_#1a120c]">{playable ? picked.name : "Locked"}</h1>
        <p className="text-sm font-extrabold text-accent">{playable ? picked.title : `Opens at ${picked.belt} belt`}</p>
        <p className="mt-1 min-h-5 text-sm font-bold">{foeLine}</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {ROSTER.map((slot) => {
          const open = slot.open && beltAllows(belt, slot.belt);
          const on = slot.id === cursor;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onCursor(slot.id)}
              className={`relative min-h-16 rounded-md border-4 bg-black/55 px-1 py-2 text-center ${on ? "border-accent" : "border-[#5a3d2a]"} ${open ? "" : "opacity-70"}`}
            >
              <span className="block text-xs font-extrabold uppercase">{open ? slot.name : "Locked"}</span>
              <span className="mt-1 inline-block h-2 w-8 rounded-full" style={{ background: `var(--color-${beltToken(slot.belt)})` }} />
              <span className="mt-1 block text-[10px] font-bold uppercase">{slot.belt}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={!playable || locked}
          onClick={() => onLock(picked.id)}
          className="min-h-12 rounded-md border-4 border-accent bg-accent font-extrabold text-accent-ink disabled:opacity-60"
        >
          {locked ? "Locked" : "Lock in"}
        </button>
        <button type="button" onClick={onClose} className="min-h-12 rounded-md border-4 border-[#5a3d2a] bg-black/55 font-extrabold">
          Close
        </button>
      </div>
    </section>
  );
}
