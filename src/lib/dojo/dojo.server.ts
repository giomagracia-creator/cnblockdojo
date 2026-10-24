import ExcelJS from "exceljs";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { getSql, type Sql } from "@/lib/db";
import { beltLine, coinLine, redeemLine, renameLine, restLine, shopLine, welcomeLine } from "@/lib/dojo/lines";
import {
  DAILY_MAX,
  DIRECTOR_MS,
  DIRECTOR_PIN,
  PAYOUT_GAP_MS,
  PAYOUT_MAX,
  PIN_LOCK_MS,
  PIN_TRIES,
  PRICE_MAX,
  ITEM_PRICE_MAX,
  STOCK_MAX,
  WELCOME_MAX,
  CENTER_CODE,
  earnedToday,
  periodKey,
  todayKey,
} from "@/lib/dojo/rules";
import { SEED_ACHIEVEMENTS, seedEvents, SEED_ITEMS, SEED_STUDENTS } from "@/lib/dojo/seed";
import {
  BELT_RANK,
  BELTS,
  displayName,
  nextBelt,
  type Belt,
  type BeltCeremony,
  type DojoEvent,
  type DojoKind,
  type DojoRole,
  type DojoSnapshot,
  type Hero,
  type ShopItem,
  type Student,
} from "@/lib/dojo/types";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const SCENE_MS = 6400;
const POCKET_MS = 6800;

type Fail = { ok: false; reason: string; phone?: boolean };
type SnapOk = { ok: true; snapshot: DojoSnapshot };

type DojoRow = {
  id: string;
  week_started: number | string;
  display_seen: boolean | string | number;
  sensei_seen: boolean | string | number;
  last_redeem_at: number | string;
  director_token_hash: string | null;
  director_until: number | string;
  pin_fails: number | string;
  pin_lock_until: number | string;
  hero?: string | null;
  vault?: number | string | null;
  ceremony_id?: string | null;
  ceremony_name?: string | null;
  ceremony_belt?: string | null;
  phone_code?: string | null;
  phone_hour?: string | null;
  phone_zone?: string | null;
};

type StudentRow = {
  id: string;
  first_name: string;
  last_initial: string;
  belt: string;
  coins: number | string;
  week_coins: number | string;
  archived: boolean | string | number;
  day_key: string | null;
  day_coins: number | string | null;
  last_award_at: number | string | null;
  exp?: number | string | null;
};

type ItemRow = {
  id: string;
  name: string;
  price: number | string;
  stock: number | string;
  image: string;
  min_belt: string | null;
  currency?: string | null;
};

type EventRow = {
  id: string;
  kind: string;
  at_ms: number | string;
  student_name: string;
  detail: string;
  line: string;
  coins: number | string;
  celebrate_until: number | string;
  scene_until: number | string;
};

function hashSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeCode(input: string) {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (raw.length !== 8) return null;
  return `${raw.slice(0, 4)}-${raw.slice(4)}`;
}

function flag(value: boolean | string | number | null | undefined) {
  return value === true || value === "t" || value === "true" || value === 1;
}

