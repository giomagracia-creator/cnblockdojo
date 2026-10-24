import { create } from "zustand";
import {
  addItemFn,
  addStudentFn,
  awardCoinsFn,
  callPocketFn,
  joinDojoFn,
  openDojoFn,
  pullDojoFn,
  redeemItemFn,
  removeItemFn,
  restoreDemoFn,
  setHeroFn,
  undoLastFn,
  claimAchievementFn,
  addAchievementFn,
  updateAchievementFn,
  removeAchievementFn,
  unlockDirectorFn,
  updateItemFn,
  updateStudentFn,
  promoteBeltFn,
  dismissCeremonyFn,
  dayLedgerFn,
} from "@/lib/dojo/api";
import { caveAudio } from "@/lib/dojo/audio";
import { gateOpen } from "@/lib/dojo/gate";
import { CENTER_CODE } from "@/lib/dojo/rules";
import type { Achievement, AchievementClaim, Belt, BeltCeremony, DojoEvent, DojoRole, DojoSnapshot, ExpClaim, Hero, ShopItem, Student } from "@/lib/dojo/types";

export const CODE_KEY = "blockdojo-code";
const PHONE_KEY = "blockdojo-phone";

export type RedeemResult = { ok: true } | { ok: false; reason: string };

type DojoStore = {
  hydrated: boolean;
  code: string | null;
  students: Student[];
  items: ShopItem[];
  achievements: Achievement[];
  claims: AchievementClaim[];
  events: DojoEvent[];
  weekStarted: number;
  displaySeen: boolean;
  senseiSeen: boolean;
  hero: Hero;
  vault: number;
  undo: { count: number; label: string } | null;
  ceremony: BeltCeremony | null;
  expClaims: ExpClaim[];
  phoneCode: string;
  phoneHour: string;
  phoneUntil: string;
  phoneLocked: boolean;
  directorUntil: number;
  directorToken: string;
  lockDirector: () => void;
  refresh: (role: DojoRole) => Promise<void>;
  openDojo: (role: DojoRole) => Promise<RedeemResult>;
  joinDojo: (role: DojoRole, code: string) => Promise<RedeemResult>;
  leaveDojo: () => void;
  unlockDirector: (pin: string) => Promise<RedeemResult>;
  awardCoins: (studentId: string, amount: number) => Promise<RedeemResult>;
  callPocket: (studentId: string) => Promise<RedeemResult>;
  redeem: (studentId: string, itemId: string) => Promise<RedeemResult>;
  addStudent: (input: { firstName: string; lastInitial: string; belt: Belt; coins: number }) => Promise<
    { ok: true; id: string } | { ok: false; reason: string }
  >;
  updateStudent: (
    studentId: string,
    patch: { firstName?: string; lastInitial?: string; belt?: Belt; coins?: number; archived?: boolean },
  ) => Promise<RedeemResult>;
  addItem: (input: Omit<ShopItem, "id">) => Promise<string>;
  updateItem: (itemId: string, patch: Partial<Omit<ShopItem, "id">>) => Promise<RedeemResult>;
  removeItem: (itemId: string) => Promise<RedeemResult>;
  restoreDemo: () => Promise<RedeemResult>;
  setHero: (hero: Hero) => Promise<RedeemResult>;
  undoLast: () => Promise<RedeemResult>;
  claimAchievement: (studentId: string, achievementId: string) => Promise<RedeemResult>;
  addAchievement: (input: Omit<Achievement, "id">) => Promise<string>;
  updateAchievement: (achievementId: string, patch: Partial<Omit<Achievement, "id">>) => Promise<RedeemResult>;
  removeAchievement: (achievementId: string) => Promise<RedeemResult>;
  promoteBelt: (studentId: string) => Promise<RedeemResult>;
  linkPhone: (phone: string) => Promise<RedeemResult>;
  dismissCeremony: (ceremonyId: string) => Promise<RedeemResult>;
  dayLedger: (timeZone: string) => Promise<{ ok: true; filename: string; file: string } | { ok: false; reason: string }>;
};

