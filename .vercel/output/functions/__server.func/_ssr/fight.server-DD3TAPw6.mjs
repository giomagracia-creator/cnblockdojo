import { a as displayName } from "./types-wveOOwoA.mjs";
import { matchCaveCode } from "./dojo.server-CkJxiroC.mjs";
import { r as beltAllows } from "./games-DjeaWp0m.mjs";
import { a as poseNow, i as movesOf, o as press, r as createLive } from "./fight-live-BLUGJ08k.mjs";
import { ninjaBoard } from "./games.server-D1koyYmj.mjs";
import { randomUUID } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/fight.server-DD3TAPw6.js
var WAIT_MS = 3e4;
var PAIR_MS = 4e4;
var STALE_MS = 8e4;
function num(value) {
	const next = Number(value);
	return Number.isFinite(next) ? next : 0;
}
function text(value) {
	return String(value ?? "");
}
function asPhase(value) {
	if (value === "fight" || value === "stop" || value === "ko" || value === "match" || value === "pick") return value;
	return "intro";
}
function asMatch(row) {
	const phase = asPhase(text(row.phase));
	const pose = (value) => {
		const next = text(value);
		return next === "attack" || next === "hurt" || next === "down" || next === "run" ? next : "idle";
	};
	return {
		id: text(row.id),
		dojo_id: text(row.dojo_id),
		a_id: text(row.a_id),
		b_id: text(row.b_id),
		a_name: text(row.a_name),
		b_name: text(row.b_name),
		a_hp: num(row.a_hp),
		b_hp: num(row.b_hp),
		a_rounds: num(row.a_rounds),
		b_rounds: num(row.b_rounds),
		round_no: num(row.round_no),
		match_no: num(row.match_no),
		word: text(row.word),
		a_typed: text(row.a_typed),
		b_typed: text(row.b_typed),
		last_word: text(row.last_word),
		deadline: num(row.deadline),
		window_ms: num(row.window_ms) || 2400,
		phase,
		until_at: num(row.until_at),
		banner: text(row.banner),
		last_blow: text(row.last_blow),
		a_pose: pose(row.a_pose),
		b_pose: pose(row.b_pose),
		pose_until: num(row.pose_until),
		a_hits: num(row.a_hits),
		b_hits: num(row.b_hits),
		a_clean: num(row.a_clean),
		b_clean: num(row.b_clean),
		a_hurt: num(row.a_hurt),
		b_hurt: num(row.b_hurt),
		board: text(row.board),
		updated_at: num(row.updated_at)
	};
}
function readBoard(raw) {
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw);
		if (!parsed?.a?.slots?.forward?.word || !parsed?.b?.slots?.attack?.word) return null;
		return parsed;
	} catch {
		return null;
	}
}
function beginRound(row, now) {
	return {
		a_hp: 100,
		b_hp: 100,
		a_hurt: 0,
		b_hurt: 0,
		a_typed: "",
		b_typed: "",
		a_pose: "idle",
		b_pose: "idle",
		phase: "intro",
		until_at: now + 2800,
		round_no: row.round_no,
		match_no: row.match_no,
		a_rounds: row.a_rounds,
		b_rounds: row.b_rounds,
		word: "",
		banner: "intro",
		last_blow: "",
		board: "",
		deadline: 0
	};
}
function goLive(row) {
	const board = createLive();
	board.a.hp = row.a_hp > 0 ? row.a_hp : 100;
	board.b.hp = row.b_hp > 0 ? row.b_hp : 100;
	board.a.hits = row.a_hits;
	board.b.hits = row.b_hits;
	board.a.hurt = row.a_hurt > 0;
	board.b.hurt = row.b_hurt > 0;
	return {
		phase: "fight",
		banner: "",
		board: JSON.stringify(board),
		a_pose: "idle",
		b_pose: "idle",
		a_hp: board.a.hp,
		b_hp: board.b.hp,
		deadline: 0
	};
}
function syncBoard(row, board, side, note, now) {
	return {
		board: JSON.stringify(board),
		a_hp: board.a.hp,
		b_hp: board.b.hp,
		a_hits: board.a.hits,
		b_hits: board.b.hits,
		a_hurt: board.a.hurt ? 1 : 0,
		b_hurt: board.b.hurt ? 1 : 0,
		a_pose: poseNow(board.a, now),
		b_pose: poseNow(board.b, now),
		pose_until: Math.max(board.a.poseUntil, board.b.poseUntil),
		last_blow: note === "hit" ? side : note === "trade" ? "both" : row.last_blow
	};
}
function openKo(row, now) {
	let winner = "";
	if (row.b_hp <= 0 && row.a_hp > 0) winner = "a";
	else if (row.a_hp <= 0 && row.b_hp > 0) winner = "b";
	let aRounds = row.a_rounds;
	let bRounds = row.b_rounds;
	let aClean = row.a_clean;
	let bClean = row.b_clean;
	if (winner === "a") {
		aRounds += 1;
		if (!row.a_hurt) aClean += 1;
	}
	if (winner === "b") {
		bRounds += 1;
		if (!row.b_hurt) bClean += 1;
	}
	return {
		a_rounds: aRounds,
		b_rounds: bRounds,
		a_clean: aClean,
		b_clean: bClean,
		last_blow: winner,
		a_pose: row.a_hp <= 0 ? "down" : "idle",
		b_pose: row.b_hp <= 0 ? "down" : "idle",
		phase: "ko",
		until_at: now + 1500,
		banner: "ko"
	};
}
function step(row, now) {
	if (row.phase === "pick") return null;
	if (row.phase === "intro" && now >= row.until_at) return goLive(row);
	if (row.phase === "fight" && (row.a_hp <= 0 || row.b_hp <= 0)) return openKo(row, now);
	if (row.phase === "fight" && !readBoard(row.board)) return goLive(row);
	if (row.phase === "stop" && now >= row.until_at) {
		if (row.a_hp <= 0 || row.b_hp <= 0) return openKo(row, now);
		return goLive(row);
	}
	if (row.phase === "ko" && now >= row.until_at) {
		if (row.a_rounds >= 2 || row.b_rounds >= 2) return {
			phase: "match",
			until_at: now + 1600,
			banner: "match",
			a_pose: row.a_hp <= 0 ? "down" : "idle",
			b_pose: row.b_hp <= 0 ? "down" : "idle"
		};
		const replay = row.a_hp <= 0 && row.b_hp <= 0;
		return beginRound({
			...row,
			round_no: replay ? row.round_no : row.round_no + 1
		}, now);
	}
	if (row.phase === "match" && now >= row.until_at) return beginRound({
		...row,
		match_no: row.match_no + 1,
		round_no: 1,
		a_rounds: 0,
		b_rounds: 0
	}, now);
	return null;
}
var SAVE_KEYS = [
	"a_hp",
	"b_hp",
	"a_rounds",
	"b_rounds",
	"round_no",
	"match_no",
	"word",
	"a_typed",
	"b_typed",
	"last_word",
	"deadline",
	"window_ms",
	"phase",
	"until_at",
	"banner",
	"last_blow",
	"a_pose",
	"b_pose",
	"pose_until",
	"a_hits",
	"b_hits",
	"a_clean",
	"b_clean",
	"a_hurt",
	"b_hurt",
	"board"
];
async function save(sql, id, prevUpdated, row) {
	const now = Date.now();
	const params = SAVE_KEYS.map((key) => row[key]);
	const sets = SAVE_KEYS.map((key, index) => `${key} = $${index + 1}`).join(", ");
	params.push(now, id, prevUpdated);
	return (await sql.query(`update fight_matches set ${sets}, updated_at = $${SAVE_KEYS.length + 1} where id = $${SAVE_KEYS.length + 2} and updated_at = $${SAVE_KEYS.length + 3} returning id`, params)).length ? now : 0;
}
async function readMatch(sql, matchId, dojoId) {
	const rows = await sql`select * from fight_matches where id = ${matchId} and dojo_id = ${dojoId}`;
	return rows[0] ? asMatch(rows[0]) : null;
}
async function advance(sql, row) {
	let current = row;
	let changed = false;
	for (let i = 0; i < 4; i += 1) {
		const next = step(current, Date.now());
		if (!next) break;
		current = {
			...current,
			...next
		};
		changed = true;
	}
	if (!changed) return current;
	const stamp = await save(sql, row.id, row.updated_at, current);
	if (!stamp) return await readMatch(sql, row.id, row.dojo_id) ?? current;
	return {
		...current,
		updated_at: stamp
	};
}
function poseOf(row, who, now) {
	if ((row.phase === "ko" || row.phase === "match") && row[`${who}_hp`] <= 0) return "down";
	if (now < row.pose_until) return row[`${who}_pose`];
	return "idle";
}
function bannerFor(row, side, now) {
	if (row.phase === "intro") {
		const elapsed = now - (row.until_at - 2800);
		if (elapsed < 1100) return "TYPE ME IF YOU CAN";
		if (elapsed < 2e3) return `ROUND ${row.round_no}`;
		return "FIGHT";
	}
	if (row.phase === "stop") return row.last_blow === side ? "HIT" : "TOO SLOW";
	if (row.phase === "ko") {
		if (row.a_hp <= 0 && row.b_hp <= 0) return "CLASH";
		return row.last_blow === side ? "YOU WIN THE ROUND" : "ROUND LOST";
	}
	if (row.phase === "match") return row[`${side}_rounds`] >= 2 ? "YOU WIN" : "NEXT MATCH";
	return "";
}
function snap(row, side, now) {
	const foe = side === "a" ? "b" : "a";
	const board = readBoard(row.board);
	const you = board?.[side];
	const them = board?.[foe];
	const fighting = row.phase === "fight" && Boolean(you && them);
	return {
		phase: row.phase === "pick" ? "intro" : row.phase === "stop" ? "fight" : row.phase,
		youHp: row[`${side}_hp`],
		foeHp: row[`${foe}_hp`],
		youRounds: row[`${side}_rounds`],
		foeRounds: row[`${foe}_rounds`],
		round: row.round_no,
		youPos: you?.pos ?? 0,
		foePos: them?.pos ?? 0,
		youMoves: fighting && you ? movesOf(you) : [],
		foeMoves: fighting && them ? movesOf(them) : [],
		banner: bannerFor(row, side, now),
		youPose: you ? poseNow(you, now) : poseOf(row, side, now),
		foePose: them ? poseNow(them, now) : poseOf(row, foe, now),
		hits: row[`${side}_hits`],
		clean: row[`${side}_clean`]
	};
}
async function nameOf(sql, dojoId, studentId) {
	const row = (await sql`
    select first_name, last_initial from students where id = ${studentId} and dojo_id = ${dojoId}
  `)[0];
	return row ? displayName({
		firstName: row.first_name,
		lastInitial: row.last_initial
	}) : "Ninja";
}
async function claim(sql, dojoId, mine, other) {
	const matchId = randomUUID();
	if (!(await sql.query(`update fight_queue set status = 'matched', match_id = $1, opponent_id = $2 where id = $3 and status = 'waiting' returning id`, [
		matchId,
		other.student_id,
		mine.id
	])).length) return false;
	if (!(await sql.query(`update fight_queue set status = 'matched', match_id = $1, opponent_id = $2 where id = $3 and status = 'waiting' returning id`, [
		matchId,
		mine.student_id,
		other.id
	])).length) {
		await sql`update fight_queue set status = 'waiting', match_id = null, opponent_id = null where id = ${mine.id} and match_id = ${matchId}`;
		return false;
	}
	const now = Date.now();
	const aName = await nameOf(sql, dojoId, mine.student_id);
	const bName = await nameOf(sql, dojoId, other.student_id);
	await sql`
    insert into fight_matches (
      id, dojo_id, a_id, b_id, a_name, b_name, phase, until_at, banner, updated_at
    ) values (
      ${matchId}, ${dojoId}, ${mine.student_id}, ${other.student_id}, ${aName}, ${bName}, 'pick', ${0}, 'pick', ${now}
    )
  `;
	return true;
}
async function present(sql, dojoId, studentId, mine) {
	const mineAt = num(mine.ready_at);
	const youLocked = num(mine.locked_at) > 0;
	const youFighter = text(mine.fighter);
	const base = {
		ok: true,
		queueId: mine.id,
		readyAt: mineAt,
		youLocked,
		youFighter,
		foeLocked: false,
		foeFighter: "",
		foeName: "",
		go: false
	};
	if (mine.status === "bot") return {
		...base,
		status: "bot",
		go: youLocked
	};
	if (mine.status === "matched" && mine.match_id) {
		const foe = (await sql`
      select student_id, fighter, locked_at, status from fight_queue
      where dojo_id = ${dojoId} and match_id = ${mine.match_id}
    `).find((pick) => pick.student_id !== studentId);
		const foeLocked = Boolean(foe && foe.status === "matched" && num(foe.locked_at) > 0);
		const both = youLocked && foeLocked;
		if (both) {
			const now = Date.now();
			await sql`
        update fight_matches
        set phase = 'intro', until_at = ${now + 2800}, banner = 'intro', updated_at = ${now}
        where id = ${mine.match_id} and dojo_id = ${dojoId} and phase = 'pick'
      `;
		}
		const row = await readMatch(sql, mine.match_id, dojoId);
		if (!row) return {
			ok: false,
			reason: "That match closed."
		};
		const side = row.a_id === studentId ? "a" : "b";
		const foeName = side === "a" ? row.b_name : row.a_name;
		return {
			...base,
			status: "matched",
			foeLocked,
			foeFighter: text(foe?.fighter),
			foeName,
			go: both,
			match: {
				matchId: row.id,
				side,
				foeName
			}
		};
	}
	return {
		...base,
		status: "waiting"
	};
}
async function readQueue(sql, dojoId, studentId, queueId) {
	return (await sql`
    select id, student_id, ready_at, status, match_id, fighter, locked_at from fight_queue
    where id = ${queueId} and dojo_id = ${dojoId} and student_id = ${studentId}
  `)[0] ?? null;
}
async function sweep(sql, dojoId, studentId, queueId) {
	const now = Date.now();
	await sql`
    update fight_queue set status = 'closed'
    where dojo_id = ${dojoId} and status = 'waiting' and ready_at < ${now - STALE_MS}
  `;
	const mine = await readQueue(sql, dojoId, studentId, queueId);
	if (!mine) return {
		ok: false,
		reason: "The queue closed."
	};
	if (mine.status === "matched" && mine.match_id) {
		const opp = await sql`
      select status from fight_queue
      where dojo_id = ${dojoId} and match_id = ${mine.match_id} and student_id <> ${studentId}
    `;
		if (!opp[0] || opp[0].status === "closed") {
			await sql`
        update fight_queue set status = 'waiting', match_id = null, opponent_id = null
        where id = ${mine.id} and status = 'matched'
      `;
			mine.status = "waiting";
			mine.match_id = null;
		}
	}
	if (mine.status === "matched" || mine.status === "bot") return present(sql, dojoId, studentId, mine);
	if (mine.status !== "waiting") return {
		ok: false,
		reason: "The queue closed."
	};
	const other = (await sql`
    select id, student_id, ready_at from fight_queue
    where dojo_id = ${dojoId} and status = 'waiting' and student_id <> ${studentId} and ready_at >= ${now - PAIR_MS}
    order by ready_at asc, id asc
  `)[0];
	const mineAt = num(mine.ready_at);
	if (other) {
		const otherAt = num(other.ready_at);
		if (mineAt < otherAt || mineAt === otherAt && mine.id < other.id) {
			if (await claim(sql, dojoId, {
				id: mine.id,
				student_id: studentId
			}, other)) {
				const next = await readQueue(sql, dojoId, studentId, queueId);
				if (next) return present(sql, dojoId, studentId, next);
			}
		}
	}
	if (now - mineAt >= WAIT_MS) {
		if ((await sql.query(`update fight_queue set status = 'bot' where id = $1 and status = 'waiting' returning id`, [queueId])).length) {
			mine.status = "bot";
			return present(sql, dojoId, studentId, mine);
		}
		const again = await readQueue(sql, dojoId, studentId, queueId);
		if (again) return present(sql, dojoId, studentId, again);
	}
	return present(sql, dojoId, studentId, mine);
}
async function dropOpen(sql, dojoId, studentId) {
	const open = await sql`
    select id, status, match_id from fight_queue
    where dojo_id = ${dojoId} and student_id = ${studentId} and status in ('waiting', 'bot', 'matched')
  `;
	for (const row of open) {
		if (row.status === "matched" && row.match_id) {
			const match = await readMatch(sql, row.match_id, dojoId);
			if (match && match.phase !== "pick") continue;
		}
		await sql`update fight_queue set status = 'closed' where id = ${row.id}`;
	}
}
async function ninjaQueueReady(phone, studentId) {
	const board = await ninjaBoard(phone, studentId);
	if (!board.ok) return board;
	if (!beltAllows(board.ninja.belt, "Yellow")) return {
		ok: false,
		reason: "Type Me If You Can opens at Yellow belt."
	};
	if (!board.canStart) return {
		ok: false,
		reason: "The games are resting.",
		note: board.note
	};
	const cave = await matchCaveCode(phone);
	if (!cave.ok) return cave;
	await dropOpen(cave.sql, cave.dojo.id, studentId);
	const id = randomUUID();
	const now = Date.now();
	await cave.sql`
    insert into fight_queue (id, dojo_id, student_id, ready_at, status)
    values (${id}, ${cave.dojo.id}, ${studentId}, ${now}, 'waiting')
  `;
	return sweep(cave.sql, cave.dojo.id, studentId, id);
}
async function ninjaQueuePoll(phone, studentId, queueId) {
	const cave = await matchCaveCode(phone);
	if (!cave.ok) return cave;
	return sweep(cave.sql, cave.dojo.id, studentId, queueId);
}
async function ninjaQueueLock(phone, studentId, queueId, fighter) {
	const cave = await matchCaveCode(phone);
	if (!cave.ok) return cave;
	if (fighter !== "rosie") return {
		ok: false,
		reason: "That fighter is locked."
	};
	const now = Date.now();
	await cave.sql.query(`update fight_queue set fighter = $1, locked_at = $2
     where id = $3 and dojo_id = $4 and student_id = $5 and status in ('waiting', 'matched', 'bot') and locked_at = 0`, [
		fighter,
		now,
		queueId,
		cave.dojo.id,
		studentId
	]);
	return sweep(cave.sql, cave.dojo.id, studentId, queueId);
}
async function ninjaQueueClose(phone, studentId, queueId) {
	const cave = await matchCaveCode(phone);
	if (!cave.ok) return cave;
	const mine = await readQueue(cave.sql, cave.dojo.id, studentId, queueId);
	if (mine?.status === "matched" && mine.match_id) {
		const match = await readMatch(cave.sql, mine.match_id, cave.dojo.id);
		if (!match || match.phase === "pick") await cave.sql`update fight_queue set status = 'closed' where id = ${queueId}`;
	} else if (mine && (mine.status === "waiting" || mine.status === "bot")) await cave.sql`update fight_queue set status = 'closed' where id = ${queueId}`;
	return { ok: true };
}
async function ownedMatch(phone, studentId, matchId) {
	const cave = await matchCaveCode(phone);
	if (!cave.ok) return cave;
	const row = await readMatch(cave.sql, matchId, cave.dojo.id);
	if (!row || row.a_id !== studentId && row.b_id !== studentId) return {
		ok: false,
		reason: "That match closed."
	};
	const side = row.a_id === studentId ? "a" : "b";
	return {
		ok: true,
		sql: cave.sql,
		row,
		side
	};
}
async function ninjaMatchState(phone, studentId, matchId) {
	const owned = await ownedMatch(phone, studentId, matchId);
	if (!owned.ok) return owned;
	return {
		ok: true,
		view: snap(await advance(owned.sql, owned.row), owned.side, Date.now()),
		miss: false
	};
}
async function ninjaMatchType(phone, studentId, matchId, letter) {
	const owned = await ownedMatch(phone, studentId, matchId);
	if (!owned.ok) return owned;
	let row = await advance(owned.sql, owned.row);
	const side = row.a_id === studentId ? "a" : "b";
	const key = letter.toLowerCase();
	const now = Date.now();
	const idle = () => ({
		ok: true,
		view: snap(row, side, Date.now()),
		miss: false,
		shake: "",
		note: ""
	});
	if (row.phase !== "fight" || key.length !== 1) return idle();
	const board = readBoard(row.board) ?? createLive();
	const before = JSON.stringify(board);
	const result = press(board, side, key, now);
	if (JSON.stringify(board) === before) return {
		ok: true,
		view: snap(row, side, now),
		miss: Boolean(result.miss),
		shake: result.miss,
		note: result.note
	};
	let next = {
		...row,
		...syncBoard(row, board, side, result.note, now)
	};
	if (next.a_hp <= 0 || next.b_hp <= 0) next = {
		...next,
		...openKo(next, now)
	};
	const stamp = await save(owned.sql, row.id, row.updated_at, next);
	if (!stamp) {
		const fresh = await readMatch(owned.sql, row.id, row.dojo_id);
		row = fresh ? await advance(owned.sql, fresh) : row;
		if (!fresh || row.phase !== "fight") return {
			ok: true,
			view: snap(row, side, Date.now()),
			miss: false,
			shake: "",
			note: ""
		};
		const retryBoard = readBoard(row.board) ?? createLive();
		const retry = press(retryBoard, side, key, Date.now());
		let retried = {
			...row,
			...syncBoard(row, retryBoard, side, retry.note, Date.now())
		};
		if (retried.a_hp <= 0 || retried.b_hp <= 0) retried = {
			...retried,
			...openKo(retried, Date.now())
		};
		const second = await save(owned.sql, row.id, row.updated_at, retried);
		if (!second) return {
			ok: true,
			view: snap(row, side, Date.now()),
			miss: false,
			shake: "",
			note: ""
		};
		return {
			ok: true,
			view: snap({
				...retried,
				updated_at: second
			}, side, Date.now()),
			miss: Boolean(retry.miss),
			shake: retry.miss,
			note: retry.note
		};
	}
	return {
		ok: true,
		view: snap({
			...next,
			updated_at: stamp
		}, side, now),
		miss: Boolean(result.miss),
		shake: result.miss,
		note: result.note
	};
}
//#endregion
export { ninjaMatchState, ninjaMatchType, ninjaQueueClose, ninjaQueueLock, ninjaQueuePoll, ninjaQueueReady };
