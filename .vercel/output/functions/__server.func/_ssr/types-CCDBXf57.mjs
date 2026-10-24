//#region node_modules/.nitro/vite/services/ssr/assets/types-CCDBXf57.js
var BELTS = [
	"White",
	"Yellow",
	"Orange",
	"Green",
	"Blue",
	"Purple",
	"Brown",
	"Red",
	"Black",
	"Bronze",
	"Silver",
	"Platinum",
	"Gold"
];
var BELT_RANK = {
	White: 0,
	Yellow: 1,
	Orange: 2,
	Green: 3,
	Blue: 4,
	Purple: 5,
	Brown: 6,
	Red: 7,
	Black: 8,
	Bronze: 9,
	Silver: 10,
	Platinum: 11,
	Gold: 12
};
function displayName(student) {
	const initial = student.lastInitial.trim().slice(0, 1).toUpperCase();
	return initial ? `${student.firstName.trim()} ${initial}.` : student.firstName.trim();
}
function beltToken(belt) {
	return `belt-${belt.toLowerCase()}`;
}
function nextBelt(belt) {
	const index = BELTS.indexOf(belt);
	if (index < 0 || index >= BELTS.length - 1) return null;
	return BELTS[index + 1] ?? null;
}
function beltClip(belt) {
	return `/art/belts/${belt.toLowerCase()}.mp4`;
}
//#endregion
export { displayName as a, beltToken as i, BELT_RANK as n, nextBelt as o, beltClip as r, BELTS as t };
