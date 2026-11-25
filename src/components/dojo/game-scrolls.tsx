import type { GameBadge, RankRow } from "@/lib/dojo/games";
import { beltToken } from "@/lib/dojo/types";

export function ResultsScroll({
  phase,
  words,
  coins,
  exp,
  badges,
}: {
  phase: "in" | "hold" | "out";
  words: number;
  coins: number;
  exp: number;
  badges: GameBadge[];
}) {
  const motion = phase === "in" ? "scroll-in-right" : phase === "out" ? "scroll-out-right" : "scroll-hold";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-deep/55 px-4">
      <article className={`w-full max-w-lg rounded-lg border-8 border-[#5a3d2a] bg-[#f4e6cf] px-6 py-6 text-[#2a1c08] shadow-2xl ${motion}`}>
        <p className="text-center font-pixel text-pixel text-[#8a5a32]">YOUR HAUL</p>
        <ul className="mt-4 space-y-3">
          {[
            [`${words} words typed`, "0.15s"],
            [`${coins} ninja coins`, "0.45s"],
            [`${exp} EXP`, "0.75s"],
          ].map(([label, delay]) => (
            <li key={label} className="scroll-stamp text-center text-2xl font-extrabold" style={{ animationDelay: delay }}>
              {label}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {badges.length ? (
            badges.map((badge, index) => (
              <span
                key={badge}
                className="scroll-stamp rounded-md border-2 border-[#8a5a32] px-3 py-1 text-sm font-extrabold"
                style={{ animationDelay: `${1 + index * 0.25}s` }}
              >
                {badge}
              </span>
            ))
          ) : (
            <span className="scroll-stamp text-sm font-extrabold" style={{ animationDelay: "1s" }}>
              Keep typing next time for a badge.
            </span>
          )}
        </div>
      </article>
    </div>
  );
}

function FlameName({ name, big = false }: { name: string; big?: boolean }) {
  return (
    <span className={`flame-slot ${big ? "flame-slot-lg" : ""}`}>
      <span className="flame-ball flame-ball-left" aria-hidden>
        <img src="/art/typing/fireball-loop.png?v=loop2" alt="" />
      </span>
      <span className="flame-ball flame-ball-right" aria-hidden>
        <img src="/art/typing/fireball-loop.png?v=loop2" alt="" />
      </span>
      <span className={`relative z-10 ${big ? "flame-name" : "flame-name-sm"}`}>{name}</span>
    </span>
  );
}

export function RankScroll({ phase, ranks, you, heading = "TOP TYPER" }: { phase: "in" | "hold" | "out"; ranks: RankRow[]; you: string; heading?: string }) {
  const motion = phase === "in" ? "scroll-in-left" : phase === "out" ? "scroll-out-left" : "scroll-hold";
  const top = ranks[0];
  const topLit = Boolean(top && top.words + top.coins > 0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-visible bg-bg-deep/55 px-4">
      <article className={`flex max-h-[86dvh] w-full max-w-lg flex-col overflow-visible rounded-lg border-8 border-[#5a3d2a] bg-[#f4e6cf] px-4 py-5 text-[#2a1c08] shadow-2xl ${motion}`}>
        <p className="text-center font-pixel text-pixel text-[#8a5a32]">{heading}</p>
        <p className="relative z-10 mt-3 overflow-visible text-center text-3xl font-extrabold">
          {topLit ? <FlameName name={top.name} big /> : "The mine is quiet"}
        </p>
        <ol className="mt-4 space-y-2 overflow-visible pr-1">
          {ranks.map((row, index) => {
            const flame = index < 3 && row.coins + row.words > 0;
            return (
              <li
                key={row.id}
                className={`scroll-stamp grid grid-cols-[1fr_auto_1fr] items-center overflow-visible rounded-md border-2 px-2 py-1.5 ${
                  row.id === you ? "border-[#d63a32] bg-[#fff8ea]" : "border-[#5a3d2a]/40"
                }`}
                style={{ animationDelay: `${Math.min(index, 12) * 0.08}s` }}
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 font-extrabold tabular-nums">{index + 1}</span>
                  <span className="size-3 shrink-0 rounded-full border border-black/30" style={{ background: `var(--color-${beltToken(row.belt)})` }} />
                </span>
                <span className="relative overflow-visible px-2 text-center font-extrabold">
                  {flame ? <FlameName name={row.name} /> : <span className="block truncate">{row.name}</span>}
                </span>
                <span className="text-right text-sm font-extrabold tabular-nums">{row.coins}</span>
              </li>
            );
          })}
        </ol>
      </article>
    </div>
  );
}
