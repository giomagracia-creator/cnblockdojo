import { randomUUID } from "node:crypto";
import { grantTypingAward, matchCaveCode } from "@/lib/dojo/dojo.server";
import {
  GAME_FIRST_CAP,
  GAME_SECOND_CAP,
  GAME_TURN_MS,
  badgesFor,
  beltAllows,
  gameCoins,
  isTestNinja,
  type ActiveRun,
  type NinjaCard,
  type RankRow,
  type TurnNote,
} from "@/lib/dojo/games";
import { displayName, BELTS, type Belt } from "@/lib/dojo/types";
import type { Sql } from "@/lib/db";

function beltOf(value: string): Belt {
  return (BELTS as readonly string[]).includes(value) ? (value as Belt) : "White";
}

type RunRow = {
  id: string;
  student_id: string;
  day_key: string;
  hour_key: string;
  week_key: string;
  started_at: number | string;
  ended_at: number | string | null;
  words: number | string;
  golden: number | string;
  coins: number | string;
  game: string;
};

function num(value: number | string | null | undefined) {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

async function settleExpired(sql: Sql, dojoId: string) {
  const now = Date.now();
  await sql`
    update game_runs
    set ended_at = started_at + ${GAME_TURN_MS}
    where dojo_id = ${dojoId} and ended_at is null and started_at + ${GAME_TURN_MS} <= ${now}
  `;
}

function decideTurn(runs: RunRow[], visitHours: number, day: string, hour: string, week: string) {
  const weekRuns = runs.filter((run) => run.week_key === week);
  const earlier = weekRuns.some((run) => run.day_key !== day);
  const today = weekRuns.filter((run) => run.day_key === day);
  const allowed = visitHours === 2 ? 2 : 1;
  let note: TurnNote = null;
  let canStart = true;
  if (earlier || today.length >= allowed) {
    canStart = false;
    note = "week";
  } else if (today.length === 1 && allowed === 2 && today[0]?.hour_key === hour) {
    canStart = false;
    note = "hour";
  }
  const open = today.find((run) => run.ended_at == null);
  return { canStart: canStart && !open, note, used: today.length, allowed, open };
}

async function runsFor(sql: Sql, dojoId: string, studentId: string) {
  return sql<RunRow>`
    select id, student_id, day_key, hour_key, week_key, started_at, ended_at, words, golden, coins, game
    from game_runs
    where dojo_id = ${dojoId} and student_id = ${studentId}
    order by started_at desc
  `;
}

async function ranksFor(sql: Sql, dojoId: string, day: string, game: "typing" | "typeme"): Promise<RankRow[]> {
  const rows = await sql<{
    id: string;
    first_name: string;
    last_initial: string;
    belt: string;
    coins: number | string;
    words: number | string;
  }>`
    select s.id, s.first_name, s.last_initial, s.belt,
      coalesce(sum(r.coins), 0) as coins,
      coalesce(sum(r.words), 0) as words
    from students s
    left join game_runs r
      on r.student_id = s.id and r.dojo_id = s.dojo_id and r.day_key = ${day} and r.ended_at is not null and r.game = ${game}
    where s.dojo_id = ${dojoId} and s.archived = false
    group by s.id, s.first_name, s.last_initial, s.belt
    order by coins desc, words desc, s.first_name
  `;
  return rows.map((row) => ({
    id: row.id,
    name: displayName({ firstName: row.first_name, lastInitial: row.last_initial }),
    belt: beltOf(row.belt),
    coins: num(row.coins),
    words: num(row.words),
  }));
}

function activeFrom(run: RunRow | undefined): ActiveRun | null {
  if (!run || run.ended_at != null) return null;
  return { id: run.id, endsAt: num(run.started_at) + GAME_TURN_MS, words: num(run.words), golden: num(run.golden), game: run.game === "typeme" ? "typeme" : "typing" };
}

export async function ninjaRoster(phone: string) {
  const cave = await matchCaveCode(phone);
  if (!cave.ok) return cave;
  const rows = await cave.sql<{ id: string; first_name: string; last_initial: string; belt: string; visit_hours: number | string }>`
    select id, first_name, last_initial, belt, visit_hours
    from students
    where dojo_id = ${cave.dojo.id} and archived = false
    order by first_name
  `;
  const ninjas: NinjaCard[] = rows.map((row) => ({
    id: row.id,
    name: displayName({ firstName: row.first_name, lastInitial: row.last_initial }),
    belt: beltOf(row.belt),
    visitHours: num(row.visit_hours) === 2 ? 2 : 1,
  }));
  return { ok: true as const, ninjas };
}

export async function ninjaBoard(phone: string, studentId: string) {
  const cave = await matchCaveCode(phone);
  if (!cave.ok) return cave;
  await settleExpired(cave.sql, cave.dojo.id);
  const students = await cave.sql<{ id: string; first_name: string; last_initial: string; belt: string; visit_hours: number | string }>`
    select id, first_name, last_initial, belt, visit_hours
    from students where id = ${studentId} and dojo_id = ${cave.dojo.id} and archived = false
  `;
  const student = students[0];
  if (!student) return { ok: false as const, reason: "Pick your name again." };
  const runs = await runsFor(cave.sql, cave.dojo.id, studentId);
  const turn = decideTurn(runs, num(student.visit_hours) === 2 ? 2 : 1, cave.day, cave.hour, cave.week);
  const testing = isTestNinja(student.first_name);
  const ranks = await ranksFor(cave.sql, cave.dojo.id, cave.day, "typing");
  return {
    ok: true as const,
    ninja: {
      id: student.id,
      name: displayName({ firstName: student.first_name, lastInitial: student.last_initial }),
      belt: beltOf(student.belt),
      visitHours: num(student.visit_hours) === 2 ? 2 : 1,
    } satisfies NinjaCard,
    canStart: testing ? !turn.open : turn.canStart,
    note: testing ? null : turn.note,
    active: activeFrom(turn.open),
    ranks,
  };
}

export async function ninjaStart(phone: string, studentId: string, requested = "typing") {
  const game = requested === "typeme" ? "typeme" : "typing";
  const board = await ninjaBoard(phone, studentId);
  if (!board.ok) return board;
  if (board.active) return { ok: true as const, run: board.active, resumed: true };
  const need = game === "typeme" ? "Yellow" : "White";
  if (!beltAllows(board.ninja.belt, need)) {
    const name = game === "typeme" ? "Type Me If You Can" : "Typing";
    return { ok: false as const, reason: `${name} opens at ${need} belt.`, note: null };
  }
  if (!board.canStart) return { ok: false as const, reason: "The games are resting.", note: board.note };
  const cave = await matchCaveCode(phone);
  if (!cave.ok) return cave;
  const id = randomUUID();
  const now = Date.now();
  await cave.sql`
    insert into game_runs (id, dojo_id, student_id, game, day_key, hour_key, week_key, started_at, words, golden, coins, exp, badges)
    values (
      ${id}, ${cave.dojo.id}, ${studentId}, ${game}, ${cave.day}, ${cave.hour}, ${cave.week}, ${now}, 0, 0, 0, 0, ''
    )
  `;
  return { ok: true as const, run: { id, endsAt: now + GAME_TURN_MS, words: 0, golden: 0, game }, resumed: false };
}

export async function ninjaFinish(phone: string, studentId: string, runId: string, words: number, golden: number, lost = false) {
  const cave = await matchCaveCode(phone);
  if (!cave.ok) return cave;
  const rows = await cave.sql<RunRow>`
    select id, student_id, day_key, hour_key, week_key, started_at, ended_at, words, golden, coins, game
    from game_runs
    where id = ${runId} and dojo_id = ${cave.dojo.id} and student_id = ${studentId}
  `;
  const run = rows[0];
  if (!run) return { ok: false as const, reason: "That game already closed." };
  const game = run.game === "typeme" ? "typeme" : "typing";
  if (run.ended_at != null) {
    const ranks = await ranksFor(cave.sql, cave.dojo.id, cave.day, game);
    return {
      ok: true as const,
      words: num(run.words),
      golden: num(run.golden),
      coins: num(run.coins),
      exp: num(run.coins),
      badges: badgesFor(num(run.words)),
      ranks,
      game,
    };
  }
  const elapsed = Math.min(GAME_TURN_MS, Math.max(0, Date.now() - num(run.started_at)));
  const maxWords = Math.floor(elapsed / 700) + 8;
  const cleanWords = Math.max(0, Math.min(maxWords, Math.floor(words)));
  const cleanGolden = Math.max(0, Math.min(cleanWords, Math.floor(golden)));
  const earlierToday = await cave.sql<{ id: string }>`
    select id from game_runs
    where dojo_id = ${cave.dojo.id} and student_id = ${studentId} and day_key = ${cave.day} and id <> ${runId} and ended_at is not null
  `;
  const named = await cave.sql<{ first_name: string }>`
    select first_name from students where id = ${studentId} and dojo_id = ${cave.dojo.id}
  `;
  const testing = isTestNinja(named[0]?.first_name ?? "");
  const cap = testing ? 10_000 : earlierToday.length > 0 ? GAME_SECOND_CAP : GAME_FIRST_CAP;
  const full = gameCoins(cleanWords, cleanGolden, cap);
  const requested = game === "typeme" && lost ? Math.floor(full / 2) : full;
  const paid = await grantTypingAward(cave.sql, cave.dojo.id, studentId, requested, cleanWords);
  const badges = badgesFor(cleanWords);
  await cave.sql`
    update game_runs
    set ended_at = ${Date.now()}, words = ${cleanWords}, golden = ${cleanGolden},
        coins = ${paid.coins}, exp = ${paid.exp}, badges = ${badges.join(",")}
    where id = ${runId} and ended_at is null
  `;
  const ranks = await ranksFor(cave.sql, cave.dojo.id, cave.day, game);
  return {
    ok: true as const,
    words: cleanWords,
    golden: cleanGolden,
    coins: paid.coins,
    exp: paid.exp,
    badges,
    ranks,
    game,
  };
}
