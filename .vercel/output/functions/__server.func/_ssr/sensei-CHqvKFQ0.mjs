import { o as __toESM } from "../_runtime.mjs";
import { J as require_react, x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as periodKey, i as ITEM_PRICE_MAX, s as earnedToday } from "./rules-C78vdps4.mjs";
import { a as displayName, i as beltToken, n as BELT_RANK, o as nextBelt, t as BELTS } from "./types-CCDBXf57.mjs";
import { n as CODE_KEY, r as useDojo, s as caveAudio } from "./router-DUnVjQu-.mjs";
import { a as useDoor, i as SoundToggle, n as DojoLoading, r as PhoneLink, t as AccessGate } from "./sound-toggle-BL5Wgsml.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sensei-CHqvKFQ0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KEYS = [
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"C",
	"0",
	"OK"
];
function PinPad({ onClose }) {
	const unlockDirector = useDojo((state) => state.unlockDirector);
	const [digits, setDigits] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [shake, setShake] = (0, import_react.useState)(false);
	const fail = (reason) => {
		setDigits("");
		setError(reason);
		setShake(true);
		window.setTimeout(() => setShake(false), 420);
	};
	const submit = (value) => {
		if (value.length !== 6) {
			fail("Enter all 6 digits.");
			return;
		}
		(async () => {
			const result = await unlockDirector(value);
			if (!result.ok) {
				fail(result.reason);
				return;
			}
			onClose();
		})();
	};
	const press = (key) => {
		if (key === "C") {
			setDigits("");
			setError("");
			return;
		}
		if (key === "OK") {
			submit(digits);
			return;
		}
		const next = `${digits}${key}`.slice(0, 6);
		setDigits(next);
		setError("");
		if (next.length === 6) submit(next);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dialog", {
		open: true,
		className: "fixed inset-0 z-40 m-0 flex h-full w-full items-center justify-center bg-bg-deep/80 p-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-xs border-4 border-accent bg-bg px-4 py-4 shadow-2xl",
			style: {
				animation: shake ? "pin-shake 420ms linear" : void 0,
				imageRendering: "pixelated"
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-pixel text-pixel text-center text-accent",
					children: "DIRECTOR"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-center text-sm font-extrabold text-muted",
					children: "Shop and balance fixes need this pin."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid grid-cols-6 gap-1",
					"aria-label": "Pin entry",
					children: Array.from({ length: 6 }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex h-10 items-center justify-center border-2 border-accent bg-bg-deep font-extrabold text-accent",
						children: digits[index] ? "•" : ""
					}, index))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid grid-cols-3 gap-2",
					children: KEYS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => press(key),
						className: `min-h-14 border-4 font-extrabold text-lg ${key === "OK" ? "border-accent bg-accent text-accent-ink" : "border-border bg-surface text-fg active:translate-y-0.5"}`,
						children: key
					}, key))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 min-h-5 text-center text-sm font-extrabold text-primary",
					role: "status",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "mt-1 min-h-11 w-full border-2 border-border font-extrabold",
					children: "Close"
				})
			]
		})
	});
}
var field = "w-full min-w-0";
function CoinMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: "/art/sprites/props/prop-1.png",
		alt: "",
		className: "inline-block size-5 object-contain align-text-bottom",
		style: { imageRendering: "pixelated" }
	});
}
function BeltDot({ belt }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-block size-2.5 shrink-0 rounded-full border border-fg/25",
		style: { background: `var(--color-${beltToken(belt)})` },
		"aria-hidden": true
	});
}
async function fileToIcon(file) {
	if (file.size > 8e6) throw new Error("Use an image under 8 MB.");
	const bitmap = await createImageBitmap(file);
	const size = 256;
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Could not read that image.");
	const scale = Math.max(size / bitmap.width, size / bitmap.height);
	const width = bitmap.width * scale;
	const height = bitmap.height * scale;
	ctx.drawImage(bitmap, (size - width) / 2, (size - height) / 2, width, height);
	bitmap.close();
	return canvas.toDataURL("image/jpeg", .82);
}
function canRedeem(student, item, claimed) {
	if (!student || student.archived) return "Pick a ninja first.";
	if (item.minBelt && BELT_RANK[student.belt] < BELT_RANK[item.minBelt]) return `Needs ${item.minBelt} belt.`;
	if (item.currency === "exp") {
		if (claimed) return "Already claimed.";
		if ((student.exp ?? 0) < item.price) return "Not enough EXP.";
		return null;
	}
	if (item.stock <= 0) return "Out of stock.";
	if (student.coins < item.price) return "Not enough coins.";
	return null;
}
function SenseiDesk() {
	const students = useDojo((state) => state.students);
	const items = useDojo((state) => state.items);
	const awardCoins = useDojo((state) => state.awardCoins);
	const redeem = useDojo((state) => state.redeem);
	const addStudent = useDojo((state) => state.addStudent);
	const updateStudent = useDojo((state) => state.updateStudent);
	const addItem = useDojo((state) => state.addItem);
	const updateItem = useDojo((state) => state.updateItem);
	const removeItem = useDojo((state) => state.removeItem);
	const restoreDemo = useDojo((state) => state.restoreDemo);
	const directorUntil = useDojo((state) => state.directorUntil);
	const lockDirector = useDojo((state) => state.lockDirector);
	const hydrated = useDojo((state) => state.hydrated);
	const code = useDojo((state) => state.code);
	const displaySeen = useDojo((state) => state.displaySeen);
	const hero = useDojo((state) => state.hero);
	const vault = useDojo((state) => state.vault);
	const setHero = useDojo((state) => state.setHero);
	const undo = useDojo((state) => state.undo);
	const undoLast = useDojo((state) => state.undoLast);
	const achievements = useDojo((state) => state.achievements);
	const claims = useDojo((state) => state.claims);
	const weekStarted = useDojo((state) => state.weekStarted);
	const claimAchievement = useDojo((state) => state.claimAchievement);
	const addAchievement = useDojo((state) => state.addAchievement);
	const updateAchievement = useDojo((state) => state.updateAchievement);
	const removeAchievement = useDojo((state) => state.removeAchievement);
	const promoteBelt = useDojo((state) => state.promoteBelt);
	const dayLedger = useDojo((state) => state.dayLedger);
	const phoneLocked = useDojo((state) => state.phoneLocked);
	const expClaims = useDojo((state) => state.expClaims);
	const door = useDoor();
	const [clock, setClock] = (0, import_react.useState)(() => Date.now());
	const [pinOpen, setPinOpen] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)("");
	const [selectedId, setSelectedId] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return "";
		try {
			const savedCode = localStorage.getItem(CODE_KEY);
			return savedCode ? localStorage.getItem(`blockdojo-ninja:${savedCode}`) ?? "" : "";
		} catch {
			return "";
		}
	});
	const [searching, setSearching] = (0, import_react.useState)(false);
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const [rosterOpen, setRosterOpen] = (0, import_react.useState)(false);
	const [stockOpen, setStockOpen] = (0, import_react.useState)(false);
	const [achieveOpen, setAchieveOpen] = (0, import_react.useState)(false);
	const [notice, setNotice] = (0, import_react.useState)(null);
	const [custom, setCustom] = (0, import_react.useState)("");
	const [belting, setBelting] = (0, import_react.useState)(false);
	const [savingDay, setSavingDay] = (0, import_react.useState)(false);
	const [showArchived, setShowArchived] = (0, import_react.useState)(false);
	const [rosterQuery, setRosterQuery] = (0, import_react.useState)("");
	const [studentForm, setStudentForm] = (0, import_react.useState)(null);
	const [itemForm, setItemForm] = (0, import_react.useState)(null);
	const [achieveForm, setAchieveForm] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		caveAudio.bind();
		const timer = window.setInterval(() => setClock(Date.now()), 1e3);
		return () => window.clearInterval(timer);
	}, []);
	const director = directorUntil > clock;
	const needDirector = () => {
		if (directorUntil > Date.now()) return true;
		setPinOpen(true);
		return false;
	};
	const active = students.filter((student) => !student.archived);
	const selected = students.find((student) => student.id === selectedId && !student.archived) ?? active[0];
	const upcoming = selected ? nextBelt(selected.belt) : null;
	const matches = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLowerCase();
		return active.filter((student) => {
			if (!needle) return true;
			return displayName(student).toLowerCase().includes(needle) || student.firstName.toLowerCase().startsWith(needle);
		}).slice(0, 8);
	}, [active, query]);
	const roster = students.filter((student) => {
		if (!showArchived && student.archived) return false;
		const needle = rosterQuery.trim().toLowerCase();
		if (!needle) return true;
		return displayName(student).toLowerCase().includes(needle);
	});
	const chooseNinja = (id) => {
		setSelectedId(id);
		setQuery("");
		setSearching(false);
		if (!code) return;
		try {
			localStorage.setItem(`blockdojo-ninja:${code}`, id);
		} catch {}
	};
	const flash = (next) => {
		setNotice(next);
		window.setTimeout(() => setNotice(null), 2400);
	};
	const pay = async (amount) => {
		if (!selected) return;
		const result = await awardCoins(selected.id, amount);
		flash(result.ok ? {
			tone: "ok",
			text: `${displayName(selected)} +${amount}`
		} : {
			tone: "no",
			text: result.reason
		});
	};
	const checkout = async (item) => {
		if (!selected) return;
		const result = await redeem(selected.id, item.id);
		flash(result.ok ? {
			tone: "ok",
			text: item.currency === "exp" ? `${displayName(selected)} claimed ${item.name}. It’s on the TV.` : `${displayName(selected)} redeemed ${item.name}. It’s on the TV.`
		} : {
			tone: "no",
			text: result.reason
		});
	};
	const claimed = (achievement) => Boolean(selected && claims.some((claim) => claim.achievementId === achievement.id && claim.studentId === selected.id && claim.periodKey === periodKey(achievement.cadence, weekStarted, clock)));
	const give = async (achievement) => {
		if (!selected) return;
		const result = await claimAchievement(selected.id, achievement.id);
		flash(result.ok ? {
			tone: "ok",
			text: `${displayName(selected)} +${achievement.coins} · ${achievement.name}`
		} : {
			tone: "no",
			text: result.reason
		});
	};
	const saveTheDay = async () => {
		if (savingDay) return;
		const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		const popup = window.open("about:blank", "_blank");
		setSavingDay(true);
		try {
			const result = await dayLedger(timeZone);
			if (!result.ok) {
				popup?.close();
				flash({
					tone: "no",
					text: result.reason
				});
				return;
			}
			const subject = encodeURIComponent(result.subject);
			let body = result.body;
			let note = "Outlook draft is ready. Send it when the book looks right.";
			const outlook = `https://outlook.office.com/mail/deeplink/compose?subject=${subject}&body=${encodeURIComponent(body)}`;
			const href = outlook.length > 7500 ? `https://outlook.office.com/mail/deeplink/compose?subject=${subject}&body=${encodeURIComponent("The full ledger is on the clipboard. Paste it into this draft.")}` : outlook;
			if (outlook.length > 7500) {
				note = "The day was long, so the ledger is copied. Paste it into the draft.";
				try {
					await navigator.clipboard.writeText(body);
				} catch {
					body = result.body;
				}
			}
			if (popup) {
				popup.location.href = href;
				try {
					popup.opener = null;
				} catch {}
				flash({
					tone: "ok",
					text: note
				});
			} else {
				const mailBody = outlook.length > 7500 ? "The full ledger is on the clipboard. Paste it into this draft." : body;
				window.location.href = `mailto:?subject=${subject}&body=${encodeURIComponent(mailBody)}`;
				flash({
					tone: "ok",
					text: "The draft opened in your mail app."
				});
			}
		} finally {
			setSavingDay(false);
		}
	};
	if (door === "locked") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccessGate, {});
	if (door === "wait" || !hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DojoLoading, {});
	if (phoneLocked) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneLink, {});
	if (!code) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DojoLoading, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto min-h-dvh max-w-6xl px-3 py-4 sm:px-6 sm:py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-pixel text-pixel text-accent",
									children: "BLOCKDOJO"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "mt-1 text-2xl font-extrabold",
									children: "Sensei desk"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm font-bold text-muted",
									children: [displaySeen ? "TV linked" : "Waiting for the TV", " · 75 a day"]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-expanded": menuOpen,
							onClick: () => setMenuOpen((open) => !open),
							className: "inline-flex min-h-11 shrink-0 items-center rounded-md border-2 border-border bg-surface px-4 font-extrabold",
							children: menuOpen ? "Close" : "Desk"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex max-w-lg gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: savingDay,
							onClick: () => void saveTheDay(),
							className: "inline-flex min-h-11 flex-1 items-center justify-center rounded-md border-2 border-accent bg-surface px-3 font-extrabold disabled:cursor-not-allowed disabled:text-muted",
							children: savingDay ? "Saving…" : "Save the day"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-h-11 shrink-0 items-center gap-2 rounded-md border-2 border-border bg-surface px-3 font-extrabold",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinMark, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums",
									children: vault
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-bold text-muted uppercase",
									children: "vault"
								})
							]
						})]
					}),
					menuOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-w-lg rounded-lg border-2 border-border bg-surface p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-bold tracking-wide text-muted uppercase",
								children: "TV ninja"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex overflow-hidden rounded-md border-2 border-border",
								role: "group",
								"aria-label": "Cave ninja",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": hero === "boy",
									onClick: () => void setHero("boy"),
									className: `min-h-11 flex-1 font-extrabold ${hero === "boy" ? "bg-accent text-accent-ink" : "bg-surface text-fg"}`,
									children: "Boy"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": hero === "girl",
									onClick: () => void setHero("girl"),
									className: `min-h-11 flex-1 border-l-2 border-border font-extrabold ${hero === "girl" ? "bg-accent text-accent-ink" : "bg-surface text-fg"}`,
									children: "Girl"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 [&_button]:w-full [&_button]:justify-center [&_button]:shadow-none",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoundToggle, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									setMenuOpen(false);
									if (director) lockDirector();
									else setPinOpen(true);
								},
								className: `mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-md border-2 px-4 font-extrabold ${director ? "border-accent bg-surface text-accent" : "border-border bg-surface text-fg"}`,
								children: director ? "Lock director" : "Director pin"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								className: "mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-md border-2 border-accent bg-accent px-4 font-extrabold text-accent-ink",
								children: "Open TV"
							})
						]
					}) : null
				]
			}),
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `mt-4 rounded-md border-2 px-3 py-2 font-extrabold ${notice.tone === "ok" ? "border-accent bg-surface text-accent" : "border-primary bg-surface text-fg"}`,
				role: "status",
				children: notice.text
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 grid gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "z-10 -mx-3 border-b-2 border-border bg-bg px-3 py-3 sm:-mx-6 sm:px-6 lg:sticky lg:top-4 lg:z-20 lg:mx-0 lg:self-start lg:border-0 lg:bg-transparent lg:p-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border-2 border-border bg-surface p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "font-pixel text-pixel text-accent",
								htmlFor: "ninja-search",
								children: "Ninja"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "ninja-search",
								className: `${field} mt-2`,
								placeholder: "Type a name…",
								value: query,
								autoComplete: "off",
								onFocus: () => setSearching(true),
								onBlur: () => window.setTimeout(() => setSearching(false), 150),
								onChange: (event) => {
									setQuery(event.target.value);
									setSearching(true);
								}
							}),
							searching || query.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 max-h-40 space-y-1 overflow-auto",
								role: "listbox",
								"aria-label": "Ninjas",
								children: matches.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "px-2 py-3 text-sm font-bold text-muted",
									children: "No match. Add them on the roster."
								}) : matches.map((student) => {
									const on = student.id === selected?.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										role: "option",
										"aria-selected": on,
										onMouseDown: (event) => event.preventDefault(),
										onClick: () => chooseNinja(student.id),
										className: `flex min-h-11 w-full items-center gap-2 rounded-md border-2 px-2 text-left font-extrabold ${on ? "border-accent bg-surface-2" : "border-transparent bg-bg-deep"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BeltDot, { belt: student.belt }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "min-w-0 flex-1 truncate",
												children: displayName(student)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-bold text-muted",
												children: student.belt
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "tabular-nums text-accent",
												children: student.coins
											})
										]
									}) }, student.id);
								})
							}) : null,
							selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 rounded-md border-2 border-line bg-bg-deep p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-baseline justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "min-w-0 truncate text-lg font-extrabold",
											children: displayName(selected)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "shrink-0 text-sm font-bold text-muted",
											children: selected.belt
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 flex items-center gap-2 text-3xl font-extrabold text-accent tabular-nums",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinMark, {}), selected.coins]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-sm font-extrabold tabular-nums",
										children: [selected.exp ?? 0, " EXP"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-xs font-bold text-muted",
										children: [
											earnedToday(selected),
											"/",
											75,
											" earned today · ",
											25,
											" max each payout"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 grid grid-cols-3 gap-2",
										children: [
											5,
											10,
											25
										].map((amount) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => pay(amount),
											className: "min-h-11 rounded-md border-2 border-accent bg-accent font-extrabold text-accent-ink",
											children: ["+", amount]
										}, amount))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
										className: "mt-2 flex gap-2",
										onSubmit: (event) => {
											event.preventDefault();
											const amount = Number(custom);
											if (!amount) return;
											pay(amount);
											setCustom("");
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: field,
											inputMode: "numeric",
											"aria-label": "Custom coin amount",
											placeholder: "Custom",
											value: custom,
											onChange: (event) => {
												const digits = event.target.value.replace(/[^\d]/g, "").slice(0, 2);
												const amount = Number(digits);
												setCustom(!digits || amount <= 25 ? digits : String(25));
											}
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "submit",
											className: "min-h-11 shrink-0 rounded-md border-2 border-border bg-surface-2 px-3 font-extrabold",
											children: "Add"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: !upcoming || belting,
										onClick: () => {
											if (!selected || !upcoming || belting) return;
											const name = displayName(selected);
											const belt = upcoming;
											setBelting(true);
											(async () => {
												const result = await promoteBelt(selected.id);
												flash(result.ok ? {
													tone: "ok",
													text: `${name} is up for ${belt}. It’s on the TV.`
												} : {
													tone: "no",
													text: result.reason
												});
												setBelting(false);
											})();
										},
										className: "mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-md border-2 border-accent bg-bg px-3 font-extrabold text-fg disabled:cursor-not-allowed disabled:border-border disabled:text-muted",
										children: upcoming ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BeltDot, { belt: upcoming }),
											"Belt up to ",
											upcoming
										] }) : "Gold belt"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: !undo,
										onClick: () => {
											(async () => {
												const result = await undoLast();
												flash(result.ok ? {
													tone: "ok",
													text: "Last step undone."
												} : {
													tone: "no",
													text: result.reason
												});
											})();
										},
										className: "mt-2 min-h-11 w-full rounded-md border-2 border-border bg-surface px-3 font-extrabold disabled:cursor-not-allowed disabled:text-muted",
										children: undo ? `${undo.label} · ${undo.count}/5` : "Nothing to undo"
									})
								]
							}) : null
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-end justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-pixel text-pixel text-accent",
							children: "Shop"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-bold text-muted uppercase",
							children: "One tap redeems"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid grid-cols-2 gap-2 xl:grid-cols-3",
						children: items.map((item) => {
							const taken = item.currency === "exp" && Boolean(selected && expClaims.some((claim) => claim.studentId === selected.id && claim.itemId === item.id));
							const block = canRedeem(selected, item, taken);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex flex-col rounded-lg border-2 border-border bg-surface p-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-base leading-snug font-extrabold break-words",
										children: item.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: item.image,
										alt: "",
										className: "mt-2 h-16 w-full rounded-md object-cover sm:h-20",
										style: { imageRendering: "pixelated" }
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 flex items-center gap-1 text-sm font-extrabold text-accent tabular-nums",
										children: item.currency === "exp" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [item.price, " EXP"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ml-auto text-xs font-bold text-muted",
											children: "once"
										})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinMark, {}),
											item.price,
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "ml-auto text-xs font-bold text-muted",
												children: [item.stock, " left"]
											})
										] })
									}),
									item.minBelt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 flex items-center gap-1 text-xs font-bold text-muted",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BeltDot, { belt: item.minBelt }),
											item.minBelt,
											"+"
										]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs font-bold text-muted",
										children: "Any belt"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: Boolean(block),
										onClick: () => checkout(item),
										className: "mt-2 min-h-11 rounded-md border-2 border-primary bg-primary px-2 text-sm leading-tight font-extrabold text-fg disabled:cursor-not-allowed disabled:border-line disabled:bg-bg-deep disabled:text-muted",
										children: block ?? (item.currency === "exp" ? "Claim" : "Redeem")
									})
								]
							}, item.id);
						})
					}),
					items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 font-bold text-muted",
						children: "The shop is empty. Add a prize below."
					}) : null
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-expanded": achieveOpen,
					onClick: () => setAchieveOpen((open) => !open),
					className: "flex min-h-11 w-full items-center justify-between rounded-md border-2 border-border bg-surface px-4 font-extrabold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Achievements · ", achievements.length] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted",
						children: achieveOpen ? "Hide" : "Show"
					})]
				}), achieveOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 rounded-lg border-2 border-border bg-surface p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "max-w-xl text-sm font-bold text-muted",
							children: ["Daily and weekly bonuses skip the 25-coin payout and the 75-a-day cap. Each ninja can earn one once.", selected ? ` Paying ${displayName(selected)}` : " Pick a ninja first."]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								if (!needDirector()) return;
								setAchieveForm({ mode: "add" });
							},
							className: "min-h-11 rounded-md border-2 border-primary bg-primary px-3 font-extrabold text-fg",
							children: "Add achievement"
						})]
					}), ["daily", "weekly"].map((cadence) => {
						const group = achievements.filter((achievement) => achievement.cadence === cadence);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-pixel text-pixel text-accent",
									children: cadence === "daily" ? "Daily" : "Weekly"
								}),
								group.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm font-bold text-muted",
									children: "None yet."
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 space-y-2",
									children: group.map((achievement) => {
										const given = claimed(achievement);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "rounded-md border-2 border-line bg-bg-deep p-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-base leading-snug font-extrabold",
												children: achievement.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-2 flex flex-wrap items-center gap-3",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
														src: achievement.image,
														alt: "",
														className: "size-14 shrink-0 rounded-md object-cover",
														style: { imageRendering: "pixelated" }
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "flex items-center gap-1 text-sm font-extrabold text-accent tabular-nums",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinMark, {}), achievement.coins]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex w-full gap-2 sm:ml-auto sm:w-auto",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															type: "button",
															disabled: !selected || given,
															onClick: () => void give(achievement),
															className: "min-h-11 flex-1 rounded-md border-2 border-accent bg-accent px-3 font-extrabold whitespace-nowrap text-accent-ink disabled:cursor-not-allowed disabled:border-line disabled:bg-bg disabled:text-muted sm:flex-none",
															children: given ? cadence === "daily" ? "Already given today" : "Already given this week" : "Give"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															type: "button",
															onClick: () => {
																if (!needDirector()) return;
																setAchieveForm({
																	mode: "edit",
																	id: achievement.id
																});
															},
															className: "min-h-11 shrink-0 rounded-md border-2 border-border px-3 font-extrabold",
															children: "Edit"
														})]
													})
												]
											})]
										}, achievement.id);
									})
								})
							]
						}, cadence);
					})]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-expanded": rosterOpen,
						onClick: () => setRosterOpen((open) => !open),
						className: "flex min-h-11 w-full items-center justify-between rounded-md border-2 border-border bg-surface px-4 font-extrabold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"Roster · ",
							active.length,
							" ",
							active.length === 1 ? "ninja" : "ninjas"
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: rosterOpen ? "Hide" : "Show"
						})]
					}),
					rosterOpen || active.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 rounded-lg border-2 border-border bg-surface p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "min-w-0 flex-1",
										placeholder: "Search roster",
										value: rosterQuery,
										onChange: (event) => setRosterQuery(event.target.value),
										"aria-label": "Search roster"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setShowArchived((value) => !value),
										className: "min-h-11 rounded-md border-2 border-border bg-bg-deep px-3 font-extrabold",
										children: showArchived ? "Hide archived" : "Show archived"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setStudentForm({ mode: "add" }),
										className: "min-h-11 rounded-md border-2 border-primary bg-primary px-3 font-extrabold text-fg",
										children: "Add ninja"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "mt-3 space-y-2",
								children: [roster.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "rounded-md border-2 border-dashed border-line px-3 py-4 text-sm font-bold text-muted",
									children: "No ninjas yet. Add the first one."
								}) : null, roster.map((student) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex flex-wrap items-center gap-2 rounded-md border-2 border-line bg-bg-deep px-3 py-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BeltDot, { belt: student.belt }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "font-extrabold",
												children: [displayName(student), student.archived ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "ml-2 text-xs text-muted",
													children: "Archived"
												}) : null]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-xs font-bold text-muted",
												children: [
													student.belt,
													" belt · week ",
													student.weekCoins
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-extrabold text-accent tabular-nums",
											children: student.coins
										}),
										!student.archived ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex gap-1",
											children: [5, 10].map((amount) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => {
													chooseNinja(student.id);
													(async () => {
														const result = await awardCoins(student.id, amount);
														flash(result.ok ? {
															tone: "ok",
															text: `${displayName(student)} +${amount}`
														} : {
															tone: "no",
															text: result.reason
														});
													})();
												},
												className: "min-h-11 rounded-md border-2 border-border px-2 font-extrabold",
												children: ["+", amount]
											}, amount))
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setStudentForm({
												mode: "edit",
												id: student.id
											}),
											className: "min-h-11 rounded-md border-2 border-border px-3 font-extrabold",
											children: "Edit"
										})
									]
								}, student.id))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									if (!needDirector()) return;
									if (window.confirm("Replace this dojo’s ninjas and shop with the sample set? The TV will follow.")) restoreDemo();
								},
								className: "mt-4 text-sm font-bold text-muted underline decoration-border underline-offset-4",
								children: "Restore sample dojo"
							})
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-expanded": stockOpen,
						onClick: () => setStockOpen((open) => !open),
						className: "flex min-h-11 w-full items-center justify-between rounded-md border-2 border-border bg-surface px-4 font-extrabold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"Stock · ",
							items.length,
							" ",
							items.length === 1 ? "prize" : "prizes"
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: stockOpen ? "Hide" : "Show"
						})]
					}),
					stockOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 rounded-lg border-2 border-border bg-surface p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-bold text-muted",
								children: director ? "Director desk is open for 10 minutes." : "Prices, stock, and new prizes need the director pin."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									if (!needDirector()) return;
									setItemForm({ mode: "add" });
								},
								className: "min-h-11 rounded-md border-2 border-primary bg-primary px-3 font-extrabold text-fg",
								children: "Add prize"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-2",
							children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex flex-wrap items-center gap-3 rounded-md border-2 border-line bg-bg-deep p-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: item.image,
										alt: "",
										className: "size-14 rounded-md object-cover",
										style: { imageRendering: "pixelated" }
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-extrabold",
											children: item.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-bold text-muted",
											children: item.currency === "exp" ? `${item.price} EXP · once · ${item.minBelt ? `${item.minBelt}+` : "Any belt"}` : `${item.price} coins · ${item.minBelt ? `${item.minBelt}+` : "Any belt"}`
										})]
									}),
									item.currency === "exp" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-extrabold tracking-wide text-accent uppercase",
										children: "EXP"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												"aria-label": `Decrease stock of ${item.name}`,
												onClick: () => {
													if (!needDirector()) return;
													updateItem(item.id, { stock: item.stock - 1 });
												},
												className: "min-h-11 min-w-11 rounded-md border-2 border-border font-extrabold",
												children: "−"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "w-8 text-center font-extrabold tabular-nums",
												children: item.stock
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												"aria-label": `Increase stock of ${item.name}`,
												onClick: () => {
													if (!needDirector()) return;
													updateItem(item.id, { stock: item.stock + 1 });
												},
												className: "min-h-11 min-w-11 rounded-md border-2 border-border font-extrabold",
												children: "+"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => {
											if (!needDirector()) return;
											setItemForm({
												mode: "edit",
												id: item.id
											});
										},
										className: "min-h-11 rounded-md border-2 border-border px-3 font-extrabold",
										children: "Edit"
									})
								]
							}, item.id))
						})]
					}) : null
				]
			}),
			studentForm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentDialog, {
				mode: studentForm,
				director,
				student: studentForm.mode === "edit" ? students.find((entry) => entry.id === studentForm.id) : void 0,
				onClose: () => setStudentForm(null),
				onSave: (value) => {
					(async () => {
						if (studentForm.mode === "add") {
							const result = await addStudent(value);
							if (!result.ok) {
								flash({
									tone: "no",
									text: result.reason
								});
								return;
							}
							chooseNinja(result.id);
							flash({
								tone: "ok",
								text: `${displayName(value)} joined the dojo.`
							});
						} else if (studentForm.mode === "edit") {
							const result = await updateStudent(studentForm.id, value);
							flash(result.ok ? {
								tone: "ok",
								text: "Ninja updated."
							} : {
								tone: "no",
								text: result.reason
							});
							if (!result.ok) return;
						}
						setStudentForm(null);
					})();
				}
			}, studentForm.mode === "edit" ? studentForm.id : "new") : null,
			itemForm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemDialog, {
				item: itemForm.mode === "edit" ? items.find((entry) => entry.id === itemForm.id) : void 0,
				onClose: () => setItemForm(null),
				onRemove: itemForm.mode === "edit" ? () => {
					(async () => {
						const result = await removeItem(itemForm.id);
						if (!result.ok) {
							flash({
								tone: "no",
								text: result.reason
							});
							return;
						}
						setItemForm(null);
						flash({
							tone: "ok",
							text: "Prize removed."
						});
					})();
				} : void 0,
				onSave: (value) => {
					(async () => {
						if (itemForm.mode === "add") {
							if (!await addItem(value)) {
								flash({
									tone: "no",
									text: "The prize didn't save. Check the director pin."
								});
								return;
							}
						} else {
							const result = await updateItem(itemForm.id, value);
							if (!result.ok) {
								flash({
									tone: "no",
									text: result.reason
								});
								return;
							}
						}
						setItemForm(null);
						flash({
							tone: "ok",
							text: itemForm.mode === "add" ? "Prize added." : "Prize updated."
						});
					})();
				}
			}, itemForm.mode === "edit" ? itemForm.id : "new-item") : null,
			achieveForm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AchievementDialog, {
				achievement: achieveForm.mode === "edit" ? achievements.find((entry) => entry.id === achieveForm.id) : void 0,
				onClose: () => setAchieveForm(null),
				onRemove: achieveForm.mode === "edit" ? () => {
					(async () => {
						const result = await removeAchievement(achieveForm.id);
						if (!result.ok) {
							flash({
								tone: "no",
								text: result.reason
							});
							return;
						}
						setAchieveForm(null);
						flash({
							tone: "ok",
							text: "Achievement removed."
						});
					})();
				} : void 0,
				onSave: (value) => {
					(async () => {
						if (achieveForm.mode === "add") {
							if (!await addAchievement(value)) {
								flash({
									tone: "no",
									text: "The achievement didn't save. Check the director pin."
								});
								return;
							}
						} else {
							const result = await updateAchievement(achieveForm.id, value);
							if (!result.ok) {
								flash({
									tone: "no",
									text: result.reason
								});
								return;
							}
						}
						setAchieveForm(null);
						flash({
							tone: "ok",
							text: achieveForm.mode === "add" ? "Achievement added." : "Achievement updated."
						});
					})();
				}
			}, achieveForm.mode === "edit" ? achieveForm.id : "new-achievement") : null,
			pinOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinPad, { onClose: () => setPinOpen(false) }) : null
		]
	});
}
function StudentDialog({ mode, student, director, onClose, onSave }) {
	const [firstName, setFirstName] = (0, import_react.useState)(student?.firstName ?? "");
	const [lastInitial, setLastInitial] = (0, import_react.useState)(student?.lastInitial ?? "");
	const [belt, setBelt] = (0, import_react.useState)(student?.belt ?? "White");
	const [coins, setCoins] = (0, import_react.useState)(String(student?.coins ?? 0));
	const [archived, setArchived] = (0, import_react.useState)(student?.archived ?? false);
	const [error, setError] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dialog", {
		open: true,
		className: "fixed inset-0 z-30 m-0 flex h-full w-full items-end justify-center bg-bg-deep/70 p-3 sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "w-full max-w-md rounded-lg border-2 border-border bg-surface p-4",
			onSubmit: (event) => {
				event.preventDefault();
				if (firstName.trim().length < 1) {
					setError("First name is required.");
					return;
				}
				if (!/^[a-z]$/i.test(lastInitial.trim())) {
					setError("Use a single last initial.");
					return;
				}
				onSave({
					firstName,
					lastInitial,
					belt,
					coins: Number(coins) || 0,
					archived
				});
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-extrabold",
					children: mode.mode === "add" ? "Add ninja" : "Edit ninja"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-3 block text-sm font-extrabold",
					htmlFor: "first-name",
					children: "First name"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "first-name",
					className: `${field} mt-1`,
					value: firstName,
					onChange: (event) => setFirstName(event.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-3 block text-sm font-extrabold",
					htmlFor: "last-initial",
					children: "Last initial"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "last-initial",
					className: `${field} mt-1`,
					maxLength: 1,
					value: lastInitial,
					onChange: (event) => setLastInitial(event.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-3 block text-sm font-extrabold",
					htmlFor: "belt",
					children: "Belt"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					id: "belt",
					className: `${field} mt-1`,
					value: belt,
					onChange: (event) => setBelt(event.target.value),
					children: BELTS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: option,
						children: option
					}, option))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-3 block text-sm font-extrabold",
					htmlFor: "start-coins",
					children: mode.mode === "add" ? `Welcome coins (max 10)` : "Coin balance"
				}),
				mode.mode === "edit" && !director ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm font-bold text-muted",
					children: "Balance corrections need the director pin. Use the payout buttons for earned coins."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "start-coins",
					className: `${field} mt-1`,
					inputMode: "numeric",
					value: coins,
					onChange: (event) => {
						const digits = event.target.value.replace(/[^\d]/g, "");
						const cap = mode.mode === "add" && !director ? 10 : 9999;
						const amount = Number(digits);
						setCoins(!digits || amount <= cap ? digits : String(cap));
					}
				}),
				mode.mode === "edit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 flex min-h-11 items-center gap-2 font-extrabold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: archived,
						onChange: (event) => setArchived(event.target.checked),
						className: "size-5"
					}), "Archive this ninja"]
				}) : null,
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 font-bold text-primary",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex justify-end gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "min-h-11 rounded-md border-2 border-border px-3 font-extrabold",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "min-h-11 rounded-md border-2 border-primary bg-primary px-3 font-extrabold text-fg",
						children: "Save"
					})]
				})
			]
		})
	});
}
function ItemDialog({ item, onClose, onSave, onRemove }) {
	const [name, setName] = (0, import_react.useState)(item?.name ?? "");
	const [price, setPrice] = (0, import_react.useState)(String(item?.price ?? 20));
	const [currency, setCurrency] = (0, import_react.useState)(item?.currency ?? "coins");
	const [stock, setStock] = (0, import_react.useState)(String(item?.stock ?? 1));
	const [minBelt, setMinBelt] = (0, import_react.useState)(item?.minBelt ?? "");
	const [image, setImage] = (0, import_react.useState)(item?.image ?? "/art/items/chest.jpg");
	const [error, setError] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dialog", {
		open: true,
		className: "fixed inset-0 z-30 m-0 flex h-full w-full items-end justify-center overflow-auto bg-bg-deep/70 p-3 sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "w-full max-w-md rounded-lg border-2 border-border bg-surface p-4",
			onSubmit: (event) => {
				event.preventDefault();
				if (name.trim().length < 2) {
					setError("Give the prize a name.");
					return;
				}
				const nextPrice = Number(price);
				if (!nextPrice || nextPrice < 1 || nextPrice > 1e4) {
					setError(`Price must be 1 to ${ITEM_PRICE_MAX.toLocaleString()}.`);
					return;
				}
				const nextStock = Number(stock) || 0;
				if (currency === "coins" && nextStock > 99) {
					setError(`Stock stops at 99.`);
					return;
				}
				onSave({
					name,
					price: nextPrice,
					currency,
					stock: currency === "exp" ? 0 : nextStock,
					image,
					minBelt: minBelt || null
				});
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-extrabold",
					children: item ? "Edit prize" : "Add prize"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: image,
					alt: "",
					className: "mt-3 size-24 rounded-md object-cover",
					style: { imageRendering: "pixelated" }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-3 block text-sm font-extrabold",
					htmlFor: "prize-name",
					children: "Name"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "prize-name",
					className: `${field} mt-1`,
					value: name,
					onChange: (event) => setName(event.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex overflow-hidden rounded-md border-2 border-border",
					role: "group",
					"aria-label": "Prize currency",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": currency === "coins",
						onClick: () => setCurrency("coins"),
						className: `min-h-11 flex-1 font-extrabold ${currency === "coins" ? "bg-accent text-accent-ink" : "bg-surface text-fg"}`,
						children: "Coins"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": currency === "exp",
						onClick: () => setCurrency("exp"),
						className: `min-h-11 flex-1 border-l-2 border-border font-extrabold ${currency === "exp" ? "bg-accent text-accent-ink" : "bg-surface text-fg"}`,
						children: "EXP"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs font-bold text-muted",
					children: currency === "exp" ? "Claimed once when a ninja’s EXP reaches this number. EXP is not spent." : "Spent from the ninja’s coins. Coins return to the vault."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `mt-3 grid gap-2 ${currency === "exp" ? "grid-cols-1" : "grid-cols-2"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-sm font-extrabold",
						htmlFor: "prize-price",
						children: currency === "exp" ? "EXP needed" : "Coin price"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "prize-price",
						className: `${field} mt-1`,
						inputMode: "numeric",
						value: price,
						onChange: (event) => setPrice(event.target.value.replace(/[^\d]/g, "").slice(0, 5))
					})] }), currency === "coins" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-sm font-extrabold",
						htmlFor: "prize-stock",
						children: "Stock"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "prize-stock",
						className: `${field} mt-1`,
						inputMode: "numeric",
						value: stock,
						onChange: (event) => setStock(event.target.value.replace(/[^\d]/g, ""))
					})] }) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-3 block text-sm font-extrabold",
					htmlFor: "prize-belt",
					children: "Belt gate"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					id: "prize-belt",
					className: `${field} mt-1`,
					value: minBelt,
					onChange: (event) => setMinBelt(event.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Any belt"
					}), BELTS.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: option,
						children: [option, " and above"]
					}, option))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-3 block text-sm font-extrabold",
					htmlFor: "prize-image",
					children: "Image"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "prize-image",
					className: `${field} mt-1`,
					type: "file",
					accept: "image/*",
					onChange: (event) => {
						const file = event.target.files?.[0];
						if (!file) return;
						fileToIcon(file).then(setImage).catch((reason) => setError(reason instanceof Error ? reason.message : "Could not use that image."));
					}
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 font-bold text-primary",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap justify-end gap-2",
					children: [
						onRemove ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								if (window.confirm("Remove this prize from the shop?")) onRemove();
							},
							className: "mr-auto min-h-11 rounded-md border-2 border-primary px-3 font-extrabold text-primary",
							children: "Remove"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onClose,
							className: "min-h-11 rounded-md border-2 border-border px-3 font-extrabold",
							children: "Cancel"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "min-h-11 rounded-md border-2 border-primary bg-primary px-3 font-extrabold text-fg",
							children: "Save"
						})
					]
				})
			]
		})
	});
}
function AchievementDialog({ achievement, onClose, onSave, onRemove }) {
	const [name, setName] = (0, import_react.useState)(achievement?.name ?? "");
	const [coins, setCoins] = (0, import_react.useState)(String(achievement?.coins ?? 10));
	const [cadence, setCadence] = (0, import_react.useState)(achievement?.cadence ?? "daily");
	const [image, setImage] = (0, import_react.useState)(achievement?.image ?? "/art/achievements/code.png");
	const [error, setError] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dialog", {
		open: true,
		className: "fixed inset-0 z-30 m-0 flex h-full w-full items-end justify-center overflow-auto bg-bg-deep/70 p-3 sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "w-full max-w-md rounded-lg border-2 border-border bg-surface p-4",
			onSubmit: (event) => {
				event.preventDefault();
				if (name.trim().length < 2) {
					setError("Name the achievement.");
					return;
				}
				const nextCoins = Number(coins);
				if (!nextCoins || nextCoins < 1 || nextCoins > 500) {
					setError(`Coins must be 1 to 500.`);
					return;
				}
				onSave({
					name,
					coins: nextCoins,
					cadence,
					image
				});
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-extrabold",
					children: achievement ? "Edit achievement" : "Add achievement"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: image,
					alt: "",
					className: "mt-3 size-24 rounded-md object-cover",
					style: { imageRendering: "pixelated" }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-3 block text-sm font-extrabold",
					htmlFor: "achieve-name",
					children: "Name"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "achieve-name",
					className: `${field} mt-1`,
					maxLength: 48,
					value: name,
					onChange: (event) => setName(event.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-sm font-extrabold",
						htmlFor: "achieve-coins",
						children: "Ninja coins"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "achieve-coins",
						className: `${field} mt-1`,
						inputMode: "numeric",
						value: coins,
						onChange: (event) => setCoins(event.target.value.replace(/[^\d]/g, ""))
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-sm font-extrabold",
						htmlFor: "achieve-cadence",
						children: "Repeats"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						id: "achieve-cadence",
						className: `${field} mt-1`,
						value: cadence,
						onChange: (event) => setCadence(event.target.value === "weekly" ? "weekly" : "daily"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "daily",
							children: "Daily"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "weekly",
							children: "Weekly"
						})]
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-3 block text-sm font-extrabold",
					htmlFor: "achieve-image",
					children: "Image"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "achieve-image",
					className: `${field} mt-1`,
					type: "file",
					accept: "image/*",
					onChange: (event) => {
						const file = event.target.files?.[0];
						if (!file) return;
						fileToIcon(file).then(setImage).catch((reason) => setError(reason instanceof Error ? reason.message : "Could not use that image."));
					}
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 font-bold text-primary",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap justify-end gap-2",
					children: [
						onRemove ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								if (window.confirm("Remove this achievement?")) onRemove();
							},
							className: "mr-auto min-h-11 rounded-md border-2 border-primary px-3 font-extrabold text-primary",
							children: "Remove"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onClose,
							className: "min-h-11 rounded-md border-2 border-border px-3 font-extrabold",
							children: "Cancel"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "min-h-11 rounded-md border-2 border-primary bg-primary px-3 font-extrabold text-fg",
							children: "Save"
						})
					]
				})
			]
		})
	});
}
var SplitComponent = SenseiDesk;
//#endregion
export { SplitComponent as component };
