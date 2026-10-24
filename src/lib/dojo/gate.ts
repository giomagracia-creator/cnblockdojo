import { ACCESS_CODE, todayKey } from "@/lib/dojo/rules";

export const GATE_KEY = "blockdojo-gate";
export const GATE_DAY_KEY = "blockdojo-gate-day";
export const GATE_EVENT = "blockdojo-gate";

export function gateOpen(now = Date.now()) {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(GATE_KEY) === ACCESS_CODE && localStorage.getItem(GATE_DAY_KEY) === todayKey(now);
  } catch {
    return false;
  }
}

export function unlockGate(code: string) {
  const typed = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (typed !== ACCESS_CODE) return false;
  try {
    localStorage.setItem(GATE_KEY, ACCESS_CODE);
    localStorage.setItem(GATE_DAY_KEY, todayKey());
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(GATE_EVENT));
  return true;
}