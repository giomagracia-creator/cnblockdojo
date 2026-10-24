import { o as __toESM } from "../_runtime.mjs";
import { J as require_react, x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as displayName, i as beltToken, r as beltClip } from "./types-CCDBXf57.mjs";
import { r as useDojo, s as caveAudio } from "./router-DUnVjQu-.mjs";
import { a as useDoor, i as SoundToggle, n as DojoLoading, t as AccessGate } from "./sound-toggle-BL5Wgsml.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DBDz786T.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MINING_TIPS = [
	"Hey, snap that move block under the green flag. That's how the ninja starts.",
	"If the loop feels endless, check the stop. Every good dig has a finish line.",
	"Drag an if-block around the prize. The cave only opens when the answer is yes.",
	"Rosie likes repeat blocks. Do the cool part, then do it again.",
	"Stuck? Pull the blocks apart and try one piece. Small snaps still count.",
	"A variable is a pouch. Name it so you remember what you dropped in.",
	"Wait blocks are breathers. Let the sprite finish the hop before the next move.",
	"Broadcast is a shout across the cave. One sprite calls, another answers.",
	"Costume changes are the belt ceremony. Same ninja, new look.",
	"The green flag is the sensei's clap. Everything listens when it starts.",
	"If it only works once, you probably wanted a forever loop. Or a repeat.",
	"Clone blocks are extra ninjas. Handy, but tell them when to leave.",
	"Touching color is a secret door. Pick a color the cave actually uses.",
	"Ask block is you talking to a ninja. Save the answer, then use it.",
	"Operators are the math snacks. Add, compare, and join words.",
	"Glide is the smooth walk. Move is the quick step. Both belong.",
	"Hide and show are lights. Don't leave a sprite invisible by accident.",
	"A list is a scroll of names. Add one, then say the first item out loud.",
	"When I receive is a listener. No message, no dance. That's fair.",
	"Try the weird path. What if the coins are zero? What if the name is blank?",
	"Comments are whispers to future you. Be kind. You will be tired later.",
	"Duplicate a stack, then change one block. That's how new moves are born.",
	"The backpack saves a move you love. Drag it back when the next ninja needs it.",
	"Size blocks make the reward feel huge. Use them on purpose.",
	"Point towards is a compass. The pet always knows where the ninja went.",
	"If-else is a fork in the tunnel. One path for yes, one path for not yet.",
	"Repeat until is patient. It keeps mining until the rock finally cracks.",
	"Say blocks are the speech bubble. Short, warm, and easy to read.",
	"Sound blocks are the cheer. Play one when the prize lands.",
	"Pen blocks draw the path. Clear it when the cave gets messy.",
	"Sensing asks the world. Is the mouse down? Is the key pressed? Listen.",
	"A custom block is your own move. Name it like a sensei would.",
	"Don't stack ten waits. One clear pause beats a pile of tiny ones.",
	"Negative numbers walk backward. Useful, and a little funny.",
	"Join words with a space. Otherwise the name sticks to the belt.",
	"Round the score if it grows a tail of decimals. Ninjas like clean coins.",
	"The stage is the cave wall. Backgrounds change the mood, not the rules.",
	"Debug by saying the variable. If the pouch is empty, you'll see it.",
	"Make the first block obvious. A stranger should know how the story starts.",
	"Rosie says: one brave snap, then watch. Curiosity is the whole dojo.",
	"Drag slowly. The highlight means it will snap. Trust the glow.",
	"A forever loop with no wait can freeze the cave. Give it a breath.",
	"When this sprite clicked is a secret handshake. Tap the ninja, start the move.",
	"Compare blocks ask bigger, smaller, or the same. The if-block loves an answer.",
	"Keep the reward block at the end. Earn it, then celebrate.",
	"Delete the extra blocks. A short stack you understand beats a tangle.",
	"Cloud variables are shared pouches. Only use them when everyone should see.",
	"The stop block is a bow. Use it when the scene is done.",
	"If two sprites talk at once, give one a tiny wait. Let the other finish.",
	"You already know more than the empty stage. Snap the next block."
];
var recent = [];
function nextTip() {
	const fresh = MINING_TIPS.filter((tip) => !recent.includes(tip));
	const pool = fresh.length ? fresh : MINING_TIPS;
	const tip = pool[Math.floor(Math.random() * pool.length)] ?? MINING_TIPS[0];
	recent.unshift(tip);
	if (recent.length > 18) recent.pop();
	return tip;
}
var W = 480;
var H = 270;
var GROUND = 214;
var ORE_SPOTS = [
	{
		x: 86,
		ore: "ruby"
	},
	{
		x: 196,
		ore: "emerald"
	},
	{
		x: 312,
		ore: "ruby"
	},
	{
		x: 404,
		ore: "emerald"
	}
];
var CHESTS = [40, 440];
var BODY = 72;
var PET = 36;
var QUIET_MS = 12e5;
var QUEST_LEN = 8.4;
var PLANT_REV = 2;
function questEase(t) {
	const fadeIn = t < 1.15 ? 0 : t < 2.5 ? (t - 1.15) / 1.35 : 1;
	const fadeOut = t < 6.45 ? 1 : t > 8.15 ? 0 : 1 - (t - 6.45) / 1.7;
	const u = Math.max(0, Math.min(1, Math.min(fadeIn, fadeOut)));
	return u * u * (3 - 2 * u);
}
function liveScene() {
	if (useDojo.getState().ceremony) return void 0;
	return useDojo.getState().events.find((event) => (event.sceneUntil ?? 0) > Date.now());
}
function measureSprite(image) {
	const scratch = document.createElement("canvas");
	scratch.width = image.naturalWidth;
	scratch.height = image.naturalHeight;
	const ctx = scratch.getContext("2d", { willReadFrequently: true });
	if (!ctx) return {
		image,
		head: 0,
		foot: image.naturalHeight - 1,
		anchorX: image.naturalWidth / 2
	};
	ctx.drawImage(image, 0, 0);
	const { data, width, height } = ctx.getImageData(0, 0, scratch.width, scratch.height);
	let head = 0;
	let foot = 0;
	let seen = false;
	for (let y = 0; y < height; y++) {
		let left = -1;
		let right = -1;
		for (let x = 0; x < width; x++) if (data[(y * width + x) * 4 + 3] > 24) {
			if (left < 0) left = x;
			right = x;
		}
		if (left < 0) continue;
		if (!seen && right - left + 1 >= 12) {
			head = y;
			seen = true;
		}
		foot = y;
	}
	const body = Math.max(1, foot - head);
	const bandTop = foot - body * .22;
	const xs = [];
	for (let y = Math.floor(bandTop); y <= foot; y++) for (let x = 0; x < width; x++) if (data[(y * width + x) * 4 + 3] > 24) xs.push(x);
	xs.sort((a, b) => a - b);
	const anchorX = xs.length ? xs[Math.floor(xs.length / 2)] : width / 2;
	return {
		image,
		head: seen ? head : 0,
		foot,
		anchorX
	};
}
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.decoding = "async";
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error(src));
		image.src = src;
	});
}
async function loadFrames(prefix, names) {
	return Promise.all(names.map((name) => loadImage(`${prefix}${name}.png`)));
}
function MineStage() {
	const canvasRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		canvas.width = W;
		canvas.height = H;
		caveAudio.bind();
		caveAudio.armMusic(true);
		const questCall = () => {
			const list = useDojo.getState().achievements;
			const daily = list.filter((item) => item.cadence === "daily");
			const weekly = list.filter((item) => item.cadence === "weekly");
			const weeklyFirst = Math.random() < .5;
			const pool = weeklyFirst ? weekly : daily;
			const choices = pool.length ? pool : weeklyFirst ? daily : weekly;
			const closers = [
				"Get it done.",
				"That's the job.",
				"Earn it.",
				"Show me."
			];
			if (!choices.length) return "Daily quest. Code for 40 minutes. Get it done.";
			const item = choices[Math.floor(Math.random() * choices.length)];
			const closer = closers[Math.floor(Math.random() * closers.length)];
			return `${item.cadence === "weekly" ? "Weekly quest" : "Daily quest"}. ${item.name}. ${closer}`;
		};
		let alive = true;
		let raf = 0;
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const state = {
			x: 48,
			node: 0,
			mode: "walk",
			facing: 1,
			frame: 0,
			frameT: 0,
			swings: 0,
			spark: 0,
			flash: 0,
			squash: 0,
			shake: 0,
			cave: null,
			walk: [],
			mine: [],
			sparks: [],
			ruby: null,
			emerald: null,
			coin: null,
			chest: null,
			walkSprites: [],
			mineSprites: [],
			greetSprites: [],
			girlWalk: [],
			girlMine: [],
			girlGreet: [],
			plantSprites: [],
			girlPlant: [],
			reward: [],
			rosieSprites: [],
			hopSprites: [],
			rosieX: 300,
			rosieFacing: -1,
			rosieFrame: 0,
			rosieT: 0,
			rosieMood: "wander",
			rosieGoal: 360,
			rosieMoodUntil: 0,
			rosieCheered: false,
			nodes: ORE_SPOTS.map((spot) => ({
				...spot,
				growth: 1
			})),
			chunks: [],
			chunkSeq: 1,
			boomId: "",
			tip: "",
			tipUntil: 0,
			tipNext: 0,
			poseFrame: 0,
			poseT: 0,
			sceneId: "",
			questT: -1,
			quietSince: 0,
			questSting: false,
			questLine: "",
			floaters: [],
			drifts: Array.from({ length: 16 }, (_, index) => ({
				x: index * 37 % W,
				y: 40 + index * 53 % 150,
				speed: 4 + index % 5,
				size: index % 3 === 0 ? 2 : 1,
				phase: index * .7
			})),
			motes: []
		};
		const burst = (x, y) => {
			const colors = [
				"#f0c14b",
				"#7ee0d0",
				"#f4e6cf",
				"#d63a32"
			];
			for (let i = 0; i < 10; i++) {
				const angle = -Math.PI * .15 - Math.random() * Math.PI * .7;
				const speed = 18 + Math.random() * 46;
				state.motes.push({
					x,
					y,
					vx: Math.cos(angle) * speed,
					vy: Math.sin(angle) * speed,
					life: .45 + Math.random() * .35,
					max: .8,
					color: colors[i % colors.length],
					size: 2 + i % 3
				});
			}
		};
		const drawSprite = (sprite, x, feet, facing, bodyHeight = BODY) => {
			if (!sprite) return;
			const scale = bodyHeight / Math.max(1, sprite.foot - sprite.head);
			const destW = sprite.image.width * scale;
			const destH = sprite.image.height * scale;
			ctx.save();
			ctx.translate(Math.round(x), Math.round(feet));
			ctx.scale(facing, 1);
			ctx.drawImage(sprite.image, Math.round(-sprite.anchorX * scale), Math.round(-(sprite.foot + 1) * scale), destW, destH);
			ctx.restore();
		};
		const drawProp = (image, x, y, size, time, phase) => {
			if (!image) return;
			const bob = reduced ? 0 : Math.sin(time * 1.35 + phase) * 2.2;
			const sway = reduced ? 0 : Math.sin(time * .85 + phase) * .08;
			const pulse = reduced ? 1 : 1 + Math.sin(time * 1.8 + phase) * .035;
			ctx.save();
			ctx.translate(x, y + bob);
			ctx.rotate(sway);
			ctx.scale(pulse, pulse);
			ctx.drawImage(image, -size / 2, -size, size, size);
			if (!reduced && Math.sin(time * 2.6 + phase) > .86) {
				ctx.fillStyle = "rgba(244, 230, 207, 0.9)";
				ctx.fillRect(-1, Math.round(-size * .72), 2, 2);
			}
			ctx.restore();
		};
		const wrapLine = (text, max) => {
			const words = text.split(" ");
			const lines = [];
			let line = "";
			for (const word of words) {
				const next = line ? `${line} ${word}` : word;
				if (line && ctx.measureText(next).width > max) {
					lines.push(line);
					line = word;
				} else line = next;
			}
			if (line) lines.push(line);
			return lines.slice(0, 5);
		};
		const drawBubble = (text, anchorX, anchorY, grand = false) => {
			ctx.save();
			ctx.font = grand ? "bold 14px Nunito, sans-serif" : "bold 11px Nunito, sans-serif";
			ctx.textAlign = "left";
			ctx.textBaseline = "top";
			const lines = wrapLine(text, grand ? 210 : 156);
			const widest = Math.max(...lines.map((line) => ctx.measureText(line).width), 36);
			const boxW = Math.min(grand ? 236 : 170, widest + (grand ? 20 : 14));
			const lineH = grand ? 17 : 13;
			const boxH = lines.length * lineH + (grand ? 14 : 10);
			const left = Math.max(6, Math.min(W - boxW - 6, anchorX - boxW / 2));
			const top = Math.max(grand ? 92 : 4, anchorY - boxH - (grand ? 22 : 16));
			ctx.fillStyle = "#1c140f";
			ctx.strokeStyle = "#f0c14b";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.roundRect(left, top, boxW, boxH, 5);
			ctx.fill();
			ctx.stroke();
			const tailX = Math.max(left + 14, Math.min(left + boxW - 14, anchorX));
			ctx.beginPath();
			ctx.moveTo(tailX - 8, top + boxH - 2);
			ctx.lineTo(tailX + 8, top + boxH - 2);
			ctx.lineTo(tailX, top + boxH + 10);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.fillStyle = grand ? "#fff6d0" : "#f4e6cf";
			lines.forEach((line, index) => {
				ctx.fillText(line, left + (grand ? 10 : 7), top + (grand ? 7 : 5) + index * lineH);
			});
			ctx.restore();
		};
		const drawBanner = (live) => {
			const title = live.kind === "award" ? live.detail.replace("coins", "COINS").toUpperCase() : live.kind === "redeem" ? live.detail.toUpperCase() : live.kind === "welcome" ? "WELCOME" : live.kind === "belt" ? `${live.detail.toUpperCase()} BELT` : live.kind === "shop" ? "NEW PRIZE" : "REST EASY";
			ctx.save();
			ctx.fillStyle = "rgba(28, 20, 15, 0.92)";
			ctx.strokeStyle = "#f0c14b";
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.roundRect(36, 46, 408, 38, 4);
			ctx.fill();
			ctx.stroke();
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "#f0c14b";
			ctx.font = "8px 'Press Start 2P', monospace";
			ctx.fillText(title.slice(0, 16), W / 2, 58);
			ctx.font = "bold 12px Nunito, sans-serif";
			ctx.fillStyle = "#fff6d0";
			ctx.fillText(live.studentName || "The dojo", W / 2, 74);
			ctx.restore();
		};
		const draw = (time) => {
			ctx.imageSmoothingEnabled = false;
			ctx.clearRect(0, 0, W, H);
			ctx.save();
			if (state.shake > 0) ctx.translate((Math.random() - .5) * state.shake, (Math.random() - .5) * state.shake);
			const live = liveScene();
			const questing = state.questT >= 0 && !live;
			const ease = questing && !reduced ? questEase(state.questT) : 0;
			if (ease > .001) {
				const zoom = 1 + ease * 1.55;
				const fx = state.x;
				const fy = 148;
				const sx = fx + (W / 2 - fx) * ease;
				const sy = fy + (H * .42 - fy) * ease;
				ctx.translate(sx, sy);
				ctx.scale(zoom, zoom);
				ctx.translate(-fx, -148);
			}
			if (state.cave) ctx.drawImage(state.cave, 0, 0, W, H);
			else {
				ctx.fillStyle = "#1a120c";
				ctx.fillRect(0, 0, W, H);
			}
			if (state.flash > 0) {
				const ring = (1 - state.flash) * 70 + 8;
				ctx.globalAlpha = state.flash * .45;
				ctx.strokeStyle = "#f0c14b";
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.arc(state.x, 168, ring, 0, Math.PI * 2);
				ctx.stroke();
				ctx.globalAlpha = state.flash * .12;
				ctx.fillStyle = "#f0c14b";
				ctx.fillRect(0, 0, W, H);
				ctx.globalAlpha = 1;
			}
			const flicker = .35 + Math.sin(time * 3.2) * .08;
			const lanternSway = reduced ? 0 : Math.sin(time * .7) * 4;
			ctx.fillStyle = `rgba(240, 193, 75, ${flicker * .18})`;
			ctx.beginPath();
			ctx.ellipse(168 + lanternSway, 78, 46, 28, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.ellipse(392 - lanternSway * .6, 92, 36, 22, 0, 0, Math.PI * 2);
			ctx.fill();
			drawProp(state.chest, CHESTS[0], 210, 28, time, .4);
			drawProp(state.chest, CHESTS[1], 210, 28, time, 2.2);
			drawProp(state.coin, 48, 178, 14, time, 1.7);
			drawProp(state.ruby, 132, 148, 22, time, .2);
			drawProp(state.emerald, 248, 156, 18, time, 2.1);
			drawProp(state.ruby, 356, 142, 20, time, 3.3);
			drawProp(state.emerald, 438, 150, 18, time, 4.2);
			for (const node of state.nodes) {
				if (node.growth <= .04) continue;
				const ore = node.ore === "ruby" ? state.ruby : state.emerald;
				const squash = state.mode === "mine" && Math.abs(state.x - (node.x - 26)) < 8 ? state.squash : 0;
				const bob = reduced ? 0 : Math.sin(time * 1.6 + node.x) * 2 * node.growth;
				if (!ore) continue;
				const grow = Math.max(.05, node.growth);
				ctx.save();
				ctx.translate(node.x, 206 + bob + (1 - grow) * 28);
				ctx.scale(grow, grow * (1 - squash));
				ctx.drawImage(ore, -23, -46, 46, 46);
				ctx.restore();
			}
			for (const chunk of state.chunks) {
				if (chunk.carried) continue;
				const ore = chunk.ore === "ruby" ? state.ruby : state.emerald;
				if (!ore) continue;
				const bob = reduced ? 0 : Math.sin(time * 3 + chunk.x) * 1.5;
				ctx.drawImage(ore, chunk.x - 9, 190 + bob, 18, 18);
			}
			const girl = useDojo.getState().hero === "girl" && state.girlWalk.length > 0;
			const walks = girl ? state.girlWalk : state.walkSprites;
			const mines = girl ? state.girlMine : state.mineSprites;
			const greets = (girl ? state.girlGreet : state.greetSprites).length ? girl ? state.girlGreet : state.greetSprites : walks;
			const frames = state.mode === "mine" ? mines : walks;
			const plants = girl && state.girlPlant.length ? state.girlPlant : state.plantSprites;
			const firework = live?.kind === "award" || live?.kind === "redeem";
			const hop = live && !firework ? Math.abs(Math.sin(time * 8)) * 10 : 0;
			const plantAt = (t) => {
				if (t < .42) return 0;
				if (t < .78) return 1;
				if (t < 1.12) return 2;
				if (t < 6.7) return 3;
				const back = Math.min(1, (t - 6.7) / 1.35);
				return 3 - Math.round(back * 3);
			};
			const sprite = live ? greets[state.poseFrame % Math.max(1, greets.length)] : questing && plants.length ? plants[plantAt(state.questT) % plants.length] : frames[state.frame];
			const height = firework ? 84 : live ? 112 : BODY;
			ctx.fillStyle = "rgba(16, 11, 8, 0.45)";
			ctx.beginPath();
			ctx.ellipse(state.x, 212, live ? 26 : 16, live ? 6 : 4, 0, 0, Math.PI * 2);
			ctx.fill();
			if (live && !firework && state.reward.length) {
				const medal = state.reward[state.poseFrame % state.reward.length];
				drawSprite(medal, state.x, GROUND - hop - 6, 1, 88);
			}
			if (live && !firework && state.chest && live.kind === "shop") {
				const size = 54 * (1 + Math.sin(time * 6) * .08);
				ctx.drawImage(state.chest, state.x + 36, GROUND - hop - size - 8, size, size);
			}
			drawSprite(sprite, state.x, GROUND - hop, live ? 1 : state.facing, height);
			if (firework && live) {
				const t = (Date.now() - live.at) / 1e3;
				const handX = state.x + 16;
				const handY = 136;
				const aimX = W / 2;
				if (t < 1.45) {
					const u = t < .55 ? 0 : Math.min(1, (t - .55) / .9);
					const rx = handX + (aimX - handX) * u;
					const ry = handY + -50 * u;
					const angle = u === 0 ? -Math.PI / 2 : Math.atan2(-50, aimX - handX) + Math.PI / 2;
					ctx.save();
					ctx.translate(rx, ry);
					ctx.rotate(angle);
					ctx.fillStyle = "#d63a32";
					ctx.fillRect(-3, -12, 6, 16);
					ctx.fillStyle = "#f0c14b";
					ctx.fillRect(-4, 2, 8, 3);
					ctx.fillStyle = "#f4e6cf";
					ctx.beginPath();
					ctx.moveTo(-3, -12);
					ctx.lineTo(0, -18);
					ctx.lineTo(3, -12);
					ctx.fill();
					ctx.fillStyle = u > 0 ? "#f0c14b" : "#7ee0d0";
					ctx.fillRect(-2, 6, 4, 3 + (u > 0 ? 3 : 0));
					ctx.restore();
				} else if (state.reward.length) {
					const burst = state.reward[Math.min(3, Math.floor((t - 1.45) * 6)) % state.reward.length];
					if (burst && t < 2.4) drawSprite(burst, aimX, 122, 1, 90);
				}
			}
			const rosieSleeping = !live && state.questT < 0 && state.rosieMood === "sleep";
			const beside = Math.abs(state.rosieX - state.x) < 70 && Math.abs(state.rosieX - state.x) > 40;
			const rosieSet = live && beside ? state.hopSprites : state.rosieSprites;
			const rosie = rosieSleeping ? state.rosieSprites[0] : rosieSet[state.rosieFrame % Math.max(1, rosieSet.length)];
			ctx.beginPath();
			ctx.fillStyle = "rgba(16, 11, 8, 0.35)";
			ctx.ellipse(state.rosieX, 215, 10, 3, 0, 0, Math.PI * 2);
			ctx.fill();
			const rosieHop = live && beside ? Math.abs(Math.sin(time * 7)) * 6 : 0;
			drawSprite(rosie, state.rosieX, GROUND + (rosieSleeping ? 3 : 2) - rosieHop, state.rosieFacing, PET);
			const carried = state.chunks.find((chunk) => chunk.carried);
			if (carried) {
				const ore = carried.ore === "ruby" ? state.ruby : state.emerald;
				if (ore) ctx.drawImage(ore, state.rosieX - 8, 162 - rosieHop, 16, 16);
			}
			if (!rosieSleeping) {
				ctx.font = "7px 'Press Start 2P', monospace";
				ctx.textAlign = "center";
				ctx.fillStyle = "#f4e6cf";
				ctx.fillText("Rosie", Math.round(state.rosieX), Math.round(172));
			} else {
				ctx.font = "bold 10px Nunito, sans-serif";
				ctx.textAlign = "center";
				ctx.fillStyle = "#c8d4e8";
				const drift = time * 10 % 14;
				ctx.fillText("z", state.rosieX + 10, 168 - drift);
				ctx.globalAlpha = .7;
				ctx.fillText("z", state.rosieX + 16, 158 - drift * .6);
				ctx.globalAlpha = 1;
			}
			if (state.coin) {
				for (const floater of state.floaters) {
					ctx.globalAlpha = Math.max(0, floater.life);
					ctx.drawImage(state.coin, floater.x - (live ? 11 : 7), floater.y - (live ? 22 : 14), live ? 22 : 14, live ? 22 : 14);
				}
				ctx.globalAlpha = 1;
			}
			if (state.spark > 0 && state.sparks.length) {
				const spark = state.sparks[Math.min(3, Math.floor((1 - state.spark) * 4))];
				if (spark) {
					const tip = state.x + state.facing * 28;
					ctx.globalAlpha = Math.min(1, state.spark * 1.6);
					ctx.drawImage(spark, tip - 28, 136, 56, 56);
					ctx.globalAlpha = 1;
				}
			}
			for (const mote of state.motes) {
				const alpha = Math.max(0, mote.life / mote.max);
				ctx.globalAlpha = alpha;
				ctx.fillStyle = mote.color;
				ctx.fillRect(Math.round(mote.x), Math.round(mote.y), mote.size, mote.size);
			}
			ctx.globalAlpha = 1;
			for (const drift of state.drifts) {
				const alpha = .25 + (Math.sin(time * 1.4 + drift.phase) * .5 + .5) * .45;
				ctx.globalAlpha = alpha;
				ctx.fillStyle = drift.size === 2 ? "#7ee0d0" : "#f0c14b";
				ctx.fillRect(Math.round(drift.x), Math.round(drift.y), drift.size, drift.size);
			}
			ctx.globalAlpha = 1;
			ctx.restore();
			if (ease > .02) {
				const bar = Math.round(ease * 24);
				ctx.fillStyle = "#100c09";
				ctx.fillRect(0, 0, W, bar);
				ctx.fillRect(0, H - bar, W, bar);
			}
			const questTalk = questing && state.questT > 1.7 && state.questT < 7.2 && state.questLine;
			const spoken = firework ? "" : live?.line || (questTalk ? state.questLine : !questing && state.tipUntil > Date.now() ? state.tip : "");
			if (live) drawBanner(live);
			if (spoken) {
				if (questTalk) drawBubble(spoken, W / 2, 86);
				else drawBubble(spoken, state.x, GROUND - hop - height + 8, Boolean(live));
			}
		};
		const step = (dt) => {
			for (const node of state.nodes) if (node.growth < 1) node.growth = Math.min(1, node.growth + dt * .28);
			const ready = state.nodes.findIndex((node, index) => node.growth >= .95 && (index === state.node || state.nodes[state.node].growth < .95));
			if (ready >= 0 && state.nodes[state.node].growth < .95) state.node = ready;
			const target = state.nodes[state.node];
			const stopX = target.x - 26;
			state.shake = Math.max(0, state.shake - dt * 18);
			state.squash = Math.max(0, state.squash - dt * 4);
			state.spark = Math.max(0, state.spark - dt * 2.4);
			state.flash = Math.max(0, state.flash - dt * .9);
			const live = liveScene();
			if (live) {
				if (state.sceneId !== live.id) {
					state.sceneId = live.id;
					state.poseFrame = 0;
					state.poseT = 0;
					state.flash = .85;
					const colors = live.kind === "rest" ? ["#9bb0d0", "#e7eef8"] : live.kind === "welcome" ? [
						"#7ee0d0",
						"#f4e6cf",
						"#f0c14b"
					] : [
						"#f0c14b",
						"#fff6d0",
						"#d63a32",
						"#7ee0d0"
					];
					for (let i = 0; i < 16; i++) {
						const angle = -Math.PI * .15 - Math.random() * Math.PI * .85;
						const speed = 28 + Math.random() * 70;
						state.motes.push({
							x: state.x,
							y: 166,
							vx: Math.cos(angle) * speed,
							vy: Math.sin(angle) * speed,
							life: .7 + Math.random() * .3,
							max: 1,
							color: colors[i % colors.length],
							size: 2 + i % 3
						});
					}
				}
				if ((live.kind === "award" || live.kind === "redeem") && state.boomId !== live.id) {
					if ((Date.now() - live.at) / 1e3 >= 1.35) {
						state.boomId = live.id;
						state.flash = 1;
						state.shake = 6;
						caveAudio.cue("hit");
						for (let i = 0; i < 18; i++) {
							const angle = Math.PI * 2 * i / 18;
							state.floaters.push({
								x: W / 2,
								y: 86,
								vx: Math.cos(angle) * (40 + i % 4 * 16),
								vy: Math.sin(angle) * (30 + i % 3 * 14) - 20,
								life: 1.6
							});
						}
					}
				}
				state.poseT += dt;
				if (state.poseT > .2) {
					state.poseT = 0;
					state.poseFrame += 1;
				}
			} else if (state.questT >= 0) state.sceneId = "";
			else {
				state.sceneId = "";
				if (target.growth < .95) state.mode = "walk";
				if (state.mode === "walk") {
					if (target.growth < .95) {
						state.frameT += dt;
						if (state.frameT > .2) {
							state.frameT = 0;
							state.frame = (state.frame + 1) % Math.max(1, state.walk.length);
						}
					} else {
						const dir = Math.sign(stopX - state.x) || 1;
						state.facing = dir;
						const next = state.x + dir * 38 * dt;
						if (dir > 0 && next >= stopX || dir < 0 && next <= stopX) {
							state.x = stopX;
							state.mode = "mine";
							state.frame = 0;
							state.frameT = 0;
							state.swings = 0;
						} else state.x = next;
						state.frameT += dt;
						if (state.frameT > .16) {
							state.frameT = 0;
							state.frame = (state.frame + 1) % Math.max(1, state.walk.length);
							if (state.frame % 2 === 0) caveAudio.cue("step");
						}
					}
				} else {
					state.facing = 1;
					state.frameT += dt;
					if (state.frameT > .16) {
						state.frameT = 0;
						const count = Math.max(1, state.mine.length);
						const prev = state.frame;
						state.frame = (state.frame + 1) % count;
						if (prev === 2 || count < 3 && state.frame === 0) {
							state.spark = 1;
							state.shake = 3.2;
							state.squash = .18;
							burst(target.x, 178);
							caveAudio.cue("hit");
						}
						if (state.frame === 0) {
							state.swings += 1;
							if (state.swings >= 3) {
								target.growth = 0;
								state.chunks.push({
									id: state.chunkSeq,
									ore: target.ore,
									x: target.x,
									carried: false
								});
								state.chunkSeq += 1;
								state.mode = "walk";
								state.node = (state.node + 1) % state.nodes.length;
								state.frame = 0;
								state.frameT = 0;
							}
						}
					}
				}
			}
			const loose = state.chunks.find((chunk) => !chunk.carried);
			const carriedChunk = state.chunks.find((chunk) => chunk.carried);
			const payShow = Boolean(live && (live.kind === "award" || live.kind === "redeem"));
			const spot = Math.max(28, Math.min(452, state.x + (state.rosieX < state.x ? -62 : 62)));
			const questingNow = state.questT >= 0;
			if ((carriedChunk || loose && !payShow) && !(questingNow && !carriedChunk)) {
				state.rosieCheered = false;
				const goal = carriedChunk ? CHESTS.reduce((best, x) => Math.abs(x - state.rosieX) < Math.abs(best - state.rosieX) ? x : best, CHESTS[0]) : loose.x;
				const gap = goal - state.rosieX;
				if (Math.abs(gap) > 10) {
					const dir = Math.sign(gap) || 1;
					state.rosieFacing = dir;
					state.rosieX += dir * 36 * dt;
					state.rosieT += dt;
					if (state.rosieT > .16) {
						state.rosieT = 0;
						state.rosieFrame += 1;
					}
				} else if (carriedChunk) {
					state.chunks = state.chunks.filter((chunk) => chunk.id !== carriedChunk.id);
					burst(goal, 190);
					caveAudio.cue("hop");
				} else if (loose) loose.carried = true;
			} else if (live || questingNow) {
				state.rosieGoal = spot;
				const gap = state.rosieGoal - state.rosieX;
				if (Math.abs(gap) > 4) {
					const dir = Math.sign(gap) || 1;
					state.rosieFacing = dir;
					state.rosieX += dir * (live ? 42 : 28) * dt;
					state.rosieT += dt;
					if (state.rosieT > .16) {
						state.rosieT = 0;
						state.rosieFrame += 1;
					}
				} else {
					if (!state.rosieCheered) {
						state.rosieCheered = true;
						if (live) caveAudio.cue("hop");
					}
					state.rosieFacing = state.x > state.rosieX ? 1 : -1;
					state.rosieT += dt;
					if (state.rosieT > .14) {
						state.rosieT = 0;
						state.rosieFrame += 1;
					}
				}
			} else {
				state.rosieCheered = false;
				if (Date.now() > state.rosieMoodUntil) {
					if (state.rosieMood === "wander" && Math.random() < .45) {
						state.rosieMood = "sleep";
						state.rosieMoodUntil = Date.now() + 5e3 + Math.random() * 4e3;
						caveAudio.cue("sleep");
					} else {
						state.rosieMood = "wander";
						let next = 40 + Math.random() * 400;
						for (let attempt = 0; attempt < 6 && Math.abs(next - state.x) < 90; attempt++) next = 40 + Math.random() * 400;
						state.rosieGoal = next;
						state.rosieMoodUntil = Date.now() + 7e3 + Math.random() * 4e3;
					}
				}
				if (state.rosieMood === "sleep") state.rosieFrame = 0;
				else {
					const gap = state.rosieGoal - state.rosieX;
					if (Math.abs(gap) > 4) {
						const dir = Math.sign(gap) || 1;
						state.rosieFacing = dir;
						state.rosieX += dir * 22 * dt;
						state.rosieT += dt;
						if (state.rosieT > .2) {
							state.rosieT = 0;
							state.rosieFrame += 1;
						}
					}
				}
				if (!state.tipNext) state.tipNext = Date.now() + 1800;
				if (Date.now() > state.tipNext) {
					state.tip = nextTip();
					state.tipUntil = Date.now() + 7e3;
					state.tipNext = state.tipUntil + 4e3;
					caveAudio.cue("tip");
				}
			}
			for (const floater of state.floaters) {
				floater.life -= dt * .55;
				floater.vy += 70 * dt;
				floater.x += floater.vx * dt;
				floater.y += floater.vy * dt;
			}
			state.floaters = state.floaters.filter((floater) => floater.life > 0);
			for (const mote of state.motes) {
				mote.life -= dt;
				mote.vy += 90 * dt;
				mote.x += mote.vx * dt;
				mote.y += mote.vy * dt;
			}
			state.motes = state.motes.filter((mote) => mote.life > 0);
			if (!reduced) for (const drift of state.drifts) {
				drift.y -= drift.speed * dt;
				drift.x += Math.sin(drift.phase + drift.y * .05) * 6 * dt;
				if (drift.y < 28) {
					drift.y = 176;
					drift.x = (drift.x + 80) % W;
				}
			}
		};
		const tickQuiet = (dt) => {
			if (useDojo.getState().ceremony) {
				state.questT = -1;
				state.quietSince = 0;
				state.questSting = false;
				return;
			}
			if (liveScene()) {
				state.questT = -1;
				state.quietSince = 0;
				state.questSting = false;
				return;
			}
			if (state.plantSprites.length === 0) return;
			if (state.questT >= 0) {
				state.questT += dt;
				if (state.questT > 1.05) {
					state.poseT += dt;
					if (state.poseT > .32) {
						state.poseT = 0;
						state.poseFrame += 1;
					}
				}
				if (!state.questSting && state.questT >= 2.15) {
					state.questSting = true;
					caveAudio.cue("quest");
				}
				if (state.questT >= QUEST_LEN) {
					if (state.mode === "mine") {
						state.frame = Math.max(0, state.mine.length - 1);
						state.frameT = 0;
					}
					state.questT = -1;
					state.quietSince = Date.now();
					state.questSting = false;
					state.tipNext = Date.now() + 5e3;
				}
				return;
			}
			if (!state.quietSince) state.quietSince = Date.now();
			if (Date.now() - state.quietSince >= QUIET_MS) {
				state.questLine = questCall();
				state.questT = 0;
				state.poseFrame = 0;
				state.poseT = 0;
				state.questSting = false;
			}
		};
		let last = performance.now();
		const loop = (now) => {
			if (!alive) return;
			const dt = Math.min(.05, (now - last) / 1e3);
			last = now;
			if (useDojo.getState().ceremony) {
				state.questT = -1;
				state.quietSince = 0;
				state.questSting = false;
				state.sceneId = "";
				raf = requestAnimationFrame(loop);
				return;
			}
			tickQuiet(dt);
			if (!reduced) step(dt);
			draw(now / 1e3);
			raf = requestAnimationFrame(loop);
		};
		(async () => {
			try {
				const [cave, walk, mine, sparks, ruby, emerald, coin, chest, greet, rosie, hop, girlWalk, girlMine, girlGreet, reward, boyPlant, girlPlantFrames] = await Promise.all([
					loadImage("/art/cave.jpg"),
					loadFrames("/art/sprites/walk/walk-", [
						"1",
						"2",
						"3",
						"4"
					]),
					Promise.all([
						1,
						2,
						3,
						4
					].map((frame) => loadImage(`/art/sprites/mine/attack-${frame}.png?v=2`))),
					loadFrames("/art/sprites/sparks/impact-", [
						"1",
						"2",
						"3",
						"4"
					]),
					loadImage("/art/sprites/props/prop-2.png"),
					loadImage("/art/sprites/props/prop-3.png"),
					loadImage("/art/sprites/props/prop-1.png"),
					loadImage("/art/sprites/props/prop-4.png"),
					loadFrames("/art/sprites/greet/idle-", [
						"1",
						"2",
						"3",
						"4"
					]),
					loadFrames("/art/sprites/rosie/walk-", [
						"1",
						"2",
						"3",
						"4"
					]),
					loadFrames("/art/sprites/rosie-hop/jump-", [
						"1",
						"2",
						"3",
						"4"
					]),
					loadFrames("/art/sprites/girl-walk/walk-", [
						"1",
						"2",
						"3",
						"4"
					]),
					loadFrames("/art/sprites/girl-mine/attack-", [
						"1",
						"2",
						"3",
						"4"
					]),
					loadFrames("/art/sprites/girl-greet/idle-", [
						"1",
						"2",
						"3",
						"4"
					]),
					loadFrames("/art/sprites/reward/burst-", [
						"1",
						"2",
						"3",
						"4"
					]),
					Promise.all([
						1,
						2,
						3,
						4
					].map((frame) => loadImage(`/art/sprites/plant/plant-${frame}.png?v=2`))),
					Promise.all([
						1,
						2,
						3,
						4
					].map((frame) => loadImage(`/art/sprites/girl-plant/plant-${frame}.png?v=2`)))
				]);
				if (!alive) return;
				state.cave = cave;
				state.walk = walk;
				state.mine = mine;
				state.walkSprites = walk.map(measureSprite);
				state.mineSprites = mine.map(measureSprite);
				state.greetSprites = greet.map(measureSprite);
				state.girlWalk = girlWalk.map(measureSprite);
				state.girlMine = girlMine.map(measureSprite);
				state.girlGreet = girlGreet.map(measureSprite);
				state.plantSprites = boyPlant.map(measureSprite);
				state.girlPlant = girlPlantFrames.map(measureSprite);
				state.reward = reward.map(measureSprite);
				state.rosieSprites = rosie.map(measureSprite);
				state.hopSprites = hop.map(measureSprite);
				state.sparks = sparks;
				state.ruby = ruby;
				state.emerald = emerald;
				state.coin = coin;
				state.chest = chest;
			} catch {}
			raf = requestAnimationFrame(loop);
		})();
		return () => {
			alive = false;
			caveAudio.armMusic(false);
			cancelAnimationFrame(raf);
		};
	}, [QUIET_MS, PLANT_REV]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref: canvasRef,
		className: "h-full w-full bg-bg-deep object-contain",
		style: { imageRendering: "pixelated" },
		"aria-label": "A ninja mining crystals in a lantern-lit cave"
	});
}
function eventLine(event) {
	if (event.kind === "redeem") return `${event.studentName} redeemed ${event.detail}`;
	if (event.kind === "welcome") return event.detail === "rename" ? `${event.studentName} has a new name` : `${event.studentName} joined the dojo`;
	if (event.kind === "belt") return `${event.studentName} reached ${event.detail}`;
	if (event.kind === "shop") return event.line || `Shop update: ${event.detail}`;
	if (event.kind === "undo") return event.line;
	if (event.kind === "return") return event.line;
	if (event.kind === "rest") return `${event.studentName} is resting`;
	return `${event.studentName} earned ${event.detail}`;
}
function BeltShow({ ceremony }) {
	const dismissCeremony = useDojo((state) => state.dismissCeremony);
	const videoRef = (0, import_react.useRef)(null);
	const [failed, setFailed] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		caveAudio.armMusic(false);
		const video = videoRef.current;
		let armed = false;
		const armTimer = window.setTimeout(() => {
			armed = true;
		}, 400);
		const dismiss = (event) => {
			if (!armed) return;
			const target = event.target;
			if (target instanceof Element && target.closest("[data-sound-toggle]")) return;
			dismissCeremony(ceremony.id);
		};
		window.addEventListener("pointerdown", dismiss, true);
		window.addEventListener("keydown", dismiss, true);
		const start = async () => {
			if (!video) return;
			video.muted = caveAudio.snapshot() === "off";
			try {
				await video.play();
			} catch {
				video.muted = true;
				try {
					await video.play();
				} catch {}
			}
		};
		start();
		return () => {
			window.clearTimeout(armTimer);
			window.removeEventListener("pointerdown", dismiss, true);
			window.removeEventListener("keydown", dismiss, true);
			caveAudio.armMusic(true);
		};
	}, [ceremony.id, dismissCeremony]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[80] flex items-center justify-center bg-black",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": `${ceremony.studentName}, ${ceremony.belt} belt`,
		children: failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-6 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xl font-extrabold text-fg",
				children: [
					ceremony.studentName,
					" tied on a ",
					ceremony.belt,
					" belt."
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm font-bold text-white/70",
				children: "Tap to return to the mine."
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
			ref: videoRef,
			src: beltClip(ceremony.belt),
			className: "h-full w-full object-contain",
			autoPlay: true,
			loop: true,
			playsInline: true,
			preload: "auto",
			onError: () => setFailed(true)
		})
	});
}
function ExpPath({ onClose }) {
	const students = useDojo((state) => state.students);
	const items = useDojo((state) => state.items);
	const [query, setQuery] = (0, import_react.useState)("");
	const prizes = (0, import_react.useMemo)(() => items.filter((item) => item.currency === "exp").sort((a, b) => a.price - b.price || a.name.localeCompare(b.name)), [items]);
	const goal = prizes.at(-1);
	const needle = query.trim().toLowerCase();
	const roster = (0, import_react.useMemo)(() => {
		const active = students.filter((student) => !student.archived);
		active.sort((a, b) => displayName(a).localeCompare(displayName(b), void 0, { sensitivity: "base" }));
		if (!needle) return active;
		return active.filter((student) => displayName(student).toLowerCase().includes(needle));
	}, [students, needle]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "absolute inset-x-3 top-[11.5rem] bottom-[4.25rem] z-30 flex flex-col overflow-hidden rounded-lg border-4 border-accent bg-bg/92 shadow-2xl backdrop-blur-sm sm:inset-x-[8%] sm:top-44 sm:bottom-[5.25rem]",
		role: "dialog",
		"aria-label": "EXP path",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3 border-b-2 border-line px-3 py-3 sm:px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-pixel text-pixel text-accent",
						children: "EXP PATH"
					}), goal ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-lg leading-tight font-extrabold sm:text-2xl",
						children: [goal.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-accent",
							children: [
								" · ",
								goal.price.toLocaleString(),
								" EXP"
							]
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-base font-extrabold",
						children: "No EXP prizes in the shop yet."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "min-h-11 shrink-0 rounded-md border-2 border-border bg-surface px-3 font-extrabold",
					children: "Close"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-3 pt-3 sm:px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "sr-only",
					htmlFor: "exp-search",
					children: "Find a ninja"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "exp-search",
					value: query,
					autoComplete: "off",
					placeholder: "Find a ninja",
					onChange: (event) => setQuery(event.target.value),
					className: "min-h-12 w-full"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 min-h-0 flex-1 space-y-2 overflow-auto px-3 pb-4 sm:px-5",
				children: roster.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "py-6 text-center text-base font-extrabold text-muted",
					children: needle ? "No ninja by that name." : "No ninjas in the cave yet."
				}) : roster.map((student) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExpRow, {
					student,
					prizes,
					goal
				}, student.id))
			})
		]
	});
}
function ExpRow({ student, prizes, goal }) {
	const exp = student.exp ?? 0;
	const width = goal && goal.price > 0 ? Math.max(0, Math.min(100, exp / goal.price * 100)) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-md border-2 border-line bg-surface/80 px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "min-w-0 truncate text-base font-extrabold sm:text-xl",
				children: displayName(student)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "shrink-0 text-base font-extrabold text-accent tabular-nums sm:text-xl",
				children: [exp.toLocaleString(), " EXP"]
			})]
		}), goal ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mt-2 h-3 overflow-hidden rounded-full border border-line bg-bg-deep",
			"aria-hidden": true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-full bg-accent",
				style: { width: `${width}%` }
			}), prizes.filter((prize) => prize.price < goal.price).map((prize) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute top-0 h-full w-0.5 bg-fg/80",
				style: { left: `${prize.price / goal.price * 100}%` }
			}, prize.id))]
		}) : null]
	});
}
function TvScreen() {
	const students = useDojo((state) => state.students);
	const events = useDojo((state) => state.events);
	const hydrated = useDojo((state) => state.hydrated);
	const code = useDojo((state) => state.code);
	const vault = useDojo((state) => state.vault);
	const senseiSeen = useDojo((state) => state.senseiSeen);
	const ceremony = useDojo((state) => state.ceremony);
	const phoneCode = useDojo((state) => state.phoneCode);
	const phoneUntil = useDojo((state) => state.phoneUntil);
	const door = useDoor();
	const [minersOpen, setMinersOpen] = (0, import_react.useState)(false);
	const [expOpen, setExpOpen] = (0, import_react.useState)(false);
	const active = students.filter((student) => !student.archived);
	const week = active.reduce((sum, student) => sum + student.weekCoins, 0);
	const leaders = [...active].sort((a, b) => b.weekCoins - a.weekCoins || b.coins - a.coins).slice(0, 4);
	const feed = events.slice(0, 8);
	const loop = feed.length ? [...feed, ...feed] : [];
	if (door === "locked") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessGate, {});
	if (door !== "open" || !hydrated || !code) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DojoLoading, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative h-dvh overflow-hidden bg-bg-deep text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MineStage, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0",
				style: { background: "radial-gradient(ellipse at center, transparent 45%, color-mix(in srgb, var(--color-bg-deep) 72%, transparent) 100%)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute top-[18%] left-[28%] h-24 w-40 rounded-full blur-2xl",
				style: {
					background: "var(--color-accent)",
					animation: "lantern 3.4s ease-in-out infinite"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "absolute inset-x-0 top-0 z-40 flex flex-col gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pl-[max(0.75rem,env(safe-area-inset-left))] sm:flex-row sm:items-start sm:justify-between sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-2 sm:contents",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 rounded-md border-2 border-border bg-bg/85 px-3 py-2 shadow-lg backdrop-blur-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-pixel text-pixel text-accent",
							children: "BLOCKDOJO"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 truncate text-sm font-extrabold text-fg",
							children: "The mine is open"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 items-center gap-2 sm:order-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoundToggle, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/sensei",
							className: `inline-flex min-h-11 items-center rounded-md border-2 border-border bg-bg/85 px-3 font-extrabold text-fg shadow-lg ${senseiSeen ? "lg:hidden" : ""}`,
							children: "Desk"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border-4 border-accent bg-bg/95 px-3 py-1 text-center shadow-lg sm:order-2 sm:px-4 sm:py-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[10px] font-extrabold tracking-wide text-muted uppercase",
						children: ["Phone code", phoneUntil ? ` · until ${phoneUntil}` : ""]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-3xl font-black tracking-[0.28em] text-accent sm:text-4xl",
						children: phoneCode || "····"
					})]
				})]
			}),
			expOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExpPath, { onClose: () => setExpOpen(false) }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: `${minersOpen && !expOpen ? "block" : "hidden"} absolute bottom-[max(3.25rem,calc(env(safe-area-inset-bottom)+2.75rem))] left-[max(0.75rem,env(safe-area-inset-left))] z-10 w-64 max-w-[calc(100%-1.5rem)] rounded-lg border-2 border-border bg-surface/90 p-3 shadow-xl backdrop-blur-sm lg:hidden`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-pixel text-pixel text-accent",
							children: "TOP MINERS"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setMinersOpen(false),
							className: "text-sm font-extrabold text-muted lg:hidden",
							children: "Close"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs font-bold tracking-wide text-muted uppercase lg:text-sm",
						children: [
							"This week · ",
							week,
							" coins earned"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-2 space-y-1.5",
						children: leaders.map((student, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-2 text-sm font-extrabold lg:text-lg",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-5 text-accent tabular-nums",
									children: index + 1
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "size-2.5 shrink-0 rounded-full border border-fg/30 lg:size-3.5",
									style: { background: `var(--color-${beltToken(student.belt)})` }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "min-w-0 flex-1 truncate",
									children: displayName(student)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums text-accent",
									children: student.weekCoins
								})
							]
						}, student.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 border-t border-line pt-2 text-sm font-extrabold lg:text-base",
						children: ["Dojo vault ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "float-right text-accent tabular-nums",
							children: vault
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setMinersOpen(true),
				className: `${minersOpen || expOpen ? "hidden" : ""} absolute bottom-[max(3.25rem,calc(env(safe-area-inset-bottom)+2.75rem))] left-[max(0.75rem,env(safe-area-inset-left))] z-10 min-h-11 rounded-md border-2 border-border bg-surface/90 px-3 font-extrabold shadow-lg lg:hidden`,
				children: "Top miners"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setExpOpen(true),
				className: `${expOpen ? "hidden" : ""} absolute right-[max(0.75rem,env(safe-area-inset-right))] bottom-[max(3.25rem,calc(env(safe-area-inset-bottom)+2.75rem))] z-20 min-h-11 rounded-md border-2 border-accent bg-surface/90 px-3 font-extrabold text-accent shadow-lg`,
				children: "EXP"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-x-0 z-10 hidden border-t border-line bg-bg/80 px-3 py-1 backdrop-blur-sm lg:block",
				style: { bottom: "max(2.35rem, calc(env(safe-area-inset-bottom) + 1.85rem))" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 overflow-hidden text-sm font-extrabold",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 font-pixel text-pixel text-accent",
							children: "TOP MINERS"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "shrink-0 text-xs font-bold tracking-wide text-muted uppercase",
							children: [week, " this week"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "flex min-w-0 flex-1 items-center gap-4 overflow-hidden",
							children: leaders.map((student, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex min-w-0 items-center gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-accent tabular-nums",
										children: index + 1
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "size-2 shrink-0 rounded-full border border-fg/30",
										style: { background: `var(--color-${beltToken(student.belt)})` }
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "max-w-36 truncate",
										children: displayName(student)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tabular-nums text-accent",
										children: student.weekCoins
									})
								]
							}, student.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "shrink-0",
							children: ["Vault ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-accent tabular-nums",
								children: vault
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-x-0 bottom-0 z-10 border-t-2 border-accent bg-bg/90 px-3 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden overflow-hidden sm:block",
					children: loop.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex w-max gap-8",
						style: { animation: "ticker-slide 28s linear infinite" },
						children: loop.map((event, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-extrabold whitespace-nowrap text-fg",
							children: eventLine(event)
						}, `${event.id}-${index}`))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-extrabold",
						children: "Quiet cave. Coins land here when the desk pays them out."
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate font-extrabold sm:hidden",
					children: feed[0] ? eventLine(feed[0]) : "Waiting for the first payout."
				})]
			}),
			ceremony ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BeltShow, { ceremony }, ceremony.id) : null
		]
	});
}
var SplitComponent = TvScreen;
//#endregion
export { SplitComponent as component };
