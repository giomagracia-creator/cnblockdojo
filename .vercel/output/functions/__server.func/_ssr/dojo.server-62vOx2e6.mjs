import { a as PAYOUT_GAP_MS, c as periodKey, i as ITEM_PRICE_MAX, l as todayKey, n as CENTER_CODE, o as PIN_LOCK_MS, r as DIRECTOR_MS, s as earnedToday } from "./rules-C78vdps4.mjs";
import { a as displayName, n as BELT_RANK, o as nextBelt, t as BELTS } from "./types-CCDBXf57.mjs";
import { createHash, randomBytes, randomUUID } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/dojo.server-62vOx2e6.js
var _0002_dojo_default = "create table if not exists dojos (\n  id text primary key,\n  code_hash text not null unique,\n  created_at timestamptz not null default now(),\n  week_started bigint not null,\n  display_seen boolean not null default false,\n  sensei_seen boolean not null default false,\n  last_redeem_at bigint not null default 0,\n  director_token_hash text,\n  director_until bigint not null default 0,\n  pin_fails integer not null default 0,\n  pin_lock_until bigint not null default 0\n);\n\ncreate table if not exists students (\n  id text primary key,\n  dojo_id text not null references dojos (id),\n  first_name text not null,\n  last_initial text not null,\n  belt text not null,\n  coins integer not null default 0,\n  week_coins integer not null default 0,\n  archived boolean not null default false,\n  day_key text,\n  day_coins integer not null default 0,\n  last_award_at bigint\n);\n\ncreate index if not exists students_dojo_idx on students (dojo_id);\n\ncreate table if not exists shop_items (\n  id text primary key,\n  dojo_id text not null references dojos (id),\n  name text not null,\n  price integer not null,\n  stock integer not null,\n  image text not null,\n  min_belt text\n);\n\ncreate index if not exists shop_items_dojo_idx on shop_items (dojo_id);\n\ncreate table if not exists dojo_events (\n  id text primary key,\n  dojo_id text not null references dojos (id),\n  kind text not null,\n  at_ms bigint not null,\n  student_name text not null,\n  detail text not null,\n  line text not null,\n  coins integer not null default 0,\n  celebrate_until bigint not null default 0,\n  scene_until bigint not null default 0\n);\n\ncreate index if not exists dojo_events_dojo_idx on dojo_events (dojo_id, at_ms desc);\n";
var _0003_hero_default = "alter table dojos add column if not exists hero text not null default 'boy';\n";
var _0004_undo_default = "create table if not exists dojo_undos (\n  id text primary key,\n  dojo_id text not null references dojos (id),\n  at_ms bigint not null,\n  kind text not null,\n  student_id text not null,\n  item_id text,\n  amount integer not null,\n  event_id text not null,\n  label text not null,\n  action_day text,\n  prev_last_award bigint,\n  prev_last_redeem bigint not null default 0\n);\n\ncreate index if not exists dojo_undos_idx on dojo_undos (dojo_id, at_ms desc);\n";
var _0005_achievements_default = "create table if not exists achievements (\n  id text primary key,\n  dojo_id text not null references dojos (id),\n  cadence text not null,\n  name text not null,\n  coins integer not null,\n  image text not null\n);\n\ncreate index if not exists achievements_dojo_idx on achievements (dojo_id);\n\ncreate table if not exists achievement_claims (\n  id text primary key,\n  dojo_id text not null references dojos (id),\n  achievement_id text not null,\n  student_id text not null,\n  period_key text not null,\n  at_ms bigint not null\n);\n\ncreate unique index if not exists achievement_claims_once on achievement_claims (achievement_id, student_id, period_key);\n\ninsert into achievements (id, dojo_id, cadence, name, coins, image)\nselect d.id || ':a-code', d.id, 'daily', 'Code for 40 minutes', 40, '/art/achievements/code.png'\nfrom dojos d\nwhere not exists (select 1 from achievements a where a.dojo_id = d.id);\n\ninsert into achievements (id, dojo_id, cadence, name, coins, image)\nselect d.id || ':a-friend', d.id, 'weekly', 'Bring a friend', 100, '/art/achievements/friend.png'\nfrom dojos d\nwhere not exists (select 1 from achievements a where a.dojo_id = d.id and a.cadence = 'weekly');\n\ninsert into achievements (id, dojo_id, cadence, name, coins, image)\nselect d.id || ':a-print-friend', d.id, 'weekly', 'Give a 3D print to a friend', 10, '/art/achievements/print.png'\nfrom dojos d\nwhere not exists (select 1 from achievements a where a.id = d.id || ':a-print-friend');\n\ninsert into achievements (id, dojo_id, cadence, name, coins, image)\nselect d.id || ':a-print-teacher', d.id, 'weekly', 'Give a 3D print to your teacher', 30, '/art/achievements/teacher.png'\nfrom dojos d\nwhere not exists (select 1 from achievements a where a.id = d.id || ':a-print-teacher');\n";
var _0006_vault_default = "alter table dojos add column if not exists vault integer not null default 1000;\n\nupdate dojos set vault = 1000;\n\ndelete from achievement_claims;\ndelete from dojo_undos;\ndelete from dojo_events;\ndelete from students;\n";
var _0007_ceremony_default = "alter table dojos add column if not exists ceremony_id text;\nalter table dojos add column if not exists ceremony_name text;\nalter table dojos add column if not exists ceremony_belt text;\n";
var _0008_ledger_default = "alter table dojos add column if not exists last_mined_at bigint not null default 0;\n\nalter table students add column if not exists archived_at bigint;\n\nupdate dojos set last_mined_at = (extract(epoch from now()) * 1000)::bigint where last_mined_at = 0;\n\nupdate students set archived_at = (extract(epoch from now()) * 1000)::bigint where archived = true and archived_at is null;\n";
var _0009_one_name_default = "delete from students\nwhere id in (\n  select s.id\n  from students s\n  join students o\n    on s.dojo_id = o.dojo_id\n   and lower(s.first_name) = lower(o.first_name)\n   and s.last_initial = o.last_initial\n   and s.id <> o.id\n   and (s.coins < o.coins or (s.coins = o.coins and s.id > o.id))\n);\n\ncreate unique index if not exists students_one_name\n  on students (dojo_id, lower(first_name), last_initial);\n";
var _0010_exp_default = "alter table students add column if not exists exp integer not null default 0;\n\nalter table shop_items add column if not exists currency text not null default 'coins';\n\nalter table dojos add column if not exists phone_code text;\nalter table dojos add column if not exists phone_hour text;\nalter table dojos add column if not exists phone_zone text;\n\ncreate table if not exists exp_claims (\n  dojo_id text not null references dojos (id),\n  student_id text not null,\n  item_id text not null,\n  at_ms bigint not null,\n  primary key (dojo_id, student_id, item_id)\n);\n";
var _0011_exp_chest_default = "update shop_items\nset currency = 'exp', stock = 0\nwhere name = 'Treasure Chest' and price = 200 and currency = 'coins';\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({
			"/migrations/0002_dojo.sql": _0002_dojo_default,
			"/migrations/0003_hero.sql": _0003_hero_default,
			"/migrations/0004_undo.sql": _0004_undo_default,
			"/migrations/0005_achievements.sql": _0005_achievements_default,
			"/migrations/0006_vault.sql": _0006_vault_default,
			"/migrations/0007_ceremony.sql": _0007_ceremony_default,
			"/migrations/0008_ledger.sql": _0008_ledger_default,
			"/migrations/0009_one_name.sql": _0009_one_name_default,
			"/migrations/0010_exp.sql": _0010_exp_default,
			"/migrations/0011_exp_chest.sql": _0011_exp_chest_default
		});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
