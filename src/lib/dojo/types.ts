export const BELTS = [
  "White",
  "Yellow",
  "Orange",
  "Green",
  "Blue",
  "Purple",
  "Brown",
  "Red",
  "Black",
  "Bronze",
  "Silver",
  "Platinum",
  "Gold",
] as const;

export type Belt = (typeof BELTS)[number];

export const BELT_RANK: Record<Belt, number> = {
  White: 0,
  Yellow: 1,
  Orange: 2,
  Green: 3,
  Blue: 4,
  Purple: 5,
  Brown: 6,
  Red: 7,
  Black: 8,
  Bronze: 9,
  Silver: 10,
  Platinum: 11,
  Gold: 12,
};

export type Student = {
  id: string;
  firstName: string;
  lastInitial: string;
  belt: Belt;
  coins: number;
  exp: number;
  weekCoins: number;
  archived: boolean;
  dayKey?: string;
  dayCoins?: number;
  lastAwardAt?: number;
};

export type Achievement = {
  id: string;
  cadence: "daily" | "weekly";
  name: string;
  coins: number;
  image: string;
};

export type AchievementClaim = {
  achievementId: string;
  studentId: string;
  periodKey: string;
};
export type ShopItem = {
  id: string;
  name: string;
  price: number;
  currency: "coins" | "exp";
  stock: number;
  image: string;
  minBelt: Belt | null;
};

export type ExpClaim = {
  studentId: string;
  itemId: string;
};

export type DojoKind = "redeem" | "award" | "welcome" | "belt" | "shop" | "rest" | "undo" | "mine" | "return" | "pocket";

export type DojoRole = "display" | "sensei";

export type Hero = "boy" | "girl";

export type DojoSnapshot = {
  students: Student[];
  items: ShopItem[];
  achievements: Achievement[];
  claims: AchievementClaim[];
  expClaims: ExpClaim[];
  events: DojoEvent[];
  weekStarted: number;
  displaySeen: boolean;
  senseiSeen: boolean;
  hero: Hero;
  vault: number;
  undo: { count: number; label: string } | null;
  ceremony: BeltCeremony | null;
  phoneCode: string;
  phoneHour: string;
  phoneUntil: string;
};

export type BeltCeremony = {
  id: string;
  studentName: string;
  belt: Belt;
};

export type DojoEvent = {
  id: string;
  kind: DojoKind;
  at: number;
  studentName: string;
  detail: string;
  line: string;
  coins: number;
  celebrateUntil: number;
  sceneUntil: number;
};

export function displayName(student: Pick<Student, "firstName" | "lastInitial">) {
  const initial = student.lastInitial.trim().slice(0, 1).toUpperCase();
  return initial ? `${student.firstName.trim()} ${initial}.` : student.firstName.trim();
}

export function beltToken(belt: Belt) {
  return `belt-${belt.toLowerCase()}` as const;
}

export function nextBelt(belt: Belt): Belt | null {
  const index = BELTS.indexOf(belt);
  if (index < 0 || index >= BELTS.length - 1) return null;
  return BELTS[index + 1] ?? null;
}

export function beltClip(belt: Belt) {
  return `/art/belts/${belt.toLowerCase()}.mp4`;
}
