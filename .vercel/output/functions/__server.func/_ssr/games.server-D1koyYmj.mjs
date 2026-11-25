import { a as displayName, t as BELTS } from "./types-wveOOwoA.mjs";
import { grantTypingAward, matchCaveCode } from "./dojo.server-CkJxiroC.mjs";
import { a as isTestNinja, i as gameCoins, n as badgesFor, r as beltAllows, t as GAME_TURN_MS } from "./games-DjeaWp0m.mjs";
import { randomUUID } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/games.server-D1koyYmj.js
function beltOf(value) {
	return BELTS.includes(value) ? value : "White";
}
function num(value) {
	const next = Number(value);
	return Number.isFinite(next) ? next : 0;
}
async function settleExpired(sql, dojoId) {
	await sql`
    update game_runs
    set ended_at = started_at + ${GAME_TURN_MS}
    where dojo_id = ${dojoId} and ended_at is null and started_at + ${GAME_TURN_MS} <= ${Date.now()}
  `;
}
function decideTurn(runs, visitHours, day, hour, week) {
	const weekRuns = runs.filter((run) => run.week_key === week);
	const earlier = weekRuns.some((run) => run.day_key !== day);
	const today = weekRuns.filter((run) => run.day_key === day);
	const allowed = visitHours === 2 ? 2 : 1;
	let note = null;
	let canStart = true;
	if (earlier || today.length >= allowed) {
		canStart = false;
		note = "week";
	} else if (today.length === 1 && allowed === 2 && today[0]?.hour_key === hour) {
		canStart = false;
		note = "hour";
	}
	const open = today.find((run) => run.ended_at == null);
	return {
		canStart: canStart && !open,
		note,
		used: today.length,
		allowed,
		open
	};
}
async function runsFor(sql, dojoId, studentId) {
	return sql`
    select id, student_id, day_key, hour_key, week_key, started_at, ended_at, words, golden, coins, game
    from game_runs
    where dojo_id = ${dojoId} and student_id = ${studentId}
    order by started_at desc
  `;
}
async function ranksFor(sql, dojoId, day, game) {
	return (await sql`
    select s.id, s.first_name, s.last_initial, s.belt,
      coalesce(sum(r.coins), 0) as coins,
      coalesce(sum(r.words), 0) as words
    from students s
    left join game_runs r
      on r.student_id = s.id and r.dojo_id = s.dojo_id and r.day_key = ${day} and r.ended_at is not null and r.game = ${game}
    where s.dojo_id = ${dojoId} and s.archived = false
    group by s.id, s.first_name, s.last_initial, s.belt
    order by coins desc, words desc, s.first_name
  `).map((row) => ({
		id: row.id,
		name: displayName({
			firstName: row.first_name,
			lastInitial: row.last_initial
		}),
		belt: beltOf(row.belt),
		coins: num(row.coins),
		words: num(row.words)
	}));
}
function activeFrom(run) {
	if (!run || run.ended_at != null) return null;
	return {
		id: run.id,
		endsAt: num(run.started_at) + GAME_TURN_MS,
		words: num(run.words),
		golden: num(run.golden),
		game: run.game === "typeme" ? "typeme" : "typing"
	};
}
async function ninjaRoster(phone) {
	const cave = await matchCaveCode(phone);
	if (!cave.ok) return cave;
	return {
		ok: true,
		ninjas: (await cave.sql`
    select id, first_name, last_initial, belt, visit_hours
    from students
    where dojo_id = ${cave.dojo.id} and archived = false
    order by first_name
  `).map((row) => ({
			id: row.id,
			name: displayName({
				firstName: row.first_name,
				lastInitial: row.last_initial
			}),
			belt: beltOf(row.belt),
			visitHours: num(row.visit_hours) === 2 ? 2 : 1
		}))
	};
}
async function ninjaBoard(phone, studentId) {
	const cave = await matchCaveCode(phone);
	if (!cave.ok) return cave;
	await settleExpired(cave.sql, cave.dojo.id);
	const student = (await cave.sql`
    select id, first_name, last_initial, belt, visit_hours
    from students where id = ${studentId} and dojo_id = ${cave.dojo.id} and archived = false
  `)[0];
	if (!student) return {
		ok: false,
		reason: "Pick your name again."
	};
	const turn = decideTurn(await runsFor(cave.sql, cave.dojo.id, studentId), num(student.visit_hours) === 2 ? 2 : 1, cave.day, cave.hour, cave.week);
	const testing = isTestNinja(student.first_name);
	const ranks = await ranksFor(cave.sql, cave.dojo.id, cave.day, "typing");
	return {
		ok: true,
		ninja: {
			id: student.id,
			name: displayName({
				firstName: student.first_name,
				lastInitial: student.last_initial
			}),
			belt: beltOf(student.belt),
			visitHours: num(student.visit_hours) === 2 ? 2 : 1
		},
		canStart: testing ? !turn.open : turn.canStart,
		note: testing ? null : turn.note,
		active: activeFrom(turn.open),
		ranks
	};
}
async function ninjaStart(phone, studentId, requested = "typing") {
	const game = requested === "typeme" ? "typeme" : "typing";
	const board = await ninjaBoard(phone, studentId);
	if (!board.ok) return board;
	if (board.active) return {
		ok: true,
		run: board.active,
		resumed: true
	};
	const need = game === "typeme" ? "Yellow" : "White";
	if (!beltAllows(board.ninja.belt, need)) return {
		ok: false,
		reason: `${game === "typeme" ? "Type Me If You Can" : "Typing"} opens at ${need} belt.`,
		note: null
	};
	if (!board.canStart) return {
		ok: false,
		reason: "The games are resting.",
		note: board.note
	};
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
	return {
		ok: true,
		run: {
			id,
			endsAt: now + GAME_TURN_MS,
			words: 0,
			golden: 0,
			game
		},
		resumed: false
	};
}
async function ninjaFinish(phone, studentId, runId, words, golden, lost = false) {
	const cave = await matchCaveCode(phone);
	if (!cave.ok) return cave;
	const run = (await cave.sql`
    select id, student_id, day_key, hour_key, week_key, started_at, ended_at, words, golden, coins, game
    from game_runs
    where id = ${runId} and dojo_id = ${cave.dojo.id} and student_id = ${studentId}
  `)[0];
	if (!run) return {
		ok: false,
		reason: "That game already closed."
	};
	const game = run.game === "typeme" ? "typeme" : "typing";
	if (run.ended_at != null) {
		const ranks = await ranksFor(cave.sql, cave.dojo.id, cave.day, game);
		return {
			ok: true,
			words: num(run.words),
			golden: num(run.golden),
			coins: num(run.coins),
			exp: num(run.coins),
			badges: badgesFor(num(run.words)),
			ranks,
			game
		};
	}
	const elapsed = Math.min(GAME_TURN_MS, Math.max(0, Date.now() - num(run.started_at)));
	const maxWords = Math.floor(elapsed / 700) + 8;
	const cleanWords = Math.max(0, Math.min(maxWords, Math.floor(words)));
	const cleanGolden = Math.max(0, Math.min(cleanWords, Math.floor(golden)));
	const earlierToday = await cave.sql`
    select id from game_runs
    where dojo_id = ${cave.dojo.id} and student_id = ${studentId} and day_key = ${cave.day} and id <> ${runId} and ended_at is not null
  `;
	const named = await cave.sql`
    select first_name from students where id = ${studentId} and dojo_id = ${cave.dojo.id}
  `;
	const cap = isTestNinja(named[0]?.first_name ?? "") ? 1e4 : earlierToday.length > 0 ? 10 : 20;
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
		ok: true,
		words: cleanWords,
		golden: cleanGolden,
		coins: paid.coins,
		exp: paid.exp,
		badges,
		ranks,
		game
	};
}
//#endregion
export { ninjaBoard, ninjaFinish, ninjaRoster, ninjaStart };