let epoch = 0;
let seenEvent = "";
let dismissedCeremony = "";

function shownCeremony(ceremony: BeltCeremony | null) {
  if (!ceremony) {
    dismissedCeremony = "";
    return null;
  }
  if (ceremony.id === dismissedCeremony) return null;
  dismissedCeremony = "";
  return ceremony;
}

function readCode() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(CODE_KEY);
  } catch {
    return null;
  }
}

function writeCode(code: string | null) {
  try {
    if (code) localStorage.setItem(CODE_KEY, code);
    else localStorage.removeItem(CODE_KEY);
  } catch {
    /* private mode */
  }
}

function readPhone() {
  if (typeof window === "undefined") return "";
  try {
    const parsed = JSON.parse(localStorage.getItem(PHONE_KEY) ?? "") as { code?: string };
    return typeof parsed.code === "string" ? parsed.code : "";
  } catch {
    return "";
  }
}

function writePhone(code: string, hour: string) {
  try {
    localStorage.setItem(PHONE_KEY, JSON.stringify({ code, hour }));
  } catch {
    /* private mode */
  }
}

function clearPhone() {
  try {
    localStorage.removeItem(PHONE_KEY);
  } catch {
    /* private mode */
  }
}

function timeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

function pass() {
  return { phone: readPhone(), zone: timeZone() };
}

function applySnapshot(snapshot: DojoSnapshot) {
  const ceremony = shownCeremony(snapshot.ceremony);
  const newest = snapshot.events[0];
  if (!ceremony && newest && newest.id !== seenEvent && newest.sceneUntil > Date.now()) {
    seenEvent = newest.id;
    caveAudio.cue(newest.kind);
  } else if (newest) {
    seenEvent = newest.id;
  }
  useDojo.setState({
    students: snapshot.students,
    items: snapshot.items,
    achievements: snapshot.achievements,
    claims: snapshot.claims,
    events: snapshot.events,
    weekStarted: snapshot.weekStarted,
    displaySeen: snapshot.displaySeen,
    senseiSeen: snapshot.senseiSeen,
    hero: snapshot.hero,
    vault: snapshot.vault,
    undo: snapshot.undo,
    ceremony,
    expClaims: snapshot.expClaims ?? [],
    phoneCode: snapshot.phoneCode ?? "",
    phoneHour: snapshot.phoneHour ?? "",
    phoneUntil: snapshot.phoneUntil ?? "",
    hydrated: true,
  });
}

async function run<T extends { ok: boolean }>(task: () => Promise<T>): Promise<T> {
  epoch += 1;
  try {
    return await task();
  } finally {
    epoch += 1;
  }
}

