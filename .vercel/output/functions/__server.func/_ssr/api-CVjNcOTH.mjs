import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-CVjNcOTH.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function phoneOf(data) {
	return String(data.phone ?? "");
}
function zoneOf(data) {
	return String(data.zone ?? "");
}
function tokenOf(data) {
	return String(data.token ?? "");
}
function payload(input) {
	if (!input || typeof input !== "object") return {};
	return input;
}
var openDojoFn_createServerFn_handler = createServerRpc({
	id: "01007627e4778cfafa45ee98d4d44c69a2fa0f00aaa5da99037679ca0b2d75ea",
	name: "openDojoFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => openDojoFn.__executeServer(opts));
var openDojoFn = createServerFn({ method: "POST" }).validator(payload).handler(openDojoFn_createServerFn_handler, async ({ data }) => {
	const { openDojo } = await import("./dojo.server-CkJxiroC.mjs");
	return openDojo(data.role === "sensei" ? "sensei" : "display", zoneOf(data), phoneOf(data));
});
var joinDojoFn_createServerFn_handler = createServerRpc({
	id: "0a210339eab04976cf44ed339fdf7a10ecfb72abe475103946828f16d320e11d",
	name: "joinDojoFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => joinDojoFn.__executeServer(opts));
var joinDojoFn = createServerFn({ method: "POST" }).validator(payload).handler(joinDojoFn_createServerFn_handler, async ({ data }) => {
	const { joinDojo } = await import("./dojo.server-CkJxiroC.mjs");
	const role = data.role === "sensei" ? "sensei" : "display";
	return joinDojo(String(data.code ?? ""), role, phoneOf(data), zoneOf(data));
});
var pullDojoFn_createServerFn_handler = createServerRpc({
	id: "920ca664e56844d30ea77fa5361d89d2bc117f915f07846893a65f7b5ebe8dc2",
	name: "pullDojoFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => pullDojoFn.__executeServer(opts));
var pullDojoFn = createServerFn({ method: "POST" }).validator(payload).handler(pullDojoFn_createServerFn_handler, async ({ data }) => {
	const { pullDojo } = await import("./dojo.server-CkJxiroC.mjs");
	const role = data.role === "sensei" ? "sensei" : "display";
	return pullDojo(String(data.code ?? ""), role, phoneOf(data), zoneOf(data));
});
var unlockDirectorFn_createServerFn_handler = createServerRpc({
	id: "f51cdb255e78467427c6d43e3b79d6495842a660fb8abdaa0cfecbb553c6fa4f",
	name: "unlockDirectorFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => unlockDirectorFn.__executeServer(opts));
var unlockDirectorFn = createServerFn({ method: "POST" }).validator(payload).handler(unlockDirectorFn_createServerFn_handler, async ({ data }) => {
	const { unlockDirector } = await import("./dojo.server-CkJxiroC.mjs");
	return unlockDirector(String(data.code ?? ""), String(data.pin ?? ""), phoneOf(data));
});
var awardCoinsFn_createServerFn_handler = createServerRpc({
	id: "6ebcfe0aa8c769ee9ea96fabaf50aa500588b56f8c19b1c0b2c3f690a1d5b826",
	name: "awardCoinsFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => awardCoinsFn.__executeServer(opts));
var awardCoinsFn = createServerFn({ method: "POST" }).validator(payload).handler(awardCoinsFn_createServerFn_handler, async ({ data }) => {
	const { awardCoins } = await import("./dojo.server-CkJxiroC.mjs");
	return awardCoins(String(data.code ?? ""), String(data.studentId ?? ""), Number(data.amount), phoneOf(data), tokenOf(data));
});
var callPocketFn_createServerFn_handler = createServerRpc({
	id: "595b0b2a50d8ef7e50601d6fb67151adf331217691afd96887e78f8334fef23c",
	name: "callPocketFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => callPocketFn.__executeServer(opts));
var callPocketFn = createServerFn({ method: "POST" }).validator(payload).handler(callPocketFn_createServerFn_handler, async ({ data }) => {
	const { callPocket } = await import("./dojo.server-CkJxiroC.mjs");
	return callPocket(String(data.code ?? ""), String(data.studentId ?? ""), phoneOf(data), tokenOf(data));
});
var redeemItemFn_createServerFn_handler = createServerRpc({
	id: "974c4116d59f0ab81ef6bca99bf6f04e7d33b77962a444b53cf9af2f3fc29c11",
	name: "redeemItemFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => redeemItemFn.__executeServer(opts));
var redeemItemFn = createServerFn({ method: "POST" }).validator(payload).handler(redeemItemFn_createServerFn_handler, async ({ data }) => {
	const { redeemItem } = await import("./dojo.server-CkJxiroC.mjs");
	return redeemItem(String(data.code ?? ""), String(data.studentId ?? ""), String(data.itemId ?? ""), phoneOf(data), tokenOf(data));
});
var addStudentFn_createServerFn_handler = createServerRpc({
	id: "361c20cc87c92c7f2ddfe952c2f40c21d1c5460e1f2151d780b8b99d7093e384",
	name: "addStudentFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => addStudentFn.__executeServer(opts));
var addStudentFn = createServerFn({ method: "POST" }).validator(payload).handler(addStudentFn_createServerFn_handler, async ({ data }) => {
	const { addStudent } = await import("./dojo.server-CkJxiroC.mjs");
	const input = data.input ?? {};
	return addStudent(String(data.code ?? ""), {
		firstName: String(input.firstName ?? ""),
		lastInitial: String(input.lastInitial ?? ""),
		belt: String(input.belt ?? ""),
		coins: Number(input.coins ?? 0)
	}, data.token ? String(data.token) : void 0, phoneOf(data));
});
var updateStudentFn_createServerFn_handler = createServerRpc({
	id: "3efdb7d4e4ca78ca0dd6f335ea3cf4770936c5e1ed984af0282e7112531d534c",
	name: "updateStudentFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => updateStudentFn.__executeServer(opts));
var updateStudentFn = createServerFn({ method: "POST" }).validator(payload).handler(updateStudentFn_createServerFn_handler, async ({ data }) => {
	const { updateStudent } = await import("./dojo.server-CkJxiroC.mjs");
	const patch = data.patch ?? {};
	return updateStudent(String(data.code ?? ""), String(data.studentId ?? ""), patch, data.token ? String(data.token) : void 0, phoneOf(data));
});
var addItemFn_createServerFn_handler = createServerRpc({
	id: "a1882d78c0f8ab92f9d5eae759711d84a1e602262ae25be97686dbd9866380f0",
	name: "addItemFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => addItemFn.__executeServer(opts));
var addItemFn = createServerFn({ method: "POST" }).validator(payload).handler(addItemFn_createServerFn_handler, async ({ data }) => {
	const { addItem } = await import("./dojo.server-CkJxiroC.mjs");
	const input = data.input ?? {};
	return addItem(String(data.code ?? ""), {
		name: String(input.name ?? ""),
		price: Number(input.price ?? 0),
		stock: Number(input.stock ?? 0),
		image: String(input.image ?? ""),
		minBelt: input.minBelt ? String(input.minBelt) : null,
		currency: input.currency === "exp" ? "exp" : "coins"
	}, String(data.token ?? ""), phoneOf(data));
});
var updateItemFn_createServerFn_handler = createServerRpc({
	id: "0c4612d73b58455c81113da90994b659d7ab1144b5a80804bac1f4e9770bfff5",
	name: "updateItemFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => updateItemFn.__executeServer(opts));
var updateItemFn = createServerFn({ method: "POST" }).validator(payload).handler(updateItemFn_createServerFn_handler, async ({ data }) => {
	const { updateItem } = await import("./dojo.server-CkJxiroC.mjs");
	const patch = data.patch ?? {};
	return updateItem(String(data.code ?? ""), String(data.itemId ?? ""), patch, String(data.token ?? ""), phoneOf(data));
});
var removeItemFn_createServerFn_handler = createServerRpc({
	id: "bfe2f3d7d5deeb3f55b125cd67249c001f946cc36574e3b2d08343a339d48fc4",
	name: "removeItemFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => removeItemFn.__executeServer(opts));
var removeItemFn = createServerFn({ method: "POST" }).validator(payload).handler(removeItemFn_createServerFn_handler, async ({ data }) => {
	const { removeItem } = await import("./dojo.server-CkJxiroC.mjs");
	return removeItem(String(data.code ?? ""), String(data.itemId ?? ""), String(data.token ?? ""), phoneOf(data));
});
var restoreDemoFn_createServerFn_handler = createServerRpc({
	id: "16766b607eb7dc0f41d375c69584246f9048cc0e4fa6ef5bfcaf6b7eb2fcd2d1",
	name: "restoreDemoFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => restoreDemoFn.__executeServer(opts));
var restoreDemoFn = createServerFn({ method: "POST" }).validator(payload).handler(restoreDemoFn_createServerFn_handler, async ({ data }) => {
	const { restoreDemo } = await import("./dojo.server-CkJxiroC.mjs");
	return restoreDemo(String(data.code ?? ""), String(data.token ?? ""), phoneOf(data));
});
var setHeroFn_createServerFn_handler = createServerRpc({
	id: "c5c2d6fd31f8975d6c321cbc20b6d33fd0f331e71a8708d0fea0b7a87be57a5b",
	name: "setHeroFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => setHeroFn.__executeServer(opts));
var setHeroFn = createServerFn({ method: "POST" }).validator(payload).handler(setHeroFn_createServerFn_handler, async ({ data }) => {
	const { setHero } = await import("./dojo.server-CkJxiroC.mjs");
	return setHero(String(data.code ?? ""), String(data.hero ?? "boy"), phoneOf(data), tokenOf(data));
});
var undoLastFn_createServerFn_handler = createServerRpc({
	id: "88dac1e25ce49137330540779f84bbaf4e8803ef9da8bf41c15ba0b6997a2975",
	name: "undoLastFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => undoLastFn.__executeServer(opts));
var undoLastFn = createServerFn({ method: "POST" }).validator(payload).handler(undoLastFn_createServerFn_handler, async ({ data }) => {
	const { undoLast } = await import("./dojo.server-CkJxiroC.mjs");
	return undoLast(String(data.code ?? ""), phoneOf(data), tokenOf(data));
});
var claimAchievementFn_createServerFn_handler = createServerRpc({
	id: "d6ca85a2f7c9c19c13257f645ad3fbfc572b6a4139e71f4c511a8601e974d348",
	name: "claimAchievementFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => claimAchievementFn.__executeServer(opts));
var claimAchievementFn = createServerFn({ method: "POST" }).validator(payload).handler(claimAchievementFn_createServerFn_handler, async ({ data }) => {
	const { claimAchievement } = await import("./dojo.server-CkJxiroC.mjs");
	return claimAchievement(String(data.code ?? ""), String(data.studentId ?? ""), String(data.achievementId ?? ""), phoneOf(data), tokenOf(data));
});
var addAchievementFn_createServerFn_handler = createServerRpc({
	id: "3b088e1bda10565e3e5947f87c2d325a366925b01b87cb6599a252c7054ca981",
	name: "addAchievementFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => addAchievementFn.__executeServer(opts));
var addAchievementFn = createServerFn({ method: "POST" }).validator(payload).handler(addAchievementFn_createServerFn_handler, async ({ data }) => {
	const { addAchievement } = await import("./dojo.server-CkJxiroC.mjs");
	const input = data.input ?? {};
	return addAchievement(String(data.code ?? ""), {
		cadence: String(input.cadence ?? "daily"),
		name: String(input.name ?? ""),
		coins: Number(input.coins ?? 0),
		image: String(input.image ?? "")
	}, String(data.token ?? ""), phoneOf(data));
});
var updateAchievementFn_createServerFn_handler = createServerRpc({
	id: "b90a6ebcbe244f8c451f76f23eb578ff9af6a789ac9445da8f26b278321e0e50",
	name: "updateAchievementFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => updateAchievementFn.__executeServer(opts));
var updateAchievementFn = createServerFn({ method: "POST" }).validator(payload).handler(updateAchievementFn_createServerFn_handler, async ({ data }) => {
	const { updateAchievement } = await import("./dojo.server-CkJxiroC.mjs");
	const patch = data.patch ?? {};
	return updateAchievement(String(data.code ?? ""), String(data.achievementId ?? ""), patch, String(data.token ?? ""), phoneOf(data));
});
var removeAchievementFn_createServerFn_handler = createServerRpc({
	id: "38d844e469f5d1ae979b66222b9f2c83997c7e5ddb432e0a83340e393b587ccf",
	name: "removeAchievementFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => removeAchievementFn.__executeServer(opts));
var removeAchievementFn = createServerFn({ method: "POST" }).validator(payload).handler(removeAchievementFn_createServerFn_handler, async ({ data }) => {
	const { removeAchievement } = await import("./dojo.server-CkJxiroC.mjs");
	return removeAchievement(String(data.code ?? ""), String(data.achievementId ?? ""), String(data.token ?? ""), phoneOf(data));
});
var promoteBeltFn_createServerFn_handler = createServerRpc({
	id: "cd1a48342ab90e15ca7ebfdd7640747424f8ee7c3b3b86d3b7a2d77d864e961e",
	name: "promoteBeltFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => promoteBeltFn.__executeServer(opts));
var promoteBeltFn = createServerFn({ method: "POST" }).validator(payload).handler(promoteBeltFn_createServerFn_handler, async ({ data }) => {
	const { promoteBelt } = await import("./dojo.server-CkJxiroC.mjs");
	return promoteBelt(String(data.code ?? ""), String(data.studentId ?? ""), phoneOf(data), tokenOf(data));
});
var dismissCeremonyFn_createServerFn_handler = createServerRpc({
	id: "63f9ba84443a71aae46c3515e064c3b9a934bfb68032d9ffb0523db9044b5f27",
	name: "dismissCeremonyFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => dismissCeremonyFn.__executeServer(opts));
var dismissCeremonyFn = createServerFn({ method: "POST" }).validator(payload).handler(dismissCeremonyFn_createServerFn_handler, async ({ data }) => {
	const { dismissCeremony } = await import("./dojo.server-CkJxiroC.mjs");
	return dismissCeremony(String(data.code ?? ""), String(data.ceremonyId ?? ""));
});
var dayLedgerFn_createServerFn_handler = createServerRpc({
	id: "aa5a5d967abce3d2a159d542e4f5bc4736b554e5b8786ddfe03853e38e1d7b8b",
	name: "dayLedgerFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => dayLedgerFn.__executeServer(opts));
var dayLedgerFn = createServerFn({ method: "POST" }).validator(payload).handler(dayLedgerFn_createServerFn_handler, async ({ data }) => {
	const { dayLedger } = await import("./dojo.server-CkJxiroC.mjs");
	return dayLedger(String(data.code ?? ""), String(data.timeZone ?? ""), phoneOf(data), tokenOf(data));
});
var playStoryFn_createServerFn_handler = createServerRpc({
	id: "2bdea30a1d268005cb6e2d01547e98d67bb67cec27e03921bafe82b1ee9a9314",
	name: "playStoryFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => playStoryFn.__executeServer(opts));
var playStoryFn = createServerFn({ method: "POST" }).validator(payload).handler(playStoryFn_createServerFn_handler, async ({ data }) => {
	const { playStory } = await import("./dojo.server-CkJxiroC.mjs");
	return playStory(String(data.code ?? ""), phoneOf(data), tokenOf(data));
});
var ninjaRosterFn_createServerFn_handler = createServerRpc({
	id: "a49ed05181709b292ae82c7729433ecd7d6eddc00e3fa0d63e8adf276a13b9ea",
	name: "ninjaRosterFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => ninjaRosterFn.__executeServer(opts));
var ninjaRosterFn = createServerFn({ method: "POST" }).validator(payload).handler(ninjaRosterFn_createServerFn_handler, async ({ data }) => {
	const { ninjaRoster } = await import("./games.server-D1koyYmj.mjs");
	return ninjaRoster(phoneOf(data));
});
var ninjaBoardFn_createServerFn_handler = createServerRpc({
	id: "28ab62336983699603a348faf5cc874a00076d856f1cc87f7d47cb323fe3501e",
	name: "ninjaBoardFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => ninjaBoardFn.__executeServer(opts));
var ninjaBoardFn = createServerFn({ method: "POST" }).validator(payload).handler(ninjaBoardFn_createServerFn_handler, async ({ data }) => {
	const { ninjaBoard } = await import("./games.server-D1koyYmj.mjs");
	return ninjaBoard(phoneOf(data), String(data.studentId ?? ""));
});
var ninjaStartFn_createServerFn_handler = createServerRpc({
	id: "b5d5e8c4b2d21e110c1ccd0611606bf7aed5ff08ffb98890f8c54e3bed3ee9b1",
	name: "ninjaStartFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => ninjaStartFn.__executeServer(opts));
var ninjaStartFn = createServerFn({ method: "POST" }).validator(payload).handler(ninjaStartFn_createServerFn_handler, async ({ data }) => {
	const { ninjaStart } = await import("./games.server-D1koyYmj.mjs");
	return ninjaStart(phoneOf(data), String(data.studentId ?? ""), String(data.game ?? ""));
});
var ninjaFinishFn_createServerFn_handler = createServerRpc({
	id: "2f46918d902970366326f3417de88440ad62789a7b4a3dc80bd176bccc00a745",
	name: "ninjaFinishFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => ninjaFinishFn.__executeServer(opts));
var ninjaFinishFn = createServerFn({ method: "POST" }).validator(payload).handler(ninjaFinishFn_createServerFn_handler, async ({ data }) => {
	const { ninjaFinish } = await import("./games.server-D1koyYmj.mjs");
	return ninjaFinish(phoneOf(data), String(data.studentId ?? ""), String(data.runId ?? ""), Number(data.words), Number(data.golden), Boolean(data.lost));
});
var ninjaQueueReadyFn_createServerFn_handler = createServerRpc({
	id: "608c0cc4529327f417c109464f7bbe17ff77ff864855598399fbee622defa1a5",
	name: "ninjaQueueReadyFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => ninjaQueueReadyFn.__executeServer(opts));
var ninjaQueueReadyFn = createServerFn({ method: "POST" }).validator(payload).handler(ninjaQueueReadyFn_createServerFn_handler, async ({ data }) => {
	const { ninjaQueueReady } = await import("./fight.server-DD3TAPw6.mjs");
	return ninjaQueueReady(phoneOf(data), String(data.studentId ?? ""));
});
var ninjaQueuePollFn_createServerFn_handler = createServerRpc({
	id: "3c557123f18803d7a183dbd0a74b2db84bfa01ba04a2bc8a8aecea03a7a6b8ab",
	name: "ninjaQueuePollFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => ninjaQueuePollFn.__executeServer(opts));
var ninjaQueuePollFn = createServerFn({ method: "POST" }).validator(payload).handler(ninjaQueuePollFn_createServerFn_handler, async ({ data }) => {
	const { ninjaQueuePoll } = await import("./fight.server-DD3TAPw6.mjs");
	return ninjaQueuePoll(phoneOf(data), String(data.studentId ?? ""), String(data.queueId ?? ""));
});
var ninjaQueueLockFn_createServerFn_handler = createServerRpc({
	id: "ecd146c418aa61784abb3c4ff6595fb699fa1b0a9dad971ef21c0d689fc708c4",
	name: "ninjaQueueLockFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => ninjaQueueLockFn.__executeServer(opts));
var ninjaQueueLockFn = createServerFn({ method: "POST" }).validator(payload).handler(ninjaQueueLockFn_createServerFn_handler, async ({ data }) => {
	const { ninjaQueueLock } = await import("./fight.server-DD3TAPw6.mjs");
	return ninjaQueueLock(phoneOf(data), String(data.studentId ?? ""), String(data.queueId ?? ""), String(data.fighter ?? ""));
});
var ninjaQueueCloseFn_createServerFn_handler = createServerRpc({
	id: "679088b81c334e46e33c1ebe2eefb73c499d911530643173750d980245a5eed9",
	name: "ninjaQueueCloseFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => ninjaQueueCloseFn.__executeServer(opts));
var ninjaQueueCloseFn = createServerFn({ method: "POST" }).validator(payload).handler(ninjaQueueCloseFn_createServerFn_handler, async ({ data }) => {
	const { ninjaQueueClose } = await import("./fight.server-DD3TAPw6.mjs");
	return ninjaQueueClose(phoneOf(data), String(data.studentId ?? ""), String(data.queueId ?? ""));
});
var ninjaMatchStateFn_createServerFn_handler = createServerRpc({
	id: "4404f775bc16d8c6ff7d069ac2f5c4d3b0c76bebab7ee453b0c1cc32940cbee7",
	name: "ninjaMatchStateFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => ninjaMatchStateFn.__executeServer(opts));
var ninjaMatchStateFn = createServerFn({ method: "POST" }).validator(payload).handler(ninjaMatchStateFn_createServerFn_handler, async ({ data }) => {
	const { ninjaMatchState } = await import("./fight.server-DD3TAPw6.mjs");
	return ninjaMatchState(phoneOf(data), String(data.studentId ?? ""), String(data.matchId ?? ""));
});
var ninjaMatchTypeFn_createServerFn_handler = createServerRpc({
	id: "252e9eb369b679e8921247c1292194fb3195976d6fcdc884ab48341bf369541e",
	name: "ninjaMatchTypeFn",
	filename: "src/lib/dojo/api.ts"
}, (opts) => ninjaMatchTypeFn.__executeServer(opts));
var ninjaMatchTypeFn = createServerFn({ method: "POST" }).validator(payload).handler(ninjaMatchTypeFn_createServerFn_handler, async ({ data }) => {
	const { ninjaMatchType } = await import("./fight.server-DD3TAPw6.mjs");
	return ninjaMatchType(phoneOf(data), String(data.studentId ?? ""), String(data.matchId ?? ""), String(data.letter ?? ""));
});
//#endregion
export { addAchievementFn_createServerFn_handler, addItemFn_createServerFn_handler, addStudentFn_createServerFn_handler, awardCoinsFn_createServerFn_handler, callPocketFn_createServerFn_handler, claimAchievementFn_createServerFn_handler, dayLedgerFn_createServerFn_handler, dismissCeremonyFn_createServerFn_handler, joinDojoFn_createServerFn_handler, ninjaBoardFn_createServerFn_handler, ninjaFinishFn_createServerFn_handler, ninjaMatchStateFn_createServerFn_handler, ninjaMatchTypeFn_createServerFn_handler, ninjaQueueCloseFn_createServerFn_handler, ninjaQueueLockFn_createServerFn_handler, ninjaQueuePollFn_createServerFn_handler, ninjaQueueReadyFn_createServerFn_handler, ninjaRosterFn_createServerFn_handler, ninjaStartFn_createServerFn_handler, openDojoFn_createServerFn_handler, playStoryFn_createServerFn_handler, promoteBeltFn_createServerFn_handler, pullDojoFn_createServerFn_handler, redeemItemFn_createServerFn_handler, removeAchievementFn_createServerFn_handler, removeItemFn_createServerFn_handler, restoreDemoFn_createServerFn_handler, setHeroFn_createServerFn_handler, undoLastFn_createServerFn_handler, unlockDirectorFn_createServerFn_handler, updateAchievementFn_createServerFn_handler, updateItemFn_createServerFn_handler, updateStudentFn_createServerFn_handler };
