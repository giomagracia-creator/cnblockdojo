import { n as BELT_RANK } from "./types-wveOOwoA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/games-DjeaWp0m.js
var GAME_TURN_MS = 6e5;
function badgesFor(words) {
	const badges = [];
	if (words >= 20) badges.push("Spark");
	if (words >= 50) badges.push("Lantern");
	if (words >= 80) badges.push("Golden Pick");
	return badges;
}
function gameCoins(words, golden, cap) {
	const cleanWords = Math.max(0, Math.floor(words));
	return Math.min(cap, Math.floor((cleanWords + Math.max(0, Math.min(cleanWords, Math.floor(golden)))) / 4));
}
function isTestNinja(firstName) {
	return firstName.trim().toLowerCase() === "gio";
}
function beltAllows(have, need) {
	return BELT_RANK[have] >= BELT_RANK[need];
}
function turnCopy(note) {
	if (note === "hour") return "Nice training. Your next game opens when the cave hour changes.";
	if (note === "week") return "Your turn is done, ninja. The games are resting. Come back next week and play again.";
	return "";
}
//#endregion
export { isTestNinja as a, gameCoins as i, badgesFor as n, turnCopy as o, beltAllows as r, GAME_TURN_MS as t };
