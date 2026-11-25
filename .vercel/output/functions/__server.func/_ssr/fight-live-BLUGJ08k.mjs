//#region node_modules/.nitro/vite/services/ssr/assets/fight-live-BLUGJ08k.js
var SWING_MS = 1200;
var KINDS = [
	"forward",
	"back",
	"attack"
];
var MOVE = [
	"bug",
	"run",
	"hop",
	"fix",
	"key",
	"bit",
	"log",
	"map",
	"zip",
	"bot",
	"app",
	"tab",
	"git",
	"web",
	"pin",
	"aim",
	"tag",
	"set",
	"add",
	"end",
	"top",
	"pad",
	"cat",
	"jam",
	"net",
	"orb",
	"fog",
	"wax",
	"ink",
	"cue",
	"dry",
	"elf",
	"gap",
	"hub",
	"joy",
	"kit",
	"mud",
	"nod",
	"owl",
	"pry",
	"rib",
	"sky",
	"urn",
	"vow",
	"yap",
	"dim",
	"icy"
];
var ATTACK = [
	"code",
	"loop",
	"jump",
	"mine",
	"belt",
	"coin",
	"hero",
	"star",
	"byte",
	"chip",
	"data",
	"file",
	"game",
	"hack",
	"icon",
	"node",
	"open",
	"play",
	"save",
	"test",
	"void",
	"walk",
	"yarn",
	"zoom",
	"rust",
	"quiz",
	"link",
	"kind",
	"java",
	"user",
	"edit",
	"true",
	"else",
	"func",
	"grid",
	"html",
	"json",
	"list",
	"math",
	"null",
	"pack",
	"read",
	"sync",
	"type",
	"unit",
	"wrap",
	"keys",
	"bool",
	"cast",
	"draw"
];
function pile(kind) {
	return kind === "attack" ? ATTACK : MOVE;
}
function pickWord(kind, avoidWord, avoidFirst) {
	const source = pile(kind);
	const open = source.filter((word) => word !== avoidWord && !avoidFirst.includes(word[0] ?? ""));
	const pool = open.length ? open : source.filter((word) => word !== avoidWord);
	return pool[Math.floor(Math.random() * pool.length)] ?? source[0] ?? "bug";
}
function refill(fighter, kind) {
	const avoid = KINDS.filter((other) => other !== kind).map((other) => fighter.slots[other].word[0] ?? "").filter(Boolean);
	fighter.slots[kind] = {
		word: pickWord(kind, fighter.slots[kind].word, avoid),
		typed: ""
	};
}
function blank() {
	return {
		pos: 0,
		slots: {
			forward: {
				word: "",
				typed: ""
			},
			back: {
				word: "",
				typed: ""
			},
			attack: {
				word: "",
				typed: ""
			}
		},
		active: "",
		lockUntil: 0,
		pose: "idle",
		poseUntil: 0,
		swingAt: 0,
		connectedAt: 0,
		spareUntil: 0,
		taken: 0,
		hurt: false,
		hits: 0,
		hp: 100
	};
}
function createFighter() {
	const fighter = blank();
	refill(fighter, "forward");
	refill(fighter, "back");
	refill(fighter, "attack");
	return fighter;
}
function createLive() {
	return {
		a: createFighter(),
		b: createFighter()
	};
}
function movesOf(fighter) {
	return KINDS.map((kind) => ({
		kind,
		word: fighter.slots[kind].word,
		typed: fighter.slots[kind].typed
	}));
}
function poseNow(fighter, now) {
	if (fighter.hp <= 0) return "down";
	if (now < fighter.poseUntil) return fighter.pose;
	return "idle";
}
function clearActive(fighter, keepLastAttack = false) {
	if (!fighter.active) return;
	const slot = fighter.slots.attack;
	if (keepLastAttack && fighter.active === "attack" && slot.typed.length === slot.word.length - 1) return;
	fighter.slots[fighter.active].typed = "";
	fighter.active = "";
}
function finishMove(state, side, kind, now) {
	const you = state[side];
	const foe = state[side === "a" ? "b" : "a"];
	you.active = "";
	you.spareUntil = 0;
	refill(you, kind);
	if (kind === "forward") {
		you.pos = Math.min(2, you.pos + 1);
		you.pose = "run";
		you.poseUntil = now + 360;
		return {
			miss: "",
			note: "",
			ko: false
		};
	}
	if (kind === "back") {
		you.pos = Math.max(0, you.pos - 1);
		you.pose = "idle";
		you.poseUntil = now;
		return {
			miss: "",
			note: "",
			ko: false
		};
	}
	you.pose = "attack";
	you.poseUntil = now + SWING_MS;
	you.swingAt = now;
	if (!(you.pos === 2 && foe.pos === 2)) {
		you.connectedAt = 0;
		return {
			miss: "",
			note: "whiff",
			ko: false
		};
	}
	if (foe.connectedAt && now - foe.connectedAt <= 90) {
		you.hp = Math.max(0, Math.min(100, you.hp + you.taken - 8));
		const foeTrade = Math.min(8, foe.hp);
		foe.hp -= foeTrade;
		you.taken = 8;
		foe.taken = foeTrade;
		foe.hits = Math.max(0, foe.hits - 1);
		you.hurt = true;
		foe.hurt = true;
		you.connectedAt = now;
		you.spareUntil = 0;
		foe.spareUntil = 0;
		clearActive(foe);
		you.lockUntil = now + 450;
		foe.lockUntil = now + 450;
		you.pose = you.hp <= 0 ? "down" : "hurt";
		foe.pose = foe.hp <= 0 ? "down" : "hurt";
		you.poseUntil = now + 900;
		foe.poseUntil = now + 900;
		return {
			miss: "",
			note: "trade",
			ko: you.hp <= 0 || foe.hp <= 0
		};
	}
	const dealt = Math.min(18, foe.hp);
	foe.hp -= dealt;
	foe.taken = dealt;
	you.hits += 1;
	you.connectedAt = now;
	foe.hurt = true;
	foe.pose = foe.hp <= 0 ? "down" : "hurt";
	foe.poseUntil = now + 900;
	foe.lockUntil = now + 450;
	const spared = foe.active === "attack" && foe.slots.attack.typed.length === foe.slots.attack.word.length - 1;
	clearActive(foe, true);
	foe.spareUntil = spared ? now + 90 : 0;
	return {
		miss: "",
		note: "hit",
		ko: foe.hp <= 0
	};
}
function press(state, side, letter, now) {
	const you = state[side];
	const foe = state[side === "a" ? "b" : "a"];
	const key = letter.toLowerCase();
	if (!/^[a-z]$/.test(key)) return {
		miss: "",
		note: "",
		ko: false
	};
	if (you.spareUntil && now > you.spareUntil) {
		const dropped = you.active === "attack";
		if (dropped) clearActive(you);
		you.spareUntil = 0;
		if (dropped) return {
			miss: "",
			note: "",
			ko: false
		};
	}
	const finishing = you.active === "attack" && you.slots.attack.word.length > 0 && you.slots.attack.typed.length === you.slots.attack.word.length - 1 && key === you.slots.attack.word.at(-1) && foe.connectedAt > 0 && now - foe.connectedAt <= 90;
	if ((you.hp <= 0 || now < you.lockUntil) && !finishing) return {
		miss: "",
		note: "",
		ko: false
	};
	if (!you.active) {
		const hits = KINDS.filter((kind) => you.slots[kind].word[0] === key);
		if (hits.length !== 1) return {
			miss: "",
			note: "",
			ko: false
		};
		you.active = hits[0] ?? "";
	}
	const kind = you.active;
	if (!kind) return {
		miss: "",
		note: "",
		ko: false
	};
	const slot = you.slots[kind];
	if (key !== slot.word[slot.typed.length]) return {
		miss: kind,
		note: "",
		ko: false
	};
	slot.typed += key;
	if (slot.typed !== slot.word) return {
		miss: "",
		note: "",
		ko: false
	};
	return finishMove(state, side, kind, now);
}
function botDelay(round) {
	return Math.max(240, 400 - (round - 1) * 35);
}
function botLetter(bot, you) {
	if (bot.hp <= 0 || bot.pose === "down") return "";
	let kind = bot.active;
	if (!kind) {
		const threatened = you.pos === 2 && you.active === "attack" && you.slots.attack.typed.length >= 2;
		if (bot.pos < 2) kind = "forward";
		else if (threatened && bot.pos > 0) kind = "back";
		else if (you.pos === 2) kind = "attack";
	}
	if (!kind) return "";
	return bot.slots[kind].word[bot.slots[kind].typed.length] ?? "";
}
//#endregion
export { poseNow as a, movesOf as i, botLetter as n, press as o, createLive as r, botDelay as t };
