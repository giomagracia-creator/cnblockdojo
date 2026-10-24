const COIN_LINES = [
  (name: string, amount: number) => `${name} just struck gold! +${amount} coins!`,
  (name: string, amount: number) => `Ka-ching! The cave paid ${name} +${amount}.`,
  (name: string, amount: number) => `Rosie is hopping. +${amount} for ${name}!`,
  (name: string, amount: number) => `That's the sound of good code. +${amount}, ${name}!`,
];

export function coinLine(name: string, amount: number) {
  const index = Math.floor(Math.random() * COIN_LINES.length);
  return COIN_LINES[index]!(name, amount);
}

export function welcomeLine(name: string) {
  return `Welcome to the dojo, ${name}! Grab a pick and stay curious.`;
}

export function beltLine(name: string, belt: string) {
  return `${name} tied on a ${belt} belt. The code gets sharper from here.`;
}

export function redeemLine(name: string, item: string) {
  return `${name} cracked the chest and pulled out ${item}!`;
}

export function shopLine(item: string) {
  return `New treasure on the shelf: ${item}. Who's ready?`;
}

export function restLine(name: string) {
  return `Rest easy, ${name}. Rosie will save your spot.`;
}

export function renameLine(name: string) {
  return `Got it. We'll call you ${name}.`;
}