function num(value: number | string | null | undefined) {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

function isBelt(value: string): value is Belt {
  return (BELTS as readonly string[]).includes(value);
}

function beltCase(column: string) {
  const arms = BELTS.map((belt) => `when '${belt}' then ${BELT_RANK[belt]}`).join(" ");
  return `case ${column} ${arms} else -1 end`;
}

function mapStudent(row: StudentRow): Student {
  return {
    id: row.id,
    firstName: row.first_name,
    lastInitial: row.last_initial,
    belt: isBelt(row.belt) ? row.belt : "White",
    coins: num(row.coins),
    exp: num(row.exp),
    weekCoins: num(row.week_coins),
    archived: flag(row.archived),
    dayKey: row.day_key ?? undefined,
    dayCoins: num(row.day_coins),
    lastAwardAt: row.last_award_at == null ? undefined : num(row.last_award_at),
  };
}

function mapItem(row: ItemRow): ShopItem {
  return {
    id: row.id,
    name: row.name,
    price: num(row.price),
    currency: row.currency === "exp" ? "exp" : "coins",
    stock: num(row.stock),
    image: row.image,
    minBelt: row.min_belt && isBelt(row.min_belt) ? row.min_belt : null,
  };
}

function mapCeremony(row: DojoRow): BeltCeremony | null {
  const id = row.ceremony_id ?? "";
  const studentName = row.ceremony_name ?? "";
  const belt = row.ceremony_belt ?? "";
  if (!id || !studentName || !isBelt(belt)) return null;
  return { id, studentName, belt };
}

function mapEvent(row: EventRow): DojoEvent {
  const kind: DojoKind =
    row.kind === "redeem" ||
    row.kind === "award" ||
    row.kind === "welcome" ||
    row.kind === "belt" ||
    row.kind === "shop" ||
    row.kind === "rest" ||
    row.kind === "undo" ||
    row.kind === "mine" ||
    row.kind === "return" ||
    row.kind === "pocket"
      ? row.kind
      : "shop";
  return {
    id: row.id,
    kind,
    at: num(row.at_ms),
    studentName: row.student_name,
    detail: row.detail,
    line: row.line,
    coins: num(row.coins),
    celebrateUntil: num(row.celebrate_until),
    sceneUntil: num(row.scene_until),
  };
}

async function findDojo(sql: Sql, code: string) {
  const normalized = normalizeCode(code);
  if (!normalized) return null;
  const rows = await sql<DojoRow>`
    select id, week_started, display_seen, sensei_seen, last_redeem_at, director_token_hash, director_until, pin_fails, pin_lock_until, hero, vault, ceremony_id, ceremony_name, ceremony_belt, phone_code, phone_hour, phone_zone
    from dojos where code_hash = ${hashSecret(normalized)}
  `;
  return rows[0] ?? null;
}

const MINE_MS = 60_000;
const REST_MS = 30 * 24 * 60 * 60 * 1000;

async function sweepRested(sql: Sql, dojoId: string) {
  const cutoff = Date.now() - REST_MS;
  const rows = await sql.query<{ id: string; first_name: string; last_initial: string; coins: number | string }>(
    `with due as (
       select id, first_name, last_initial, coins
       from students
       where dojo_id = $1 and archived = true and archived_at is not null and archived_at <= $2 and coins > 0
     )
     update students s
     set coins = 0
     from due
     where s.id = due.id and s.coins > 0
     returning due.id as id, due.first_name as first_name, due.last_initial as last_initial, due.coins as coins`,
    [dojoId, cutoff],
  );
  if (!rows.length) return;
  const total = rows.reduce((sum, row) => sum + num(row.coins), 0);
  await sql.query(`update dojos set vault = vault + $1 where id = $2`, [total, dojoId]);
  const now = Date.now();
  for (const row of rows) {
    const name = displayName({ firstName: row.first_name, lastInitial: row.last_initial });
    const coins = num(row.coins);
    await insertEvent(sql, dojoId, {
      id: randomUUID(),
      kind: "return",
      at: now,
      studentName: name,
      detail: "30 days",
      line: `${name} rested 30 days. ${coins} coins returned to the vault.`,
      coins,
      celebrateUntil: 0,
      sceneUntil: 0,
    });
  }
}

async function tickMine(sql: Sql, dojoId: string) {
  const now = Date.now();
  const amount = 10 + Math.floor(Math.random() * 41);
  const won = await sql.query<{ id: string }>(
    `update dojos
     set vault = vault + $1, last_mined_at = $2
     where id = $3 and ($2 - last_mined_at) >= $4
     returning id`,
    [amount, now, dojoId, MINE_MS],
  );
  if (!won.length) return;
  await insertEvent(sql, dojoId, {
    id: randomUUID(),
    kind: "mine",
    at: now,
    studentName: "",
    detail: `+${amount}`,
    line: `The mine paid ${amount} coins into the vault.`,
    coins: amount,
    celebrateUntil: 0,
    sceneUntil: 0,
  });
}

async function snapshot(sql: Sql, dojoId: string, role: DojoRole = "sensei", zone?: string): Promise<DojoSnapshot> {
  const dojos = await sql<DojoRow>`
    select id, week_started, display_seen, sensei_seen, last_redeem_at, director_token_hash, director_until, pin_fails, pin_lock_until, hero, vault, ceremony_id, ceremony_name, ceremony_belt, phone_code, phone_hour, phone_zone
    from dojos where id = ${dojoId}
  `;
  const dojo = dojos[0];
  if (!dojo) throw new Error("Dojo missing.");
  let weekStarted = num(dojo.week_started);
  if (Date.now() - weekStarted >= WEEK_MS) {
    weekStarted = Date.now();
    await sql`update dojos set week_started = ${weekStarted} where id = ${dojoId}`;
    await sql`update students set week_coins = 0 where dojo_id = ${dojoId}`;
  }
  await sweepRested(sql, dojoId);
  await tickMine(sql, dojoId);
  const banks = await sql<{ vault: number | string }>`select vault from dojos where id = ${dojoId}`;
  const students = await sql<StudentRow>`
    select id, first_name, last_initial, belt, coins, exp, week_coins, archived, day_key, day_coins, last_award_at
    from students where dojo_id = ${dojoId}
    order by archived, first_name
  `;
  const items = await sql<ItemRow>`
    select id, name, price, currency, stock, image, min_belt from shop_items where dojo_id = ${dojoId} order by price, name
  `;
  const achievements = await sql<{ id: string; cadence: string; name: string; coins: number | string; image: string }>`
    select id, cadence, name, coins, image from achievements where dojo_id = ${dojoId} order by cadence, coins
  `;
  const daily = periodKey("daily", weekStarted);
  const weekly = periodKey("weekly", weekStarted);
  const claims = await sql<{ achievement_id: string; student_id: string; period_key: string }>`
    select achievement_id, student_id, period_key from achievement_claims
    where dojo_id = ${dojoId} and period_key in (${daily}, ${weekly})
  `;
  const events = await sql<EventRow>`
    select id, kind, at_ms, student_name, detail, line, coins, celebrate_until, scene_until
    from dojo_events where dojo_id = ${dojoId} and kind <> 'mine' and kind <> 'pocket'
    order by at_ms desc limit 30
  `;
  const pockets = await sql<EventRow>`
    select id, kind, at_ms, student_name, detail, line, coins, celebrate_until, scene_until
    from dojo_events where dojo_id = ${dojoId} and kind = 'pocket' and scene_until > ${Date.now()}
    order by at_ms desc limit 1
  `;
  const expClaims = await sql<{ student_id: string; item_id: string }>`
    select student_id, item_id from exp_claims where dojo_id = ${dojoId}
  `;
  const pass = await ensurePhoneCode(sql, dojo, role === "display" ? zone : undefined);
  return {
    students: students.map(mapStudent),
    items: items.map(mapItem),
    achievements: achievements.map((row) => ({
      id: row.id,
      cadence: row.cadence === "weekly" ? "weekly" : "daily",
      name: row.name,
      coins: num(row.coins),
      image: row.image,
    })),
    claims: claims.map((row) => ({
      achievementId: row.achievement_id,
      studentId: row.student_id,
      periodKey: row.period_key,
    })),
    expClaims: expClaims.map((row) => ({ studentId: row.student_id, itemId: row.item_id })),
    events: [...pockets, ...events].map(mapEvent),
    weekStarted,
    displaySeen: flag(dojo.display_seen),
    senseiSeen: flag(dojo.sensei_seen),
    hero: dojo.hero === "girl" ? "girl" : "boy",
    vault: num(banks[0]?.vault ?? dojo.vault ?? 1000),
    undo: await undoSummary(sql, dojoId),
    ceremony: mapCeremony(dojo),
    phoneCode: role === "display" ? pass.code : "",
    phoneHour: pass.hour,
    phoneUntil: pass.until,
  };
}

async function undoSummary(sql: Sql, dojoId: string) {
  const rows = await sql<{ label: string }>`
    select label from dojo_undos where dojo_id = ${dojoId} order by at_ms desc limit 5
  `;
  if (!rows.length) return null;
  return { count: rows.length, label: rows[0]!.label };
}

async function pushUndo(
  sql: Sql,
  row: {
    dojoId: string;
    kind: "award" | "redeem" | "achieve" | "exp";
    studentId: string;
    itemId: string | null;
    amount: number;
    eventId: string;
    label: string;
    actionDay: string;
    prevLastAward: number | null;
    prevLastRedeem: number;
  },
) {
  const id = randomUUID();
  await sql`
    insert into dojo_undos (
      id, dojo_id, at_ms, kind, student_id, item_id, amount, event_id, label, action_day, prev_last_award, prev_last_redeem
    ) values (
      ${id}, ${row.dojoId}, ${Date.now()}, ${row.kind}, ${row.studentId}, ${row.itemId}, ${row.amount}, ${row.eventId},
      ${row.label}, ${row.actionDay}, ${row.prevLastAward}, ${row.prevLastRedeem}
    )
  `;
  await sql`
    delete from dojo_undos
    where dojo_id = ${row.dojoId}
      and id not in (
        select id from dojo_undos where dojo_id = ${row.dojoId} order by at_ms desc limit 5
      )
  `;
}

export async function undoLast(code: string, phone = ""): Promise<SnapOk | Fail> {
  const linked = await connected(code, "sensei", phone);
  if (!linked.ok) return linked;
  const { sql, dojo } = linked;
  const rows = await sql<{
    id: string;
    kind: string;
    student_id: string;
    item_id: string | null;
    amount: number | string;
    event_id: string;
    label: string;
    action_day: string | null;
    prev_last_award: number | string | null;
    prev_last_redeem: number | string;
  }>`
    select id, kind, student_id, item_id, amount, event_id, label, action_day, prev_last_award, prev_last_redeem
    from dojo_undos where dojo_id = ${dojo.id} order by at_ms desc limit 1
  `;
  const row = rows[0];
  if (!row) return { ok: false, reason: "Nothing to undo." };
  const amount = num(row.amount);
  const prevAward = row.prev_last_award == null ? null : num(row.prev_last_award);
  if (row.kind === "award") {
    const updated = await sql.query<{ id: string }>(
      `update students
       set coins = coins - $1,
           exp = greatest(0, exp - $1),
           week_coins = greatest(0, week_coins - $1),
           day_coins = case when day_key = $2 then greatest(0, coalesce(day_coins, 0) - $1) else coalesce(day_coins, 0) end,
           last_award_at = $3
       where id = $4 and dojo_id = $5 and coins >= $1
       returning id`,
      [amount, row.action_day, prevAward, row.student_id, dojo.id],
    );
    if (!updated.length) return { ok: false, reason: "Those coins were already spent." };
    await sql`update dojos set vault = vault + ${amount} where id = ${dojo.id}`;
  } else if (row.kind === "achieve") {
    const updated = await sql.query<{ id: string }>(
      `update students
       set coins = coins - $1, week_coins = greatest(0, week_coins - $1), exp = greatest(0, exp - $1)
       where id = $2 and dojo_id = $3 and coins >= $1
       returning id`,
      [amount, row.student_id, dojo.id],
    );
    if (!updated.length) return { ok: false, reason: "Those coins were already spent." };
    if (row.item_id && row.action_day) {
      await sql`
        delete from achievement_claims
        where dojo_id = ${dojo.id} and achievement_id = ${row.item_id} and student_id = ${row.student_id} and period_key = ${row.action_day}
      `;
    }
    await sql`update dojos set vault = vault + ${amount} where id = ${dojo.id}`;
  } else if (row.kind === "exp") {
    if (row.item_id) {
      await sql`
        delete from exp_claims
        where dojo_id = ${dojo.id} and student_id = ${row.student_id} and item_id = ${row.item_id}
      `;
    }
  } else {
    const bank = await sql.query<{ id: string }>(
      `update dojos set vault = vault - $1 where id = $2 and vault >= $1 returning id`,
      [amount, dojo.id],
    );
    if (!bank.length) return { ok: false, reason: "The vault already paid those coins back out." };
    const students = await sql.query<{ id: string }>(
      `update students set coins = coins + $1 where id = $2 and dojo_id = $3 returning id`,
      [amount, row.student_id, dojo.id],
    );
    if (!students.length) {
      await sql`update dojos set vault = vault + ${amount} where id = ${dojo.id}`;
      return { ok: false, reason: "That ninja is no longer on the roster." };
    }
    if (row.item_id) {
      await sql`update shop_items set stock = stock + 1 where id = ${row.item_id} and dojo_id = ${dojo.id}`;
    }
    await sql`update dojos set last_redeem_at = ${num(row.prev_last_redeem)} where id = ${dojo.id}`;
  }
  await sql`delete from dojo_events where id = ${row.event_id} and dojo_id = ${dojo.id}`;
  await sql`delete from dojo_undos where id = ${row.id}`;
  const who = row.label.replace(/^Undo /, "");
  await insertEvent(sql, dojo.id, {
    id: randomUUID(),
    kind: "undo",
    at: Date.now(),
    studentName: "",
    detail: who,
    line: `${who} was undone.`,
    coins: amount,
    celebrateUntil: 0,
    sceneUntil: 0,
  });
  return { ok: true, snapshot: await snapshot(sql, dojo.id) };
}

function asHero(value: string): Hero {
  return value === "girl" ? "girl" : "boy";
}

export async function setHero(code: string, hero: string, phone = ""): Promise<SnapOk | Fail> {
  const linked = await connected(code, "sensei", phone);
  if (!linked.ok) return linked;
  const next = asHero(hero);
  await linked.sql`update dojos set hero = ${next} where id = ${linked.dojo.id}`;
  return { ok: true, snapshot: await snapshot(linked.sql, linked.dojo.id) };
}

async function markSeen(sql: Sql, dojoId: string, role: DojoRole) {
  if (role === "display") await sql`update dojos set display_seen = true where id = ${dojoId}`;
  else await sql`update dojos set sensei_seen = true where id = ${dojoId}`;
}

async function seedDojo(sql: Sql, dojoId: string, now: number, demo = false) {
  if (demo) {
    for (const student of SEED_STUDENTS) {
      await sql`
        insert into students (id, dojo_id, first_name, last_initial, belt, coins, week_coins, archived, day_coins, archived_at)
        values (
          ${`${dojoId}:${student.id}`}, ${dojoId}, ${student.firstName}, ${student.lastInitial}, ${student.belt},
          ${student.coins}, ${student.weekCoins}, ${student.archived}, 0, ${student.archived ? now : null}
        )
      `;
    }
  }
  for (const item of SEED_ITEMS) {
    await sql`
      insert into shop_items (id, dojo_id, name, price, stock, image, min_belt, currency)
      values (${`${dojoId}:${item.id}`}, ${dojoId}, ${item.name}, ${item.price}, ${item.stock}, ${item.image}, ${item.minBelt}, ${item.currency})
    `;
  }
  for (const achievement of SEED_ACHIEVEMENTS) {
    await sql`
      insert into achievements (id, dojo_id, cadence, name, coins, image)
      values (${`${dojoId}:${achievement.id}`}, ${dojoId}, ${achievement.cadence}, ${achievement.name}, ${achievement.coins}, ${achievement.image})
    `;
  }
  if (demo) {
    for (const event of seedEvents(now)) {
      await insertEvent(sql, dojoId, { ...event, id: `${dojoId}:${event.id}` });
    }
  }
  await sql`update dojos set vault = 1000 where id = ${dojoId}`;
}

async function insertEvent(sql: Sql, dojoId: string, event: DojoEvent) {
  await sql`
    insert into dojo_events (id, dojo_id, kind, at_ms, student_name, detail, line, coins, celebrate_until, scene_until)
    values (
      ${event.id}, ${dojoId}, ${event.kind}, ${event.at}, ${event.studentName}, ${event.detail}, ${event.line},
      ${event.coins}, ${event.celebrateUntil}, ${event.sceneUntil}
    )
  `;
}

function scene(input: Pick<DojoEvent, "kind" | "studentName" | "detail" | "line" | "coins"> & { celebrateUntil?: number }): DojoEvent {
  const now = Date.now();
  return {
    id: randomUUID(),
    at: now,
    sceneUntil: now + SCENE_MS,
    celebrateUntil: input.celebrateUntil ?? 0,
    kind: input.kind,
    studentName: input.studentName,
    detail: input.detail,
    line: input.line,
    coins: input.coins,
  };
}

async function directorOk(sql: Sql, dojo: DojoRow, token: string | undefined) {
  if (!token || !dojo.director_token_hash) return false;
  if (num(dojo.director_until) < Date.now()) return false;
  const rows = await sql<{ director_token_hash: string | null; director_until: number | string }>`
    select director_token_hash, director_until from dojos where id = ${dojo.id}
  `;
  const fresh = rows[0];
  if (!fresh?.director_token_hash || num(fresh.director_until) < Date.now()) return false;
  return fresh.director_token_hash === hashSecret(token);
}

async function findNamed(sql: Sql, dojoId: string, firstName: string, lastInitial: string, exceptId?: string) {
  const rows = await sql<{ id: string; first_name: string; last_initial: string; archived: boolean | string | number }>`
    select id, first_name, last_initial, archived
    from students
    where dojo_id = ${dojoId} and last_initial = ${lastInitial}
  `;
  const needle = firstName.trim().toLowerCase();
  return rows.find((row) => row.id !== exceptId && row.first_name.trim().toLowerCase() === needle) ?? null;
}

function nameBlockReason(firstName: string, lastInitial: string, archived: boolean) {
  const name = displayName({ firstName, lastInitial });
  if (archived) {
    return `${name} is already on this roster, just resting. Bring that ninja back. A new card would give them another ${DAILY_MAX} coins.`;
  }
  return `${name} is already in this cave. Pick that ninja. A second card would give them another ${DAILY_MAX} coins.`;
}

const PHONE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function normalizePhone(input: string | undefined) {
  return (input ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function hourStamp(zone: string, now = Date.now()) {
  const part = zonedParts(zone, now);
  const month = String(part.month).padStart(2, "0");
  const day = String(part.day).padStart(2, "0");
  const hour = String(part.hour).padStart(2, "0");
  return `${part.year}-${month}-${day}-${hour}`;
}

function nextHourLabel(zone: string, now = Date.now()) {
  const next = (zonedParts(zone, now).hour + 1) % 24;
  const hour = next % 12 || 12;
  return `${hour}:00 ${next < 12 ? "AM" : "PM"}`;
}

function makePhoneCode() {
  const bytes = randomBytes(4);
  return Array.from(bytes, (byte) => PHONE_ALPHABET[byte % PHONE_ALPHABET.length]).join("");
}

async function ensurePhoneCode(sql: Sql, dojo: DojoRow, zoneInput?: string) {
  const zone = cleanZone(zoneInput || dojo.phone_zone || "UTC");
  const hour = hourStamp(zone);
  if (dojo.phone_code && dojo.phone_hour === hour) {
    if (dojo.phone_zone !== zone) {
      await sql`update dojos set phone_zone = ${zone} where id = ${dojo.id}`;
      dojo.phone_zone = zone;
    }
    return { code: dojo.phone_code, hour, until: nextHourLabel(zone), zone };
  }
  const code = makePhoneCode();
  await sql`update dojos set phone_code = ${code}, phone_hour = ${hour}, phone_zone = ${zone} where id = ${dojo.id}`;
  dojo.phone_code = code;
  dojo.phone_hour = hour;
  dojo.phone_zone = zone;
  return { code, hour, until: nextHourLabel(zone), zone };
}

async function connected(code: string, role: DojoRole, phone?: string, zone?: string) {
  if (normalizeCode(code) !== CENTER_CODE) return { ok: false as const, reason: "This center has one cave." };
  const sql = await getSql();
  const dojo = await findDojo(sql, code);
  if (!dojo) return { ok: false as const, reason: "That code doesn't match a dojo." };
  const pass = await ensurePhoneCode(sql, dojo, role === "display" ? zone : undefined);
  if (role === "sensei" && normalizePhone(phone) !== pass.code) {
    return { ok: false as const, reason: "Read the phone code on the cave.", phone: true as const };
  }
  await markSeen(sql, dojo.id, role);
  return { ok: true as const, sql, dojo, snapshot: await snapshot(sql, dojo.id, role, role === "display" ? zone : undefined) };
}

export async function openDojo(role: DojoRole, zone?: string, phone?: string) {
  const sql = await getSql();
  let dojo = await findDojo(sql, CENTER_CODE);
  if (!dojo) {
    const existing = await sql<{ id: string }>`select id from dojos order by created_at desc limit 1`;
    const latest = existing[0];
    if (latest) {
      try {
        await sql`update dojos set code_hash = ${hashSecret(CENTER_CODE)} where id = ${latest.id}`;
      } catch {
        /* another screen already claimed the one cave */
      }
      dojo = await findDojo(sql, CENTER_CODE);
    }
  }
  if (!dojo) {
    const now = Date.now();
    const id = randomUUID();
    try {
      await sql`
        insert into dojos (id, code_hash, week_started, display_seen, sensei_seen, vault, last_mined_at)
        values (${id}, ${hashSecret(CENTER_CODE)}, ${now}, ${role === "display"}, ${role === "sensei"}, 1000, ${now})
      `;
      await seedDojo(sql, id, now);
    } catch {
      /* another screen created the one cave first */
    }
    dojo = await findDojo(sql, CENTER_CODE);
  }
  if (!dojo) return { ok: false as const, reason: "The cave couldn't open. Try again." };
  if (role === "sensei") {
    const pass = await ensurePhoneCode(sql, dojo);
    if (normalizePhone(phone) !== pass.code) {
      return { ok: false as const, reason: "Read the phone code on the cave.", phone: true as const };
    }
  }
  await markSeen(sql, dojo.id, role);
  return { ok: true as const, code: CENTER_CODE, snapshot: await snapshot(sql, dojo.id, role, role === "display" ? zone : undefined) };
}

export async function joinDojo(code: string, role: DojoRole, phone?: string, zone?: string) {
  const normalized = normalizeCode(code);
  if (!normalized) return { ok: false as const, reason: "Enter the 8-character dojo code." };
  const linked = await connected(normalized, role, phone, zone);
  if (!linked.ok) return linked;
  return { ok: true as const, code: normalized, snapshot: linked.snapshot };
}

export async function pullDojo(code: string, role: DojoRole, phone?: string, zone?: string) {
  const linked = await connected(code, role, phone, zone);
  if (!linked.ok) return linked;
  return { ok: true as const, snapshot: linked.snapshot };
}

export async function unlockDirector(code: string, pin: string, phone = "") {
  const linked = await connected(code, "sensei", phone);
  if (!linked.ok) return linked;
  const { sql, dojo } = linked;
  const now = Date.now();
  const lockUntil = num(dojo.pin_lock_until);
  if (lockUntil > now) {
    return { ok: false as const, reason: `Pad locked. Try again in ${Math.ceil((lockUntil - now) / 1000)}s.`, lockUntil };
  }
  if (pin !== DIRECTOR_PIN) {
    const fails = num(dojo.pin_fails) + 1;
    if (fails >= PIN_TRIES) {
      const until = now + PIN_LOCK_MS;
      await sql`update dojos set pin_fails = 0, pin_lock_until = ${until} where id = ${dojo.id}`;
      return { ok: false as const, reason: "Too many tries. The pad locked for 30 seconds.", lockUntil: until };
    }
    await sql`update dojos set pin_fails = ${fails} where id = ${dojo.id}`;
    return { ok: false as const, reason: "Wrong pin.", lockUntil: 0 };
  }
  const token = randomBytes(24).toString("hex");
  const until = now + DIRECTOR_MS;
  await sql`
    update dojos
    set director_token_hash = ${hashSecret(token)}, director_until = ${until}, pin_fails = 0, pin_lock_until = 0
    where id = ${dojo.id}
  `;
  return { ok: true as const, token, until };
}

export async function awardCoins(code: string, studentId: string, amount: number, phone = ""): Promise<SnapOk | Fail> {
  const gain = Math.floor(amount);
  if (!Number.isFinite(gain) || gain <= 0) return { ok: false, reason: "Enter a coin amount." };
  if (gain > PAYOUT_MAX) return { ok: false, reason: `Payouts stop at ${PAYOUT_MAX} coins.` };
  const linked = await connected(code, "sensei", phone);
  if (!linked.ok) return linked;
  const { sql, dojo } = linked;
  const rows = await sql<StudentRow>`
    select id, first_name, last_initial, belt, coins, exp, week_coins, archived, day_key, day_coins, last_award_at
    from students where id = ${studentId} and dojo_id = ${dojo.id} and archived = false
  `;
  const student = rows[0] ? mapStudent(rows[0]) : null;
  if (!student) return { ok: false, reason: "Pick an active ninja." };
  const now = Date.now();
  const today = earnedToday(student, now);
  if (today >= DAILY_MAX) return { ok: false, reason: `${displayName(student)} already earned ${DAILY_MAX} coins today.` };
  if (today + gain > DAILY_MAX) return { ok: false, reason: `Only ${DAILY_MAX - today} coins left for ${displayName(student)} today.` };
  if (student.lastAwardAt && now - student.lastAwardAt < PAYOUT_GAP_MS) {
    const seconds = Math.ceil((PAYOUT_GAP_MS - (now - student.lastAwardAt)) / 1000);
    return { ok: false, reason: `Wait ${seconds}s before paying ${displayName(student)} again.` };
  }
  if (num(dojo.vault) < gain) return { ok: false, reason: `The vault only has ${num(dojo.vault)} coins left.` };
  const name = displayName(student);
  const line = coinLine(name, gain);
  const eventId = randomUUID();
  const updated = await sql.query<{ id: string }>(
    `with bank as (
       update dojos set vault = vault - $1
       where id = $5 and vault >= $1
       returning id
     ),
     upd as (
       update students
       set coins = coins + $1,
           week_coins = week_coins + $1,
           exp = exp + $1,
           day_key = $2,
           day_coins = case when day_key = $2 then coalesce(day_coins, 0) + $1 else $1 end,
           last_award_at = $3
       where id = $4 and dojo_id = $5 and archived = false
         and exists (select 1 from bank)
         and (last_award_at is null or $3 - last_award_at >= $6)
         and (case when day_key = $2 then coalesce(day_coins, 0) else 0 end) + $1 <= $7
       returning id
     ),
     refund as (
       update dojos set vault = vault + $1
       where id = $5 and exists (select 1 from bank) and not exists (select 1 from upd)
       returning id
     )
     insert into dojo_events (id, dojo_id, kind, at_ms, student_name, detail, line, coins, celebrate_until, scene_until)
     select $8, $5, 'award', $3, $9, $10, $11, $1, 0, $12 from upd
     returning id`,
    [gain, todayKey(now), now, studentId, dojo.id, PAYOUT_GAP_MS, DAILY_MAX, eventId, name, `+${gain} coins`, line, now + SCENE_MS],
  );
  if (!updated.length) return { ok: false, reason: "That payout just missed. Try again." };
  await pushUndo(sql, {
    dojoId: dojo.id,
    kind: "award",
    studentId,
    itemId: null,
    amount: gain,
    eventId,
    label: `Undo +${gain} · ${name}`,
    actionDay: todayKey(now),
    prevLastAward: student.lastAwardAt ?? null,
    prevLastRedeem: num(dojo.last_redeem_at),
  });
  return { ok: true, snapshot: await snapshot(sql, dojo.id) };
}

export async function callPocket(code: string, studentId: string, phone = ""): Promise<SnapOk | Fail> {
  const linked = await connected(code, "sensei", phone);
  if (!linked.ok) return linked;
  const { sql, dojo } = linked;
  const rows = await sql<StudentRow>`
    select id, first_name, last_initial, belt, coins, exp, week_coins, archived, day_key, day_coins, last_award_at
    from students where id = ${studentId} and dojo_id = ${dojo.id} and archived = false
  `;
  const student = rows[0] ? mapStudent(rows[0]) : null;
  if (!student) return { ok: false, reason: "Pick an active ninja." };
  const name = displayName(student);
  const now = Date.now();
  const line = `${name}'s pocket. ${student.coins} coins. ${student.exp} EXP.`;
  await sql`
    insert into dojo_events (id, dojo_id, kind, at_ms, student_name, detail, line, coins, celebrate_until, scene_until)
    values (
      ${randomUUID()}, ${dojo.id}, 'pocket', ${now}, ${name},
      ${`${student.coins} coins · ${student.exp} EXP`}, ${line}, 0, 0, ${now + POCKET_MS}
    )
  `;
  return { ok: true, snapshot: await snapshot(sql, dojo.id) };
}

export async function redeemItem(code: string, studentId: string, itemId: string, phone = ""): Promise<SnapOk | Fail> {
  const linked = await connected(code, "sensei", phone);
  if (!linked.ok) return linked;
  const { sql, dojo } = linked;
  const students = await sql<StudentRow>`
    select id, first_name, last_initial, belt, coins, exp, week_coins, archived, day_key, day_coins, last_award_at
    from students where id = ${studentId} and dojo_id = ${dojo.id} and archived = false
  `;
  const items = await sql<ItemRow>`
    select id, name, price, currency, stock, image, min_belt from shop_items where id = ${itemId} and dojo_id = ${dojo.id}
  `;
  const student = students[0] ? mapStudent(students[0]) : null;
  const item = items[0] ? mapItem(items[0]) : null;
  if (!student) return { ok: false, reason: "Pick an active ninja." };
  if (!item) return { ok: false, reason: "That prize is no longer in the shop." };
  if (item.minBelt && BELT_RANK[student.belt] < BELT_RANK[item.minBelt]) {
    return { ok: false, reason: `Needs a ${item.minBelt} belt or higher.` };
  }
  const now = Date.now();
  const name = displayName(student);
  const eventId = randomUUID();
  if (item.currency === "exp") {
    if (student.exp < item.price) return { ok: false, reason: "Not enough EXP." };
    const minRank = item.minBelt ? BELT_RANK[item.minBelt] : 0;
    const claimed = await sql.query<{ student_id: string }>(
      `with ok as (
         select s.id
         from students s
         where s.id = $1 and s.dojo_id = $2 and s.archived = false and s.exp >= $3
           and ${beltCase("s.belt")} >= $4
           and not exists (
             select 1 from exp_claims c
             where c.dojo_id = s.dojo_id and c.student_id = s.id and c.item_id = $5
           )
       )
       insert into exp_claims (dojo_id, student_id, item_id, at_ms)
       select $2, ok.id, $5, $6 from ok
       on conflict (dojo_id, student_id, item_id) do nothing
       returning student_id`,
      [studentId, dojo.id, item.price, minRank, itemId, now],
    );
    if (!claimed.length) return { ok: false, reason: "Already claimed." };
    await insertEvent(sql, dojo.id, {
      id: eventId,
      kind: "redeem",
      at: now,
      studentName: name,
      detail: item.name,
      line: `${name} claimed ${item.name} with EXP.`,
      coins: 0,
      celebrateUntil: now + 5600,
      sceneUntil: now + SCENE_MS,
    });
    await pushUndo(sql, {
      dojoId: dojo.id,
      kind: "exp",
      studentId,
      itemId,
      amount: 0,
      eventId,
      label: `Undo ${item.name} · ${name}`,
      actionDay: todayKey(now),
      prevLastAward: student.lastAwardAt ?? null,
      prevLastRedeem: num(dojo.last_redeem_at),
    });
    return { ok: true, snapshot: await snapshot(sql, dojo.id) };
  }
  if (item.stock <= 0) return { ok: false, reason: "Out of stock." };
  if (student.coins < item.price) return { ok: false, reason: "Not enough coins." };
  const minRank = item.minBelt ? BELT_RANK[item.minBelt] : 0;
  const updated = await sql.query<{ id: string }>(
    `with gate as (
       update dojos set last_redeem_at = $1
       where id = $2 and ($1 - last_redeem_at) >= 1200
       returning id
     ),
     ok as (
       select s.id as sid, i.id as iid, i.name, i.price
       from students s
       join shop_items i on i.id = $4 and i.dojo_id = s.dojo_id
       where s.id = $3 and s.dojo_id = $2 and s.archived = false
         and exists (select 1 from gate)
         and i.stock > 0 and s.coins >= i.price and coalesce(i.currency, 'coins') <> 'exp'
         and ${beltCase("s.belt")} >= $5
     ),
     upd_s as (
       update students s
       set coins = s.coins - ok.price
       from ok
       where s.id = ok.sid
       returning s.id
     ),
     upd_i as (
       update shop_items i
       set stock = i.stock - 1
       from ok
       where i.id = ok.iid and exists (select 1 from upd_s)
       returning i.id
     ),
     bank as (
       update dojos set vault = dojos.vault + ok.price
       from ok
       where dojos.id = $2 and exists (select 1 from upd_i)
       returning dojos.id
     ),
     revert as (
       update dojos set last_redeem_at = $1 - 1200
       where id = $2 and exists (select 1 from gate) and not exists (select 1 from upd_i)
       returning id
     )
     insert into dojo_events (id, dojo_id, kind, at_ms, student_name, detail, line, coins, celebrate_until, scene_until)
     select $6, $2, 'redeem', $1, $7, ok.name, $8, ok.price, $9, $10
     from ok
     where exists (select 1 from upd_i) and exists (select 1 from bank)
     returning id`,
    [now, dojo.id, studentId, itemId, minRank, eventId, name, redeemLine(name, item.name), now + 5600, now + SCENE_MS],
  );
  if (!updated.length) return { ok: false, reason: "That redeem just went through." };
  await pushUndo(sql, {
    dojoId: dojo.id,
    kind: "redeem",
    studentId,
    itemId,
    amount: item.price,
    eventId,
    label: `Undo ${item.name} · ${name}`,
    actionDay: todayKey(now),
    prevLastAward: student.lastAwardAt ?? null,
    prevLastRedeem: num(dojo.last_redeem_at),
  });
  return { ok: true, snapshot: await snapshot(sql, dojo.id) };
}

export async function claimAchievement(code: string, studentId: string, achievementId: string, phone = ""): Promise<SnapOk | Fail> {
  const linked = await connected(code, "sensei", phone);
  if (!linked.ok) return linked;
  const { sql, dojo } = linked;
  const students = await sql<StudentRow>`
    select id, first_name, last_initial, belt, coins, exp, week_coins, archived, day_key, day_coins, last_award_at
    from students where id = ${studentId} and dojo_id = ${dojo.id} and archived = false
  `;
  const achievements = await sql<{ id: string; cadence: string; name: string; coins: number | string }>`
    select id, cadence, name, coins from achievements where id = ${achievementId} and dojo_id = ${dojo.id}
  `;
  const student = students[0] ? mapStudent(students[0]) : null;
  const achievement = achievements[0];
  if (!student) return { ok: false, reason: "Pick an active ninja." };
  if (!achievement) return { ok: false, reason: "That achievement is gone." };
  const cadence = achievement.cadence === "weekly" ? "weekly" : "daily";
  const coins = num(achievement.coins);
  if (num(dojo.vault) < coins) return { ok: false, reason: `The vault only has ${num(dojo.vault)} coins left.` };
  const now = Date.now();
  const key = periodKey(cadence, num(dojo.week_started), now);
  const name = displayName(student);
  const eventId = randomUUID();
  const claimId = randomUUID();
  const inserted = await sql.query<{ id: string }>(
    `with bank as (
       update dojos set vault = vault - $7
       where id = $2 and vault >= $7
       returning id
     ),
     claim as (
       insert into achievement_claims (id, dojo_id, achievement_id, student_id, period_key, at_ms)
       select $1, $2, $3, $4, $5, $6
       where exists (select 1 from bank)
       on conflict (achievement_id, student_id, period_key) do nothing
       returning id
     ),
     upd as (
       update students set coins = coins + $7, week_coins = week_coins + $7, exp = exp + $7
       where id = $4 and dojo_id = $2 and exists (select 1 from claim)
       returning id
     ),
     refund as (
       update dojos set vault = vault + $7
       where id = $2 and exists (select 1 from bank) and not exists (select 1 from upd)
       returning id
     )
     insert into dojo_events (id, dojo_id, kind, at_ms, student_name, detail, line, coins, celebrate_until, scene_until)
     select $8, $2, 'award', $6, $9, $10, $11, $7, 0, $12 from upd
     returning id`,
    [claimId, dojo.id, achievementId, studentId, key, now, coins, eventId, name, `+${coins} coins`, `${name} finished ${achievement.name}.`, now + SCENE_MS],
  );
  if (!inserted.length) return { ok: false, reason: cadence === "daily" ? "Already given today." : "Already given this week." };
  await pushUndo(sql, {
    dojoId: dojo.id,
    kind: "achieve",
    studentId,
    itemId: achievementId,
    amount: coins,
    eventId,
    label: `Undo ${achievement.name} · ${name}`,
    actionDay: key,
    prevLastAward: student.lastAwardAt ?? null,
    prevLastRedeem: num(dojo.last_redeem_at),
  });
  return { ok: true, snapshot: await snapshot(sql, dojo.id) };
}

function cleanAchievement(input: { cadence: string; name: string; coins: number; image: string }) {
  const coins = Math.floor(input.coins);
  return {
    cadence: input.cadence === "weekly" ? "weekly" : "daily",
    name: input.name.trim().slice(0, 48),
    coins: Math.min(PRICE_MAX, Math.max(1, Number.isFinite(coins) ? coins : 1)),
    image: input.image.trim().slice(0, 400_000) || "/art/achievements/code.png",
  };
}

export async function addAchievement(
  code: string,
  input: { cadence: string; name: string; coins: number; image: string },
  token: string,
  phone = "",
): Promise<{ ok: true; id: string; snapshot: DojoSnapshot } | Fail> {
  const linked = await connected(code, "sensei", phone);
  if (!linked.ok) return linked;
  if (!(await directorOk(linked.sql, linked.dojo, token))) return { ok: false, reason: "The director pin is required." };
  const next = cleanAchievement(input);
  if (next.name.length < 2) return { ok: false, reason: "Name the achievement." };
  const id = randomUUID();
  await linked.sql`
    insert into achievements (id, dojo_id, cadence, name, coins, image)
    values (${id}, ${linked.dojo.id}, ${next.cadence}, ${next.name}, ${next.coins}, ${next.image})
  `;
  return { ok: true, id, snapshot: await snapshot(linked.sql, linked.dojo.id) };
}

export async function updateAchievement(
  code: string,
  achievementId: string,
  patch: Partial<{ cadence: string; name: string; coins: number; image: string }>,
  token: string,
  phone = "",
): Promise<SnapOk | Fail> {
  const linked = await connected(code, "sensei", phone);
  if (!linked.ok) return linked;
  if (!(await directorOk(linked.sql, linked.dojo, token))) return { ok: false, reason: "The director pin is required." };
  const rows = await linked.sql<{ id: string; cadence: string; name: string; coins: number | string; image: string }>`
    select id, cadence, name, coins, image from achievements where id = ${achievementId} and dojo_id = ${linked.dojo.id}
  `;
  const prev = rows[0];
  if (!prev) return { ok: false, reason: "That achievement is gone." };
  const next = cleanAchievement({
    cadence: patch.cadence ?? prev.cadence,
    name: patch.name ?? prev.name,
    coins: patch.coins ?? num(prev.coins),
    image: patch.image ?? prev.image,
  });
  if (next.name.length < 2) return { ok: false, reason: "Name the achievement." };
  await linked.sql`
    update achievements set cadence = ${next.cadence}, name = ${next.name}, coins = ${next.coins}, image = ${next.image}
    where id = ${achievementId} and dojo_id = ${linked.dojo.id}
  `;
  return { ok: true, snapshot: await snapshot(linked.sql, linked.dojo.id) };
}

export async function removeAchievement(code: string, achievementId: string, token: string, phone = ""): Promise<SnapOk | Fail> {
  const linked = await connected(code, "sensei", phone);
  if (!linked.ok) return linked;
  if (!(await directorOk(linked.sql, linked.dojo, token))) return { ok: false, reason: "The director pin is required." };
  await linked.sql`delete from achievement_claims where achievement_id = ${achievementId} and dojo_id = ${linked.dojo.id}`;
  await linked.sql`delete from achievements where id = ${achievementId} and dojo_id = ${linked.dojo.id}`;
  return { ok: true, snapshot: await snapshot(linked.sql, linked.dojo.id) };
}

export async function addStudent(
  code: string,
  input: { firstName: string; lastInitial: string; belt: string; coins: number },
  token?: string,
  phone = "",
): Promise<{ ok: true; id: string; snapshot: DojoSnapshot } | Fail> {
  const firstName = input.firstName.trim().slice(0, 24);
  const lastInitial = input.lastInitial.trim().slice(0, 1).toUpperCase();
  if (firstName.length < 1) return { ok: false, reason: "First name is required." };
  if (!/^[A-Z]$/.test(lastInitial)) return { ok: false, reason: "Use a single last initial." };
  if (!isBelt(input.belt)) return { ok: false, reason: "Pick a belt." };
  const linked = await connected(code, "sensei", phone);
  if (!linked.ok) return linked;
  const taken = await findNamed(linked.sql, linked.dojo.id, firstName, lastInitial);
  if (taken) return { ok: false, reason: nameBlockReason(taken.first_name, taken.last_initial, flag(taken.archived)) };
  const director = await directorOk(linked.sql, linked.dojo, token);
  const coins = Math.min(director ? PRICE_MAX : WELCOME_MAX, Math.max(0, Math.floor(input.coins) || 0));
  if (coins > 0 && num(linked.dojo.vault) < coins) {
    return { ok: false, reason: `The vault only has ${num(linked.dojo.vault)} coins left.` };
  }
  const now = Date.now();
  const id = randomUUID();
  const student: Student = {
    id,
    firstName,
    lastInitial,
    belt: input.belt,
    coins,
    exp: coins,
    weekCoins: 0,
    archived: false,
    dayKey: todayKey(now),
    dayCoins: coins,
    lastAwardAt: coins > 0 ? now : undefined,
  };
  if (coins > 0) {
    const bank = await linked.sql.query<{ id: string }>(
      `update dojos set vault = vault - $1 where id = $2 and vault >= $1 returning id`,
      [coins, linked.dojo.id],
    );
    if (!bank.length) return { ok: false, reason: `The vault only has ${num(linked.dojo.vault)} coins left.` };
  }
  try {
    await linked.sql`
      insert into students (id, dojo_id, first_name, last_initial, belt, coins, exp, week_coins, archived, day_key, day_coins, last_award_at)
      values (
        ${id}, ${linked.dojo.id}, ${firstName}, ${lastInitial}, ${input.belt}, ${coins}, ${coins}, ${coins}, false,
        ${todayKey(now)}, ${coins}, ${coins > 0 ? now : null}
      )
    `;
  } catch {
    if (coins > 0) await linked.sql`update dojos set vault = vault + ${coins} where id = ${linked.dojo.id}`;
    const raced = await findNamed(linked.sql, linked.dojo.id, firstName, lastInitial);
    if (raced) return { ok: false, reason: nameBlockReason(raced.first_name, raced.last_initial, flag(raced.archived)) };
    return { ok: false, reason: "The ninja didn't join. Try again." };
  }
  const named = displayName(student);
  await insertEvent(
    linked.sql,
    linked.dojo.id,
    scene({ kind: "welcome", studentName: named, detail: input.belt, line: welcomeLine(named), coins }),
  );
  return { ok: true, id, snapshot: await snapshot(linked.sql, linked.dojo.id) };
}

export async function updateStudent(
  code: string,
  studentId: string,
  patch: { firstName?: string; lastInitial?: string; belt?: string; coins?: number; archived?: boolean },
  token?: string,
  phone = "",
): Promise<SnapOk | Fail> {
  const linked = await connected(code, "sensei", phone);
  if (!linked.ok) return linked;
  const rows = await linked.sql<StudentRow>`
    select id, first_name, last_initial, belt, coins, exp, week_coins, archived, day_key, day_coins, last_award_at
    from students where id = ${studentId} and dojo_id = ${linked.dojo.id}
  `;
  const prev = rows[0] ? mapStudent(rows[0]) : null;
  if (!prev) return { ok: false, reason: "That ninja is gone." };
  const director = await directorOk(linked.sql, linked.dojo, token);
  const firstName = patch.firstName !== undefined ? patch.firstName.trim().slice(0, 24) : prev.firstName;
  const lastInitial = patch.lastInitial !== undefined ? patch.lastInitial.trim().slice(0, 1).toUpperCase() : prev.lastInitial;
  if (firstName.length < 1) return { ok: false, reason: "First name is required." };
  if (!/^[A-Z]$/.test(lastInitial)) return { ok: false, reason: "Use a single last initial." };
  const belt = patch.belt !== undefined ? patch.belt : prev.belt;
  if (!isBelt(belt)) return { ok: false, reason: "Pick a belt." };
  const renamed = firstName.trim().toLowerCase() !== prev.firstName.trim().toLowerCase() || lastInitial !== prev.lastInitial;
  if (renamed) {
    const taken = await findNamed(linked.sql, linked.dojo.id, firstName, lastInitial, prev.id);
    if (taken) return { ok: false, reason: nameBlockReason(taken.first_name, taken.last_initial, flag(taken.archived)) };
  }
  let coins = prev.coins;
  if (patch.coins !== undefined && Math.floor(patch.coins) !== prev.coins) {
    if (!director) return { ok: false, reason: "Balance corrections need the director pin." };
    coins = Math.max(0, Math.min(9999, Math.floor(patch.coins)));
  }
  const delta = coins - prev.coins;
  if (delta > 0) {
    const bank = await linked.sql.query<{ id: string }>(
      `update dojos set vault = vault - $1 where id = $2 and vault >= $1 returning id`,
      [delta, linked.dojo.id],
    );
    if (!bank.length) return { ok: false, reason: `The vault only has ${num(linked.dojo.vault)} coins left.` };
  } else if (delta < 0) {
    await linked.sql`update dojos set vault = vault + ${-delta} where id = ${linked.dojo.id}`;
  }
  const archived = patch.archived !== undefined ? patch.archived : prev.archived;
  const stamp = Date.now();
  const archivedAt = archived && !prev.archived ? stamp : !archived && prev.archived ? null : -1;
  await linked.sql`
    update students
    set first_name = ${firstName}, last_initial = ${lastInitial}, belt = ${belt}, coins = ${coins}, archived = ${archived},
        archived_at = case when ${archivedAt} = ${-1} then archived_at else ${archivedAt} end
    where id = ${studentId} and dojo_id = ${linked.dojo.id}
  `;
  const next = { ...prev, firstName, lastInitial, belt, coins, archived };
  const name = displayName(next);
  let event: DojoEvent | null = null;
  if (archived && !prev.archived) event = scene({ kind: "rest", studentName: name, detail: "archived", line: restLine(name), coins: 0 });
  else if (belt !== prev.belt) event = scene({ kind: "belt", studentName: name, detail: belt, line: beltLine(name, belt), coins: 0 });
  else if (name !== displayName(prev)) event = scene({ kind: "welcome", studentName: name, detail: "rename", line: renameLine(name), coins: 0 });
  if (event) await insertEvent(linked.sql, linked.dojo.id, event);
  return { ok: true, snapshot: await snapshot(linked.sql, linked.dojo.id) };
}

export async function promoteBelt(code: string, studentId: string, phone = ""): Promise<SnapOk | Fail> {
  const linked = await connected(code, "sensei", phone);
  if (!linked.ok) return linked;
  const rows = await linked.sql<StudentRow>`
    select id, first_name, last_initial, belt, coins, exp, week_coins, archived, day_key, day_coins, last_award_at
    from students where id = ${studentId} and dojo_id = ${linked.dojo.id}
  `;
  const prev = rows[0] ? mapStudent(rows[0]) : null;
  if (!prev) return { ok: false, reason: "That ninja is gone." };
  if (prev.archived) return { ok: false, reason: "That ninja is resting." };
  const upcoming = nextBelt(prev.belt);
  if (!upcoming) return { ok: false, reason: "Already at gold." };
  const name = displayName(prev);
  const ceremonyId = randomUUID();
  const now = Date.now();
  const updated = await linked.sql.query<{ id: string }>(
    `with promoted as (
       update students set belt = $1
       where id = $2 and dojo_id = $3 and archived = false
       returning id
     )
     update dojos
     set ceremony_id = $4, ceremony_name = $5, ceremony_belt = $1
     where id = $3 and exists (select 1 from promoted)
     returning id`,
    [upcoming, studentId, linked.dojo.id, ceremonyId, name],
  );
  if (!updated.length) return { ok: false, reason: "That ninja is resting." };
  await insertEvent(linked.sql, linked.dojo.id, {
    id: randomUUID(),
    kind: "belt",
    at: now,
    studentName: name,
    detail: upcoming,
    line: beltLine(name, upcoming),
    coins: 0,
    celebrateUntil: 0,
    sceneUntil: 0,
  });
  return { ok: true, snapshot: await snapshot(linked.sql, linked.dojo.id) };
}

export async function dismissCeremony(code: string, ceremonyId: string): Promise<SnapOk | Fail> {
  const linked = await connected(code, "display");
  if (!linked.ok) return linked;
  if (!ceremonyId) return { ok: false, reason: "No ceremony to close." };
  await linked.sql`
    update dojos
    set ceremony_id = null, ceremony_name = null, ceremony_belt = null
    where id = ${linked.dojo.id} and ceremony_id = ${ceremonyId}
  `;
  return { ok: true, snapshot: await snapshot(linked.sql, linked.dojo.id) };
}

function cleanItem(input: { name: string; price: number; stock: number; image: string; minBelt: string | null; currency?: string | null }) {
  const currency = input.currency === "exp" ? "exp" : "coins";
  return {
    name: input.name.trim().slice(0, 40),
    currency,
    price: Math.min(ITEM_PRICE_MAX, Math.max(1, Math.floor(input.price) || 1)),
    stock: currency === "exp" ? 0 : Math.min(STOCK_MAX, Math.max(0, Math.floor(input.stock) || 0)),
    image: input.image.slice(0, 500_000),
    minBelt: input.minBelt && isBelt(input.minBelt) ? input.minBelt : null,
  };
}

export async function addItem(
  code: string,
  input: { name: string; price: number; stock: number; image: string; minBelt: string | null; currency?: string | null },
  token: string,
  phone = "",
): Promise<{ ok: true; id: string; snapshot: DojoSnapshot } | Fail> {
  const linked = await connected(code, "sensei", phone);
  if (!linked.ok) return linked;
  if (!(await directorOk(linked.sql, linked.dojo, token))) return { ok: false, reason: "The director pin is required." };
  const item = cleanItem(input);
  if (item.name.length < 1) return { ok: false, reason: "Name the prize." };
  if (!item.image) return { ok: false, reason: "Add a picture." };
  const id = randomUUID();
  await linked.sql`
    insert into shop_items (id, dojo_id, name, price, stock, image, min_belt, currency)
    values (${id}, ${linked.dojo.id}, ${item.name}, ${item.price}, ${item.stock}, ${item.image}, ${item.minBelt}, ${item.currency})
  `;
  await insertEvent(linked.sql, linked.dojo.id, scene({ kind: "shop", studentName: "", detail: item.name, line: shopLine(item.name), coins: item.price }));
  return { ok: true, id, snapshot: await snapshot(linked.sql, linked.dojo.id) };
}

export async function updateItem(
  code: string,
  itemId: string,
  patch: Partial<{ name: string; price: number; stock: number; image: string; minBelt: string | null; currency: string | null }>,
  token: string,
  phone = "",
): Promise<SnapOk | Fail> {
  const linked = await connected(code, "sensei", phone);
  if (!linked.ok) return linked;
  if (!(await directorOk(linked.sql, linked.dojo, token))) return { ok: false, reason: "The director pin is required." };
  const rows = await linked.sql<ItemRow>`select id, name, price, currency, stock, image, min_belt from shop_items where id = ${itemId} and dojo_id = ${linked.dojo.id}`;
  const prev = rows[0] ? mapItem(rows[0]) : null;
  if (!prev) return { ok: false, reason: "That prize is gone." };
  const next = cleanItem({
    name: patch.name ?? prev.name,
    price: patch.price ?? prev.price,
    stock: patch.stock ?? prev.stock,
    image: patch.image ?? prev.image,
    minBelt: patch.minBelt === undefined ? prev.minBelt : patch.minBelt,
    currency: patch.currency === undefined ? prev.currency : patch.currency,
  });
  if (next.name.length < 1) return { ok: false, reason: "Name the prize." };
  await linked.sql`
    update shop_items set name = ${next.name}, price = ${next.price}, stock = ${next.stock}, image = ${next.image}, min_belt = ${next.minBelt}, currency = ${next.currency}
    where id = ${itemId} and dojo_id = ${linked.dojo.id}
  `;
  return { ok: true, snapshot: await snapshot(linked.sql, linked.dojo.id) };
}

export async function removeItem(code: string, itemId: string, token: string, phone = ""): Promise<SnapOk | Fail> {
  const linked = await connected(code, "sensei", phone);
  if (!linked.ok) return linked;
  if (!(await directorOk(linked.sql, linked.dojo, token))) return { ok: false, reason: "The director pin is required." };
  const rows = await linked.sql<ItemRow>`select id, name, price, currency, stock, image, min_belt from shop_items where id = ${itemId} and dojo_id = ${linked.dojo.id}`;
  const item = rows[0];
  if (!item) return { ok: false, reason: "That prize is gone." };
  await linked.sql`delete from shop_items where id = ${itemId} and dojo_id = ${linked.dojo.id}`;
  await linked.sql`delete from exp_claims where item_id = ${itemId} and dojo_id = ${linked.dojo.id}`;
  await insertEvent(
    linked.sql,
    linked.dojo.id,
    scene({ kind: "shop", studentName: "", detail: item.name, line: `${item.name} left the shop. On to the next find.`, coins: 0 }),
  );
  return { ok: true, snapshot: await snapshot(linked.sql, linked.dojo.id) };
}

export async function restoreDemo(code: string, token: string, phone = ""): Promise<SnapOk | Fail> {
  const linked = await connected(code, "sensei", phone);
  if (!linked.ok) return linked;
  if (!(await directorOk(linked.sql, linked.dojo, token))) return { ok: false, reason: "The director pin is required." };
  const now = Date.now();
  await linked.sql`delete from exp_claims where dojo_id = ${linked.dojo.id}`;
  await linked.sql`delete from achievement_claims where dojo_id = ${linked.dojo.id}`;
  await linked.sql`delete from achievements where dojo_id = ${linked.dojo.id}`;
  await linked.sql`delete from dojo_undos where dojo_id = ${linked.dojo.id}`;
  await linked.sql`delete from dojo_events where dojo_id = ${linked.dojo.id}`;
  await linked.sql`delete from shop_items where dojo_id = ${linked.dojo.id}`;
  await linked.sql`delete from students where dojo_id = ${linked.dojo.id}`;
  await linked.sql`update dojos set week_started = ${now} where id = ${linked.dojo.id}`;
  await seedDojo(linked.sql, linked.dojo.id, now, true);
  return { ok: true, snapshot: await snapshot(linked.sql, linked.dojo.id) };
}

function cleanZone(input: string) {
  const zone = input.trim();
  if (!zone || zone.length > 80) return "UTC";
  try {
    Intl.DateTimeFormat("en-US", { timeZone: zone }).format(0);
    return zone;
  } catch {
    return "UTC";
  }
}

function zonedParts(timeZone: string, instant: number) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const bag: Record<string, string> = {};
  for (const part of fmt.formatToParts(instant)) bag[part.type] = part.value;
  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour: Number(bag.hour) % 24,
    minute: Number(bag.minute),
    second: Number(bag.second),
  };
}

function localMidnight(timeZone: string, year: number, month: number, day: number) {
  let utc = Date.UTC(year, month - 1, day);
  const target = utc;
  for (let i = 0; i < 4; i++) {
    const part = zonedParts(timeZone, utc);
    const shown = Date.UTC(part.year, part.month - 1, part.day, part.hour, part.minute, part.second);
    utc += target - shown;
  }
  return utc;
}

function dayWindow(timeZone: string, now: number) {
  const part = zonedParts(timeZone, now);
  const start = localMidnight(timeZone, part.year, part.month, part.day);
  const next = new Date(Date.UTC(part.year, part.month - 1, part.day));
  next.setUTCDate(next.getUTCDate() + 1);
  const end = localMidnight(timeZone, next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate());
  return { start, end };
}

function coinText(value: number) {
  return value.toLocaleString("en-US");
}

function isAchievement(event: EventRow) {
  return event.kind === "award" && event.line.includes(" finished ");
}

function auditKind(event: EventRow) {
  if (event.kind === "award") return isAchievement(event) ? "Achievement" : "Payout";
  if (event.kind === "welcome") return event.detail === "rename" ? "Rename" : "Welcome";
  if (event.kind === "redeem") return num(event.coins) > 0 ? "Shop" : "EXP";
  if (event.kind === "undo") return "Undo";
  if (event.kind === "belt") return "Belt";
  if (event.kind === "rest") return "Archived";
  if (event.kind === "return") return "Returned";
  if (event.kind === "shop") return "Shop edit";
  return event.kind;
}

function sheetHeaders(sheet: ExcelJS.Worksheet, headers: string[], widths: number[]) {
  sheet.columns = headers.map((header, index) => ({ header, width: widths[index] ?? 14 }));
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
}

export async function dayLedger(
  code: string,
  timeZone: string,
  phone = "",
): Promise<{ ok: true; filename: string; file: string; snapshot: DojoSnapshot } | Fail> {
  const linked = await connected(code, "sensei", phone);
  if (!linked.ok) return linked;
  const zone = cleanZone(timeZone);
  const now = Date.now();
  const { start, end } = dayWindow(zone, now);
  const events = await linked.sql<EventRow>`
    select id, kind, at_ms, student_name, detail, line, coins, celebrate_until, scene_until
    from dojo_events
    where dojo_id = ${linked.dojo.id} and at_ms >= ${start} and at_ms < ${end}
    order by at_ms asc
    limit 4000
  `;
  const part = zonedParts(zone, now);
  const stamp = `${part.year}-${String(part.month).padStart(2, "0")}-${String(part.day).padStart(2, "0")}`;
  const label = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(now);
  const clock = new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "numeric", minute: "2-digit" });
  const book = events.filter((event) => event.kind !== "mine" && event.kind !== "pocket");
  const mined = events.filter((event) => event.kind === "mine");
  const sumKind = (kind: string) => events.reduce((sum, event) => sum + (event.kind === kind ? num(event.coins) : 0), 0);
  const awardCoins = (achievement: boolean) =>
    events.reduce((sum, event) => sum + (event.kind === "award" && isAchievement(event) === achievement ? num(event.coins) : 0), 0);
  const students = [...linked.snapshot.students].sort((a, b) => {
    if (a.archived !== b.archived) return a.archived ? 1 : -1;
    return displayName(a).localeCompare(displayName(b));
  });
  const bookByName = new Map<string, string[]>();
  for (const event of book) {
    if (event.kind !== "redeem" || !event.student_name) continue;
    const label =
      num(event.coins) > 0 ? `${event.detail} (${coinText(num(event.coins))} coins)` : `${event.detail} (EXP)`;
    const list = bookByName.get(event.student_name) ?? [];
    list.push(label);
    bookByName.set(event.student_name, list);
  }
  const claimedByStudent = new Map<string, string[]>();
  for (const claim of linked.snapshot.expClaims) {
    const item = linked.snapshot.items.find((entry) => entry.id === claim.itemId);
    const list = claimedByStudent.get(claim.studentId) ?? [];
    list.push(item?.name ?? "Removed prize");
    claimedByStudent.set(claim.studentId, list);
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "BLOCKDOJO";
  const audit = workbook.addWorksheet("Audit");
  sheetHeaders(audit, ["Time", "Ninja", "Kind", "Detail", "Coins", "Note"], [16, 22, 14, 28, 12, 56]);
  if (!book.length) {
    audit.addRow(["", "", "", "", "", "No desk activity yet."]);
  } else {
    for (const event of book) {
      const row = audit.addRow([
        clock.format(num(event.at_ms)),
        event.student_name,
        auditKind(event),
        event.detail,
        num(event.coins),
        event.line,
      ]);
      row.getCell(5).numFmt = "#,##0";
    }
  }

  const ninjas = workbook.addWorksheet("Ninjas");
  sheetHeaders(
    ninjas,
    ["Name", "Belt", "Status", "Coins", "EXP", "Earned today", "Redeemed today", "EXP prizes claimed"],
    [22, 12, 12, 12, 12, 16, 36, 36],
  );
  if (!students.length) {
    ninjas.addRow(["No ninjas yet."]);
  } else {
    for (const student of students) {
      const row = ninjas.addRow([
        displayName(student),
        student.belt,
        student.archived ? "Archived" : "Active",
        student.coins,
        student.exp,
        earnedToday(student, now),
        (bookByName.get(displayName(student)) ?? []).join("; "),
        (claimedByStudent.get(student.id) ?? []).join(", "),
      ]);
      row.getCell(4).numFmt = "#,##0";
      row.getCell(5).numFmt = "#,##0";
      row.getCell(6).numFmt = "#,##0";
    }
  }

  const close = workbook.addWorksheet("Close");
  sheetHeaders(close, ["Item", "Amount"], [28, 18]);
  const closeRows: Array<[string, string | number]> = [
    ["Date", label],
    ["Vault", linked.snapshot.vault],
    ["Paid out", awardCoins(false)],
    ["Spent at the shop", sumKind("redeem")],
    ["Achievements", awardCoins(true)],
    ["Welcome coins", sumKind("welcome")],
    ["Mined", sumKind("mine")],
    ["Mine strikes", mined.length],
    ["Returned from rest", sumKind("return")],
    ["Undos", book.filter((event) => event.kind === "undo").length],
    ["EXP claims", book.filter((event) => event.kind === "redeem" && num(event.coins) === 0).length],
  ];
  for (const [item, amount] of closeRows) {
    const row = close.addRow([item, amount]);
    if (typeof amount === "number") row.getCell(2).numFmt = "#,##0";
  }

  const raw = await workbook.xlsx.writeBuffer();
  return {
    ok: true,
    filename: `BLOCKDOJO-${stamp}.xlsx`,
    file: Buffer.from(raw).toString("base64"),
    snapshot: linked.snapshot,
  };
}
