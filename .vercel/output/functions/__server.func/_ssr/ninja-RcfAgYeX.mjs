import { o as __toESM } from "../_runtime.mjs";
import { J as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as beltToken } from "./types-wveOOwoA.mjs";
import { o as turnCopy, r as beltAllows, t as GAME_TURN_MS } from "./games-DjeaWp0m.mjs";
import { a as poseNow, i as movesOf, n as botLetter, o as press, r as createLive, t as botDelay } from "./fight-live-BLUGJ08k.mjs";
import { _ as ninjaStartFn, c as ninjaBoardFn, d as ninjaMatchTypeFn, f as ninjaQueueCloseFn, g as ninjaRosterFn, h as ninjaQueueReadyFn, l as ninjaFinishFn, m as ninjaQueuePollFn, p as ninjaQueueLockFn, s as caveAudio, u as ninjaMatchStateFn } from "./router-CRn3DRXT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ninja-RcfAgYeX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RosieMovie({ clip = "idle", flip = false, rate = 1, className = "" }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const node = ref.current;
		if (!node) return;
		const play = () => {
			node.playbackRate = rate;
			node.play().catch(() => {});
		};
		play();
		node.addEventListener("loadeddata", play);
		return () => node.removeEventListener("loadeddata", play);
	}, [clip, rate]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
		ref,
		src: `/art/typeme/rosie/${clip}.webm`,
		className: `${className} ${flip ? "tm-flip" : ""}`.trim(),
		muted: true,
		loop: clip === "idle" || clip === "run",
		autoPlay: true,
		playsInline: true
	}, `${clip}-${flip ? "l" : "r"}`);
}
function RosieIdle({ className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RosieMovie, {
		clip: "idle",
		className
	});
}
var ROSTER = [
	{
		id: "rosie",
		name: "Rosie",
		title: "Heavy Knight",
		belt: "Yellow",
		open: true
	},
	{
		id: "orange",
		name: "Locked",
		title: "Sealed",
		belt: "Orange",
		open: false
	},
	{
		id: "green",
		name: "Locked",
		title: "Sealed",
		belt: "Green",
		open: false
	},
	{
		id: "blue",
		name: "Locked",
		title: "Sealed",
		belt: "Blue",
		open: false
	},
	{
		id: "purple",
		name: "Locked",
		title: "Sealed",
		belt: "Purple",
		open: false
	},
	{
		id: "brown",
		name: "Locked",
		title: "Sealed",
		belt: "Brown",
		open: false
	},
	{
		id: "red",
		name: "Locked",
		title: "Sealed",
		belt: "Red",
		open: false
	},
	{
		id: "black",
		name: "Locked",
		title: "Sealed",
		belt: "Black",
		open: false
	}
];
function CharacterSelect({ belt, cursor, locked, searchLabel, lockLeft, foeLine, onCursor, onLock, onClose }) {
	const picked = ROSTER.find((slot) => slot.id === cursor) ?? ROSTER[0];
	const playable = picked.open && beltAllows(belt, picked.belt);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative z-10 mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-3 py-4 text-[#fff8ea]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-3 drop-shadow-[0_2px_0_#1a120c]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-pixel text-pixel text-accent",
					children: locked ? "LOCKED IN" : `LOCK ${lockLeft}`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-right text-sm font-extrabold",
					children: searchLabel
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-1 flex-col items-center justify-center",
				children: [
					playable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RosieIdle, { className: "h-[min(42vh,20rem)] w-auto object-contain drop-shadow-[0_18px_0_rgba(0,0,0,0.35)]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid h-40 w-40 place-items-center rounded-lg border-4 border-[#5a3d2a] bg-black/50 text-4xl font-extrabold",
						children: "?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 text-3xl font-extrabold uppercase drop-shadow-[0_3px_0_#1a120c]",
						children: playable ? picked.name : "Locked"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-extrabold text-accent",
						children: playable ? picked.title : `Opens at ${picked.belt} belt`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 min-h-5 text-sm font-bold",
						children: foeLine
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-4 gap-2",
				children: ROSTER.map((slot) => {
					const open = slot.open && beltAllows(belt, slot.belt);
					const on = slot.id === cursor;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onCursor(slot.id),
						className: `relative min-h-16 rounded-md border-4 bg-black/55 px-1 py-2 text-center ${on ? "border-accent" : "border-[#5a3d2a]"} ${open ? "" : "opacity-70"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-xs font-extrabold uppercase",
								children: open ? slot.name : "Locked"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 inline-block h-2 w-8 rounded-full",
								style: { background: `var(--color-${beltToken(slot.belt)})` }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block text-[10px] font-bold uppercase",
								children: slot.belt
							})
						]
					}, slot.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: !playable || locked,
					onClick: () => onLock(picked.id),
					className: "min-h-12 rounded-md border-4 border-accent bg-accent font-extrabold text-accent-ink disabled:opacity-60",
					children: locked ? "Locked" : "Lock in"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "min-h-12 rounded-md border-4 border-[#5a3d2a] bg-black/55 font-extrabold",
					children: "Close"
				})]
			})
		]
	});
}
function ResultsScroll({ phase, words, coins, exp, badges }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-bg-deep/55 px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: `w-full max-w-lg rounded-lg border-8 border-[#5a3d2a] bg-[#f4e6cf] px-6 py-6 text-[#2a1c08] shadow-2xl ${phase === "in" ? "scroll-in-right" : phase === "out" ? "scroll-out-right" : "scroll-hold"}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center font-pixel text-pixel text-[#8a5a32]",
					children: "YOUR HAUL"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 space-y-3",
					children: [
						[`${words} words typed`, "0.15s"],
						[`${coins} ninja coins`, "0.45s"],
						[`${exp} EXP`, "0.75s"]
					].map(([label, delay]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "scroll-stamp text-center text-2xl font-extrabold",
						style: { animationDelay: delay },
						children: label
					}, label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 flex flex-wrap justify-center gap-2",
					children: badges.length ? badges.map((badge, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "scroll-stamp rounded-md border-2 border-[#8a5a32] px-3 py-1 text-sm font-extrabold",
						style: { animationDelay: `${1 + index * .25}s` },
						children: badge
					}, badge)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "scroll-stamp text-sm font-extrabold",
						style: { animationDelay: "1s" },
						children: "Keep typing next time for a badge."
					})
				})
			]
		})
	});
}
function FlameName({ name, big = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `flame-slot ${big ? "flame-slot-lg" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flame-ball flame-ball-left",
				"aria-hidden": true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/art/typing/fireball-loop.png?v=loop2",
					alt: ""
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flame-ball flame-ball-right",
				"aria-hidden": true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/art/typing/fireball-loop.png?v=loop2",
					alt: ""
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `relative z-10 ${big ? "flame-name" : "flame-name-sm"}`,
				children: name
			})
		]
	});
}
function RankScroll({ phase, ranks, you, heading = "TOP TYPER" }) {
	const motion = phase === "in" ? "scroll-in-left" : phase === "out" ? "scroll-out-left" : "scroll-hold";
	const top = ranks[0];
	const topLit = Boolean(top && top.words + top.coins > 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center overflow-visible bg-bg-deep/55 px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: `flex max-h-[86dvh] w-full max-w-lg flex-col overflow-visible rounded-lg border-8 border-[#5a3d2a] bg-[#f4e6cf] px-4 py-5 text-[#2a1c08] shadow-2xl ${motion}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center font-pixel text-pixel text-[#8a5a32]",
					children: heading
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "relative z-10 mt-3 overflow-visible text-center text-3xl font-extrabold",
					children: topLit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlameName, {
						name: top.name,
						big: true
					}) : "The mine is quiet"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-4 space-y-2 overflow-visible pr-1",
					children: ranks.map((row, index) => {
						const flame = index < 3 && row.coins + row.words > 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: `scroll-stamp grid grid-cols-[1fr_auto_1fr] items-center overflow-visible rounded-md border-2 px-2 py-1.5 ${row.id === you ? "border-[#d63a32] bg-[#fff8ea]" : "border-[#5a3d2a]/40"}`,
							style: { animationDelay: `${Math.min(index, 12) * .08}s` },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-6 font-extrabold tabular-nums",
										children: index + 1
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "size-3 shrink-0 rounded-full border border-black/30",
										style: { background: `var(--color-${beltToken(row.belt)})` }
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "relative overflow-visible px-2 text-center font-extrabold",
									children: flame ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlameName, { name: row.name }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate",
										children: row.name
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-right text-sm font-extrabold tabular-nums",
									children: row.coins
								})
							]
						}, row.id);
					})
				})
			]
		})
	});
}
var WORDS = [
	[
		"bug",
		"bit",
		"run",
		"key",
		"hop",
		"fix",
		"log",
		"tag",
		"app",
		"pop",
		"add",
		"win",
		"box",
		"map",
		"yes",
		"hit",
		"say",
		"zip",
		"dot",
		"pet",
		"fun",
		"cat",
		"sun",
		"row",
		"try",
		"set",
		"get",
		"end"
	],
	[
		"code",
		"loop",
		"jump",
		"move",
		"hide",
		"show",
		"spin",
		"grow",
		"play",
		"true",
		"else",
		"math",
		"tile",
		"belt",
		"game",
		"life",
		"hero",
		"coin",
		"star",
		"flag",
		"data",
		"list",
		"walk",
		"turn",
		"draw",
		"save",
		"byte",
		"dojo"
	],
	[
		"sprite",
		"event",
		"score",
		"start",
		"lives",
		"pixel",
		"spawn",
		"debug",
		"array",
		"while",
		"float",
		"input",
		"music",
		"scene",
		"mouse",
		"craft",
		"robot",
		"clone",
		"block",
		"quest",
		"sound",
		"white",
		"green",
		"click",
		"ninja"
	],
	[
		"button",
		"player",
		"update",
		"repeat",
		"random",
		"string",
		"number",
		"canvas",
		"script",
		"return",
		"health",
		"motion",
		"impact",
		"arcade",
		"yellow",
		"orange"
	],
	[
		"boolean",
		"collide",
		"costume",
		"forever",
		"physics",
		"overlap",
		"integer",
		"console",
		"project",
		"variable",
		"function",
		"sequence",
		"operator",
		"argument",
		"tilemap",
		"equality",
		"property",
		"keyboard",
		"velocity"
	],
	[
		"animation",
		"parameter",
		"condition",
		"collision",
		"broadcast",
		"debugging",
		"variables",
		"functions",
		"operators",
		"javascript",
		"coordinate",
		"projectile",
		"conditional"
	]
];
var TRAVEL = [
	8.5,
	7.6,
	6.8,
	6,
	5.2,
	4.4
];
var MISS_MS = 5e3;
var MISS_LIMIT = 3;
var BAR_BLOCKS = 10;
function tuneTier(tier, perf) {
	const seconds = Math.max(1, (Date.now() - perf.t0) / 1e3);
	const typed = perf.letters + perf.misses;
	const accuracy = typed === 0 ? 0 : perf.letters / typed;
	const perMinute = perf.words / seconds * 60;
	let step = 0;
	if (perf.words === 0 || accuracy < .6 || perMinute < 3 || perf.drops > perf.words) step = -1;
	else if (accuracy >= .9 && perMinute >= 12 && perf.drops === 0) step = 2;
	else if (accuracy >= .78 && perMinute >= 6) step = 1;
	return Math.max(0, Math.min(WORDS.length - 1, tier + step));
}
function nextCart(tier, count, previous) {
	const pile = WORDS[tier] ?? WORDS[0];
	let word = pile[Math.floor(Math.random() * pile.length)] ?? "bug";
	if (pile.length > 1 && word === previous) word = pile[(pile.indexOf(word) + 1) % pile.length];
	return {
		word,
		golden: count > 0 && count % 6 === 0
	};
}
function levelOf(endsAt, extra = 0, now = Date.now()) {
	const elapsed = Math.min(GAME_TURN_MS, Math.max(0, now - (endsAt - GAME_TURN_MS)) + extra);
	const level = Math.min(10, Math.floor(elapsed / 6e4) + 1);
	return {
		level,
		left: elapsed >= 6e5 ? 0 : Math.max(0, level * 6e4 - elapsed),
		session: Math.max(0, endsAt - now),
		done: elapsed >= GAME_TURN_MS
	};
}
function comboOf(streak) {
	if (streak >= 12) return 4;
	if (streak >= 8) return 3;
	if (streak >= 4) return 2;
	return 1;
}
function trainSize(len) {
	if (len <= 3) return {
		lead: 176,
		car: 118,
		letter: 52,
		gap: 4
	};
	if (len <= 5) return {
		lead: 142,
		car: 96,
		letter: 42,
		gap: 3
	};
	if (len <= 8) return {
		lead: 112,
		car: 72,
		letter: 34,
		gap: 2
	};
	return {
		lead: 88,
		car: 54,
		letter: 26,
		gap: 2
	};
}
function trainPlace(laneW, trainW, progress) {
	return laneW - progress * (laneW + trainW);
}
function paceBoost(taps) {
	const good = taps.filter((tap) => tap.ok);
	if (good.length < 2 || good.length / taps.length < .75) return 1;
	const gaps = [];
	for (let i = 1; i < good.length; i += 1) {
		const gap = good[i].at - good[i - 1].at;
		if (gap > 0 && gap < 2500) gaps.push(gap);
	}
	if (!gaps.length) return 1;
	const gap = gaps.reduce((sum, value) => sum + value, 0) / gaps.length;
	return 1 + Math.max(0, Math.min(1, (1050 - gap) / 750)) * 1.2;
}
function clock$1(ms) {
	const total = Math.max(0, Math.ceil(ms / 1e3));
	return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
var ART = "/art/typing";
function oreFor(level, golden) {
	if (level < 3) return null;
	if (golden) return "ore-gold";
	if (level <= 4) return "ore-ice";
	if (level <= 6) return "ore-lava";
	if (level <= 8) return "ore-amethyst";
	return "ore-gems";
}
function crystalFor(level, golden) {
	if (golden || level < 3) return null;
	if (level <= 4) return "crystal-ice";
	if (level >= 7 && level <= 8) return "crystal-amethyst";
	return null;
}
function cartRig(level, golden) {
	const ore = oreFor(level, golden);
	const crystal = crystalFor(level, golden);
	if (level >= 3) return {
		src: `${ART}/cart-body.png?v=kit3`,
		wheel: golden ? "wheel-gold" : "wheel-gray",
		axles: [32.7, 77.2],
		axleTop: "85%",
		letters: "top-[2%] right-[12%] left-[32%]",
		ore,
		crystal
	};
	if (!golden) return {
		src: `${ART}/cart-coal-body.png?v=kit3`,
		wheel: "wheel-gray",
		axles: [34.8, 78.6],
		axleTop: "91%",
		letters: "top-[6%] right-[8%] left-[34%]",
		ore: null,
		crystal: null
	};
	return {
		src: `${ART}/cart-gold.png?v=kit3`,
		wheel: null,
		axles: [],
		axleTop: "0%",
		letters: "top-[50%] right-[8%] left-[28%]",
		ore: null,
		crystal: null
	};
}
function TypingRun({ endsAt, onFinish }) {
	const start = levelOf(endsAt);
	const stats = (0, import_react.useRef)({
		words: 0,
		golden: 0
	});
	const streak = (0, import_react.useRef)(0);
	const count = (0, import_react.useRef)(0);
	const typed = (0, import_react.useRef)("");
	const levelRef = (0, import_react.useRef)(start.level);
	const tierRef = (0, import_react.useRef)(0);
	const perf = (0, import_react.useRef)({
		t0: Date.now(),
		letters: 0,
		misses: 0,
		words: 0,
		drops: 0
	});
	const cart = (0, import_react.useRef)(nextCart(0, 0, ""));
	const progress = (0, import_react.useRef)(0);
	const restUntil = (0, import_react.useRef)(Date.now() + 1200);
	const done = (0, import_react.useRef)(false);
	const node = (0, import_react.useRef)(null);
	const roll = (0, import_react.useRef)(0);
	const rollX = (0, import_react.useRef)(null);
	const penalty = (0, import_react.useRef)(0);
	const phase = (0, import_react.useRef)("roll");
	const wordMisses = (0, import_react.useRef)(0);
	const swing = (0, import_react.useRef)(null);
	const swingId = (0, import_react.useRef)(0);
	const bars = (0, import_react.useRef)(Math.ceil(start.left / 6e4 * BAR_BLOCKS));
	const chipId = (0, import_react.useRef)(0);
	const track = (0, import_react.useRef)(null);
	const taps = (0, import_react.useRef)([]);
	const finishRef = (0, import_react.useRef)(onFinish);
	finishRef.current = onFinish;
	const [round, setRound] = (0, import_react.useState)({
		word: cart.current.word,
		typed: "",
		golden: cart.current.golden,
		swing: null,
		misses: 0
	});
	const [hud, setHud] = (0, import_react.useState)({
		level: start.level,
		left: start.left,
		session: start.session,
		words: 0,
		combo: 1
	});
	const [cheer, setCheer] = (0, import_react.useState)({
		id: 0,
		text: "Level 1"
	});
	const [card, setCard] = (0, import_react.useState)(start.left > 58e3 ? {
		level: start.level,
		praise: start.level > 1
	} : null);
	const [pop, setPop] = (0, import_react.useState)(null);
	const [chip, setChip] = (0, import_react.useState)(0);
	const cheerId = (0, import_react.useRef)(0);
	const popId = (0, import_react.useRef)(0);
	const praise = (text) => {
		cheerId.current += 1;
		const id = cheerId.current;
		setCheer({
			id,
			text
		});
		window.setTimeout(() => setCheer((prev) => prev?.id === id ? null : prev), 1600);
	};
	const paintWord = () => {
		setRound({
			word: cart.current.word,
			typed: typed.current,
			golden: cart.current.golden,
			swing: swing.current,
			misses: wordMisses.current
		});
	};
	const finish = () => {
		if (done.current) return;
		done.current = true;
		finishRef.current(stats.current);
	};
	const commit = () => {
		phase.current = "roll";
		wordMisses.current = 0;
		swing.current = null;
		count.current += 1;
		cart.current = nextCart(tierRef.current, count.current, cart.current.word);
		typed.current = "";
		progress.current = 0;
		rollX.current = null;
		paintWord();
		setHud((prev) => ({
			...prev,
			words: stats.current.words,
			combo: comboOf(streak.current)
		}));
	};
	const leave = (missed) => {
		if (phase.current === "exit" || done.current) return;
		phase.current = "exit";
		if (!missed) {
			stats.current.words += 1;
			perf.current.words += 1;
			streak.current += 1;
			if (cart.current.golden) stats.current.golden += 1;
			const combo = comboOf(streak.current);
			praise(combo > 1 ? `Great job typing!  x${combo}` : "Great job typing!");
			popId.current += 1;
			const id = popId.current;
			setPop({
				id,
				kind: "burst"
			});
			window.setTimeout(() => setPop((prev) => prev?.id === id ? null : prev), 700);
			caveAudio.cue(cart.current.golden ? "award" : "hit");
		} else {
			perf.current.drops += 1;
			streak.current = 0;
			popId.current += 1;
			const id = popId.current;
			setPop({
				id,
				kind: "tnt"
			});
			window.setTimeout(() => setPop((prev) => prev?.id === id ? null : prev), 700);
		}
		setHud((prev) => ({
			...prev,
			words: stats.current.words,
			combo: comboOf(streak.current)
		}));
	};
	const leaveRef = (0, import_react.useRef)(leave);
	leaveRef.current = leave;
	const commitRef = (0, import_react.useRef)(commit);
	commitRef.current = commit;
	const paintRef = (0, import_react.useRef)(paintWord);
	paintRef.current = paintWord;
	(0, import_react.useLayoutEffect)(() => {
		const lane = track.current;
		const cartNode = node.current;
		if (!lane || !cartNode) return;
		cartNode.style.transform = `translate3d(${trainPlace(lane.clientWidth, cartNode.offsetWidth, progress.current)}px, 0, 0)`;
	}, [round.word]);
	(0, import_react.useEffect)(() => {
		const stop = window.setTimeout(finish, Math.max(0, endsAt - Date.now()));
		const clockTimer = window.setInterval(() => {
			const now = levelOf(endsAt, penalty.current);
			const blocks = Math.ceil(now.left / 6e4 * BAR_BLOCKS);
			if (blocks < bars.current) {
				chipId.current += 1;
				setChip(chipId.current);
			}
			bars.current = blocks;
			setHud((prev) => ({
				...prev,
				level: now.level,
				left: now.left,
				session: now.session,
				combo: comboOf(streak.current)
			}));
			if (now.done) finish();
			else if (now.level !== levelRef.current) {
				tierRef.current = tuneTier(tierRef.current, perf.current);
				perf.current = {
					t0: Date.now(),
					letters: 0,
					misses: 0,
					words: 0,
					drops: 0
				};
				levelRef.current = now.level;
				const combo = comboOf(streak.current);
				setCard({
					level: now.level,
					praise: true
				});
				praise(combo > 1 ? `Great job typing!  x${combo}` : "Great job typing!");
				restUntil.current = Date.now() + 1600;
				phase.current = "roll";
				wordMisses.current = 0;
				swing.current = null;
				cart.current = nextCart(tierRef.current, count.current, cart.current.word);
				typed.current = "";
				progress.current = 0;
				rollX.current = null;
				paintRef.current();
				window.setTimeout(() => setCard(null), 1600);
			}
		}, 200);
		let frame = 0;
		let last = performance.now();
		const loop = (now) => {
			const dt = Math.min(.032, (now - last) / 1e3);
			last = now;
			const resting = Date.now() < restUntil.current;
			const lane = track.current;
			const cartNode = node.current;
			const laneW = lane?.clientWidth ?? 0;
			const trainW = cartNode?.offsetWidth ?? 0;
			const distance = Math.max(1, laneW + trainW);
			if (!resting && phase.current === "exit") {
				progress.current += 1100 * dt / distance;
				if (progress.current >= 1) commitRef.current();
			} else if (!resting && laneW > 0) {
				const speed = laneW / (TRAVEL[tierRef.current] ?? 6) * paceBoost(taps.current);
				progress.current += speed * dt / distance;
				if (progress.current >= 1) leaveRef.current(true);
			}
			if (lane && cartNode && laneW > 0) {
				const x = trainPlace(laneW, trainW, progress.current);
				cartNode.style.transform = `translate3d(${x}px, 0, 0)`;
				const wheels = cartNode.querySelectorAll("[data-wheel]");
				if (wheels.length) {
					const prev = rollX.current;
					rollX.current = x;
					if (prev != null && Math.abs(x - prev) < 220) {
						const radius = Math.max(8, wheels[0].offsetWidth / 2);
						roll.current += (x - prev) / radius;
					}
					const turn = `translate(-50%, -50%) rotate(${roll.current}rad)`;
					wheels.forEach((wheel) => {
						wheel.style.transform = turn;
					});
				}
			}
			if (Date.now() - (endsAt - 6e5) + penalty.current >= 6e5) finish();
			else frame = window.requestAnimationFrame(loop);
		};
		frame = window.requestAnimationFrame(loop);
		const open = window.setTimeout(() => setCard(null), 1200);
		return () => {
			window.clearTimeout(stop);
			window.clearTimeout(open);
			window.clearInterval(clockTimer);
			window.cancelAnimationFrame(frame);
		};
	}, [endsAt]);
	const press = (letter) => {
		if (done.current || phase.current === "exit" || Date.now() < restUntil.current) return;
		const next = cart.current.word[typed.current.length];
		if (!next || letter !== next) {
			penalty.current += MISS_MS;
			perf.current.misses += 1;
			wordMisses.current += 1;
			taps.current = [...taps.current, {
				ok: false,
				at: Date.now()
			}].slice(-8);
			swingId.current += 1;
			swing.current = {
				id: swingId.current,
				kind: "bounce"
			};
			const now = levelOf(endsAt, penalty.current);
			const blocks = Math.ceil(now.left / 6e4 * BAR_BLOCKS);
			bars.current = blocks;
			chipId.current += 1;
			setChip(chipId.current);
			setHud((prev) => ({
				...prev,
				level: now.level,
				left: now.left,
				session: now.session
			}));
			paintRef.current();
			const swingNow = swingId.current;
			window.setTimeout(() => {
				if (swing.current?.id === swingNow) {
					swing.current = null;
					paintRef.current();
				}
			}, 340);
			caveAudio.cue("tip");
			if (now.done) finish();
			else if (wordMisses.current >= MISS_LIMIT) leaveRef.current(true);
			return;
		}
		typed.current += letter;
		perf.current.letters += 1;
		taps.current = [...taps.current, {
			ok: true,
			at: Date.now()
		}].slice(-8);
		swingId.current += 1;
		swing.current = {
			id: swingId.current,
			kind: "hit"
		};
		paintRef.current();
		const swingNow = swingId.current;
		window.setTimeout(() => {
			if (swing.current?.id === swingNow) {
				swing.current = null;
				paintRef.current();
			}
		}, 440);
		if (typed.current === cart.current.word) leaveRef.current(false);
	};
	const pressRef = (0, import_react.useRef)(press);
	pressRef.current = press;
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if (event.metaKey || event.ctrlKey || event.altKey) return;
			if (event.key === "Backspace") return;
			if (/^[a-zA-Z]$/.test(event.key)) {
				event.preventDefault();
				pressRef.current(event.key.toLowerCase());
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	const rows = [
		"qwertyuiop",
		"asdfghjkl",
		"zxcvbnm"
	];
	const rig = cartRig(hud.level, round.golden);
	const size = trainSize(round.word.length);
	const faceFor = (index) => {
		if (index === round.typed.length && round.swing?.kind === "bounce") return "block-lava";
		if (round.golden) return "block-gold";
		return "block-ice";
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative z-10 flex h-dvh flex-col px-3 py-3 text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[minmax(0,8.6rem)_minmax(4.5rem,1fr)_minmax(0,6.4rem)] items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative h-20 w-full",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: `${ART}/sign.png?v=kit3`,
							alt: "",
							className: "absolute inset-0 h-full w-full object-fill"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex h-full items-center gap-1 px-2 text-[#2a1c08]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: `${ART}/clock.png?v=kit3`,
								alt: "",
								className: "clock-tick h-9 w-9 shrink-0"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[10px] font-extrabold uppercase",
										children: [
											"Level ",
											hud.level,
											" of 10"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-2xl font-extrabold leading-none",
										children: hud.words
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "truncate text-[10px] font-extrabold uppercase",
										children: [clock$1(hud.session), " left"]
									})
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative h-12 w-full",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: `${ART}/frame-track.png?v=kit3`,
								alt: "",
								className: "absolute inset-0 h-full w-full object-fill"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute inset-y-[22%] right-[4%] left-[4%] [container-type:size]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full overflow-hidden",
									style: { width: `${Math.max(0, Math.min(1, hud.left / 6e4)) * 100}%` },
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: `${ART}/bar-gold.png?v=kit3`,
										alt: "",
										className: "h-full max-w-none object-fill",
										style: { width: "100cqi" }
									})
								}), chip ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: `${ART}/bar-gold.png?v=kit3`,
									alt: "",
									className: "bar-break pointer-events-none absolute top-0 h-full w-8 object-cover object-right",
									style: { left: `calc(${Math.max(0, Math.min(1, hud.left / 6e4)) * 100}% - 1.4rem)` }
								}, chip) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "pointer-events-none absolute inset-0 grid place-items-center text-base font-extrabold text-[#2a1c08] tabular-nums",
								children: clock$1(hud.left)
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative h-20 w-full",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: `${ART}/sign.png?v=kit3`,
							alt: "",
							className: "absolute inset-0 h-full w-full object-fill"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex h-full flex-col items-center justify-center text-[#2a1c08]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-extrabold uppercase",
								children: "Combo"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-2xl font-extrabold leading-none",
								children: ["x", hud.combo]
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: track,
				className: "relative mt-2 min-h-56 flex-1 overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: `${ART}/frame-track.png?v=kit3`,
						alt: "",
						className: "pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full object-fill"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						ref: node,
						className: "absolute bottom-1 left-0 flex items-end will-change-transform",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative shrink-0",
							style: { width: size.lead },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: rig.src,
									alt: "",
									className: "h-auto w-full"
								}),
								rig.ore ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: `${ART}/${rig.ore}.png?v=kit3`,
									alt: "",
									className: "ore-shimmer pointer-events-none absolute top-0 left-[26%] w-[48%]"
								}) : null,
								rig.crystal ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: `${ART}/${rig.crystal}.png?v=kit3`,
									alt: "",
									className: "crystal-sway pointer-events-none absolute -top-[18%] left-[14%] w-[14%]"
								}) : null,
								rig.wheel ? rig.axles.map((axle) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									"data-wheel": "",
									src: `${ART}/${rig.wheel}.png?v=kit3`,
									alt: "",
									className: "mine-wheel absolute w-[28%]",
									style: {
										left: `${axle}%`,
										top: rig.axleTop
									}
								}, axle)) : null
							]
						}), round.word.split("").map((letter, index) => {
							const broken = index < round.typed.length;
							const justBroke = broken && index === round.typed.length - 1 && round.swing?.kind === "hit";
							const pickOn = round.swing?.kind === "hit" ? round.typed.length - 1 : round.typed.length;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative shrink-0",
								style: {
									width: size.car,
									marginLeft: size.gap
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: `${ART}/cart-body.png?v=kit3`,
										alt: "",
										className: "h-auto w-full"
									}),
									[32.7, 77.2].map((axle) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										"data-wheel": "",
										src: `${ART}/wheel-gray.png?v=kit3`,
										alt: "",
										className: "mine-wheel absolute w-[28%]",
										style: {
											left: `${axle}%`,
											top: "85%"
										}
									}, axle)),
									!broken || justBroke ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "absolute left-[18%] z-20",
										style: {
											bottom: "58%",
											width: size.letter
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: justBroke ? "letter-break" : "",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "relative grid place-items-center",
												style: {
													width: size.letter,
													height: size.letter
												},
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
														src: `${ART}/${faceFor(index)}.png?v=kit3`,
														alt: "",
														className: "absolute inset-0 h-full w-full object-contain"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: `letter-ink relative font-extrabold uppercase ${faceFor(index) === "block-lava" ? "text-[#fff8ea]" : "text-[#2a1c08]"}`,
														style: { fontSize: Math.round(size.letter * .55) },
														children: letter
													}),
													justBroke ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "pick-chips",
														"aria-hidden": true,
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {})
														]
													}) : null
												]
											})
										})
									}) : null,
									index === pickOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: `${ART}/pickaxe.png?v=kit3`,
										alt: "",
										className: `pick-axe pointer-events-none absolute z-10 ${round.swing ? round.swing.kind === "hit" ? "pick-hit" : "pick-bounce" : "pick-ready"}`
									}, round.swing?.id ?? "ready") : null
								]
							}, `${round.word}-${index}`);
						})]
					}),
					pop ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-none absolute top-1 right-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: `${ART}/${pop.kind}.png?v=kit3`,
							alt: "",
							className: "fx-pop h-16 w-16"
						})
					}, pop.id) : null,
					cheer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "type-cheer pointer-events-none absolute inset-x-0 top-1 text-center text-xl font-extrabold text-accent",
						children: cheer.text
					}, cheer.id) : null,
					card ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 z-30 grid place-items-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative w-[min(34rem,94%)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: `${ART}/frame-wood.png?v=kit3`,
									alt: "",
									className: "h-auto w-full"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: `${ART}/lantern.png?v=kit3`,
									alt: "",
									className: "lantern-flicker absolute -top-6 -left-1 h-14 w-10"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "absolute inset-[24%_16%] flex flex-col items-center justify-center rounded-md bg-[#f4e6cf] text-center text-[#2a1c08] shadow-md",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-2xl font-extrabold leading-none",
											children: ["Level ", card.level]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-base font-extrabold",
											children: card.praise ? "Great job typing!" : "Type the letters."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-base font-extrabold",
											children: ["Combo x", hud.combo]
										})
									]
								})
							]
						})
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto w-full max-w-3xl space-y-2 pb-2",
				children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center gap-1.5",
					children: row.split("").map((letter) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => pressRef.current(letter),
						className: "min-h-12 min-w-8 flex-1 rounded-md border-2 border-border bg-surface text-lg font-extrabold text-[#fff8ea] uppercase",
						children: letter
					}, letter))
				}, row))
			})
		]
	});
}
var INTRO_MS = 2800;
function clock(ms) {
	const total = Math.max(0, Math.ceil(ms / 1e3));
	return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
function rosieClip(pose, phase) {
	if (pose === "attack") return "attack";
	if (pose === "hurt" || pose === "down") return "hurt";
	if (pose === "run" || phase === "intro") return "run";
	return "idle";
}
function rosieFlip(clip, side) {
	const facesRight = side === "you";
	if (clip === "run") return !facesRight;
	if (clip === "attack" || clip === "hurt") return facesRight;
	return !facesRight;
}
function rosieRate(clip) {
	if (clip === "attack") return 2.2;
	if (clip === "hurt") return 2;
	return 1;
}
function useRosieSounds(clips) {
	const key = [...new Set(clips)].sort().join(",");
	(0, import_react.useEffect)(() => {
		const tracks = (key ? key.split(",") : []).map((clip) => {
			const audio = new Audio(`/art/typeme/rosie/${clip}.mp3`);
			audio.loop = clip === "idle" || clip === "run";
			audio.volume = clip === "idle" ? .42 : clip === "run" ? .58 : .82;
			audio.playbackRate = rosieRate(clip);
			return audio;
		});
		let dead = false;
		const sync = () => {
			if (dead) return;
			const off = caveAudio.snapshot() === "off";
			for (const audio of tracks) if (off) audio.pause();
			else audio.play().catch(() => {});
		};
		const unsub = caveAudio.subscribe(sync);
		window.addEventListener("pointerdown", sync);
		window.addEventListener("keydown", sync);
		sync();
		return () => {
			dead = true;
			unsub();
			window.removeEventListener("pointerdown", sync);
			window.removeEventListener("keydown", sync);
			for (const audio of tracks) {
				audio.pause();
				audio.src = "";
			}
		};
	}, [key]);
}
function moveLabel(kind, mini) {
	if (mini) return kind === "attack" ? "Hit" : kind;
	if (kind === "forward") return "Forward";
	if (kind === "back") return "Back";
	return "Attack";
}
function MoveCard({ move, hot, shake, mini }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `tm-move tm-move-${move.kind} ${hot ? "tm-move-hot" : ""} ${mini ? "tm-move-mini" : ""} ${shake ? "tm-shake" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "tm-move-label",
			children: moveLabel(move.kind, Boolean(mini))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "tm-move-word",
			children: move.word.split("").map((letter, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: index < move.typed.length ? "text-accent" : "",
				children: letter
			}, `${move.kind}-${move.word}-${index}`))
		})]
	});
}
function TypeMeRun({ endsAt, onFinish, match = null, youFighter = "rosie", foeFighter = "rosie" }) {
	const sim = (0, import_react.useRef)({
		phase: "intro",
		until: Date.now() + INTRO_MS,
		introAt: Date.now(),
		live: createLive(),
		youRounds: 0,
		foeRounds: 0,
		round: 1,
		match: 1,
		hits: 0,
		clean: 0,
		banner: "TYPE ME IF YOU CAN",
		clash: false,
		botAt: 0
	});
	const done = (0, import_react.useRef)(false);
	const finishRef = (0, import_react.useRef)(onFinish);
	finishRef.current = onFinish;
	const [shakeKind, setShakeKind] = (0, import_react.useState)("");
	const [callout, setCallout] = (0, import_react.useState)("");
	const flashRef = (0, import_react.useRef)(() => {});
	const shakeRef = (0, import_react.useRef)(() => {});
	flashRef.current = (text) => {
		setCallout(text);
		window.setTimeout(() => setCallout((current) => current === text ? "" : current), 520);
	};
	shakeRef.current = (kind) => {
		setShakeKind(kind);
		window.setTimeout(() => setShakeKind((current) => current === kind ? "" : current), 180);
	};
	const [view, setView] = (0, import_react.useState)({
		phase: "intro",
		youHp: 100,
		foeHp: 100,
		youRounds: 0,
		foeRounds: 0,
		round: 1,
		youPos: 0,
		foePos: 0,
		youMoves: [],
		foeMoves: [],
		youPose: "run",
		foePose: "run",
		banner: "TYPE ME IF YOU CAN",
		turn: Math.max(0, endsAt - Date.now())
	});
	const pressRef = (0, import_react.useRef)(() => {});
	(0, import_react.useEffect)(() => {
		if (match) return;
		const simNow = sim.current;
		const beginRound = () => {
			simNow.live = createLive();
			simNow.clash = false;
			simNow.phase = "intro";
			simNow.introAt = Date.now();
			simNow.until = Date.now() + INTRO_MS;
			simNow.banner = "TYPE ME IF YOU CAN";
			simNow.botAt = 0;
		};
		const openKo = () => {
			if (simNow.phase !== "fight") return;
			const youDead = simNow.live.a.hp <= 0;
			const foeDead = simNow.live.b.hp <= 0;
			if (youDead && foeDead) {
				simNow.clash = true;
				simNow.banner = "CLASH";
				simNow.phase = "ko";
				simNow.until = Date.now() + 1500;
				return;
			}
			const youWin = foeDead;
			if (youWin) {
				simNow.youRounds += 1;
				if (!simNow.live.a.hurt) simNow.clean += 1;
				caveAudio.cue("award");
			} else simNow.foeRounds += 1;
			simNow.banner = youWin ? "YOU WIN THE ROUND" : "ROUND LOST";
			simNow.phase = "ko";
			simNow.until = Date.now() + 1500;
		};
		const advance = () => {
			if (simNow.phase === "intro") {
				simNow.phase = "fight";
				simNow.banner = "";
				simNow.botAt = Date.now() + botDelay(simNow.round);
				return;
			}
			if (simNow.phase === "ko") {
				if (simNow.youRounds >= 2 || simNow.foeRounds >= 2) {
					simNow.banner = simNow.youRounds >= 2 ? "YOU WIN" : "NEXT MATCH";
					simNow.phase = "match";
					simNow.until = Date.now() + 1600;
				} else if (simNow.clash) beginRound();
				else {
					simNow.round += 1;
					beginRound();
				}
				return;
			}
			if (simNow.phase === "match") {
				simNow.match += 1;
				simNow.round = 1;
				simNow.youRounds = 0;
				simNow.foeRounds = 0;
				beginRound();
			}
		};
		const finish = () => {
			if (done.current) return;
			done.current = true;
			finishRef.current({
				words: simNow.hits,
				golden: simNow.clean,
				lost: simNow.foeRounds > simNow.youRounds
			});
		};
		pressRef.current = (letter) => {
			if (done.current || simNow.phase !== "fight") return;
			const result = press(simNow.live, "a", letter, Date.now());
			if (result.miss) {
				shakeRef.current(result.miss);
				caveAudio.cue("tip");
			}
			if (result.note === "hit") {
				simNow.hits += 1;
				caveAudio.cue("hit");
				flashRef.current("HIT");
			} else if (result.note === "whiff") flashRef.current("TOO FAR");
			else if (result.note === "trade") {
				caveAudio.cue("tip");
				flashRef.current("CLASH");
			}
			if (result.ko) openKo();
		};
		let frame = 0;
		const loop = () => {
			const now = Date.now();
			if (now >= endsAt) {
				finish();
				return;
			}
			if (now >= simNow.until && simNow.phase !== "fight") advance();
			if (simNow.phase === "fight" && simNow.botAt > 0 && now >= simNow.botAt) {
				const letter = botLetter(simNow.live.b, simNow.live.a);
				if (letter) {
					const result = press(simNow.live, "b", letter, now);
					if (result.note === "hit") {
						caveAudio.cue("tip");
						flashRef.current("OUCH");
					} else if (result.note === "trade") flashRef.current("CLASH");
					if (result.ko) openKo();
				}
				const pause = Math.random() < .12 ? botDelay(simNow.round) : 0;
				simNow.botAt = now + botDelay(simNow.round) + pause;
			}
			if (simNow.phase === "intro") {
				const elapsed = now - simNow.introAt;
				simNow.banner = elapsed < 1100 ? "TYPE ME IF YOU CAN" : elapsed < 2e3 ? `ROUND ${simNow.round}` : "FIGHT";
			}
			const you = simNow.live.a;
			const foe = simNow.live.b;
			const fighting = simNow.phase === "fight";
			setView({
				phase: simNow.phase,
				youHp: you.hp,
				foeHp: foe.hp,
				youRounds: simNow.youRounds,
				foeRounds: simNow.foeRounds,
				round: simNow.round,
				youPos: you.pos,
				foePos: foe.pos,
				youMoves: fighting ? movesOf(you) : [],
				foeMoves: fighting ? movesOf(foe) : [],
				youPose: simNow.phase === "intro" ? "run" : poseNow(you, now),
				foePose: simNow.phase === "intro" ? "run" : poseNow(foe, now),
				banner: simNow.banner,
				turn: Math.max(0, endsAt - now)
			});
			frame = window.requestAnimationFrame(loop);
		};
		frame = window.requestAnimationFrame(loop);
		const onKey = (event) => {
			if (event.metaKey || event.ctrlKey || event.altKey) return;
			if (/^[a-zA-Z]$/.test(event.key)) {
				event.preventDefault();
				pressRef.current(event.key.toLowerCase());
			}
		};
		window.addEventListener("keydown", onKey);
		return () => {
			window.cancelAnimationFrame(frame);
			window.removeEventListener("keydown", onKey);
		};
	}, [endsAt, match]);
	(0, import_react.useEffect)(() => {
		if (!match) return;
		let stop = false;
		let lastPose = "";
		const stats = {
			hits: 0,
			clean: 0,
			youRounds: 0,
			foeRounds: 0
		};
		const finish = () => {
			if (done.current) return;
			done.current = true;
			finishRef.current({
				words: stats.hits,
				golden: stats.clean,
				lost: stats.foeRounds > stats.youRounds
			});
		};
		const paint = (viewSnap) => {
			stats.hits = viewSnap.hits;
			stats.clean = viewSnap.clean;
			stats.youRounds = viewSnap.youRounds;
			stats.foeRounds = viewSnap.foeRounds;
			const hurt = viewSnap.youPose === "hurt" && lastPose !== "hurt";
			lastPose = viewSnap.youPose;
			setView({
				phase: viewSnap.phase === "stop" ? "fight" : viewSnap.phase,
				youHp: viewSnap.youHp,
				foeHp: viewSnap.foeHp,
				youRounds: viewSnap.youRounds,
				foeRounds: viewSnap.foeRounds,
				round: viewSnap.round,
				youPos: viewSnap.youPos,
				foePos: viewSnap.foePos,
				youMoves: viewSnap.youMoves,
				foeMoves: viewSnap.foeMoves,
				youPose: viewSnap.youPose,
				foePose: viewSnap.foePose,
				banner: viewSnap.banner,
				turn: Math.max(0, endsAt - Date.now())
			});
			return hurt;
		};
		const pull = async () => {
			const result = await ninjaMatchStateFn({ data: {
				phone: match.phone,
				studentId: match.studentId,
				matchId: match.matchId
			} });
			if (stop || !result.ok) return;
			if (Date.now() >= endsAt) finish();
			if (paint(result.view)) {
				caveAudio.cue("tip");
				flashRef.current("OUCH");
			}
		};
		pressRef.current = (letter) => {
			if (done.current) return;
			ninjaMatchTypeFn({ data: {
				phone: match.phone,
				studentId: match.studentId,
				matchId: match.matchId,
				letter
			} }).then((result) => {
				if (stop || !result.ok) return;
				const hurt = paint(result.view);
				if (result.shake) {
					shakeRef.current(result.shake);
					caveAudio.cue("tip");
				}
				if (result.note === "hit") {
					caveAudio.cue("hit");
					flashRef.current("HIT");
				} else if (result.note === "whiff") flashRef.current("TOO FAR");
				else if (result.note === "trade") {
					caveAudio.cue("tip");
					flashRef.current("CLASH");
				} else if (hurt) {
					caveAudio.cue("tip");
					flashRef.current("OUCH");
				}
			});
		};
		const timer = window.setInterval(() => void pull(), 160);
		pull();
		const onKey = (event) => {
			if (event.metaKey || event.ctrlKey || event.altKey) return;
			if (/^[a-zA-Z]$/.test(event.key)) {
				event.preventDefault();
				pressRef.current(event.key.toLowerCase());
			}
		};
		window.addEventListener("keydown", onKey);
		return () => {
			stop = true;
			window.clearInterval(timer);
			window.removeEventListener("keydown", onKey);
		};
	}, [endsAt, match]);
	const rows = [
		"qwertyuiop",
		"asdfghjkl",
		"zxcvbnm"
	];
	const youClip = rosieClip(view.youPose, view.phase);
	const foeClip = rosieClip(view.foePose, view.phase);
	useRosieSounds(youFighter === "rosie" || foeFighter === "rosie" ? [youClip, foeClip] : []);
	const pips = (count, end) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `mt-1 flex gap-1 ${end ? "justify-end" : ""}`,
		children: [0, 1].map((pip) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-2.5 w-2.5 rounded-full border border-[#fff8ea]/70 ${pip < count ? "bg-accent" : "bg-transparent"}` }, pip))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative z-10 flex h-dvh flex-col px-3 pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-[#fff8ea]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-[1fr_auto_1fr] items-center gap-2 drop-shadow-[0_2px_0_#1a120c]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] font-extrabold uppercase",
							children: "You"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-4 overflow-hidden rounded-sm border-2 border-[#2a1c08] bg-black/50",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full bg-[#3ecf6e]",
								style: { width: `${view.youHp}%` }
							})
						}),
						pips(view.youRounds, false)
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-pixel text-pixel text-accent",
							children: "TYPE ME"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xl font-extrabold tabular-nums",
							children: clock(view.turn)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-right text-[10px] font-extrabold uppercase",
							children: match?.foeName ?? "Rival"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-4 overflow-hidden rounded-sm border-2 border-[#2a1c08] bg-black/50",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ml-auto h-full bg-[#e04b3a]",
								style: { width: `${view.foeHp}%` }
							})
						}),
						pips(view.foeRounds, true)
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mt-2 min-h-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `tm-fighter tm-you tm-lane-${view.youPos} tm-pose-${view.youPose} ${youFighter === "rosie" ? "tm-rosie" : ""} ${view.phase === "intro" && youFighter === "rosie" ? "tm-runin" : ""} ${view.youPose === "idle" && youFighter !== "rosie" ? "tm-idle" : ""}`,
						children: youFighter === "rosie" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RosieMovie, {
							clip: youClip,
							flip: rosieFlip(youClip, "you"),
							rate: rosieRate(youClip)
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: `/art/typeme/you-${view.youPose === "run" ? "idle" : view.youPose}.png`,
							alt: ""
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `tm-fighter tm-foe tm-lane-${view.foePos} tm-pose-${view.foePose} ${foeFighter === "rosie" ? "tm-rosie" : ""} ${view.phase === "intro" && foeFighter === "rosie" ? "tm-runin" : ""} ${view.foePose === "idle" && foeFighter !== "rosie" ? "tm-idle" : ""}`,
						children: foeFighter === "rosie" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RosieMovie, {
							clip: foeClip,
							flip: rosieFlip(foeClip, "foe"),
							rate: rosieRate(foeClip)
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: `/art/typeme/foe-${view.foePose === "run" ? "idle" : view.foePose}.png`,
							alt: ""
						})
					}),
					view.phase === "fight" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "tm-moves",
							children: view.youMoves.map((move) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoveCard, {
								move,
								hot: move.typed.length > 0,
								shake: shakeKind === move.kind
							}, move.kind))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "tm-foe-moves",
							children: view.foeMoves.map((move) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoveCard, {
								move,
								mini: true,
								hot: move.typed.length > 0
							}, move.kind))
						}),
						callout ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "tm-hit",
							children: callout
						}) : null
					] }) : null,
					view.banner && view.phase !== "fight" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "tm-banner",
						children: view.banner
					}, view.banner) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto w-full max-w-3xl space-y-1.5 rounded-lg bg-black/35 px-1.5 py-2 backdrop-blur-[2px]",
				children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-center gap-1.5",
					children: row.split("").map((letter) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => pressRef.current(letter),
						className: "min-h-11 min-w-8 flex-1 rounded-md border-2 border-[#5a3d2a] bg-black/55 text-lg font-extrabold text-[#fff8ea] uppercase",
						children: letter
					}, letter))
				}, row))
			})
		]
	});
}
var CODE_KEY = "blockdojo-ninja-code";
var WHO_KEY = "blockdojo-ninja-id";
var TILES = [
	{
		id: "typing",
		title: "Typing",
		open: true,
		minBelt: "White",
		line: "Catch the ore carts before the dark takes them."
	},
	{
		id: "typeme",
		title: "Type Me If You Can",
		open: true,
		minBelt: "Yellow",
		line: "Type the call. Land the hit before the rival does.",
		art: "/art/typeme-card.jpg"
	},
	{
		id: "belts",
		title: "Belt Match",
		open: false,
		minBelt: null,
		line: "Painted shut."
	},
	{
		id: "rosie",
		title: "Rosie's Path",
		open: false,
		minBelt: null,
		line: "Painted shut."
	}
];
function readSaved(key) {
	try {
		return sessionStorage.getItem(key) ?? "";
	} catch {
		return "";
	}
}
function NinjaHall() {
	const [code, setCode] = (0, import_react.useState)("");
	const [savedCode, setSavedCode] = (0, import_react.useState)("");
	const [ninjas, setNinjas] = (0, import_react.useState)([]);
	const [ninja, setNinja] = (0, import_react.useState)(null);
	const [note, setNote] = (0, import_react.useState)(null);
	const [ranks, setRanks] = (0, import_react.useState)([]);
	const [run, setRun] = (0, import_react.useState)(null);
	const [haul, setHaul] = (0, import_react.useState)(null);
	const [step, setStep] = (0, import_react.useState)("code");
	const [fly, setFly] = (0, import_react.useState)("in");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [gate, setGate] = (0, import_react.useState)(null);
	const [queueId, setQueueId] = (0, import_react.useState)("");
	const [readyAt, setReadyAt] = (0, import_react.useState)(0);
	const [tick, setTick] = (0, import_react.useState)(0);
	const [match, setMatch] = (0, import_react.useState)(null);
	const [cursor, setCursor] = (0, import_react.useState)("rosie");
	const [lockedFighter, setLockedFighter] = (0, import_react.useState)("");
	const [queueMode, setQueueMode] = (0, import_react.useState)("search");
	const [foePick, setFoePick] = (0, import_react.useState)({
		name: "",
		locked: false,
		fighter: ""
	});
	const [youFighter, setYouFighter] = (0, import_react.useState)("");
	const [foeFighter, setFoeFighter] = (0, import_react.useState)("");
	const going = (0, import_react.useRef)(false);
	const lockSent = (0, import_react.useRef)(false);
	const openBoard = async (phone, studentId) => {
		const result = await ninjaBoardFn({ data: {
			phone,
			studentId
		} });
		if (!result.ok) {
			setError(result.reason);
			setStep("code");
			return;
		}
		setNinja(result.ninja);
		setNote(result.note);
		setRanks(result.ranks);
		setRun(result.active);
		setStep(result.active ? "play" : "wall");
	};
	(0, import_react.useEffect)(() => {
		const phone = readSaved(CODE_KEY);
		const studentId = readSaved(WHO_KEY);
		if (!phone) return;
		setSavedCode(phone);
		ninjaRosterFn({ data: { phone } }).then((result) => {
			if (!result.ok) return;
			setNinjas(result.ninjas);
			if (studentId && result.ninjas.some((card) => card.id === studentId)) openBoard(phone, studentId);
			else setStep("names");
		});
	}, []);
	(0, import_react.useEffect)(() => {
		if (step !== "results" && step !== "ranks") return;
		const enter = window.setTimeout(() => setFly("hold"), 900);
		const leave = window.setTimeout(() => setFly("out"), step === "results" ? 5200 : 6400);
		const next = window.setTimeout(() => {
			if (step === "results") {
				setStep("ranks");
				setFly("in");
			} else {
				setStep("wall");
				setFly("in");
			}
		}, step === "results" ? 6e3 : 7200);
		return () => {
			window.clearTimeout(enter);
			window.clearTimeout(leave);
			window.clearTimeout(next);
		};
	}, [step]);
	const submitCode = async () => {
		setBusy(true);
		setError("");
		const result = await ninjaRosterFn({ data: { phone: code } });
		setBusy(false);
		if (!result.ok) {
			setError(result.reason);
			return;
		}
		try {
			sessionStorage.setItem(CODE_KEY, code);
		} catch {}
		setSavedCode(code);
		setNinjas(result.ninjas);
		setStep("names");
	};
	const choose = async (card) => {
		setBusy(true);
		setError("");
		try {
			sessionStorage.setItem(WHO_KEY, card.id);
		} catch {}
		await openBoard(savedCode, card.id);
		setBusy(false);
	};
	const start = async (game) => {
		if (!ninja) return;
		setBusy(true);
		const result = await ninjaStartFn({ data: {
			phone: savedCode,
			studentId: ninja.id,
			game
		} });
		setBusy(false);
		if (!result.ok) {
			setNote("note" in result && result.note ? result.note : "week");
			setError("");
			return;
		}
		setRun({
			...result.run,
			game: result.run.game === "typeme" ? "typeme" : "typing"
		});
		setGate(null);
		setStep("play");
	};
	const enterMatch = (info) => {
		if (!ninja) return;
		setMatch({
			phone: savedCode,
			studentId: ninja.id,
			matchId: info.matchId,
			side: info.side,
			foeName: info.foeName
		});
	};
	const applyQueue = async (result) => {
		if (!result.ok || !("status" in result)) return;
		const view = result;
		if (view.youLocked && view.youFighter) setLockedFighter(view.youFighter);
		if (view.status === "waiting") setQueueMode("search");
		if (view.status === "bot") {
			setQueueMode("bot");
			setFoePick({
				name: "",
				locked: false,
				fighter: ""
			});
		}
		if (view.status === "matched") {
			setQueueMode("found");
			setFoePick({
				name: view.foeName,
				locked: view.foeLocked,
				fighter: view.foeFighter
			});
		}
		if (!view.go || going.current) return;
		going.current = true;
		setYouFighter(view.youFighter || "rosie");
		setFoeFighter(view.foeFighter || "rosie");
		if (view.status === "matched" && view.match) enterMatch(view.match);
		else setMatch(null);
		await start("typeme");
	};
	const ready = async () => {
		if (!ninja) return;
		setBusy(true);
		setError("");
		const result = await ninjaQueueReadyFn({ data: {
			phone: savedCode,
			studentId: ninja.id
		} });
		setBusy(false);
		if (!result.ok) {
			setError(result.reason);
			setGate(null);
			return;
		}
		going.current = false;
		lockSent.current = false;
		setLockedFighter("");
		setCursor("rosie");
		setQueueMode(result.status === "matched" ? "found" : result.status === "bot" ? "bot" : "search");
		setFoePick({
			name: "",
			locked: false,
			fighter: ""
		});
		setQueueId(result.queueId);
		setReadyAt(result.readyAt);
		setGate("queue");
		await applyQueue(result);
	};
	const lockIn = async (fighter) => {
		if (!ninja || !queueId || lockSent.current || lockedFighter) return;
		lockSent.current = true;
		const result = await ninjaQueueLockFn({ data: {
			phone: savedCode,
			studentId: ninja.id,
			queueId,
			fighter
		} });
		if (!result.ok) {
			lockSent.current = false;
			setError(result.reason);
			return;
		}
		setLockedFighter(fighter);
		await applyQueue(result);
	};
	const closeGate = async () => {
		if (queueId && ninja) ninjaQueueCloseFn({ data: {
			phone: savedCode,
			studentId: ninja.id,
			queueId
		} });
		going.current = false;
		lockSent.current = false;
		setLockedFighter("");
		setQueueMode("search");
		setFoePick({
			name: "",
			locked: false,
			fighter: ""
		});
		setGate(null);
		setQueueId("");
	};
	(0, import_react.useEffect)(() => {
		if (gate !== "queue") return;
		const clock = window.setInterval(() => setTick((value) => value + 1), 250);
		return () => window.clearInterval(clock);
	}, [gate]);
	(0, import_react.useEffect)(() => {
		if (gate !== "queue" || !queueId || !ninja) return;
		let stop = false;
		const look = async () => {
			const result = await ninjaQueuePollFn({ data: {
				phone: savedCode,
				studentId: ninja.id,
				queueId
			} });
			if (stop || !result.ok) return;
			await applyQueue(result);
		};
		const timer = window.setInterval(() => void look(), 500);
		look();
		return () => {
			stop = true;
			window.clearInterval(timer);
		};
	}, [
		gate,
		queueId,
		ninja,
		savedCode
	]);
	(0, import_react.useEffect)(() => {
		if (gate !== "queue" || !readyAt || lockSent.current || lockedFighter) return;
		if (Date.now() - readyAt < 3e4) return;
		lockIn("rosie");
	}, [
		tick,
		gate,
		readyAt,
		lockedFighter,
		queueId
	]);
	const finish = async (stats) => {
		if (!ninja || !run) return;
		const game = run.game === "typeme" ? "typeme" : "typing";
		const result = await ninjaFinishFn({ data: {
			phone: savedCode,
			studentId: ninja.id,
			runId: run.id,
			words: stats.words,
			golden: stats.golden,
			lost: Boolean(stats.lost)
		} });
		if (!result.ok) {
			setError(result.reason);
			setStep("wall");
			return;
		}
		setHaul({
			words: result.words,
			coins: result.coins,
			exp: result.exp,
			badges: result.badges,
			ranks: result.ranks,
			game: result.game === "typeme" ? "typeme" : game
		});
		setRanks(result.ranks);
		const board = await ninjaBoardFn({ data: {
			phone: savedCode,
			studentId: ninja.id
		} });
		if (board.ok) setNote(board.note);
		setRun(null);
		setMatch(null);
		setFly("in");
		setStep("results");
	};
	const arena = Boolean(gate) || step === "play" && run?.game === "typeme" || (step === "results" || step === "ranks") && haul?.game === "typeme";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative min-h-dvh overflow-hidden text-fg",
		children: [
			arena ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				className: "absolute inset-0 h-full w-full object-cover object-[center_72%]",
				src: "/art/arena-loop.mp4",
				autoPlay: true,
				muted: true,
				loop: true,
				playsInline: true
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/art/cave.jpg?v=winter",
				alt: "",
				className: "absolute inset-0 h-full w-full object-cover"
			}),
			arena ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-bg-deep/72" }),
			step === "code" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
				className: "relative z-10 mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4",
				onSubmit: (event) => {
					event.preventDefault();
					submitCode();
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border-4 border-accent bg-bg/90 p-5 text-center shadow-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-pixel text-pixel text-accent",
							children: "BLOCKDOJO"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-2 text-2xl font-extrabold",
							children: "Ninja games"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm font-bold text-muted",
							children: "Read the 4-character code on the cave."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: code,
							autoCapitalize: "characters",
							autoComplete: "off",
							maxLength: 4,
							"aria-label": "Code on the cave",
							onChange: (event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4)),
							className: "mt-4 w-full text-center text-3xl font-extrabold tracking-[0.3em] uppercase"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: busy || code.length < 4,
							className: "mt-3 min-h-12 w-full rounded-md border-4 border-accent bg-accent font-extrabold text-accent-ink disabled:opacity-60",
							children: busy ? "Opening…" : "Enter"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 min-h-5 text-sm font-extrabold text-primary",
							role: "status",
							children: error
						})
					]
				})
			}) : null,
			step === "names" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative z-10 mx-auto max-w-5xl px-4 py-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-pixel text-pixel text-accent",
					children: "WHO IS TRAINING?"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 columns-1 gap-3 sm:columns-2 lg:columns-3",
					children: ninjas.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: busy,
						onClick: () => void choose(card),
						className: "mb-3 flex w-full break-inside-avoid items-center gap-3 rounded-lg border-4 border-border bg-bg/90 p-3 text-left shadow-lg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "h-14 w-3 rounded-full",
							style: { background: `var(--color-${beltToken(card.belt)})` }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-lg font-extrabold",
							children: card.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm font-bold text-muted",
							children: [card.belt, " belt"]
						})] })]
					}, card.id))
				})]
			}) : null,
			step === "wall" && ninja && gate === "arm" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 pb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/art/typeme-title.webp?v=2",
					alt: "Type Me If You Can",
					className: "title-float w-[min(40rem,94vw)] drop-shadow-[0_16px_16px_rgba(0,0,0,0.5)]"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 grid w-[min(22rem,88vw)] grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: busy,
						onClick: () => void ready(),
						className: "min-h-12 rounded-md border-4 border-accent bg-accent font-extrabold text-accent-ink disabled:opacity-60",
						children: "Ready"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: busy,
						onClick: () => void closeGate(),
						className: "min-h-12 rounded-md border-4 border-border bg-bg font-extrabold",
						children: "Close"
					})]
				})]
			}) : null,
			step === "wall" && ninja && gate === "queue" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharacterSelect, {
				belt: ninja.belt,
				cursor,
				locked: Boolean(lockedFighter),
				searchLabel: queueMode === "bot" ? "Training rival is ready" : queueMode === "found" ? foePick.name ? `${foePick.name} found` : "Ninja found" : `Looking for a ninja… ${Math.max(0, Math.ceil((3e4 - (Date.now() - readyAt)) / 1e3))}`,
				lockLeft: lockedFighter ? 0 : Math.max(0, Math.ceil((3e4 - (Date.now() - readyAt)) / 1e3)),
				foeLine: queueMode === "found" ? foePick.locked ? `${foePick.name} locked in` : `${foePick.name} is choosing` : lockedFighter && queueMode === "search" ? "Locked. Still looking…" : queueMode === "bot" && !lockedFighter ? "Lock in to fight" : "",
				onCursor: setCursor,
				onLock: (id) => void lockIn(id),
				onClose: () => void closeGate()
			}) : null,
			step === "wall" && ninja && !gate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative z-10 mx-auto max-w-5xl px-4 py-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-pixel text-pixel text-accent",
								children: "GAME WALL"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-2 text-2xl font-extrabold",
								children: ninja.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm font-bold text-muted",
								children: [ninja.belt, " belt"]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								try {
									sessionStorage.removeItem(WHO_KEY);
								} catch {}
								setNinja(null);
								setStep("names");
							},
							className: "min-h-11 rounded-md border-2 border-border bg-bg/85 px-3 font-extrabold",
							children: "Switch ninja"
						})]
					}),
					note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "float-card fixed top-6 left-1/2 z-30 w-[min(36rem,calc(100%-2rem))] rounded-lg border-4 border-accent bg-bg/95 px-4 py-3 text-center text-lg font-extrabold shadow-xl",
						children: turnCopy(note)
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 columns-1 gap-4 sm:columns-2",
						children: TILES.map((tile) => {
							const allowed = !tile.minBelt || beltAllows(ninja.belt, tile.minBelt);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "mb-4 break-inside-avoid overflow-hidden rounded-lg border-4 border-border bg-bg/88 shadow-xl",
								children: [tile.id === "typeme" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative aspect-[16/9] overflow-hidden bg-black",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
											className: "absolute inset-0 h-full w-full object-cover",
											src: "/art/arena-loop.mp4",
											autoPlay: true,
											muted: true,
											loop: true,
											playsInline: true
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: "/art/typeme-title.png?v=2",
											alt: tile.title,
											className: "relative z-10 w-full"
										}),
										tile.minBelt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "absolute top-2 right-2 z-20 flex items-center gap-2 rounded-md border-2 border-black/40 bg-bg/90 px-2 py-1 text-sm font-extrabold",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "h-4 w-10 rounded-full border-2 border-black/40",
													style: { background: `var(--color-${beltToken(tile.minBelt)})` }
												}),
												tile.minBelt,
												" belt and up"
											]
										}) : null
									]
								}) : tile.art ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: tile.art,
										alt: tile.title,
										className: "aspect-[16/9] w-full object-cover"
									}), tile.minBelt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "absolute top-2 right-2 flex items-center gap-2 rounded-md border-2 border-black/40 bg-bg/90 px-2 py-1 text-sm font-extrabold",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "h-4 w-10 rounded-full border-2 border-black/40",
												style: { background: `var(--color-${beltToken(tile.minBelt)})` }
											}),
											tile.minBelt,
											" belt and up"
										]
									}) : null]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3 px-4 pt-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-pixel text-pixel text-accent",
										children: tile.title
									}), tile.minBelt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-2 text-sm font-extrabold",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "h-4 w-10 rounded-full border-2 border-black/40",
												style: { background: `var(--color-${beltToken(tile.minBelt)})` }
											}),
											tile.minBelt,
											" belt and up"
										]
									}) : null]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: tile.art ? "min-h-12 text-lg font-extrabold" : "mt-3 min-h-16 text-lg font-extrabold",
										children: tile.line
									}), tile.open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: busy || Boolean(note) || !allowed,
										onClick: () => {
											if (tile.id === "typeme") {
												setGate("arm");
												return;
											}
											start("typing");
										},
										className: "mt-3 min-h-12 w-full rounded-md border-4 border-accent bg-accent font-extrabold text-accent-ink disabled:cursor-not-allowed disabled:opacity-60",
										children: !allowed && tile.minBelt ? `Needs a ${tile.minBelt} belt` : note ? "Resting" : "Play"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-sm font-extrabold text-muted",
										children: "Soon"
									})]
								})]
							}, tile.id);
						})
					})
				]
			}) : null,
			step === "play" && run ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-10",
				children: run.game === "typeme" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypeMeRun, {
					endsAt: run.endsAt,
					match,
					youFighter,
					foeFighter,
					onFinish: (stats) => void finish(stats)
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TypingRun, {
					endsAt: run.endsAt,
					onFinish: (stats) => void finish(stats)
				})
			}) : null,
			step === "results" && haul ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultsScroll, {
				phase: fly,
				words: haul.words,
				coins: haul.coins,
				exp: haul.exp,
				badges: haul.badges
			}) : null,
			step === "ranks" && haul ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RankScroll, {
				phase: fly,
				ranks: haul.ranks.length ? haul.ranks : ranks,
				you: ninja?.id ?? "",
				heading: haul.game === "typeme" ? "TOP FIGHTER" : "TOP TYPER"
			}) : null,
			error && step !== "code" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "relative z-20 px-4 py-2 text-center font-extrabold text-primary",
				children: error
			}) : null
		]
	});
}
var SplitComponent = NinjaHall;
//#endregion
export { SplitComponent as component };