export const useDojo = create<DojoStore>()((set, get) => ({
  hydrated: false,
  code: null,
  students: [],
  items: [],
  achievements: [],
  claims: [],
  events: [],
  weekStarted: 0,
  displaySeen: false,
  senseiSeen: false,
  hero: "boy",
  vault: 1000,
  undo: null,
  ceremony: null,
  expClaims: [],
  phoneCode: "",
  phoneHour: "",
  phoneUntil: "",
  phoneLocked: false,
  directorUntil: 0,
  directorToken: "",
  lockDirector: () => set({ directorUntil: 0, directorToken: "" }),
  refresh: async (role) => {
    if (!gateOpen()) {
      set({ hydrated: true });
      return;
    }
    const saved = get().code ?? readCode();
    const phone = readPhone();
    const zone = timeZone();
    if (role === "sensei" && !phone) {
      set({ hydrated: true, phoneLocked: true, code: CENTER_CODE });
      return;
    }
    if (saved !== CENTER_CODE) {
      const seen = epoch;
      try {
        const result = await openDojoFn({ data: { role, phone, zone } });
        if (seen !== epoch) return;
        if (!result.ok) {
          if (result.phone) clearPhone();
          set({ hydrated: true, phoneLocked: role === "sensei" && Boolean(result.phone), code: role === "sensei" ? CENTER_CODE : null });
          return;
        }
        writeCode(result.code);
        if (role === "sensei") writePhone(phone, result.snapshot.phoneHour);
        set({ code: result.code, directorToken: "", directorUntil: 0, phoneLocked: false });
        applySnapshot(result.snapshot);
      } catch {
        if (seen === epoch) set({ hydrated: true });
      }
      return;
    }
    if (!get().code) set({ code: saved });
    const seen = epoch;
    try {
      const result = await pullDojoFn({ data: { code: saved, role, phone, zone } });
      if (seen !== epoch) return;
      if (!result.ok) {
        if (result.phone) {
          clearPhone();
          set({ hydrated: true, phoneLocked: true, code: saved });
          return;
        }
        writeCode(null);
        dismissedCeremony = "";
        set({ hydrated: true, code: null, students: [], items: [], events: [], ceremony: null, phoneLocked: false });
        return;
      }
      if (role === "sensei") writePhone(phone, result.snapshot.phoneHour);
      set({ phoneLocked: false });
      applySnapshot(result.snapshot);
    } catch {
      if (seen === epoch) set({ hydrated: true, code: saved });
    }
  },
  openDojo: async (role) => {
    try {
      const result = await run(() => openDojoFn({ data: { role, ...pass() } }));
      if (!result.ok) return result;
      writeCode(result.code);
      set({ code: result.code, directorToken: "", directorUntil: 0 });
      applySnapshot(result.snapshot);
      return { ok: true };
    } catch {
      return { ok: false, reason: "The cave couldn't open. Try again." };
    }
  },
  joinDojo: async (role, code) => {
    try {
      const result = await run(() => joinDojoFn({ data: { role, code, ...pass() } }));
      if (!result.ok) return result;
      writeCode(result.code);
      set({ code: result.code, directorToken: "", directorUntil: 0 });
      applySnapshot(result.snapshot);
      return { ok: true };
    } catch {
      return { ok: false, reason: "The cave couldn't open. Try again." };
    }
  },
  leaveDojo: () => {
    epoch += 1;
    writeCode(null);
    seenEvent = "";
    dismissedCeremony = "";
    set({
      code: null,
      students: [],
      items: [],
      achievements: [],
      claims: [],
      events: [],
      displaySeen: false,
      senseiSeen: false,
      hero: "boy",
      undo: null,
      ceremony: null,
      directorToken: "",
      directorUntil: 0,
      hydrated: true,
    });
  },
  unlockDirector: async (pin) => {
    const code = get().code;
    if (!code) return { ok: false, reason: "Join a dojo first." };
    try {
      const result = await unlockDirectorFn({ data: { code, pin, ...pass() } });
      if (!result.ok) return { ok: false, reason: result.reason };
      set({ directorToken: result.token, directorUntil: result.until });
      return { ok: true };
    } catch {
      return { ok: false, reason: "The pad didn't answer. Try again." };
    }
  },
  awardCoins: async (studentId, amount) => {
    const code = get().code;
    if (!code) return { ok: false, reason: "Join a dojo first." };
    try {
      const result = await run(() => awardCoinsFn({ data: { code, studentId, amount, ...pass() } }));
      if (result.ok) applySnapshot(result.snapshot);
      return result.ok ? { ok: true } : result;
    } catch {
      return { ok: false, reason: "The payout didn't land. Try again." };
    }
  },
  callPocket: async (studentId) => {
    const code = get().code;
    if (!code) return { ok: false, reason: "Join a dojo first." };
    try {
      const result = await run(() => callPocketFn({ data: { code, studentId, ...pass() } }));
      if (result.ok) applySnapshot(result.snapshot);
      return result.ok ? { ok: true } : result;
    } catch {
      return { ok: false, reason: "The pocket call didn't reach the TV." };
    }
  },
  redeem: async (studentId, itemId) => {
    const code = get().code;
    if (!code) return { ok: false, reason: "Join a dojo first." };
    try {
      const result = await run(() => redeemItemFn({ data: { code, studentId, itemId, ...pass() } }));
      if (result.ok) applySnapshot(result.snapshot);
      return result.ok ? { ok: true } : result;
    } catch {
      return { ok: false, reason: "The redeem didn't land. Try again." };
    }
  },
  addStudent: async (input) => {
    const code = get().code;
    if (!code) return { ok: false, reason: "The cave isn't open yet." };
    try {
      const result = await run(() => addStudentFn({ data: { code, input, token: get().directorToken, ...pass() } }));
      if (!result.ok) return result;
      applySnapshot(result.snapshot);
      return { ok: true, id: result.id };
    } catch {
      return { ok: false, reason: "The ninja didn't join. Try again." };
    }
  },
  updateStudent: async (studentId, patch) => {
    const code = get().code;
    if (!code) return { ok: false, reason: "Join a dojo first." };
    try {
      const result = await run(() => updateStudentFn({ data: { code, studentId, patch, token: get().directorToken, ...pass() } }));
      if (result.ok) applySnapshot(result.snapshot);
      return result.ok ? { ok: true } : result;
    } catch {
      return { ok: false, reason: "The ninja didn't save. Try again." };
    }
  },
  addItem: async (input) => {
    const code = get().code;
    if (!code) return "";
    try {
      const result = await run(() => addItemFn({ data: { code, input, token: get().directorToken, ...pass() } }));
      if (!result.ok) return "";
      applySnapshot(result.snapshot);
      return result.id;
    } catch {
      return "";
    }
  },
  updateItem: async (itemId, patch) => {
    const code = get().code;
    if (!code) return { ok: false, reason: "Join a dojo first." };
    try {
      const result = await run(() => updateItemFn({ data: { code, itemId, patch, token: get().directorToken, ...pass() } }));
      if (result.ok) applySnapshot(result.snapshot);
      return result.ok ? { ok: true } : result;
    } catch {
      return { ok: false, reason: "The prize didn't save. Try again." };
    }
  },
  removeItem: async (itemId) => {
    const code = get().code;
    if (!code) return { ok: false, reason: "Join a dojo first." };
    try {
      const result = await run(() => removeItemFn({ data: { code, itemId, token: get().directorToken, ...pass() } }));
      if (result.ok) applySnapshot(result.snapshot);
      return result.ok ? { ok: true } : result;
    } catch {
      return { ok: false, reason: "The prize didn't leave. Try again." };
    }
  },
  restoreDemo: async () => {
    const code = get().code;
    if (!code) return { ok: false, reason: "Join a dojo first." };
    try {
      const result = await run(() => restoreDemoFn({ data: { code, token: get().directorToken, ...pass() } }));
      if (result.ok) applySnapshot(result.snapshot);
      return result.ok ? { ok: true } : result;
    } catch {
      return { ok: false, reason: "The sample dojo didn't restore." };
    }
  },
  setHero: async (hero) => {
    const code = get().code;
    if (!code) return { ok: false, reason: "Join a dojo first." };
    try {
      const result = await run(() => setHeroFn({ data: { code, hero, ...pass() } }));
      if (result.ok) applySnapshot(result.snapshot);
      return result.ok ? { ok: true } : result;
    } catch {
      return { ok: false, reason: "The cave ninja didn't change." };
    }
  },
  undoLast: async () => {
    const code = get().code;
    if (!code) return { ok: false, reason: "Join a dojo first." };
    try {
      const result = await run(() => undoLastFn({ data: { code, ...pass() } }));
      if (result.ok) applySnapshot(result.snapshot);
      return result.ok ? { ok: true } : result;
    } catch {
      return { ok: false, reason: "Couldn't undo that." };
    }
  },
  claimAchievement: async (studentId, achievementId) => {
    const code = get().code;
    if (!code) return { ok: false, reason: "Join a dojo first." };
    try {
      const result = await run(() => claimAchievementFn({ data: { code, studentId, achievementId, ...pass() } }));
      if (result.ok) applySnapshot(result.snapshot);
      return result.ok ? { ok: true } : result;
    } catch {
      return { ok: false, reason: "That achievement didn't land." };
    }
  },
  addAchievement: async (input) => {
    const code = get().code;
    if (!code) return "";
    try {
      const result = await run(() => addAchievementFn({ data: { code, input, token: get().directorToken, ...pass() } }));
      if (!result.ok) return "";
      applySnapshot(result.snapshot);
      return result.id;
    } catch {
      return "";
    }
  },
  updateAchievement: async (achievementId, patch) => {
    const code = get().code;
    if (!code) return { ok: false, reason: "Join a dojo first." };
    try {
      const result = await run(() => updateAchievementFn({ data: { code, achievementId, patch, token: get().directorToken, ...pass() } }));
      if (result.ok) applySnapshot(result.snapshot);
      return result.ok ? { ok: true } : result;
    } catch {
      return { ok: false, reason: "The achievement didn't save." };
    }
  },
  removeAchievement: async (achievementId) => {
    const code = get().code;
    if (!code) return { ok: false, reason: "Join a dojo first." };
    try {
      const result = await run(() => removeAchievementFn({ data: { code, achievementId, token: get().directorToken, ...pass() } }));
      if (result.ok) applySnapshot(result.snapshot);
      return result.ok ? { ok: true } : result;
    } catch {
      return { ok: false, reason: "The achievement didn't leave." };
    }
  },
  promoteBelt: async (studentId) => {
    const code = get().code;
    if (!code) return { ok: false, reason: "Join a dojo first." };
    try {
      const result = await run(() => promoteBeltFn({ data: { code, studentId, ...pass() } }));
      if (result.ok) applySnapshot(result.snapshot);
      return result.ok ? { ok: true } : result;
    } catch {
      return { ok: false, reason: "The belt didn't move. Try again." };
    }
  },
  linkPhone: async (phone) => {
    const typed = phone.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (typed.length < 4) return { ok: false, reason: "Enter the 4-letter code on the cave." };
    try {
      const result = await run(() => pullDojoFn({ data: { code: CENTER_CODE, role: "sensei", phone: typed, zone: timeZone() } }));
      if (!result.ok) {
        clearPhone();
        return { ok: false, reason: result.phone ? "That code isn't on the cave right now." : result.reason };
      }
      writeCode(CENTER_CODE);
      writePhone(typed, result.snapshot.phoneHour);
      set({ code: CENTER_CODE, phoneLocked: false });
      applySnapshot(result.snapshot);
      return { ok: true };
    } catch {
      return { ok: false, reason: "The cave didn't answer. Try again." };
    }
  },
  dismissCeremony: async (ceremonyId) => {
    const code = get().code;
    if (!code) return { ok: false, reason: "Join a dojo first." };
    dismissedCeremony = ceremonyId;
    set({ ceremony: null });
    try {
      const result = await run(() => dismissCeremonyFn({ data: { code, ceremonyId } }));
      if (result.ok) {
        applySnapshot(result.snapshot);
        return { ok: true };
      }
      if (dismissedCeremony === ceremonyId) dismissedCeremony = "";
      return result;
    } catch {
      if (dismissedCeremony === ceremonyId) dismissedCeremony = "";
      return { ok: false, reason: "The ceremony stayed up. Tap the TV again." };
    }
  },
  dayLedger: async (timeZone) => {
    const code = get().code;
    if (!code) return { ok: false, reason: "Join a dojo first." };
    try {
      const result = await dayLedgerFn({ data: { code, timeZone, ...pass() } });
      if (!result.ok) return result;
      applySnapshot(result.snapshot);
      return { ok: true, filename: result.filename, file: result.file };
    } catch {
      return { ok: false, reason: "The day file didn't export. Try again." };
    }
  },
}));
