import { o as __toESM } from "../_runtime.mjs";
import { J as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as gateOpen, i as GATE_EVENT, o as unlockGate, r as useDojo, s as caveAudio } from "./router-DUnVjQu-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sound-toggle-BL5Wgsml.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DojoLoading() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-extrabold",
			children: "Opening the cave…"
		})
	});
}
function useDoor() {
	const [door, setDoor] = (0, import_react.useState)("wait");
	(0, import_react.useEffect)(() => {
		const sync = () => setDoor(gateOpen() ? "open" : "locked");
		sync();
		window.addEventListener(GATE_EVENT, sync);
		window.addEventListener("storage", sync);
		const timer = window.setInterval(sync, 3e4);
		return () => {
			window.removeEventListener(GATE_EVENT, sync);
			window.removeEventListener("storage", sync);
			window.clearInterval(timer);
		};
	}, []);
	return door;
}
function AccessGate() {
	const [code, setCode] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const enter = () => {
		setBusy(true);
		const opened = unlockGate(code);
		setBusy(false);
		if (!opened) setError("That code doesn't open the dojo.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/art/cave.jpg",
				alt: "",
				className: "absolute inset-0 h-full w-full object-cover"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-bg-deep/80" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "relative z-10 w-full max-w-md rounded-lg border-4 border-accent bg-bg/90 p-5 text-center shadow-xl",
				onSubmit: (event) => {
					event.preventDefault();
					enter();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end justify-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/art/sprites/greet/idle-1.png",
							alt: "",
							className: "h-28 w-auto",
							style: { imageRendering: "pixelated" }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/art/sprites/rosie/walk-1.png",
							alt: "",
							className: "mb-1 h-16 w-auto",
							style: { imageRendering: "pixelated" }
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-pixel text-pixel text-accent",
						children: "BLOCKDOJO"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 text-2xl font-extrabold",
						children: "Enter the dojo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm font-bold text-muted",
						children: "One cave for the whole center. This code lasts until midnight."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mt-4 block text-left text-sm font-extrabold",
						htmlFor: "access-code",
						children: "Access code"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "access-code",
						value: code,
						autoCapitalize: "characters",
						autoCorrect: "off",
						autoComplete: "off",
						spellCheck: false,
						inputMode: "text",
						onChange: (event) => {
							setCode(event.target.value.toUpperCase());
							setError("");
						},
						className: "mt-2 min-h-14 w-full rounded-md border-4 border-accent bg-bg px-3 text-center text-2xl font-extrabold tracking-[0.2em] uppercase"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: busy || code.trim().length < 4,
						className: "mt-3 min-h-14 w-full rounded-md border-4 border-accent bg-accent text-lg font-extrabold text-accent-ink disabled:cursor-not-allowed disabled:opacity-60",
						children: "Open the cave"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 min-h-5 text-sm font-extrabold text-primary",
						role: "status",
						children: error
					})
				]
			})
		]
	});
}
function PhoneLink() {
	const linkPhone = useDojo((state) => state.linkPhone);
	const [code, setCode] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/art/cave.jpg",
				alt: "",
				className: "absolute inset-0 h-full w-full object-cover"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-bg-deep/80" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "relative z-10 w-full max-w-md rounded-lg border-4 border-accent bg-bg/90 p-5 text-center shadow-xl",
				onSubmit: (event) => {
					event.preventDefault();
					setBusy(true);
					linkPhone(code).then((result) => {
						setBusy(false);
						if (!result.ok) setError(result.reason);
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-pixel text-pixel text-accent",
						children: "BLOCKDOJO"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 text-2xl font-extrabold",
						children: "Phone code"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm font-bold text-muted",
						children: "Read the code on the cave TV. It changes every hour. Other phones can use the same one."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mt-4 block text-left text-sm font-extrabold",
						htmlFor: "phone-code",
						children: "Code on the TV"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "phone-code",
						value: code,
						autoCapitalize: "characters",
						autoCorrect: "off",
						autoComplete: "off",
						spellCheck: false,
						maxLength: 4,
						onChange: (event) => {
							setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4));
							setError("");
						},
						className: "mt-2 min-h-14 w-full rounded-md border-4 border-accent bg-bg px-3 text-center text-3xl font-extrabold tracking-[0.3em] uppercase"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: busy || code.length < 4,
						className: "mt-3 min-h-14 w-full rounded-md border-4 border-accent bg-accent text-lg font-extrabold text-accent-ink disabled:cursor-not-allowed disabled:opacity-60",
						children: "Link this phone"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 min-h-5 text-sm font-extrabold text-primary",
						role: "status",
						children: error
					})
				]
			})
		]
	});
}
function SoundToggle() {
	const mode = (0, import_react.useSyncExternalStore)(caveAudio.subscribe, caveAudio.snapshot, () => "waiting");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"data-sound-toggle": true,
		onClick: () => caveAudio.press(),
		"aria-pressed": mode === "on",
		className: "inline-flex min-h-11 items-center rounded-md border-2 border-border bg-bg/85 px-3 font-extrabold text-fg shadow-lg",
		children: mode === "off" ? "Sound off" : mode === "on" ? "Sound on" : "Tap for sound"
	});
}
//#endregion
export { useDoor as a, SoundToggle as i, DojoLoading as n, PhoneLink as r, AccessGate as t };
