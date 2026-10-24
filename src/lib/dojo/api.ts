import { createServerFn } from "@tanstack/react-start";

function phoneOf(data: Record<string, unknown>) {
  return String(data.phone ?? "");
}

function zoneOf(data: Record<string, unknown>) {
  return String(data.zone ?? "");
}

function payload(input: unknown) {
  if (!input || typeof input !== "object") return {} as Record<string, unknown>;
  return input as Record<string, unknown>;
}

export const openDojoFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { openDojo } = await import("@/lib/dojo/dojo.server");
    const role = data.role === "sensei" ? "sensei" : "display";
    return openDojo(role, zoneOf(data), phoneOf(data));
  });

export const joinDojoFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { joinDojo } = await import("@/lib/dojo/dojo.server");
    const role = data.role === "sensei" ? "sensei" : "display";
    return joinDojo(String(data.code ?? ""), role, phoneOf(data), zoneOf(data));
  });

export const pullDojoFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { pullDojo } = await import("@/lib/dojo/dojo.server");
    const role = data.role === "sensei" ? "sensei" : "display";
    return pullDojo(String(data.code ?? ""), role, phoneOf(data), zoneOf(data));
  });

export const unlockDirectorFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { unlockDirector } = await import("@/lib/dojo/dojo.server");
    return unlockDirector(String(data.code ?? ""), String(data.pin ?? ""), phoneOf(data));
  });

export const awardCoinsFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { awardCoins } = await import("@/lib/dojo/dojo.server");
    return awardCoins(String(data.code ?? ""), String(data.studentId ?? ""), Number(data.amount), phoneOf(data));
  });

export const callPocketFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { callPocket } = await import("@/lib/dojo/dojo.server");
    return callPocket(String(data.code ?? ""), String(data.studentId ?? ""), phoneOf(data));
  });

export const redeemItemFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { redeemItem } = await import("@/lib/dojo/dojo.server");
    return redeemItem(String(data.code ?? ""), String(data.studentId ?? ""), String(data.itemId ?? ""), phoneOf(data));
  });

export const addStudentFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { addStudent } = await import("@/lib/dojo/dojo.server");
    const input = (data.input ?? {}) as { firstName?: string; lastInitial?: string; belt?: string; coins?: number };
    return addStudent(
      String(data.code ?? ""),
      {
        firstName: String(input.firstName ?? ""),
        lastInitial: String(input.lastInitial ?? ""),
        belt: String(input.belt ?? ""),
        coins: Number(input.coins ?? 0),
      },
      data.token ? String(data.token) : undefined,
      phoneOf(data),
    );
  });

export const updateStudentFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { updateStudent } = await import("@/lib/dojo/dojo.server");
    const patch = (data.patch ?? {}) as {
      firstName?: string;
      lastInitial?: string;
      belt?: string;
      coins?: number;
      archived?: boolean;
    };
    return updateStudent(String(data.code ?? ""), String(data.studentId ?? ""), patch, data.token ? String(data.token) : undefined, phoneOf(data));
  });

export const addItemFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { addItem } = await import("@/lib/dojo/dojo.server");
    const input = (data.input ?? {}) as { name?: string; price?: number; stock?: number; image?: string; minBelt?: string | null; currency?: string | null };
    return addItem(
      String(data.code ?? ""),
      {
        name: String(input.name ?? ""),
        price: Number(input.price ?? 0),
        stock: Number(input.stock ?? 0),
        image: String(input.image ?? ""),
        minBelt: input.minBelt ? String(input.minBelt) : null,
        currency: input.currency === "exp" ? "exp" : "coins",
      },
      String(data.token ?? ""),
      phoneOf(data),
    );
  });

export const updateItemFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { updateItem } = await import("@/lib/dojo/dojo.server");
    const patch = (data.patch ?? {}) as { name?: string; price?: number; stock?: number; image?: string; minBelt?: string | null; currency?: string | null };
    return updateItem(String(data.code ?? ""), String(data.itemId ?? ""), patch, String(data.token ?? ""), phoneOf(data));
  });

export const removeItemFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { removeItem } = await import("@/lib/dojo/dojo.server");
    return removeItem(String(data.code ?? ""), String(data.itemId ?? ""), String(data.token ?? ""), phoneOf(data));
  });

export const restoreDemoFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { restoreDemo } = await import("@/lib/dojo/dojo.server");
    return restoreDemo(String(data.code ?? ""), String(data.token ?? ""), phoneOf(data));
  });

export const setHeroFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { setHero } = await import("@/lib/dojo/dojo.server");
    return setHero(String(data.code ?? ""), String(data.hero ?? "boy"), phoneOf(data));
  });

export const undoLastFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { undoLast } = await import("@/lib/dojo/dojo.server");
    return undoLast(String(data.code ?? ""), phoneOf(data));
  });

export const claimAchievementFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { claimAchievement } = await import("@/lib/dojo/dojo.server");
    return claimAchievement(String(data.code ?? ""), String(data.studentId ?? ""), String(data.achievementId ?? ""), phoneOf(data));
  });

export const addAchievementFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { addAchievement } = await import("@/lib/dojo/dojo.server");
    const input = (data.input ?? {}) as { cadence?: string; name?: string; coins?: number; image?: string };
    return addAchievement(
      String(data.code ?? ""),
      {
        cadence: String(input.cadence ?? "daily"),
        name: String(input.name ?? ""),
        coins: Number(input.coins ?? 0),
        image: String(input.image ?? ""),
      },
      String(data.token ?? ""),
      phoneOf(data),
    );
  });

export const updateAchievementFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { updateAchievement } = await import("@/lib/dojo/dojo.server");
    const patch = (data.patch ?? {}) as { cadence?: string; name?: string; coins?: number; image?: string };
    return updateAchievement(String(data.code ?? ""), String(data.achievementId ?? ""), patch, String(data.token ?? ""), phoneOf(data));
  });

export const removeAchievementFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { removeAchievement } = await import("@/lib/dojo/dojo.server");
    return removeAchievement(String(data.code ?? ""), String(data.achievementId ?? ""), String(data.token ?? ""), phoneOf(data));
  });

export const promoteBeltFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { promoteBelt } = await import("@/lib/dojo/dojo.server");
    return promoteBelt(String(data.code ?? ""), String(data.studentId ?? ""), phoneOf(data));
  });

export const dismissCeremonyFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { dismissCeremony } = await import("@/lib/dojo/dojo.server");
    return dismissCeremony(String(data.code ?? ""), String(data.ceremonyId ?? ""));
  });

export const dayLedgerFn = createServerFn({ method: "POST" })
  .validator(payload)
  .handler(async ({ data }) => {
    const { dayLedger } = await import("@/lib/dojo/dojo.server");
    return dayLedger(String(data.code ?? ""), String(data.timeZone ?? ""), phoneOf(data));
  });

