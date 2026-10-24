import type { Achievement, DojoEvent, ShopItem, Student } from "@/lib/dojo/types";

export const SEED_STUDENTS: Student[] = [
  { id: "s-priya", firstName: "Priya", lastInitial: "D", belt: "Purple", coins: 520, exp: 0, weekCoins: 80, archived: false },
  { id: "s-luna", firstName: "Luna", lastInitial: "K", belt: "Blue", coins: 410, exp: 0, weekCoins: 60, archived: false },
  { id: "s-sam", firstName: "Sam", lastInitial: "T", belt: "Brown", coins: 310, exp: 0, weekCoins: 45, archived: false },
  { id: "s-jasper", firstName: "Jasper", lastInitial: "M", belt: "Yellow", coins: 240, exp: 0, weekCoins: 50, archived: false },
  { id: "s-aiko", firstName: "Aiko", lastInitial: "S", belt: "Green", coins: 180, exp: 0, weekCoins: 35, archived: false },
  { id: "s-mateo", firstName: "Mateo", lastInitial: "R", belt: "Orange", coins: 95, exp: 0, weekCoins: 25, archived: false },
  { id: "s-eli", firstName: "Eli", lastInitial: "W", belt: "Red", coins: 80, exp: 0, weekCoins: 20, archived: false },
  { id: "s-noah", firstName: "Noah", lastInitial: "P", belt: "White", coins: 40, exp: 0, weekCoins: 15, archived: false },
  { id: "s-quinn", firstName: "Quinn", lastInitial: "B", belt: "Black", coins: 12, exp: 0, weekCoins: 0, archived: true },
];

export const SEED_ITEMS: ShopItem[] = [
  { id: "i-stickers", name: "Sticker Pack", price: 15, currency: "coins", stock: 24, image: "/art/items/stickers.jpg", minBelt: null },
  { id: "i-patch", name: "Code Patch", price: 25, currency: "coins", stock: 12, image: "/art/items/patch.jpg", minBelt: "Yellow" },
  { id: "i-key", name: "LED Keychain", price: 40, currency: "coins", stock: 8, image: "/art/items/keychain.jpg", minBelt: null },
  { id: "i-dragon", name: "3D Printed Dragon", price: 80, currency: "coins", stock: 5, image: "/art/items/dragon.jpg", minBelt: "Green" },
  { id: "i-figure", name: "Mini Figure", price: 120, currency: "coins", stock: 4, image: "/art/items/figure.jpg", minBelt: "Blue" },
  { id: "i-chest", name: "Treasure Chest", price: 200, currency: "exp", stock: 0, image: "/art/items/chest.jpg", minBelt: "Purple" },
];

export const SEED_ACHIEVEMENTS: Achievement[] = [
  { id: "a-code", cadence: "daily", name: "Code for 40 minutes", coins: 40, image: "/art/achievements/code.png" },
  { id: "a-friend", cadence: "weekly", name: "Bring a friend", coins: 100, image: "/art/achievements/friend.png" },
  { id: "a-print-friend", cadence: "weekly", name: "Give a 3D print to a friend", coins: 10, image: "/art/achievements/print.png" },
  { id: "a-print-teacher", cadence: "weekly", name: "Give a 3D print to your teacher", coins: 30, image: "/art/achievements/teacher.png" },
];

export function seedEvents(now = Date.now()): DojoEvent[] {
  return [
    {
      id: "e-luna",
      kind: "redeem",
      at: now - 1000 * 60 * 48,
      studentName: "Luna K.",
      detail: "Mini Figure",
      line: "Luna K. cracked the chest and pulled out Mini Figure!",
      coins: 120,
      celebrateUntil: 0,
      sceneUntil: 0,
    },
    {
      id: "e-jasper",
      kind: "award",
      at: now - 1000 * 60 * 20,
      studentName: "Jasper M.",
      detail: "+10 coins",
      line: "Jasper M. just struck gold! +10 coins!",
      coins: 10,
      celebrateUntil: 0,
      sceneUntil: 0,
    },
    {
      id: "e-priya",
      kind: "redeem",
      at: now - 1000 * 60 * 8,
      studentName: "Priya D.",
      detail: "LED Keychain",
      line: "Priya D. cracked the chest and pulled out LED Keychain!",
      coins: 40,
      celebrateUntil: 0,
      sceneUntil: 0,
    },
  ];
}