var COIN_LINES = [
	(name, amount) => `${name} just struck gold! +${amount} coins!`,
	(name, amount) => `Ka-ching! The cave paid ${name} +${amount}.`,
	(name, amount) => `Rosie is hopping. +${amount} for ${name}!`,
	(name, amount) => `That's the sound of good code. +${amount}, ${name}!`
];
function coinLine(name, amount) {
	return COIN_LINES[Math.floor(Math.random() * COIN_LINES.length)](name, amount);
}
function welcomeLine(name) {
	return `Welcome to the dojo, ${name}! Grab a pick and stay curious.`;
}
function beltLine(name, belt) {
	return `${name} tied on a ${belt} belt. The code gets sharper from here.`;
}
function redeemLine(name, item) {
	return `${name} cracked the chest and pulled out ${item}!`;
}
function shopLine(item) {
	return `New treasure on the shelf: ${item}. Who's ready?`;
}
function restLine(name) {
	return `Rest easy, ${name}. Rosie will save your spot.`;
}
function renameLine(name) {
	return `Got it. We'll call you ${name}.`;
}
var SEED_STUDENTS = [
	{
		id: "s-priya",
		firstName: "Priya",
		lastInitial: "D",
		belt: "Purple",
		coins: 520,
		exp: 0,
		weekCoins: 80,
		archived: false
	},
	{
		id: "s-luna",
		firstName: "Luna",
		lastInitial: "K",
		belt: "Blue",
		coins: 410,
		exp: 0,
		weekCoins: 60,
		archived: false
	},
	{
		id: "s-sam",
		firstName: "Sam",
		lastInitial: "T",
		belt: "Brown",
		coins: 310,
		exp: 0,
		weekCoins: 45,
		archived: false
	},
	{
		id: "s-jasper",
		firstName: "Jasper",
		lastInitial: "M",
		belt: "Yellow",
		coins: 240,
		exp: 0,
		weekCoins: 50,
		archived: false
	},
	{
		id: "s-aiko",
		firstName: "Aiko",
		lastInitial: "S",
		belt: "Green",
		coins: 180,
		exp: 0,
		weekCoins: 35,
		archived: false
	},
	{
		id: "s-mateo",
		firstName: "Mateo",
		lastInitial: "R",
		belt: "Orange",
		coins: 95,
		exp: 0,
		weekCoins: 25,
		archived: false
	},
	{
		id: "s-eli",
		firstName: "Eli",
		lastInitial: "W",
		belt: "Red",
		coins: 80,
		exp: 0,
		weekCoins: 20,
		archived: false
	},
	{
		id: "s-noah",
		firstName: "Noah",
		lastInitial: "P",
		belt: "White",
		coins: 40,
		exp: 0,
		weekCoins: 15,
		archived: false
	},
	{
		id: "s-quinn",
		firstName: "Quinn",
		lastInitial: "B",
		belt: "Black",
		coins: 12,
		exp: 0,
		weekCoins: 0,
		archived: true
	}
];
var SEED_ITEMS = [
	{
		id: "i-stickers",
		name: "Sticker Pack",
		price: 15,
		currency: "coins",
		stock: 24,
		image: "/art/items/stickers.jpg",
		minBelt: null
	},
	{
		id: "i-patch",
		name: "Code Patch",
		price: 25,
		currency: "coins",
		stock: 12,
		image: "/art/items/patch.jpg",
		minBelt: "Yellow"
	},
	{
		id: "i-key",
		name: "LED Keychain",
		price: 40,
		currency: "coins",
		stock: 8,
		image: "/art/items/keychain.jpg",
		minBelt: null
	},
	{
		id: "i-dragon",
		name: "3D Printed Dragon",
		price: 80,
		currency: "coins",
		stock: 5,
		image: "/art/items/dragon.jpg",
		minBelt: "Green"
	},
	{
		id: "i-figure",
		name: "Mini Figure",
		price: 120,
		currency: "coins",
		stock: 4,
		image: "/art/items/figure.jpg",
		minBelt: "Blue"
	},
	{
		id: "i-chest",
		name: "Treasure Chest",
		price: 200,
		currency: "exp",
		stock: 0,
		image: "/art/items/chest.jpg",
		minBelt: "Purple"
	}
];
var SEED_ACHIEVEMENTS = [
	{
		id: "a-code",
		cadence: "daily",
		name: "Code for 40 minutes",
		coins: 40,
		image: "/art/achievements/code.png"
	},
	{
		id: "a-friend",
		cadence: "weekly",
		name: "Bring a friend",
		coins: 100,
		image: "/art/achievements/friend.png"
	},
	{
		id: "a-print-friend",
		cadence: "weekly",
		name: "Give a 3D print to a friend",
		coins: 10,
		image: "/art/achievements/print.png"
	},
	{
		id: "a-print-teacher",
		cadence: "weekly",
		name: "Give a 3D print to your teacher",
		coins: 30,
		image: "/art/achievements/teacher.png"
	}
];
function seedEvents(now = Date.now()) {
	return [
		{
			id: "e-luna",
			kind: "redeem",
			at: now - 288e4,
			studentName: "Luna K.",
			detail: "Mini Figure",
			line: "Luna K. cracked the chest and pulled out Mini Figure!",
			coins: 120,
			celebrateUntil: 0,
			sceneUntil: 0
		},
		{
			id: "e-jasper",
			kind: "award",
			at: now - 12e5,
			studentName: "Jasper M.",
			detail: "+10 coins",
			line: "Jasper M. just struck gold! +10 coins!",
			coins: 10,
			celebrateUntil: 0,
			sceneUntil: 0
		},
		{
			id: "e-priya",
			kind: "redeem",
			at: now - 48e4,
			studentName: "Priya D.",
			detail: "LED Keychain",
			line: "Priya D. cracked the chest and pulled out LED Keychain!",
			coins: 40,
			celebrateUntil: 0,
			sceneUntil: 0
		}
	];
}
var WEEK_MS = 6048e5;
var SCENE_MS = 6400;
function hashSecret(value) {
	return createHash("sha256").update(value).digest("hex");
}
function normalizeCode(input) {
	const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
	if (raw.length !== 8) return null;
	return `${raw.slice(0, 4)}-${raw.slice(4)}`;
}
function flag(value) {
	return value === true || value === "t" || value === "true" || value === 1;
}
function num(value) {
	const next = Number(value);
	return Number.isFinite(next) ? next : 0;
}
function isBelt(value) {
	return BELTS.includes(value);
}
function beltCase(column) {
	return `case ${column} ${BELTS.map((belt) => `when '${belt}' then ${BELT_RANK[belt]}`).join(" ")} else -1 end`;
}
function mapStudent(row) {
	return {
		id: row.id,
		firstName: row.first_name,
		lastInitial: row.last_initial,
		belt: isBelt(row.belt) ? row.belt : "White",
		coins: num(row.coins),
		exp: num(row.exp),
		weekCoins: num(row.week_coins),
		archived: flag(row.archived),
		dayKey: row.day_key ?? void 0,
		dayCoins: num(row.day_coins),
		lastAwardAt: row.last_award_at == null ? void 0 : num(row.last_award_at)
	};
}
function mapItem(row) {
	return {
		id: row.id,
		name: row.name,
		price: num(row.price),
		currency: row.currency === "exp" ? "exp" : "coins",
		stock: num(row.stock),
		image: row.image,
		minBelt: row.min_belt && isBelt(row.min_belt) ? row.min_belt : null
	};
}
function mapCeremony(row) {
	const id = row.ceremony_id ?? "";
	const studentName = row.ceremony_name ?? "";
	const belt = row.ceremony_belt ?? "";
	if (!id || !studentName || !isBelt(belt)) return null;
	return {
		id,
		studentName,
		belt
	};
}
function mapEvent(row) {
	const kind = row.kind === "redeem" || row.kind === "award" || row.kind === "welcome" || row.kind === "belt" || row.kind === "shop" || row.kind === "rest" || row.kind === "undo" || row.kind === "mine" || row.kind === "return" ? row.kind : "shop";
	return {
		id: row.id,
		kind,
		at: num(row.at_ms),
		studentName: row.student_name,
		detail: row.detail,
		line: row.line,
		coins: num(row.coins),
		celebrateUntil: num(row.celebrate_until),
		sceneUntil: num(row.scene_until)
	};
}
async function findDojo(sql, code) {
	const normalized = normalizeCode(code);
	if (!normalized) return null;
	return (await sql`
    select id, week_started, display_seen, sensei_seen, last_redeem_at, director_token_hash, director_until, pin_fails, pin_lock_until, hero, vault, ceremony_id, ceremony_name, ceremony_belt, phone_code, phone_hour, phone_zone
    from dojos where code_hash = ${hashSecret(normalized)}
  `)[0] ?? null;
}
var MINE_MS = 6e4;
var REST_MS = 2592e6;
async function sweepRested(sql, dojoId) {
	const cutoff = Date.now() - REST_MS;
	const rows = await sql.query(`with due as (
       select id, first_name, last_initial, coins
       from students
       where dojo_id = $1 and archived = true and archived_at is not null and archived_at <= $2 and coins > 0
     )
     update students s
     set coins = 0
     from due
     where s.id = due.id and s.coins > 0
     returning due.id as id, due.first_name as first_name, due.last_initial as last_initial, due.coins as coins`, [dojoId, cutoff]);
	if (!rows.length) return;
	const total = rows.reduce((sum, row) => sum + num(row.coins), 0);
	await sql.query(`update dojos set vault = vault + $1 where id = $2`, [total, dojoId]);
	const now = Date.now();
	for (const row of rows) {
		const name = displayName({
			firstName: row.first_name,
			lastInitial: row.last_initial
		});
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
			sceneUntil: 0
		});
	}
}
async function tickMine(sql, dojoId) {
	const now = Date.now();
	const amount = 10 + Math.floor(Math.random() * 41);
	if (!(await sql.query(`update dojos
     set vault = vault + $1, last_mined_at = $2
     where id = $3 and ($2 - last_mined_at) >= $4
     returning id`, [
		amount,
		now,
		dojoId,
		MINE_MS
	])).length) return;
	await insertEvent(sql, dojoId, {
		id: randomUUID(),
		kind: "mine",
		at: now,
		studentName: "",
		detail: `+${amount}`,
		line: `The mine paid ${amount} coins into the vault.`,
		coins: amount,
		celebrateUntil: 0,
		sceneUntil: 0
	});
}
async function snapshot(sql, dojoId, role = "sensei", zone) {
	const dojo = (await sql`
    select id, week_started, display_seen, sensei_seen, last_redeem_at, director_token_hash, director_until, pin_fails, pin_lock_until, hero, vault, ceremony_id, ceremony_name, ceremony_belt, phone_code, phone_hour, phone_zone
    from dojos where id = ${dojoId}
  `)[0];
	if (!dojo) throw new Error("Dojo missing.");
	let weekStarted = num(dojo.week_started);
	if (Date.now() - weekStarted >= WEEK_MS) {
		weekStarted = Date.now();
		await sql`update dojos set week_started = ${weekStarted} where id = ${dojoId}`;
		await sql`update students set week_coins = 0 where dojo_id = ${dojoId}`;
	}
	await sweepRested(sql, dojoId);
	await tickMine(sql, dojoId);
	const banks = await sql`select vault from dojos where id = ${dojoId}`;
	const students = await sql`
    select id, first_name, last_initial, belt, coins, exp, week_coins, archived, day_key, day_coins, last_award_at
    from students where dojo_id = ${dojoId}
    order by archived, first_name
  `;
	const items = await sql`
    select id, name, price, currency, stock, image, min_belt from shop_items where dojo_id = ${dojoId} order by price, name
  `;
	const achievements = await sql`
    select id, cadence, name, coins, image from achievements where dojo_id = ${dojoId} order by cadence, coins
  `;
	const claims = await sql`
    select achievement_id, student_id, period_key from achievement_claims
    where dojo_id = ${dojoId} and period_key in (${periodKey("daily", weekStarted)}, ${periodKey("weekly", weekStarted)})
  `;
	const events = await sql`
    select id, kind, at_ms, student_name, detail, line, coins, celebrate_until, scene_until
    from dojo_events where dojo_id = ${dojoId} and kind <> 'mine'
    order by at_ms desc limit 30
  `;
	const expClaims = await sql`
    select student_id, item_id from exp_claims where dojo_id = ${dojoId}
  `;
	const pass = await ensurePhoneCode(sql, dojo, role === "display" ? zone : void 0);
	return {
		students: students.map(mapStudent),
		items: items.map(mapItem),
		achievements: achievements.map((row) => ({
			id: row.id,
			cadence: row.cadence === "weekly" ? "weekly" : "daily",
			name: row.name,
			coins: num(row.coins),
			image: row.image
		})),
		claims: claims.map((row) => ({
			achievementId: row.achievement_id,
			studentId: row.student_id,
			periodKey: row.period_key
		})),
		expClaims: expClaims.map((row) => ({
			studentId: row.student_id,
			itemId: row.item_id
		})),
		events: events.map(mapEvent),
		weekStarted,
		displaySeen: flag(dojo.display_seen),
		senseiSeen: flag(dojo.sensei_seen),
		hero: dojo.hero === "girl" ? "girl" : "boy",
		vault: num(banks[0]?.vault ?? dojo.vault ?? 1e3),
		undo: await undoSummary(sql, dojoId),
		ceremony: mapCeremony(dojo),
		phoneCode: role === "display" ? pass.code : "",
		phoneHour: pass.hour,
		phoneUntil: pass.until
	};
}
async function undoSummary(sql, dojoId) {
	const rows = await sql`
    select label from dojo_undos where dojo_id = ${dojoId} order by at_ms desc limit 5
  `;
	if (!rows.length) return null;
	return {
		count: rows.length,
		label: rows[0].label
	};
}
async function pushUndo(sql, row) {
	await sql`
    insert into dojo_undos (
      id, dojo_id, at_ms, kind, student_id, item_id, amount, event_id, label, action_day, prev_last_award, prev_last_redeem
    ) values (
      ${randomUUID()}, ${row.dojoId}, ${Date.now()}, ${row.kind}, ${row.studentId}, ${row.itemId}, ${row.amount}, ${row.eventId},
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
async function undoLast(code, phone = "") {
	const linked = await connected(code, "sensei", phone);
	if (!linked.ok) return linked;
	const { sql, dojo } = linked;
	const row = (await sql`
    select id, kind, student_id, item_id, amount, event_id, label, action_day, prev_last_award, prev_last_redeem
    from dojo_undos where dojo_id = ${dojo.id} order by at_ms desc limit 1
  `)[0];
	if (!row) return {
		ok: false,
		reason: "Nothing to undo."
	};
	const amount = num(row.amount);
	const prevAward = row.prev_last_award == null ? null : num(row.prev_last_award);
	if (row.kind === "award") {
		if (!(await sql.query(`update students
       set coins = coins - $1,
           exp = greatest(0, exp - $1),
           week_coins = greatest(0, week_coins - $1),
           day_coins = case when day_key = $2 then greatest(0, coalesce(day_coins, 0) - $1) else coalesce(day_coins, 0) end,
           last_award_at = $3
       where id = $4 and dojo_id = $5 and coins >= $1
       returning id`, [
			amount,
			row.action_day,
			prevAward,
			row.student_id,
			dojo.id
		])).length) return {
			ok: false,
			reason: "Those coins were already spent."
		};
		await sql`update dojos set vault = vault + ${amount} where id = ${dojo.id}`;
	} else if (row.kind === "achieve") {
		if (!(await sql.query(`update students
       set coins = coins - $1, week_coins = greatest(0, week_coins - $1), exp = greatest(0, exp - $1)
       where id = $2 and dojo_id = $3 and coins >= $1
       returning id`, [
			amount,
			row.student_id,
			dojo.id
		])).length) return {
			ok: false,
			reason: "Those coins were already spent."
		};
		if (row.item_id && row.action_day) await sql`
        delete from achievement_claims
        where dojo_id = ${dojo.id} and achievement_id = ${row.item_id} and student_id = ${row.student_id} and period_key = ${row.action_day}
      `;
		await sql`update dojos set vault = vault + ${amount} where id = ${dojo.id}`;
	} else if (row.kind === "exp") {
		if (row.item_id) await sql`
        delete from exp_claims
        where dojo_id = ${dojo.id} and student_id = ${row.student_id} and item_id = ${row.item_id}
      `;
	} else {
		if (!(await sql.query(`update dojos set vault = vault - $1 where id = $2 and vault >= $1 returning id`, [amount, dojo.id])).length) return {
			ok: false,
			reason: "The vault already paid those coins back out."
		};
		if (!(await sql.query(`update students set coins = coins + $1 where id = $2 and dojo_id = $3 returning id`, [
			amount,
			row.student_id,
			dojo.id
		])).length) {
			await sql`update dojos set vault = vault + ${amount} where id = ${dojo.id}`;
			return {
				ok: false,
				reason: "That ninja is no longer on the roster."
			};
		}
		if (row.item_id) await sql`update shop_items set stock = stock + 1 where id = ${row.item_id} and dojo_id = ${dojo.id}`;
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
		sceneUntil: 0
	});
	return {
		ok: true,
		snapshot: await snapshot(sql, dojo.id)
	};
}
function asHero(value) {
	return value === "girl" ? "girl" : "boy";
}
async function setHero(code, hero, phone = "") {
	const linked = await connected(code, "sensei", phone);
	if (!linked.ok) return linked;
	const next = asHero(hero);
	await linked.sql`update dojos set hero = ${next} where id = ${linked.dojo.id}`;
	return {
		ok: true,
		snapshot: await snapshot(linked.sql, linked.dojo.id)
	};
}
async function markSeen(sql, dojoId, role) {
	if (role === "display") await sql`update dojos set display_seen = true where id = ${dojoId}`;
	else await sql`update dojos set sensei_seen = true where id = ${dojoId}`;
}
async function seedDojo(sql, dojoId, now, demo = false) {
	if (demo) for (const student of SEED_STUDENTS) await sql`
        insert into students (id, dojo_id, first_name, last_initial, belt, coins, week_coins, archived, day_coins, archived_at)
        values (
          ${`${dojoId}:${student.id}`}, ${dojoId}, ${student.firstName}, ${student.lastInitial}, ${student.belt},
          ${student.coins}, ${student.weekCoins}, ${student.archived}, 0, ${student.archived ? now : null}
        )
      `;
	for (const item of SEED_ITEMS) await sql`
      insert into shop_items (id, dojo_id, name, price, stock, image, min_belt, currency)
      values (${`${dojoId}:${item.id}`}, ${dojoId}, ${item.name}, ${item.price}, ${item.stock}, ${item.image}, ${item.minBelt}, ${item.currency})
    `;
	for (const achievement of SEED_ACHIEVEMENTS) await sql`
      insert into achievements (id, dojo_id, cadence, name, coins, image)
      values (${`${dojoId}:${achievement.id}`}, ${dojoId}, ${achievement.cadence}, ${achievement.name}, ${achievement.coins}, ${achievement.image})
    `;
	if (demo) for (const event of seedEvents(now)) await insertEvent(sql, dojoId, {
		...event,
		id: `${dojoId}:${event.id}`
	});
	await sql`update dojos set vault = 1000 where id = ${dojoId}`;
}
async function insertEvent(sql, dojoId, event) {
	await sql`
    insert into dojo_events (id, dojo_id, kind, at_ms, student_name, detail, line, coins, celebrate_until, scene_until)
    values (
      ${event.id}, ${dojoId}, ${event.kind}, ${event.at}, ${event.studentName}, ${event.detail}, ${event.line},
      ${event.coins}, ${event.celebrateUntil}, ${event.sceneUntil}
    )
  `;
}
function scene(input) {
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
		coins: input.coins
	};
}
async function directorOk(sql, dojo, token) {
	if (!token || !dojo.director_token_hash) return false;
	if (num(dojo.director_until) < Date.now()) return false;
	const fresh = (await sql`
    select director_token_hash, director_until from dojos where id = ${dojo.id}
  `)[0];
	if (!fresh?.director_token_hash || num(fresh.director_until) < Date.now()) return false;
	return fresh.director_token_hash === hashSecret(token);
}
async function findNamed(sql, dojoId, firstName, lastInitial, exceptId) {
	const rows = await sql`
    select id, first_name, last_initial, archived
    from students
    where dojo_id = ${dojoId} and last_initial = ${lastInitial}
  `;
	const needle = firstName.trim().toLowerCase();
	return rows.find((row) => row.id !== exceptId && row.first_name.trim().toLowerCase() === needle) ?? null;
}
function nameBlockReason(firstName, lastInitial, archived) {
	const name = displayName({
		firstName,
		lastInitial
	});
	if (archived) return `${name} is already on this roster, just resting. Bring that ninja back. A new card would give them another 75 coins.`;
	return `${name} is already in this cave. Pick that ninja. A second card would give them another 75 coins.`;
}
var PHONE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function normalizePhone(input) {
	return (input ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}
function hourStamp(zone, now = Date.now()) {
	const part = zonedParts(zone, now);
	const month = String(part.month).padStart(2, "0");
	const day = String(part.day).padStart(2, "0");
	const hour = String(part.hour).padStart(2, "0");
	return `${part.year}-${month}-${day}-${hour}`;
}
function nextHourLabel(zone, now = Date.now()) {
	const next = (zonedParts(zone, now).hour + 1) % 24;
	return `${next % 12 || 12}:00 ${next < 12 ? "AM" : "PM"}`;
}
function makePhoneCode() {
	const bytes = randomBytes(4);
	return Array.from(bytes, (byte) => PHONE_ALPHABET[byte % 32]).join("");
}
async function ensurePhoneCode(sql, dojo, zoneInput) {
	const zone = cleanZone(zoneInput || dojo.phone_zone || "UTC");
	const hour = hourStamp(zone);
	if (dojo.phone_code && dojo.phone_hour === hour) {
		if (dojo.phone_zone !== zone) {
			await sql`update dojos set phone_zone = ${zone} where id = ${dojo.id}`;
			dojo.phone_zone = zone;
		}
		return {
			code: dojo.phone_code,
			hour,
			until: nextHourLabel(zone),
			zone
		};
	}
	const code = makePhoneCode();
	await sql`update dojos set phone_code = ${code}, phone_hour = ${hour}, phone_zone = ${zone} where id = ${dojo.id}`;
	dojo.phone_code = code;
	dojo.phone_hour = hour;
	dojo.phone_zone = zone;
	return {
		code,
		hour,
		until: nextHourLabel(zone),
		zone
	};
}
async function connected(code, role, phone, zone) {
	if (normalizeCode(code) !== "CNCE-DOJO") return {
		ok: false,
		reason: "This center has one cave."
	};
	const sql = await getSql();
	const dojo = await findDojo(sql, code);
	if (!dojo) return {
		ok: false,
		reason: "That code doesn't match a dojo."
	};
	const pass = await ensurePhoneCode(sql, dojo, role === "display" ? zone : void 0);
	if (role === "sensei" && normalizePhone(phone) !== pass.code) return {
		ok: false,
		reason: "Read the phone code on the cave.",
		phone: true
	};
	await markSeen(sql, dojo.id, role);
	return {
		ok: true,
		sql,
		dojo,
		snapshot: await snapshot(sql, dojo.id, role, role === "display" ? zone : void 0)
	};
}
async function openDojo(role, zone, phone) {
	const sql = await getSql();
	let dojo = await findDojo(sql, CENTER_CODE);
	if (!dojo) {
		const latest = (await sql`select id from dojos order by created_at desc limit 1`)[0];
		if (latest) {
			try {
				await sql`update dojos set code_hash = ${hashSecret(CENTER_CODE)} where id = ${latest.id}`;
			} catch {}
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
		} catch {}
		dojo = await findDojo(sql, CENTER_CODE);
	}
	if (!dojo) return {
		ok: false,
		reason: "The cave couldn't open. Try again."
	};
	if (role === "sensei") {
		const pass = await ensurePhoneCode(sql, dojo);
		if (normalizePhone(phone) !== pass.code) return {
			ok: false,
			reason: "Read the phone code on the cave.",
			phone: true
		};
	}
	await markSeen(sql, dojo.id, role);
	return {
		ok: true,
		code: CENTER_CODE,
		snapshot: await snapshot(sql, dojo.id, role, role === "display" ? zone : void 0)
	};
}
async function joinDojo(code, role, phone, zone) {
	const normalized = normalizeCode(code);
	if (!normalized) return {
		ok: false,
		reason: "Enter the 8-character dojo code."
	};
	const linked = await connected(normalized, role, phone, zone);
	if (!linked.ok) return linked;
	return {
		ok: true,
		code: normalized,
		snapshot: linked.snapshot
	};
}
async function pullDojo(code, role, phone, zone) {
	const linked = await connected(code, role, phone, zone);
	if (!linked.ok) return linked;
	return {
		ok: true,
		snapshot: linked.snapshot
	};
}
async function unlockDirector(code, pin, phone = "") {
	const linked = await connected(code, "sensei", phone);
	if (!linked.ok) return linked;
	const { sql, dojo } = linked;
	const now = Date.now();
	const lockUntil = num(dojo.pin_lock_until);
	if (lockUntil > now) return {
		ok: false,
		reason: `Pad locked. Try again in ${Math.ceil((lockUntil - now) / 1e3)}s.`,
		lockUntil
	};
	if (pin !== "010125") {
		const fails = num(dojo.pin_fails) + 1;
		if (fails >= 5) {
			const until = now + PIN_LOCK_MS;
			await sql`update dojos set pin_fails = 0, pin_lock_until = ${until} where id = ${dojo.id}`;
			return {
				ok: false,
				reason: "Too many tries. The pad locked for 30 seconds.",
				lockUntil: until
			};
		}
		await sql`update dojos set pin_fails = ${fails} where id = ${dojo.id}`;
		return {
			ok: false,
			reason: "Wrong pin.",
			lockUntil: 0
		};
	}
	const token = randomBytes(24).toString("hex");
	const until = now + DIRECTOR_MS;
	await sql`
    update dojos
    set director_token_hash = ${hashSecret(token)}, director_until = ${until}, pin_fails = 0, pin_lock_until = 0
    where id = ${dojo.id}
  `;
	return {
		ok: true,
		token,
		until
	};
}
async function awardCoins(code, studentId, amount, phone = "") {
	const gain = Math.floor(amount);
	if (!Number.isFinite(gain) || gain <= 0) return {
		ok: false,
		reason: "Enter a coin amount."
	};
	if (gain > 25) return {
		ok: false,
		reason: `Payouts stop at 25 coins.`
	};
	const linked = await connected(code, "sensei", phone);
	if (!linked.ok) return linked;
	const { sql, dojo } = linked;
	const rows = await sql`
    select id, first_name, last_initial, belt, coins, exp, week_coins, archived, day_key, day_coins, last_award_at
    from students where id = ${studentId} and dojo_id = ${dojo.id} and archived = false
  `;
	const student = rows[0] ? mapStudent(rows[0]) : null;
	if (!student) return {
		ok: false,
		reason: "Pick an active ninja."
	};
	const now = Date.now();
	const today = earnedToday(student, now);
	if (today >= 75) return {
		ok: false,
		reason: `${displayName(student)} already earned 75 coins today.`
	};
	if (today + gain > 75) return {
		ok: false,
		reason: `Only ${75 - today} coins left for ${displayName(student)} today.`
	};
	if (student.lastAwardAt && now - student.lastAwardAt < 15e3) return {
		ok: false,
		reason: `Wait ${Math.ceil((PAYOUT_GAP_MS - (now - student.lastAwardAt)) / 1e3)}s before paying ${displayName(student)} again.`
	};
	if (num(dojo.vault) < gain) return {
		ok: false,
		reason: `The vault only has ${num(dojo.vault)} coins left.`
	};
	const name = displayName(student);
	const line = coinLine(name, gain);
	const eventId = randomUUID();
	if (!(await sql.query(`with bank as (
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
     returning id`, [
		gain,
		todayKey(now),
		now,
		studentId,
		dojo.id,
		15e3,
		75,
		eventId,
		name,
		`+${gain} coins`,
		line,
		now + SCENE_MS
	])).length) return {
		ok: false,
		reason: "That payout just missed. Try again."
	};
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
		prevLastRedeem: num(dojo.last_redeem_at)
	});
	return {
		ok: true,
		snapshot: await snapshot(sql, dojo.id)
	};
}
async function redeemItem(code, studentId, itemId, phone = "") {
	const linked = await connected(code, "sensei", phone);
	if (!linked.ok) return linked;
	const { sql, dojo } = linked;
	const students = await sql`
    select id, first_name, last_initial, belt, coins, exp, week_coins, archived, day_key, day_coins, last_award_at
    from students where id = ${studentId} and dojo_id = ${dojo.id} and archived = false
  `;
	const items = await sql`
    select id, name, price, currency, stock, image, min_belt from shop_items where id = ${itemId} and dojo_id = ${dojo.id}
  `;
	const student = students[0] ? mapStudent(students[0]) : null;
	const item = items[0] ? mapItem(items[0]) : null;
	if (!student) return {
		ok: false,
		reason: "Pick an active ninja."
	};
	if (!item) return {
		ok: false,
		reason: "That prize is no longer in the shop."
	};
	if (item.minBelt && BELT_RANK[student.belt] < BELT_RANK[item.minBelt]) return {
		ok: false,
		reason: `Needs a ${item.minBelt} belt or higher.`
	};
	const now = Date.now();
	const name = displayName(student);
	const eventId = randomUUID();
	if (item.currency === "exp") {
		if (student.exp < item.price) return {
			ok: false,
			reason: "Not enough EXP."
		};
		const minRank = item.minBelt ? BELT_RANK[item.minBelt] : 0;
		if (!(await sql.query(`with ok as (
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
       returning student_id`, [
			studentId,
			dojo.id,
			item.price,
			minRank,
			itemId,
			now
		])).length) return {
			ok: false,
			reason: "Already claimed."
		};
		await insertEvent(sql, dojo.id, {
			id: eventId,
			kind: "redeem",
			at: now,
			studentName: name,
			detail: item.name,
			line: `${name} claimed ${item.name} with EXP.`,
			coins: 0,
			celebrateUntil: now + 5600,
			sceneUntil: now + SCENE_MS
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
			prevLastRedeem: num(dojo.last_redeem_at)
		});
		return {
			ok: true,
			snapshot: await snapshot(sql, dojo.id)
		};
	}
	if (item.stock <= 0) return {
		ok: false,
		reason: "Out of stock."
	};
	if (student.coins < item.price) return {
		ok: false,
		reason: "Not enough coins."
	};
	const minRank = item.minBelt ? BELT_RANK[item.minBelt] : 0;
	if (!(await sql.query(`with gate as (
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
     returning id`, [
		now,
		dojo.id,
		studentId,
		itemId,
		minRank,
		eventId,
		name,
		redeemLine(name, item.name),
		now + 5600,
		now + SCENE_MS
	])).length) return {
		ok: false,
		reason: "That redeem just went through."
	};
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
		prevLastRedeem: num(dojo.last_redeem_at)
	});
	return {
		ok: true,
		snapshot: await snapshot(sql, dojo.id)
	};
}
async function claimAchievement(code, studentId, achievementId, phone = "") {
	const linked = await connected(code, "sensei", phone);
	if (!linked.ok) return linked;
	const { sql, dojo } = linked;
	const students = await sql`
    select id, first_name, last_initial, belt, coins, exp, week_coins, archived, day_key, day_coins, last_award_at
    from students where id = ${studentId} and dojo_id = ${dojo.id} and archived = false
  `;
	const achievements = await sql`
    select id, cadence, name, coins from achievements where id = ${achievementId} and dojo_id = ${dojo.id}
  `;
	const student = students[0] ? mapStudent(students[0]) : null;
	const achievement = achievements[0];
	if (!student) return {
		ok: false,
		reason: "Pick an active ninja."
	};
	if (!achievement) return {
		ok: false,
		reason: "That achievement is gone."
	};
	const cadence = achievement.cadence === "weekly" ? "weekly" : "daily";
	const coins = num(achievement.coins);
	if (num(dojo.vault) < coins) return {
		ok: false,
		reason: `The vault only has ${num(dojo.vault)} coins left.`
	};
	const now = Date.now();
	const key = periodKey(cadence, num(dojo.week_started), now);
	const name = displayName(student);
	const eventId = randomUUID();
	const claimId = randomUUID();
	if (!(await sql.query(`with bank as (
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
     returning id`, [
		claimId,
		dojo.id,
		achievementId,
		studentId,
		key,
		now,
		coins,
		eventId,
		name,
		`+${coins} coins`,
		`${name} finished ${achievement.name}.`,
		now + SCENE_MS
	])).length) return {
		ok: false,
		reason: cadence === "daily" ? "Already given today." : "Already given this week."
	};
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
		prevLastRedeem: num(dojo.last_redeem_at)
	});
	return {
		ok: true,
		snapshot: await snapshot(sql, dojo.id)
	};
}
function cleanAchievement(input) {
	const coins = Math.floor(input.coins);
	return {
		cadence: input.cadence === "weekly" ? "weekly" : "daily",
		name: input.name.trim().slice(0, 48),
		coins: Math.min(500, Math.max(1, Number.isFinite(coins) ? coins : 1)),
		image: input.image.trim().slice(0, 4e5) || "/art/achievements/code.png"
	};
}
async function addAchievement(code, input, token, phone = "") {
	const linked = await connected(code, "sensei", phone);
	if (!linked.ok) return linked;
	if (!await directorOk(linked.sql, linked.dojo, token)) return {
		ok: false,
		reason: "The director pin is required."
	};
	const next = cleanAchievement(input);
	if (next.name.length < 2) return {
		ok: false,
		reason: "Name the achievement."
	};
	const id = randomUUID();
	await linked.sql`
    insert into achievements (id, dojo_id, cadence, name, coins, image)
    values (${id}, ${linked.dojo.id}, ${next.cadence}, ${next.name}, ${next.coins}, ${next.image})
  `;
	return {
		ok: true,
		id,
		snapshot: await snapshot(linked.sql, linked.dojo.id)
	};
}
async function updateAchievement(code, achievementId, patch, token, phone = "") {
	const linked = await connected(code, "sensei", phone);
	if (!linked.ok) return linked;
	if (!await directorOk(linked.sql, linked.dojo, token)) return {
		ok: false,
		reason: "The director pin is required."
	};
	const prev = (await linked.sql`
    select id, cadence, name, coins, image from achievements where id = ${achievementId} and dojo_id = ${linked.dojo.id}
  `)[0];
	if (!prev) return {
		ok: false,
		reason: "That achievement is gone."
	};
	const next = cleanAchievement({
		cadence: patch.cadence ?? prev.cadence,
		name: patch.name ?? prev.name,
		coins: patch.coins ?? num(prev.coins),
		image: patch.image ?? prev.image
	});
	if (next.name.length < 2) return {
		ok: false,
		reason: "Name the achievement."
	};
	await linked.sql`
    update achievements set cadence = ${next.cadence}, name = ${next.name}, coins = ${next.coins}, image = ${next.image}
    where id = ${achievementId} and dojo_id = ${linked.dojo.id}
  `;
	return {
		ok: true,
		snapshot: await snapshot(linked.sql, linked.dojo.id)
	};
}
async function removeAchievement(code, achievementId, token, phone = "") {
	const linked = await connected(code, "sensei", phone);
	if (!linked.ok) return linked;
	if (!await directorOk(linked.sql, linked.dojo, token)) return {
		ok: false,
		reason: "The director pin is required."
	};
	await linked.sql`delete from achievement_claims where achievement_id = ${achievementId} and dojo_id = ${linked.dojo.id}`;
	await linked.sql`delete from achievements where id = ${achievementId} and dojo_id = ${linked.dojo.id}`;
	return {
		ok: true,
		snapshot: await snapshot(linked.sql, linked.dojo.id)
	};
}
async function addStudent(code, input, token, phone = "") {
	const firstName = input.firstName.trim().slice(0, 24);
	const lastInitial = input.lastInitial.trim().slice(0, 1).toUpperCase();
	if (firstName.length < 1) return {
		ok: false,
		reason: "First name is required."
	};
	if (!/^[A-Z]$/.test(lastInitial)) return {
		ok: false,
		reason: "Use a single last initial."
	};
	if (!isBelt(input.belt)) return {
		ok: false,
		reason: "Pick a belt."
	};
	const linked = await connected(code, "sensei", phone);
	if (!linked.ok) return linked;
	const taken = await findNamed(linked.sql, linked.dojo.id, firstName, lastInitial);
	if (taken) return {
		ok: false,
		reason: nameBlockReason(taken.first_name, taken.last_initial, flag(taken.archived))
	};
	const director = await directorOk(linked.sql, linked.dojo, token);
	const coins = Math.min(director ? 500 : 10, Math.max(0, Math.floor(input.coins) || 0));
	if (coins > 0 && num(linked.dojo.vault) < coins) return {
		ok: false,
		reason: `The vault only has ${num(linked.dojo.vault)} coins left.`
	};
	const now = Date.now();
	const id = randomUUID();
	const student = {
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
		lastAwardAt: coins > 0 ? now : void 0
	};
	if (coins > 0) {
		if (!(await linked.sql.query(`update dojos set vault = vault - $1 where id = $2 and vault >= $1 returning id`, [coins, linked.dojo.id])).length) return {
			ok: false,
			reason: `The vault only has ${num(linked.dojo.vault)} coins left.`
		};
	}
	try {
		await linked.sql`
      insert into students (id, dojo_id, first_name, last_initial, belt, coins, exp, week_coins, archived, day_key, day_coins, last_award_at)
      values (
        ${id}, ${linked.dojo.id}, ${firstName}, ${lastInitial}, ${input.belt}, ${coins}, ${coins}, 0, false,
        ${todayKey(now)}, ${coins}, ${coins > 0 ? now : null}
      )
    `;
	} catch {
		if (coins > 0) await linked.sql`update dojos set vault = vault + ${coins} where id = ${linked.dojo.id}`;
		const raced = await findNamed(linked.sql, linked.dojo.id, firstName, lastInitial);
		if (raced) return {
			ok: false,
			reason: nameBlockReason(raced.first_name, raced.last_initial, flag(raced.archived))
		};
		return {
			ok: false,
			reason: "The ninja didn't join. Try again."
		};
	}
	const named = displayName(student);
	await insertEvent(linked.sql, linked.dojo.id, scene({
		kind: "welcome",
		studentName: named,
		detail: input.belt,
		line: welcomeLine(named),
		coins
	}));
	return {
		ok: true,
		id,
		snapshot: await snapshot(linked.sql, linked.dojo.id)
	};
}
async function updateStudent(code, studentId, patch, token, phone = "") {
	const linked = await connected(code, "sensei", phone);
	if (!linked.ok) return linked;
	const rows = await linked.sql`
    select id, first_name, last_initial, belt, coins, exp, week_coins, archived, day_key, day_coins, last_award_at
    from students where id = ${studentId} and dojo_id = ${linked.dojo.id}
  `;
	const prev = rows[0] ? mapStudent(rows[0]) : null;
	if (!prev) return {
		ok: false,
		reason: "That ninja is gone."
	};
	const director = await directorOk(linked.sql, linked.dojo, token);
	const firstName = patch.firstName !== void 0 ? patch.firstName.trim().slice(0, 24) : prev.firstName;
	const lastInitial = patch.lastInitial !== void 0 ? patch.lastInitial.trim().slice(0, 1).toUpperCase() : prev.lastInitial;
	if (firstName.length < 1) return {
		ok: false,
		reason: "First name is required."
	};
	if (!/^[A-Z]$/.test(lastInitial)) return {
		ok: false,
		reason: "Use a single last initial."
	};
	const belt = patch.belt !== void 0 ? patch.belt : prev.belt;
	if (!isBelt(belt)) return {
		ok: false,
		reason: "Pick a belt."
	};
	if (firstName.trim().toLowerCase() !== prev.firstName.trim().toLowerCase() || lastInitial !== prev.lastInitial) {
		const taken = await findNamed(linked.sql, linked.dojo.id, firstName, lastInitial, prev.id);
		if (taken) return {
			ok: false,
			reason: nameBlockReason(taken.first_name, taken.last_initial, flag(taken.archived))
		};
	}
	let coins = prev.coins;
	if (patch.coins !== void 0 && Math.floor(patch.coins) !== prev.coins) {
		if (!director) return {
			ok: false,
			reason: "Balance corrections need the director pin."
		};
		coins = Math.max(0, Math.min(9999, Math.floor(patch.coins)));
	}
	const delta = coins - prev.coins;
	if (delta > 0) {
		if (!(await linked.sql.query(`update dojos set vault = vault - $1 where id = $2 and vault >= $1 returning id`, [delta, linked.dojo.id])).length) return {
			ok: false,
			reason: `The vault only has ${num(linked.dojo.vault)} coins left.`
		};
	} else if (delta < 0) await linked.sql`update dojos set vault = vault + ${-delta} where id = ${linked.dojo.id}`;
	const archived = patch.archived !== void 0 ? patch.archived : prev.archived;
	const stamp = Date.now();
	const archivedAt = archived && !prev.archived ? stamp : !archived && prev.archived ? null : -1;
	await linked.sql`
    update students
    set first_name = ${firstName}, last_initial = ${lastInitial}, belt = ${belt}, coins = ${coins}, archived = ${archived},
        archived_at = case when ${archivedAt} = ${-1} then archived_at else ${archivedAt} end
    where id = ${studentId} and dojo_id = ${linked.dojo.id}
  `;
	const next = {
		...prev,
		firstName,
		lastInitial,
		belt,
		coins,
		archived
	};
	const name = displayName(next);
	let event = null;
	if (archived && !prev.archived) event = scene({
		kind: "rest",
		studentName: name,
		detail: "archived",
		line: restLine(name),
		coins: 0
	});
	else if (belt !== prev.belt) event = scene({
		kind: "belt",
		studentName: name,
		detail: belt,
		line: beltLine(name, belt),
		coins: 0
	});
	else if (name !== displayName(prev)) event = scene({
		kind: "welcome",
		studentName: name,
		detail: "rename",
		line: renameLine(name),
		coins: 0
	});
	if (event) await insertEvent(linked.sql, linked.dojo.id, event);
	return {
		ok: true,
		snapshot: await snapshot(linked.sql, linked.dojo.id)
	};
}
async function promoteBelt(code, studentId, phone = "") {
	const linked = await connected(code, "sensei", phone);
	if (!linked.ok) return linked;
	const rows = await linked.sql`
    select id, first_name, last_initial, belt, coins, exp, week_coins, archived, day_key, day_coins, last_award_at
    from students where id = ${studentId} and dojo_id = ${linked.dojo.id}
  `;
	const prev = rows[0] ? mapStudent(rows[0]) : null;
	if (!prev) return {
		ok: false,
		reason: "That ninja is gone."
	};
	if (prev.archived) return {
		ok: false,
		reason: "That ninja is resting."
	};
	const upcoming = nextBelt(prev.belt);
	if (!upcoming) return {
		ok: false,
		reason: "Already at gold."
	};
	const name = displayName(prev);
	const ceremonyId = randomUUID();
	const now = Date.now();
	if (!(await linked.sql.query(`with promoted as (
       update students set belt = $1
       where id = $2 and dojo_id = $3 and archived = false
       returning id
     )
     update dojos
     set ceremony_id = $4, ceremony_name = $5, ceremony_belt = $1
     where id = $3 and exists (select 1 from promoted)
     returning id`, [
		upcoming,
		studentId,
		linked.dojo.id,
		ceremonyId,
		name
	])).length) return {
		ok: false,
		reason: "That ninja is resting."
	};
	await insertEvent(linked.sql, linked.dojo.id, {
		id: randomUUID(),
		kind: "belt",
		at: now,
		studentName: name,
		detail: upcoming,
		line: beltLine(name, upcoming),
		coins: 0,
		celebrateUntil: 0,
		sceneUntil: 0
	});
	return {
		ok: true,
		snapshot: await snapshot(linked.sql, linked.dojo.id)
	};
}
async function dismissCeremony(code, ceremonyId) {
	const linked = await connected(code, "display");
	if (!linked.ok) return linked;
	if (!ceremonyId) return {
		ok: false,
		reason: "No ceremony to close."
	};
	await linked.sql`
    update dojos
    set ceremony_id = null, ceremony_name = null, ceremony_belt = null
    where id = ${linked.dojo.id} and ceremony_id = ${ceremonyId}
  `;
	return {
		ok: true,
		snapshot: await snapshot(linked.sql, linked.dojo.id)
	};
}
function cleanItem(input) {
	const currency = input.currency === "exp" ? "exp" : "coins";
	return {
		name: input.name.trim().slice(0, 40),
		currency,
		price: Math.min(ITEM_PRICE_MAX, Math.max(1, Math.floor(input.price) || 1)),
		stock: currency === "exp" ? 0 : Math.min(99, Math.max(0, Math.floor(input.stock) || 0)),
		image: input.image.slice(0, 5e5),
		minBelt: input.minBelt && isBelt(input.minBelt) ? input.minBelt : null
	};
}
async function addItem(code, input, token, phone = "") {
	const linked = await connected(code, "sensei", phone);
	if (!linked.ok) return linked;
	if (!await directorOk(linked.sql, linked.dojo, token)) return {
		ok: false,
		reason: "The director pin is required."
	};
	const item = cleanItem(input);
	if (item.name.length < 1) return {
		ok: false,
		reason: "Name the prize."
	};
	if (!item.image) return {
		ok: false,
		reason: "Add a picture."
	};
	const id = randomUUID();
	await linked.sql`
    insert into shop_items (id, dojo_id, name, price, stock, image, min_belt, currency)
    values (${id}, ${linked.dojo.id}, ${item.name}, ${item.price}, ${item.stock}, ${item.image}, ${item.minBelt}, ${item.currency})
  `;
	await insertEvent(linked.sql, linked.dojo.id, scene({
		kind: "shop",
		studentName: "",
		detail: item.name,
		line: shopLine(item.name),
		coins: item.price
	}));
	return {
		ok: true,
		id,
		snapshot: await snapshot(linked.sql, linked.dojo.id)
	};
}
async function updateItem(code, itemId, patch, token, phone = "") {
	const linked = await connected(code, "sensei", phone);
	if (!linked.ok) return linked;
	if (!await directorOk(linked.sql, linked.dojo, token)) return {
		ok: false,
		reason: "The director pin is required."
	};
	const rows = await linked.sql`select id, name, price, currency, stock, image, min_belt from shop_items where id = ${itemId} and dojo_id = ${linked.dojo.id}`;
	const prev = rows[0] ? mapItem(rows[0]) : null;
	if (!prev) return {
		ok: false,
		reason: "That prize is gone."
	};
	const next = cleanItem({
		name: patch.name ?? prev.name,
		price: patch.price ?? prev.price,
		stock: patch.stock ?? prev.stock,
		image: patch.image ?? prev.image,
		minBelt: patch.minBelt === void 0 ? prev.minBelt : patch.minBelt,
		currency: patch.currency === void 0 ? prev.currency : patch.currency
	});
	if (next.name.length < 1) return {
		ok: false,
		reason: "Name the prize."
	};
	await linked.sql`
    update shop_items set name = ${next.name}, price = ${next.price}, stock = ${next.stock}, image = ${next.image}, min_belt = ${next.minBelt}, currency = ${next.currency}
    where id = ${itemId} and dojo_id = ${linked.dojo.id}
  `;
	return {
		ok: true,
		snapshot: await snapshot(linked.sql, linked.dojo.id)
	};
}
async function removeItem(code, itemId, token, phone = "") {
	const linked = await connected(code, "sensei", phone);
	if (!linked.ok) return linked;
	if (!await directorOk(linked.sql, linked.dojo, token)) return {
		ok: false,
		reason: "The director pin is required."
	};
	const item = (await linked.sql`select id, name, price, currency, stock, image, min_belt from shop_items where id = ${itemId} and dojo_id = ${linked.dojo.id}`)[0];
	if (!item) return {
		ok: false,
		reason: "That prize is gone."
	};
	await linked.sql`delete from shop_items where id = ${itemId} and dojo_id = ${linked.dojo.id}`;
	await linked.sql`delete from exp_claims where item_id = ${itemId} and dojo_id = ${linked.dojo.id}`;
	await insertEvent(linked.sql, linked.dojo.id, scene({
		kind: "shop",
		studentName: "",
		detail: item.name,
		line: `${item.name} left the shop. On to the next find.`,
		coins: 0
	}));
	return {
		ok: true,
		snapshot: await snapshot(linked.sql, linked.dojo.id)
	};
}
async function restoreDemo(code, token, phone = "") {
	const linked = await connected(code, "sensei", phone);
	if (!linked.ok) return linked;
	if (!await directorOk(linked.sql, linked.dojo, token)) return {
		ok: false,
		reason: "The director pin is required."
	};
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
	return {
		ok: true,
		snapshot: await snapshot(linked.sql, linked.dojo.id)
	};
}
function cleanZone(input) {
	const zone = input.trim();
	if (!zone || zone.length > 80) return "UTC";
	try {
		Intl.DateTimeFormat("en-US", { timeZone: zone }).format(0);
		return zone;
	} catch {
		return "UTC";
	}
}
function zonedParts(timeZone, instant) {
	const fmt = new Intl.DateTimeFormat("en-US", {
		timeZone,
		hourCycle: "h23",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit"
	});
	const bag = {};
	for (const part of fmt.formatToParts(instant)) bag[part.type] = part.value;
	return {
		year: Number(bag.year),
		month: Number(bag.month),
		day: Number(bag.day),
		hour: Number(bag.hour) % 24,
		minute: Number(bag.minute),
		second: Number(bag.second)
	};
}
function localMidnight(timeZone, year, month, day) {
	let utc = Date.UTC(year, month - 1, day);
	const target = utc;
	for (let i = 0; i < 4; i++) {
		const part = zonedParts(timeZone, utc);
		const shown = Date.UTC(part.year, part.month - 1, part.day, part.hour, part.minute, part.second);
		utc += target - shown;
	}
	return utc;
}
function dayWindow(timeZone, now) {
	const part = zonedParts(timeZone, now);
	const start = localMidnight(timeZone, part.year, part.month, part.day);
	const next = new Date(Date.UTC(part.year, part.month - 1, part.day));
	next.setUTCDate(next.getUTCDate() + 1);
	return {
		start,
		end: localMidnight(timeZone, next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate())
	};
}
function coinText(value) {
	return value.toLocaleString("en-US");
}
async function dayLedger(code, timeZone, phone = "") {
	const linked = await connected(code, "sensei", phone);
	if (!linked.ok) return linked;
	const zone = cleanZone(timeZone);
	const now = Date.now();
	const { start, end } = dayWindow(zone, now);
	const events = await linked.sql`
    select id, kind, at_ms, student_name, detail, line, coins, celebrate_until, scene_until
    from dojo_events
    where dojo_id = ${linked.dojo.id} and at_ms >= ${start} and at_ms < ${end}
    order by at_ms asc
    limit 4000
  `;
	const label = new Intl.DateTimeFormat("en-US", {
		timeZone: zone,
		weekday: "long",
		month: "short",
		day: "numeric"
	}).format(now);
	const clock = new Intl.DateTimeFormat("en-US", {
		timeZone: zone,
		hour: "numeric",
		minute: "2-digit"
	});
	const book = events.filter((event) => event.kind !== "mine");
	const mined = events.filter((event) => event.kind === "mine");
	const sumKind = (kind) => events.reduce((sum, event) => sum + (event.kind === kind ? num(event.coins) : 0), 0);
	const handouts = events.filter((event) => event.kind === "redeem");
	const active = linked.snapshot.students.filter((student) => !student.archived);
	const holding = linked.snapshot.students.filter((student) => student.archived && student.coins > 0);
	const transactions = book.length ? book.map((event) => `${clock.format(num(event.at_ms))}  ${event.line}`).join("\n") : "No desk activity yet.";
	const handout = handouts.length ? handouts.map((event) => num(event.coins) > 0 ? `${event.student_name} — ${event.detail} (${coinText(num(event.coins))} coins)` : `${event.student_name} — ${event.detail} (EXP)`).join("\n") : "Nothing to hand out.";
	const ninjas = active.length ? active.map((student) => `${displayName(student)} (${student.belt}): ${coinText(student.coins)} coins · ${coinText(student.exp)} EXP`).join("\n") : "No active ninjas.";
	const resting = holding.length ? `\n\nStill holding coins while resting\n${holding.map((student) => `${displayName(student)} (${student.belt}): ${coinText(student.coins)}`).join("\n")}` : "";
	const welcome = sumKind("welcome");
	const strikes = mined.length;
	const body = [
		"BLOCKDOJO ledger",
		label,
		"",
		"Transactions",
		transactions,
		"",
		"Hand out",
		handout,
		"",
		"Close of day",
		`Paid out: ${coinText(sumKind("award"))}`,
		`Spent at the shop: ${coinText(sumKind("redeem"))}`,
		`Mined: ${coinText(sumKind("mine"))} (${strikes} strike${strikes === 1 ? "" : "s"})`,
		`Returned from rest: ${coinText(sumKind("return"))}`,
		welcome ? `Welcome coins: ${coinText(welcome)}` : null,
		`Undos: ${events.filter((event) => event.kind === "undo").length}`,
		"",
		`Vault: ${coinText(linked.snapshot.vault)}`,
		"",
		"Ninjas",
		ninjas + resting
	].filter((line) => line !== null).join("\n");
	return {
		ok: true,
		subject: `BLOCKDOJO ledger · ${label}`,
		body,
		snapshot: linked.snapshot
	};
}
//#endregion
export { addAchievement, addItem, addStudent, awardCoins, claimAchievement, dayLedger, dismissCeremony, joinDojo, openDojo, promoteBelt, pullDojo, redeemItem, removeAchievement, removeItem, restoreDemo, setHero, undoLast, unlockDirector, updateAchievement, updateItem, updateStudent };
