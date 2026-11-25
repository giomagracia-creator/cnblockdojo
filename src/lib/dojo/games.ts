import { BELT_RANK, type Belt } from "@/lib/dojo/types";

export const GAME_TURN_MS = 10 * 60 * 1000;
export const GAME_FIRST_CAP = 20;
export const GAME_SECOND_CAP = 10;

export type GameBadge = "Spark" | "Lantern" | "Golden Pick";
export type TurnNote = "hour" | "week" | null;

export type NinjaCard = {
  id: string;
  name: string;
  belt: Belt;
  visitHours: 1 | 2;
};

export type RankRow = {
  id: string;
  name: string;
  belt: Belt;
  coins: number;
  words: number;
};

export type ActiveRun = {
  id: string;
  endsAt: number;
  words: number;
  golden: number;
  game: "typing" | "typeme";
};

export function badgesFor(words: number): GameBadge[] {
  const badges: GameBadge[] = [];
  if (words >= 20) badges.push("Spark");
  if (words >= 50) badges.push("Lantern");
  if (words >= 80) badges.push("Golden Pick");
  return badges;
}

export function gameCoins(words: number, golden: number, cap: number) {
  const cleanWords = Math.max(0, Math.floor(words));
  const cleanGolden = Math.max(0, Math.min(cleanWords, Math.floor(golden)));
  return Math.min(cap, Math.floor((cleanWords + cleanGolden) / 4));
}

export function isTestNinja(firstName: string) {
  return firstName.trim().toLowerCase() === "gio";
}

export function beltAllows(have: Belt, need: Belt) {
  return BELT_RANK[have] >= BELT_RANK[need];
}

export type MoveKind = "forward" | "back" | "attack";

export type MoveWord = {
  kind: MoveKind;
  word: string;
  typed: string;
};

export type FightSnap = {
  phase: "intro" | "fight" | "stop" | "ko" | "match";
  youHp: number;
  foeHp: number;
  youRounds: number;
  foeRounds: number;
  round: number;
  youPos: number;
  foePos: number;
  youMoves: MoveWord[];
  foeMoves: MoveWord[];
  banner: string;
  youPose: "idle" | "run" | "attack" | "hurt" | "down";
  foePose: "idle" | "run" | "attack" | "hurt" | "down";
  hits: number;
  clean: number;
};

export function turnCopy(note: TurnNote) {
  if (note === "hour") return "Nice training. Your next game opens when the cave hour changes.";
  if (note === "week") return "Your turn is done, ninja. The games are resting. Come back next week and play again.";
  return "";
}
