export const PAYOUT_MAX = 25;
export const DAILY_MAX = 75;
export const PAYOUT_GAP_MS = 15_000;
export const WELCOME_MAX = 10;
export const DIRECTOR_PIN = "010125";
export const DIRECTOR_MS = 10 * 60 * 1000;
export const PIN_TRIES = 5;
export const PIN_LOCK_MS = 30_000;
export const PRICE_MAX = 500;
export const ITEM_PRICE_MAX = 10_000;
export const STOCK_MAX = 99;
export const ACCESS_CODE = "CNCE2026";
export const CENTER_CODE = "CNCE-DOJO";

export function todayKey(now = Date.now()) {
  const date = new Date(now);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function earnedToday(student: { dayKey?: string; dayCoins?: number }, now = Date.now()) {
  return student.dayKey === todayKey(now) ? (student.dayCoins ?? 0) : 0;
}

export function periodKey(cadence: "daily" | "weekly", weekStarted: number, now = Date.now()) {
  if (cadence === "daily") return todayKey(now);
  const index = Math.floor(Math.max(0, now - weekStarted) / (7 * 24 * 60 * 60 * 1000));
  return `w${weekStarted}-${index}`;
}
