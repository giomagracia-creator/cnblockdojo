//#region node_modules/.nitro/vite/services/ssr/assets/rules-C78vdps4.js
var PAYOUT_GAP_MS = 15e3;
var DIRECTOR_MS = 6e5;
var PIN_LOCK_MS = 3e4;
var ITEM_PRICE_MAX = 1e4;
var ACCESS_CODE = "CNCE2026";
var CENTER_CODE = "CNCE-DOJO";
function todayKey(now = Date.now()) {
	const date = new Date(now);
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${date.getFullYear()}-${month}-${day}`;
}
function earnedToday(student, now = Date.now()) {
	return student.dayKey === todayKey(now) ? student.dayCoins ?? 0 : 0;
}
function periodKey(cadence, weekStarted, now = Date.now()) {
	if (cadence === "daily") return todayKey(now);
	return `w${weekStarted}-${Math.floor(Math.max(0, now - weekStarted) / 6048e5)}`;
}
//#endregion
export { PAYOUT_GAP_MS as a, periodKey as c, ITEM_PRICE_MAX as i, todayKey as l, CENTER_CODE as n, PIN_LOCK_MS as o, DIRECTOR_MS as r, earnedToday as s, ACCESS_CODE as t };
