export const MINING_TIPS = [
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
  "You already know more than the empty stage. Snap the next block.",
];

const recent: string[] = [];

export function nextTip() {
  const fresh = MINING_TIPS.filter((tip) => !recent.includes(tip));
  const pool = fresh.length ? fresh : MINING_TIPS;
  const tip = pool[Math.floor(Math.random() * pool.length)] ?? MINING_TIPS[0]!;
  recent.unshift(tip);
  if (recent.length > 18) recent.pop();
  return tip;
}
