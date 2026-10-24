import { o as __toESM } from "../_runtime.mjs";
import { J as require_react, _ as createFileRoute, b as useRouter, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, v as createRootRoute, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { l as todayKey, n as CENTER_CODE, t as ACCESS_CODE } from "./rules-C78vdps4.mjs";
import { t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DUnVjQu-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* Path-based preview hosts serve the dev server under `/{port_id}/` and strip
* that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
* prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
* client routing and generated links aligned with the public URL.
*/
var PATH_BASED_PREVIEW_HOSTS = /* @__PURE__ */ new Set([
	"preview.grok.genai.mil",
	"preview.grok.mil",
	"preview.grokgsac.com"
]);
var PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;
function previewPathPrefix(hostname, pathname) {
	if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return void 0;
	return PORT_ID_PREFIX.exec(pathname)?.[0];
}
function prefixRewrite(prefix) {
	return {
		input: ({ url }) => {
			if (url.pathname === prefix) url.pathname = "/";
			else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = `${prefix}${url.pathname}`;
			return url;
		}
	};
}
function previewPathRewrite() {
	if (typeof window === "undefined") return void 0;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? prefixRewrite(prefix) : void 0;
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function payload(input) {
	if (!input || typeof input !== "object") return {};
	return input;
}
var openDojoFn = createServerFn({ method: "POST" }).validator(payload).handler(createSsrRpc("01007627e4778cfafa45ee98d4d44c69a2fa0f00aaa5da99037679ca0b2d75ea"));
var joinDojoFn = createServerFn({ method: "POST" }).validator(payload).handler(createSsrRpc("0a210339eab04976cf44ed339fdf7a10ecfb72abe475103946828f16d320e11d"));
var pullDojoFn = createServerFn({ method: "POST" }).validator(payload).handler(createSsrRpc("920ca664e56844d30ea77fa5361d89d2bc117f915f07846893a65f7b5ebe8dc2"));
var unlockDirectorFn = createServerFn({ method: "POST" }).validator(payload).handler(createSsrRpc("f51cdb255e78467427c6d43e3b79d6495842a660fb8abdaa0cfecbb553c6fa4f"));
var awardCoinsFn = createServerFn({ method: "POST" }).validator(payload).handler(createSsrRpc("6ebcfe0aa8c769ee9ea96fabaf50aa500588b56f8c19b1c0b2c3f690a1d5b826"));
var redeemItemFn = createServerFn({ method: "POST" }).validator(payload).handler(createSsrRpc("974c4116d59f0ab81ef6bca99bf6f04e7d33b77962a444b53cf9af2f3fc29c11"));
var addStudentFn = createServerFn({ method: "POST" }).validator(payload).handler(createSsrRpc("361c20cc87c92c7f2ddfe952c2f40c21d1c5460e1f2151d780b8b99d7093e384"));
var updateStudentFn = createServerFn({ method: "POST" }).validator(payload).handler(createSsrRpc("3efdb7d4e4ca78ca0dd6f335ea3cf4770936c5e1ed984af0282e7112531d534c"));
var addItemFn = createServerFn({ method: "POST" }).validator(payload).handler(createSsrRpc("a1882d78c0f8ab92f9d5eae759711d84a1e602262ae25be97686dbd9866380f0"));
var updateItemFn = createServerFn({ method: "POST" }).validator(payload).handler(createSsrRpc("0c4612d73b58455c81113da90994b659d7ab1144b5a80804bac1f4e9770bfff5"));
var removeItemFn = createServerFn({ method: "POST" }).validator(payload).handler(createSsrRpc("bfe2f3d7d5deeb3f55b125cd67249c001f946cc36574e3b2d08343a339d48fc4"));
var restoreDemoFn = createServerFn({ method: "POST" }).validator(payload).handler(createSsrRpc("16766b607eb7dc0f41d375c69584246f9048cc0e4fa6ef5bfcaf6b7eb2fcd2d1"));
var setHeroFn = createServerFn({ method: "POST" }).validator(payload).handler(createSsrRpc("c5c2d6fd31f8975d6c321cbc20b6d33fd0f331e71a8708d0fea0b7a87be57a5b"));
var undoLastFn = createServerFn({ method: "POST" }).validator(payload).handler(createSsrRpc("88dac1e25ce49137330540779f84bbaf4e8803ef9da8bf41c15ba0b6997a2975"));
var claimAchievementFn = createServerFn({ method: "POST" }).validator(payload).handler(createSsrRpc("d6ca85a2f7c9c19c13257f645ad3fbfc572b6a4139e71f4c511a8601e974d348"));
var addAchievementFn = createServerFn({ method: "POST" }).validator(payload).handler(createSsrRpc("3b088e1bda10565e3e5947f87c2d325a366925b01b87cb6599a252c7054ca981"));
var updateAchievementFn = createServerFn({ method: "POST" }).validator(payload).handler(createSsrRpc("b90a6ebcbe244f8c451f76f23eb578ff9af6a789ac9445da8f26b278321e0e50"));
var removeAchievementFn = createServerFn({ method: "POST" }).validator(payload).handler(createSsrRpc("38d844e469f5d1ae979b66222b9f2c83997c7e5ddb432e0a83340e393b587ccf"));
var promoteBeltFn = createServerFn({ method: "POST" }).validator(payload).handler(createSsrRpc("cd1a48342ab90e15ca7ebfdd7640747424f8ee7c3b3b86d3b7a2d77d864e961e"));
var dismissCeremonyFn = createServerFn({ method: "POST" }).validator(payload).handler(createSsrRpc("63f9ba84443a71aae46c3515e064c3b9a934bfb68032d9ffb0523db9044b5f27"));
var dayLedgerFn = createServerFn({ method: "POST" }).validator(payload).handler(createSsrRpc("aa5a5d967abce3d2a159d542e4f5bc4736b554e5b8786ddfe03853e38e1d7b8b"));
var listeners = /* @__PURE__ */ new Set();
function notify() {
	for (const listener of listeners) listener();
}
var CaveAudio = class {
	ctx = null;
	master = null;
	music = null;
	sfx = null;
	musicOn = false;
	timer = 0;
	step = 0;
	muted = false;
	unlocked = false;
	engaged = false;
	constructor() {
		if (typeof window === "undefined") return;
		try {
			this.muted = localStorage.getItem("blockdojo-muted") === "1";
		} catch {
			this.muted = false;
		}
	}
	subscribe = (listener) => {
		listeners.add(listener);
		return () => listeners.delete(listener);
	};
	snapshot = () => this.muted ? "off" : this.unlocked ? "on" : "waiting";
	bound = false;
	bind() {
		if (this.bound || typeof window === "undefined") return;
		this.bound = true;
		const unlock = (event) => {
			const target = event.target;
			if (target instanceof Element && target.closest("[data-sound-toggle]")) return;
			this.resume();
		};
		window.addEventListener("pointerdown", unlock);
		window.addEventListener("keydown", unlock);
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible") this.resume();
		});
	}
	armMusic(on) {
		this.musicOn = on;
		if (on) this.resume();
		else this.stopMusicLoop();
	}
	press() {
		const starting = !this.engaged;
		this.engaged = true;
		this.muted = starting ? false : !this.muted;
		try {
			localStorage.setItem("blockdojo-muted", this.muted ? "1" : "0");
		} catch {}
		this.resume();
		this.applyMute();
		notify();
	}
	toggle() {
		this.press();
	}
	cue(kind) {
		const ctx = this.resume();
		if (!ctx || !this.sfx || this.muted) return;
		const now = ctx.currentTime + .01;
		if (kind === "hit") this.hit(now);
		else if (kind === "step") this.blip(now, 180, .05, .04);
		else if (kind === "hop") this.blip(now, 620, .09, .06);
		else if (kind === "sleep") this.blip(now, 196, .2, .03, "sine");
		else if (kind === "tip") this.blip(now, 880, .06, .035);
		else if (kind === "quest") {
			this.blip(now, 98, .45, .08, "triangle", -28);
			this.arp(now + .24, [
				196,
				262,
				330
			], .16);
		} else if (kind === "award") this.arp(now, [
			659,
			880,
			1174
		], .09);
		else if (kind === "welcome") this.arp(now, [
			523,
			659,
			784,
			1046
		], .11);
		else if (kind === "redeem") this.arp(now, [
			392,
			523,
			784,
			988
		], .12);
		else if (kind === "belt") this.arp(now, [
			440,
			554,
			659,
			880
		], .12);
		else if (kind === "shop") this.arp(now, [740, 988], .08);
		else if (kind === "rest") this.blip(now, 330, .28, .05, "triangle", -180);
	}
	resume() {
		if (typeof window === "undefined") return null;
		const AC = window.AudioContext || window.webkitAudioContext;
		if (!AC) return null;
		if (!this.ctx) {
			this.ctx = new AC({ latencyHint: "interactive" });
			this.master = this.ctx.createGain();
			this.music = this.ctx.createGain();
			this.sfx = this.ctx.createGain();
			this.music.gain.value = .16;
			this.sfx.gain.value = .55;
			this.music.connect(this.master);
			this.sfx.connect(this.master);
			this.master.connect(this.ctx.destination);
			this.applyMute();
		}
		if (this.ctx.state === "running") this.markReady();
		else if (this.ctx.state === "suspended") this.ctx.resume().then(() => this.markReady());
		return this.ctx;
	}
	markReady() {
		if (!this.unlocked) {
			this.unlocked = true;
			notify();
		}
		if (this.musicOn) this.startMusicLoop();
	}
	applyMute() {
		if (!this.ctx || !this.master) return;
		const level = this.muted ? 1e-4 : .9;
		this.master.gain.setTargetAtTime(level, this.ctx.currentTime, .03);
	}
	startMusicLoop() {
		if (this.timer || !this.ctx || this.muted) return;
		this.step = 0;
		this.timer = window.setInterval(() => this.tickMusic(), 360);
		this.tickMusic();
	}
	stopMusicLoop() {
		if (this.timer) window.clearInterval(this.timer);
		this.timer = 0;
	}
	tickMusic() {
		const ctx = this.ctx;
		const bus = this.music;
		if (!ctx || !bus || !this.musicOn || this.muted || ctx.state !== "running") return;
		const melody = [
			523,
			587,
			659,
			784,
			659,
			587,
			523,
			494,
			440,
			494,
			523,
			392
		];
		const bass = [
			110,
			110,
			164.8,
			130.8
		];
		const now = ctx.currentTime + .05;
		const note = melody[this.step % melody.length];
		this.voice(bus, now, note, .28, .05, "triangle");
		if (this.step % 4 === 0) this.voice(bus, now, bass[this.step / 4 % bass.length], .7, .04, "square");
		this.step += 1;
	}
	hit(when) {
		if (!this.ctx || !this.sfx) return;
		this.voice(this.sfx, when, 140 + Math.random() * 40, .09, .12, "square");
		this.voice(this.sfx, when, 520 + Math.random() * 80, .05, .05, "triangle");
		const duration = .08;
		const length = Math.floor(this.ctx.sampleRate * duration);
		const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
		const data = buffer.getChannelData(0);
		for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
		const source = this.ctx.createBufferSource();
		source.buffer = buffer;
		const gain = this.ctx.createGain();
		gain.gain.setValueAtTime(.08, when);
		source.connect(gain);
		gain.connect(this.sfx);
		source.start(when);
		source.stop(when + duration);
		source.onended = () => {
			source.disconnect();
			gain.disconnect();
		};
	}
	blip(when, freq, dur, gain, type = "square", slide = 0) {
		if (!this.sfx) return;
		this.voice(this.sfx, when, freq, dur, gain, type, slide);
	}
	arp(when, notes, dur) {
		notes.forEach((note, index) => this.blip(when + index * dur * .85, note, dur, .07, "square"));
	}
	voice(bus, when, freq, dur, level, type, slide = 0) {
		if (!this.ctx) return;
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		osc.type = type;
		osc.frequency.setValueAtTime(freq, when);
		if (slide) osc.frequency.linearRampToValueAtTime(Math.max(40, freq + slide), when + dur);
		gain.gain.setValueAtTime(1e-4, when);
		gain.gain.exponentialRampToValueAtTime(level, when + .015);
		gain.gain.exponentialRampToValueAtTime(1e-4, when + dur);
		osc.connect(gain);
		gain.connect(bus);
		osc.start(when);
		osc.stop(when + dur + .02);
		osc.onended = () => {
			osc.disconnect();
			gain.disconnect();
		};
	}
};
var caveAudio = new CaveAudio();
var GATE_KEY = "blockdojo-gate";
var GATE_DAY_KEY = "blockdojo-gate-day";
var GATE_EVENT = "blockdojo-gate";
function gateOpen(now = Date.now()) {
	if (typeof window === "undefined") return false;
	try {
		return localStorage.getItem("blockdojo-gate") === "CNCE2026" && localStorage.getItem("blockdojo-gate-day") === todayKey(now);
	} catch {
		return false;
	}
}
function unlockGate(code) {
	if (code.toUpperCase().replace(/[^A-Z0-9]/g, "") !== "CNCE2026") return false;
	try {
		localStorage.setItem(GATE_KEY, ACCESS_CODE);
		localStorage.setItem(GATE_DAY_KEY, todayKey());
	} catch {
		return false;
	}
	window.dispatchEvent(new Event(GATE_EVENT));
	return true;
}
var CODE_KEY = "blockdojo-code";
var PHONE_KEY = "blockdojo-phone";
var epoch = 0;
var seenEvent = "";
var dismissedCeremony = "";
function shownCeremony(ceremony) {
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
function writeCode(code) {
	try {
		if (code) localStorage.setItem(CODE_KEY, code);
		else localStorage.removeItem(CODE_KEY);
	} catch {}
}
function readPhone() {
	if (typeof window === "undefined") return "";
	try {
		const parsed = JSON.parse(localStorage.getItem(PHONE_KEY) ?? "");
		return typeof parsed.code === "string" ? parsed.code : "";
	} catch {
		return "";
	}
}
function writePhone(code, hour) {
	try {
		localStorage.setItem(PHONE_KEY, JSON.stringify({
			code,
			hour
		}));
	} catch {}
}
function clearPhone() {
	try {
		localStorage.removeItem(PHONE_KEY);
	} catch {}
}
function timeZone() {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone;
	} catch {
		return "UTC";
	}
}
function pass() {
	return {
		phone: readPhone(),
		zone: timeZone()
	};
}
function applySnapshot(snapshot) {
	const ceremony = shownCeremony(snapshot.ceremony);
	const newest = snapshot.events[0];
	if (!ceremony && newest && newest.id !== seenEvent && newest.sceneUntil > Date.now()) {
		seenEvent = newest.id;
		caveAudio.cue(newest.kind);
	} else if (newest) seenEvent = newest.id;
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
		hydrated: true
	});
}
async function run(task) {
	epoch += 1;
	try {
		return await task();
	} finally {
		epoch += 1;
	}
}
var useDojo = create()((set, get) => ({
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
	vault: 1e3,
	undo: null,
	ceremony: null,
	expClaims: [],
	phoneCode: "",
	phoneHour: "",
	phoneUntil: "",
	phoneLocked: false,
	directorUntil: 0,
	directorToken: "",
	lockDirector: () => set({
		directorUntil: 0,
		directorToken: ""
	}),
	refresh: async (role) => {
		if (!gateOpen()) {
			set({ hydrated: true });
			return;
		}
		const saved = get().code ?? readCode();
		const phone = readPhone();
		const zone = timeZone();
		if (role === "sensei" && !phone) {
			set({
				hydrated: true,
				phoneLocked: true,
				code: CENTER_CODE
			});
			return;
		}
		if (saved !== "CNCE-DOJO") {
			const seen = epoch;
			try {
				const result = await openDojoFn({ data: {
					role,
					phone,
					zone
				} });
				if (seen !== epoch) return;
				if (!result.ok) {
					if (result.phone) clearPhone();
					set({
						hydrated: true,
						phoneLocked: role === "sensei" && Boolean(result.phone),
						code: role === "sensei" ? CENTER_CODE : null
					});
					return;
				}
				writeCode(result.code);
				if (role === "sensei") writePhone(phone, result.snapshot.phoneHour);
				set({
					code: result.code,
					directorToken: "",
					directorUntil: 0,
					phoneLocked: false
				});
				applySnapshot(result.snapshot);
			} catch {
				if (seen === epoch) set({ hydrated: true });
			}
			return;
		}
		if (!get().code) set({ code: saved });
		const seen = epoch;
		try {
			const result = await pullDojoFn({ data: {
				code: saved,
				role,
				phone,
				zone
			} });
			if (seen !== epoch) return;
			if (!result.ok) {
				if (result.phone) {
					clearPhone();
					set({
						hydrated: true,
						phoneLocked: true,
						code: saved
					});
					return;
				}
				writeCode(null);
				dismissedCeremony = "";
				set({
					hydrated: true,
					code: null,
					students: [],
					items: [],
					events: [],
					ceremony: null,
					phoneLocked: false
				});
				return;
			}
			if (role === "sensei") writePhone(phone, result.snapshot.phoneHour);
			set({ phoneLocked: false });
			applySnapshot(result.snapshot);
		} catch {
			if (seen === epoch) set({
				hydrated: true,
				code: saved
			});
		}
	},
	openDojo: async (role) => {
		try {
			const result = await run(() => openDojoFn({ data: {
				role,
				...pass()
			} }));
			if (!result.ok) return result;
			writeCode(result.code);
			set({
				code: result.code,
				directorToken: "",
				directorUntil: 0
			});
			applySnapshot(result.snapshot);
			return { ok: true };
		} catch {
			return {
				ok: false,
				reason: "The cave couldn't open. Try again."
			};
		}
	},
	joinDojo: async (role, code) => {
		try {
			const result = await run(() => joinDojoFn({ data: {
				role,
				code,
				...pass()
			} }));
			if (!result.ok) return result;
			writeCode(result.code);
			set({
				code: result.code,
				directorToken: "",
				directorUntil: 0
			});
			applySnapshot(result.snapshot);
			return { ok: true };
		} catch {
			return {
				ok: false,
				reason: "The cave couldn't open. Try again."
			};
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
			hydrated: true
		});
	},
	unlockDirector: async (pin) => {
		const code = get().code;
		if (!code) return {
			ok: false,
			reason: "Join a dojo first."
		};
		try {
			const result = await unlockDirectorFn({ data: {
				code,
				pin,
				...pass()
			} });
			if (!result.ok) return {
				ok: false,
				reason: result.reason
			};
			set({
				directorToken: result.token,
				directorUntil: result.until
			});
			return { ok: true };
		} catch {
			return {
				ok: false,
				reason: "The pad didn't answer. Try again."
			};
		}
	},
	awardCoins: async (studentId, amount) => {
		const code = get().code;
		if (!code) return {
			ok: false,
			reason: "Join a dojo first."
		};
		try {
			const result = await run(() => awardCoinsFn({ data: {
				code,
				studentId,
				amount,
				...pass()
			} }));
			if (result.ok) applySnapshot(result.snapshot);
			return result.ok ? { ok: true } : result;
		} catch {
			return {
				ok: false,
				reason: "The payout didn't land. Try again."
			};
		}
	},
	redeem: async (studentId, itemId) => {
		const code = get().code;
		if (!code) return {
			ok: false,
			reason: "Join a dojo first."
		};
		try {
			const result = await run(() => redeemItemFn({ data: {
				code,
				studentId,
				itemId,
				...pass()
			} }));
			if (result.ok) applySnapshot(result.snapshot);
			return result.ok ? { ok: true } : result;
		} catch {
			return {
				ok: false,
				reason: "The redeem didn't land. Try again."
			};
		}
	},
	addStudent: async (input) => {
		const code = get().code;
		if (!code) return {
			ok: false,
			reason: "The cave isn't open yet."
		};
		try {
			const result = await run(() => addStudentFn({ data: {
				code,
				input,
				token: get().directorToken,
				...pass()
			} }));
			if (!result.ok) return result;
			applySnapshot(result.snapshot);
			return {
				ok: true,
				id: result.id
			};
		} catch {
			return {
				ok: false,
				reason: "The ninja didn't join. Try again."
			};
		}
	},
	updateStudent: async (studentId, patch) => {
		const code = get().code;
		if (!code) return {
			ok: false,
			reason: "Join a dojo first."
		};
		try {
			const result = await run(() => updateStudentFn({ data: {
				code,
				studentId,
				patch,
				token: get().directorToken,
				...pass()
			} }));
			if (result.ok) applySnapshot(result.snapshot);
			return result.ok ? { ok: true } : result;
		} catch {
			return {
				ok: false,
				reason: "The ninja didn't save. Try again."
			};
		}
	},
	addItem: async (input) => {
		const code = get().code;
		if (!code) return "";
		try {
			const result = await run(() => addItemFn({ data: {
				code,
				input,
				token: get().directorToken,
				...pass()
			} }));
			if (!result.ok) return "";
			applySnapshot(result.snapshot);
			return result.id;
		} catch {
			return "";
		}
	},
	updateItem: async (itemId, patch) => {
		const code = get().code;
		if (!code) return {
			ok: false,
			reason: "Join a dojo first."
		};
		try {
			const result = await run(() => updateItemFn({ data: {
				code,
				itemId,
				patch,
				token: get().directorToken,
				...pass()
			} }));
			if (result.ok) applySnapshot(result.snapshot);
			return result.ok ? { ok: true } : result;
		} catch {
			return {
				ok: false,
				reason: "The prize didn't save. Try again."
			};
		}
	},
	removeItem: async (itemId) => {
		const code = get().code;
		if (!code) return {
			ok: false,
			reason: "Join a dojo first."
		};
		try {
			const result = await run(() => removeItemFn({ data: {
				code,
				itemId,
				token: get().directorToken,
				...pass()
			} }));
			if (result.ok) applySnapshot(result.snapshot);
			return result.ok ? { ok: true } : result;
		} catch {
			return {
				ok: false,
				reason: "The prize didn't leave. Try again."
			};
		}
	},
	restoreDemo: async () => {
		const code = get().code;
		if (!code) return {
			ok: false,
			reason: "Join a dojo first."
		};
		try {
			const result = await run(() => restoreDemoFn({ data: {
				code,
				token: get().directorToken,
				...pass()
			} }));
			if (result.ok) applySnapshot(result.snapshot);
			return result.ok ? { ok: true } : result;
		} catch {
			return {
				ok: false,
				reason: "The sample dojo didn't restore."
			};
		}
	},
	setHero: async (hero) => {
		const code = get().code;
		if (!code) return {
			ok: false,
			reason: "Join a dojo first."
		};
		try {
			const result = await run(() => setHeroFn({ data: {
				code,
				hero,
				...pass()
			} }));
			if (result.ok) applySnapshot(result.snapshot);
			return result.ok ? { ok: true } : result;
		} catch {
			return {
				ok: false,
				reason: "The cave ninja didn't change."
			};
		}
	},
	undoLast: async () => {
		const code = get().code;
		if (!code) return {
			ok: false,
			reason: "Join a dojo first."
		};
		try {
			const result = await run(() => undoLastFn({ data: {
				code,
				...pass()
			} }));
			if (result.ok) applySnapshot(result.snapshot);
			return result.ok ? { ok: true } : result;
		} catch {
			return {
				ok: false,
				reason: "Couldn't undo that."
			};
		}
	},
	claimAchievement: async (studentId, achievementId) => {
		const code = get().code;
		if (!code) return {
			ok: false,
			reason: "Join a dojo first."
		};
		try {
			const result = await run(() => claimAchievementFn({ data: {
				code,
				studentId,
				achievementId,
				...pass()
			} }));
			if (result.ok) applySnapshot(result.snapshot);
			return result.ok ? { ok: true } : result;
		} catch {
			return {
				ok: false,
				reason: "That achievement didn't land."
			};
		}
	},
	addAchievement: async (input) => {
		const code = get().code;
		if (!code) return "";
		try {
			const result = await run(() => addAchievementFn({ data: {
				code,
				input,
				token: get().directorToken,
				...pass()
			} }));
			if (!result.ok) return "";
			applySnapshot(result.snapshot);
			return result.id;
		} catch {
			return "";
		}
	},
	updateAchievement: async (achievementId, patch) => {
		const code = get().code;
		if (!code) return {
			ok: false,
			reason: "Join a dojo first."
		};
		try {
			const result = await run(() => updateAchievementFn({ data: {
				code,
				achievementId,
				patch,
				token: get().directorToken,
				...pass()
			} }));
			if (result.ok) applySnapshot(result.snapshot);
			return result.ok ? { ok: true } : result;
		} catch {
			return {
				ok: false,
				reason: "The achievement didn't save."
			};
		}
	},
	removeAchievement: async (achievementId) => {
		const code = get().code;
		if (!code) return {
			ok: false,
			reason: "Join a dojo first."
		};
		try {
			const result = await run(() => removeAchievementFn({ data: {
				code,
				achievementId,
				token: get().directorToken,
				...pass()
			} }));
			if (result.ok) applySnapshot(result.snapshot);
			return result.ok ? { ok: true } : result;
		} catch {
			return {
				ok: false,
				reason: "The achievement didn't leave."
			};
		}
	},
	promoteBelt: async (studentId) => {
		const code = get().code;
		if (!code) return {
			ok: false,
			reason: "Join a dojo first."
		};
		try {
			const result = await run(() => promoteBeltFn({ data: {
				code,
				studentId,
				...pass()
			} }));
			if (result.ok) applySnapshot(result.snapshot);
			return result.ok ? { ok: true } : result;
		} catch {
			return {
				ok: false,
				reason: "The belt didn't move. Try again."
			};
		}
	},
	linkPhone: async (phone) => {
		const typed = phone.toUpperCase().replace(/[^A-Z0-9]/g, "");
		if (typed.length < 4) return {
			ok: false,
			reason: "Enter the 4-letter code on the cave."
		};
		try {
			const result = await run(() => pullDojoFn({ data: {
				code: CENTER_CODE,
				role: "sensei",
				phone: typed,
				zone: timeZone()
			} }));
			if (!result.ok) {
				clearPhone();
				return {
					ok: false,
					reason: result.phone ? "That code isn't on the cave right now." : result.reason
				};
			}
			writeCode(CENTER_CODE);
			writePhone(typed, result.snapshot.phoneHour);
			set({
				code: CENTER_CODE,
				phoneLocked: false
			});
			applySnapshot(result.snapshot);
			return { ok: true };
		} catch {
			return {
				ok: false,
				reason: "The cave didn't answer. Try again."
			};
		}
	},
	dismissCeremony: async (ceremonyId) => {
		const code = get().code;
		if (!code) return {
			ok: false,
			reason: "Join a dojo first."
		};
		dismissedCeremony = ceremonyId;
		set({ ceremony: null });
		try {
			const result = await run(() => dismissCeremonyFn({ data: {
				code,
				ceremonyId
			} }));
			if (result.ok) {
				applySnapshot(result.snapshot);
				return { ok: true };
			}
			if (dismissedCeremony === ceremonyId) dismissedCeremony = "";
			return result;
		} catch {
			if (dismissedCeremony === ceremonyId) dismissedCeremony = "";
			return {
				ok: false,
				reason: "The ceremony stayed up. Tap the TV again."
			};
		}
	},
	dayLedger: async (timeZone) => {
		const code = get().code;
		if (!code) return {
			ok: false,
			reason: "Join a dojo first."
		};
		try {
			const result = await dayLedgerFn({ data: {
				code,
				timeZone,
				...pass()
			} });
			if (!result.ok) return result;
			applySnapshot(result.snapshot);
			return {
				ok: true,
				subject: result.subject,
				body: result.body
			};
		} catch {
			return {
				ok: false,
				reason: "The ledger didn't open. Try again."
			};
		}
	}
}));
function DojoProvider({ children }) {
	(0, import_react.useEffect)(() => {
		let stop = false;
		const tick = async () => {
			if (stop) return;
			const role = window.location.pathname.startsWith("/sensei") ? "sensei" : "display";
			await useDojo.getState().refresh(role);
		};
		tick();
		let timer = 0;
		const loop = () => {
			timer = window.setTimeout(async () => {
				await tick();
				if (!stop) loop();
			}, document.hidden ? 4e3 : 1e3);
		};
		loop();
		const onStorage = (event) => {
			if (event.key === "blockdojo-code") tick();
		};
		const onGate = () => void tick();
		window.addEventListener("storage", onStorage);
		window.addEventListener(GATE_EVENT, onGate);
		return () => {
			stop = true;
			window.clearTimeout(timer);
			window.removeEventListener("storage", onStorage);
			window.removeEventListener(GATE_EVENT, onGate);
		};
	}, []);
	return children;
}
var styles_default = "/assets/styles-ByBQa8sI.css";
var APP_NAME = "BLOCKDOJO";
var Route$2 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Ambient 16-bit mine for the dojo TV, and a Sensei desk for coins, belts, and prize checkout."
			},
			{
				name: "theme-color",
				content: "#1A120C"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Nunito:wght@600;800&family=Press+Start+2P&display=swap"
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DojoProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$1 = () => import("./routes-DBDz786T.mjs");
var Route$1 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./sensei-CHqvKFQ0.mjs");
var Route = createFileRoute("/sensei")({
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	head: () => ({ meta: [{ title: "Sensei desk · BLOCKDOJO" }] })
});
var rootRouteChildren = {
	IndexRoute: Route$1.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$2
	}),
	SenseiRoute: Route.update({
		id: "/sensei",
		path: "/sensei",
		getParentRoute: () => Route$2
	})
};
var routeTree = Route$2._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		rewrite: previewPathRewrite(),
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { gateOpen as a, GATE_EVENT as i, CODE_KEY as n, unlockGate as o, useDojo as r, caveAudio as s, router_exports as t };
