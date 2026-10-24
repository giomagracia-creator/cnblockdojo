import { useEffect, useRef } from "react";
import { caveAudio } from "@/lib/dojo/audio";
import { nextTip } from "@/lib/dojo/tips";
import { useDojo } from "@/lib/dojo/store";
import type { DojoEvent } from "@/lib/dojo/types";

const W = 480;
const H = 270;
const GROUND = 214;

type Ore = "ruby" | "emerald";

const ORE_SPOTS: { x: number; ore: Ore }[] = [
  { x: 86, ore: "ruby" },
  { x: 196, ore: "emerald" },
  { x: 312, ore: "ruby" },
  { x: 404, ore: "emerald" },
];
const CHESTS = [40, 440];

type Mote = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number };
type Drift = { x: number; y: number; speed: number; size: number; phase: number };
type Floater = { x: number; y: number; vx: number; vy: number; life: number };
type Measured = { image: HTMLImageElement; head: number; foot: number; anchorX: number };

const BODY = 72;
const PET = 36;
const QUIET_MIN = 3 * 60 * 1000;
const QUIET_MAX = 10 * 60 * 1000;
const QUEST_LEN = 8.4;
const PLANT_REV = 2;

function questEase(t: number) {
  const fadeIn = t < 1.15 ? 0 : t < 2.5 ? (t - 1.15) / 1.35 : 1;
  const fadeOut = t < 6.45 ? 1 : t > 8.15 ? 0 : 1 - (t - 6.45) / 1.7;
  const u = Math.max(0, Math.min(1, Math.min(fadeIn, fadeOut)));
  return u * u * (3 - 2 * u);
}

function pocketEase(t: number) {
  const fadeIn = t < 0.12 ? 0 : t < 0.8 ? (t - 0.12) / 0.68 : 1;
  const fadeOut = t < 5.8 ? 1 : t > 6.7 ? 0 : 1 - (t - 5.8) / 0.9;
  const u = Math.max(0, Math.min(1, Math.min(fadeIn, fadeOut)));
  return u * u * (3 - 2 * u);
}

function rollQuiet() {
  return QUIET_MIN + Math.random() * (QUIET_MAX - QUIET_MIN);
}

function liveScene(): DojoEvent | undefined {
  if (useDojo.getState().ceremony) return undefined;
  return useDojo.getState().events.find((event) => (event.sceneUntil ?? 0) > Date.now());
}

function measureSprite(image: HTMLImageElement): Measured {
  const scratch = document.createElement("canvas");
  scratch.width = image.naturalWidth;
  scratch.height = image.naturalHeight;
  const ctx = scratch.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { image, head: 0, foot: image.naturalHeight - 1, anchorX: image.naturalWidth / 2 };
  ctx.drawImage(image, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, scratch.width, scratch.height);
  let head = 0;
  let foot = 0;
  let seen = false;
  for (let y = 0; y < height; y++) {
    let left = -1;
    let right = -1;
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3]! > 24) {
        if (left < 0) left = x;
        right = x;
      }
    }
    if (left < 0) continue;
    if (!seen && right - left + 1 >= 12) {
      head = y;
      seen = true;
    }
    foot = y;
  }
  const body = Math.max(1, foot - head);
  const bandTop = foot - body * 0.22;
  const xs: number[] = [];
  for (let y = Math.floor(bandTop); y <= foot; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3]! > 24) xs.push(x);
    }
  }
  xs.sort((a, b) => a - b);
  const anchorX = xs.length ? xs[Math.floor(xs.length / 2)]! : width / 2;
  return { image, head: seen ? head : 0, foot, anchorX };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(src));
    image.src = src;
  });
}

async function loadFrames(prefix: string, names: string[]) {
  return Promise.all(names.map((name) => loadImage(`${prefix}${name}.png`)));
}

export function MineStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = W;
    canvas.height = H;

    caveAudio.bind();
    caveAudio.armMusic(true);
    const questCall = () => {
      const list = useDojo.getState().achievements;
      const daily = list.filter((item) => item.cadence === "daily");
      const weekly = list.filter((item) => item.cadence === "weekly");
      const weeklyFirst = Math.random() < 0.5;
      const pool = weeklyFirst ? weekly : daily;
      const choices = pool.length ? pool : weeklyFirst ? daily : weekly;
      const closers = ["Get it done.", "That's the job.", "Earn it.", "Show me."];
      if (!choices.length) return "Daily quest. Code for 40 minutes. Get it done.";
      const item = choices[Math.floor(Math.random() * choices.length)]!;
      const closer = closers[Math.floor(Math.random() * closers.length)]!;
      const tag = item.cadence === "weekly" ? "Weekly quest" : "Daily quest";
      return `${tag}. ${item.name}. ${closer}`;
    };

    let alive = true;
    let raf = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const state = {
      x: 48,
      node: 0,
      mode: "walk" as "walk" | "mine",
      facing: 1,
      frame: 0,
      frameT: 0,
      swings: 0,
      spark: 0,
      flash: 0,
      squash: 0,
      shake: 0,
      cave: null as HTMLImageElement | null,
      walk: [] as HTMLImageElement[],
      mine: [] as HTMLImageElement[],
      sparks: [] as HTMLImageElement[],
      ruby: null as HTMLImageElement | null,
      emerald: null as HTMLImageElement | null,
      coin: null as HTMLImageElement | null,
      chest: null as HTMLImageElement | null,
      walkSprites: [] as Measured[],
      mineSprites: [] as Measured[],
      greetSprites: [] as Measured[],
      girlWalk: [] as Measured[],
      girlMine: [] as Measured[],
      girlGreet: [] as Measured[],
      plantSprites: [] as Measured[],
      girlPlant: [] as Measured[],
      reward: [] as Measured[],
      rosieSprites: [] as Measured[],
      hopSprites: [] as Measured[],
      rosieX: 300,
      rosieFacing: -1,
      rosieFrame: 0,
      rosieT: 0,
      rosieMood: "wander" as "wander" | "sleep",
      rosieGoal: 360,
      rosieMoodUntil: 0,
      rosieCheered: false,
      nodes: ORE_SPOTS.map((spot) => ({ ...spot, growth: 1 })),
      chunks: [] as { id: number; ore: Ore; x: number; carried: boolean }[],
      chunkSeq: 1,
      boomId: "",
      tip: "",
      tipUntil: 0,
      tipNext: 0,
      poseFrame: 0,
      poseT: 0,
      sceneId: "",
      questT: -1,
      quietSince: 0,
      quietFor: rollQuiet(),
      questSting: false,
      questLine: "",
      floaters: [] as Floater[],
      drifts: Array.from({ length: 16 }, (_, index) => ({
        x: (index * 37) % W,
        y: 40 + ((index * 53) % 150),
        speed: 4 + (index % 5),
        size: index % 3 === 0 ? 2 : 1,
        phase: index * 0.7,
      })) as Drift[],
      motes: [] as Mote[],
    };

    const burst = (x: number, y: number) => {
      const colors = ["#f0c14b", "#7ee0d0", "#f4e6cf", "#d63a32"];
      for (let i = 0; i < 10; i++) {
        const angle = -Math.PI * 0.15 - Math.random() * Math.PI * 0.7;
        const speed = 18 + Math.random() * 46;
        state.motes.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.45 + Math.random() * 0.35,
          max: 0.8,
          color: colors[i % colors.length]!,
          size: 2 + (i % 3),
        });
      }
    };

    const drawSprite = (
      sprite: Measured | undefined,
      x: number,
      feet: number,
      facing: number,
      bodyHeight = BODY,
    ) => {
      if (!sprite) return;
      const body = Math.max(1, sprite.foot - sprite.head);
      const scale = bodyHeight / body;
      const destW = sprite.image.width * scale;
      const destH = sprite.image.height * scale;
      ctx.save();
      ctx.translate(Math.round(x), Math.round(feet));
      ctx.scale(facing, 1);
      ctx.drawImage(sprite.image, Math.round(-sprite.anchorX * scale), Math.round(-(sprite.foot + 1) * scale), destW, destH);
      ctx.restore();
    };

    const drawProp = (
      image: HTMLImageElement | null,
      x: number,
      y: number,
      size: number,
      time: number,
      phase: number,
    ) => {
      if (!image) return;
      const bob = reduced ? 0 : Math.sin(time * 1.35 + phase) * 2.2;
      const sway = reduced ? 0 : Math.sin(time * 0.85 + phase) * 0.08;
      const pulse = reduced ? 1 : 1 + Math.sin(time * 1.8 + phase) * 0.035;
      ctx.save();
      ctx.translate(x, y + bob);
      ctx.rotate(sway);
      ctx.scale(pulse, pulse);
      ctx.drawImage(image, -size / 2, -size, size, size);
      if (!reduced && Math.sin(time * 2.6 + phase) > 0.86) {
        ctx.fillStyle = "rgba(244, 230, 207, 0.9)";
        ctx.fillRect(-1, Math.round(-size * 0.72), 2, 2);
      }
      ctx.restore();
    };

    const wrapLine = (text: string, max: number) => {
      const words = text.split(" ");
      const lines: string[] = [];
      let line = "";
      for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(next).width > max) {
          lines.push(line);
          line = word;
        } else {
          line = next;
        }
      }
      if (line) lines.push(line);
      return lines.slice(0, 5);
    };

    const drawBubble = (text: string, anchorX: number, anchorY: number, grand = false, aboveHead = false) => {
      ctx.save();
      ctx.font = grand || aboveHead ? "bold 14px Nunito, sans-serif" : "bold 11px Nunito, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const wide = aboveHead || grand;
      const lines = wrapLine(text, aboveHead ? 300 : wide ? 210 : 156);
      const widest = Math.max(...lines.map((line) => ctx.measureText(line).width), 36);
      const boxW = Math.min(aboveHead ? 340 : wide ? 236 : 170, widest + (wide ? 20 : 14));
      const lineH = wide ? 17 : 13;
      const boxH = lines.length * lineH + (wide ? 14 : 10);
      const left = Math.max(6, Math.min(W - boxW - 6, anchorX - boxW / 2));
      const tail = 10;
      const gap = aboveHead ? 8 : wide ? 22 : 16;
      const minTop = aboveHead ? 4 : grand ? 92 : 4;
      const top = Math.max(minTop, anchorY - boxH - gap - (aboveHead ? tail : 0));
      ctx.fillStyle = "#1c140f";
      ctx.strokeStyle = "#f0c14b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(left, top, boxW, boxH, 5);
      ctx.fill();
      ctx.stroke();
      const tailX = Math.max(left + 14, Math.min(left + boxW - 14, anchorX));
      ctx.beginPath();
      ctx.moveTo(tailX - 8, top + boxH - 2);
      ctx.lineTo(tailX + 8, top + boxH - 2);
      ctx.lineTo(tailX, top + boxH + tail);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = wide ? "#fff6d0" : "#f4e6cf";
      lines.forEach((line, index) => {
        ctx.fillText(line, left + (wide ? 10 : 7), top + (wide ? 7 : 5) + index * lineH);
      });
      ctx.restore();
    };

    const drawBanner = (live: DojoEvent) => {
      const title =
        live.kind === "award"
          ? live.detail.replace("coins", "COINS").toUpperCase()
          : live.kind === "redeem"
            ? live.detail.toUpperCase()
            : live.kind === "welcome"
              ? "WELCOME"
              : live.kind === "belt"
                ? `${live.detail.toUpperCase()} BELT`
                : live.kind === "shop"
                  ? "NEW PRIZE"
                  : "REST EASY";
      ctx.save();
      ctx.fillStyle = "rgba(28, 20, 15, 0.92)";
      ctx.strokeStyle = "#f0c14b";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(36, 46, W - 72, 38, 4);
      ctx.fill();
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#f0c14b";
      ctx.font = "8px 'Press Start 2P', monospace";
      ctx.fillText(title.slice(0, 16), W / 2, 58);
      ctx.font = "bold 12px Nunito, sans-serif";
      ctx.fillStyle = "#fff6d0";
      ctx.fillText(live.studentName || "The dojo", W / 2, 74);
      ctx.restore();
    };

    const draw = (time: number) => {
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      if (state.shake > 0) {
        ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
      }
      const live = liveScene();
      const pocket = live?.kind === "pocket" ? live : undefined;
      const pocketT = pocket ? Math.max(0, (Date.now() - pocket.at) / 1000) : -1;
      const questing = state.questT >= 0 && !live;
      const ease = pocket ? (reduced ? 0 : pocketEase(pocketT)) : questing && !reduced ? questEase(state.questT) : 0;
      if (ease > 0.001) {
        const zoom = 1 + ease * 1.55;
        const fx = state.x;
        const fy = GROUND - 66;
        const sx = fx + (W / 2 - fx) * ease;
        const sy = fy + (H * 0.42 - fy) * ease;
        ctx.translate(sx, sy);
        ctx.scale(zoom, zoom);
        ctx.translate(-fx, -fy);
      }
      if (state.cave) ctx.drawImage(state.cave, 0, 0, W, H);
      else {
        ctx.fillStyle = "#1a120c";
        ctx.fillRect(0, 0, W, H);
      }
      if (state.flash > 0) {
        const ring = (1 - state.flash) * 70 + 8;
        ctx.globalAlpha = state.flash * 0.45;
        ctx.strokeStyle = "#f0c14b";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(state.x, GROUND - 46, ring, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = state.flash * 0.12;
        ctx.fillStyle = "#f0c14b";
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }

      const flicker = 0.35 + Math.sin(time * 3.2) * 0.08;
      const lanternSway = reduced ? 0 : Math.sin(time * 0.7) * 4;
      ctx.fillStyle = `rgba(240, 193, 75, ${flicker * 0.18})`;
      ctx.beginPath();
      ctx.ellipse(168 + lanternSway, 78, 46, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(392 - lanternSway * 0.6, 92, 36, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      drawProp(state.chest, CHESTS[0]!, GROUND - 4, 28, time, 0.4);
      drawProp(state.chest, CHESTS[1]!, GROUND - 4, 28, time, 2.2);
      drawProp(state.coin, 48, GROUND - 36, 14, time, 1.7);
      drawProp(state.ruby, 132, 148, 22, time, 0.2);
      drawProp(state.emerald, 248, 156, 18, time, 2.1);
      drawProp(state.ruby, 356, 142, 20, time, 3.3);
      drawProp(state.emerald, 438, 150, 18, time, 4.2);

      for (const node of state.nodes) {
        if (node.growth <= 0.04) continue;
        const ore = node.ore === "ruby" ? state.ruby : state.emerald;
        const squash = state.mode === "mine" && Math.abs(state.x - (node.x - 26)) < 8 ? state.squash : 0;
        const bob = reduced ? 0 : Math.sin(time * 1.6 + node.x) * 2 * node.growth;
        if (!ore) continue;
        const grow = Math.max(0.05, node.growth);
        ctx.save();
        ctx.translate(node.x, GROUND - 8 + bob + (1 - grow) * 28);
        ctx.scale(grow, grow * (1 - squash));
        ctx.drawImage(ore, -23, -46, 46, 46);
        ctx.restore();
      }
      for (const chunk of state.chunks) {
        if (chunk.carried) continue;
        const ore = chunk.ore === "ruby" ? state.ruby : state.emerald;
        if (!ore) continue;
        const bob = reduced ? 0 : Math.sin(time * 3 + chunk.x) * 1.5;
        ctx.drawImage(ore, chunk.x - 9, GROUND - 24 + bob, 18, 18);
      }

      const hero = useDojo.getState().hero;
      const girl = hero === "girl" && state.girlWalk.length > 0;
      const walks = girl ? state.girlWalk : state.walkSprites;
      const mines = girl ? state.girlMine : state.mineSprites;
      const greets = (girl ? state.girlGreet : state.greetSprites).length
        ? girl
          ? state.girlGreet
          : state.greetSprites
        : walks;
      const frames = state.mode === "mine" ? mines : walks;
      const plants = girl && state.girlPlant.length ? state.girlPlant : state.plantSprites;
      const firework = live?.kind === "award" || live?.kind === "redeem";
      const hop = live && !firework && !pocket ? Math.abs(Math.sin(time * 8)) * 10 : 0;
      const plantAt = (t: number) => {
        if (t < 0.42) return 0;
        if (t < 0.78) return 1;
        if (t < 1.12) return 2;
        if (t < 6.7) return 3;
        const back = Math.min(1, (t - 6.7) / 1.35);
        return 3 - Math.round(back * 3);
      };
      const pocketAt = (t: number) => (t < 0.2 ? 0 : t < 0.4 ? 1 : t < 0.6 ? 2 : 3);
      const sprite = pocket && plants.length
        ? plants[pocketAt(pocketT) % plants.length]
        : live
        ? greets[state.poseFrame % Math.max(1, greets.length)]
        : questing && plants.length
          ? plants[plantAt(state.questT) % plants.length]
          : frames[state.frame];
      const height = firework ? 84 : live && !pocket ? 112 : BODY;
      ctx.fillStyle = "rgba(16, 11, 8, 0.45)";
      ctx.beginPath();
      ctx.ellipse(state.x, GROUND - 2, live && !pocket ? 26 : 16, live && !pocket ? 6 : 4, 0, 0, Math.PI * 2);
      ctx.fill();
      if (live && !firework && !pocket && state.reward.length) {
        const medal = state.reward[state.poseFrame % state.reward.length];
        drawSprite(medal, state.x, GROUND - hop - 6, 1, 88);
      }
      if (live && !firework && state.chest && live.kind === "shop") {
        const pulse = 1 + Math.sin(time * 6) * 0.08;
        const size = 54 * pulse;
        ctx.drawImage(state.chest, state.x + 36, GROUND - hop - size - 8, size, size);
      }
      drawSprite(sprite, state.x, GROUND - hop, live ? 1 : state.facing, height);
      if (firework && live) {
        const t = (Date.now() - live.at) / 1000;
        const handX = state.x + 16;
        const handY = GROUND - 78;
        const aimX = W / 2;
        const aimY = 86;
        if (t < 1.45) {
          const u = t < 0.55 ? 0 : Math.min(1, (t - 0.55) / 0.9);
          const rx = handX + (aimX - handX) * u;
          const ry = handY + (aimY - handY) * u;
          const angle = u === 0 ? -Math.PI / 2 : Math.atan2(aimY - handY, aimX - handX) + Math.PI / 2;
          ctx.save();
          ctx.translate(rx, ry);
          ctx.rotate(angle);
          ctx.fillStyle = "#d63a32";
          ctx.fillRect(-3, -12, 6, 16);
          ctx.fillStyle = "#f0c14b";
          ctx.fillRect(-4, 2, 8, 3);
          ctx.fillStyle = "#f4e6cf";
          ctx.beginPath();
          ctx.moveTo(-3, -12);
          ctx.lineTo(0, -18);
          ctx.lineTo(3, -12);
          ctx.fill();
          ctx.fillStyle = u > 0 ? "#f0c14b" : "#7ee0d0";
          ctx.fillRect(-2, 6, 4, 3 + (u > 0 ? 3 : 0));
          ctx.restore();
        } else if (state.reward.length) {
          const burst = state.reward[Math.min(3, Math.floor((t - 1.45) * 6)) % state.reward.length];
          if (burst && t < 2.4) drawSprite(burst, aimX, aimY + 36, 1, 90);
        }
      }

      const rosieSleeping = !live && state.questT < 0 && state.rosieMood === "sleep";
      const beside = Math.abs(state.rosieX - state.x) < 70 && Math.abs(state.rosieX - state.x) > 40;
      const rosieSet = live && beside ? state.hopSprites : state.rosieSprites;
      const rosie = rosieSleeping ? state.rosieSprites[0] : rosieSet[state.rosieFrame % Math.max(1, rosieSet.length)];
      ctx.beginPath();
      ctx.fillStyle = "rgba(16, 11, 8, 0.35)";
      ctx.ellipse(state.rosieX, GROUND + 1, 10, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      const rosieHop = live && beside ? Math.abs(Math.sin(time * 7)) * 6 : 0;
      drawSprite(rosie, state.rosieX, GROUND + (rosieSleeping ? 3 : 2) - rosieHop, state.rosieFacing, PET);
      const carried = state.chunks.find((chunk) => chunk.carried);
      if (carried) {
        const ore = carried.ore === "ruby" ? state.ruby : state.emerald;
        if (ore) ctx.drawImage(ore, state.rosieX - 8, GROUND - PET - 16 - rosieHop, 16, 16);
      }
      if (!rosieSleeping) {
        ctx.font = "7px 'Press Start 2P', monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = "#f4e6cf";
        ctx.fillText("Rosie", Math.round(state.rosieX), Math.round(GROUND - PET - 6));
      } else {
        ctx.font = "bold 10px Nunito, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "#c8d4e8";
        const drift = (time * 10) % 14;
        ctx.fillText("z", state.rosieX + 10, GROUND - 46 - drift);
        ctx.globalAlpha = 0.7;
        ctx.fillText("z", state.rosieX + 16, GROUND - 56 - drift * 0.6);
        ctx.globalAlpha = 1;
      }

      if (state.coin) {
        for (const floater of state.floaters) {
          ctx.globalAlpha = Math.max(0, floater.life);
          ctx.drawImage(state.coin, floater.x - (live ? 11 : 7), floater.y - (live ? 22 : 14), live ? 22 : 14, live ? 22 : 14);
        }
        ctx.globalAlpha = 1;
      }

      if (state.spark > 0 && state.sparks.length) {
        const spark = state.sparks[Math.min(3, Math.floor((1 - state.spark) * 4))];
        if (spark) {
          const tip = state.x + state.facing * 28;
          ctx.globalAlpha = Math.min(1, state.spark * 1.6);
          ctx.drawImage(spark, tip - 28, GROUND - 78, 56, 56);
          ctx.globalAlpha = 1;
        }
      }

      for (const mote of state.motes) {
        const alpha = Math.max(0, mote.life / mote.max);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = mote.color;
        ctx.fillRect(Math.round(mote.x), Math.round(mote.y), mote.size, mote.size);
      }
      ctx.globalAlpha = 1;
      for (const drift of state.drifts) {
        const alpha = 0.25 + (Math.sin(time * 1.4 + drift.phase) * 0.5 + 0.5) * 0.45;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = drift.size === 2 ? "#7ee0d0" : "#f0c14b";
        ctx.fillRect(Math.round(drift.x), Math.round(drift.y), drift.size, drift.size);
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      if (ease > 0.02) {
        const bar = Math.round(ease * 24);
        ctx.fillStyle = "#100c09";
        ctx.fillRect(0, 0, W, bar);
        ctx.fillRect(0, H - bar, W, bar);
      }

      const questTalk = questing && state.questT > 1.7 && state.questT < 7.2 && state.questLine;
      const pocketTalk = Boolean(pocket && pocketT > 0.45 && pocketT < 6.15 && pocket.line);
      const spoken = firework
        ? ""
        : pocket
          ? pocketTalk
            ? pocket.line
            : ""
          : live?.line || (questTalk ? state.questLine : !questing && state.tipUntil > Date.now() ? state.tip : "");
      if (live && !pocket) drawBanner(live);
      if (spoken) {
        if (pocketTalk || questTalk) {
          const zoom = 1 + ease * 1.55;
          const fx = state.x;
          const fy = GROUND - 66;
          const sx = fx + (W / 2 - fx) * ease;
          const sy = fy + (H * 0.42 - fy) * ease;
          const headY = sy + (GROUND - BODY - fy) * zoom;
          drawBubble(spoken, sx, headY, true, true);
        } else drawBubble(spoken, state.x, GROUND - hop - height + 8, Boolean(live));
      }
    };

    const step = (dt: number) => {
      for (const node of state.nodes) {
        if (node.growth < 1) node.growth = Math.min(1, node.growth + dt * 0.28);
      }
      const ready = state.nodes.findIndex((node, index) => node.growth >= 0.95 && (index === state.node || state.nodes[state.node]!.growth < 0.95));
      if (ready >= 0 && state.nodes[state.node]!.growth < 0.95) state.node = ready;
      const target = state.nodes[state.node]!;
      const stopX = target.x - 26;
      state.shake = Math.max(0, state.shake - dt * 18);
      state.squash = Math.max(0, state.squash - dt * 4);
      state.spark = Math.max(0, state.spark - dt * 2.4);
      state.flash = Math.max(0, state.flash - dt * 0.9);
      const live = liveScene();

      if (live) {
        if (state.sceneId !== live.id) {
          state.sceneId = live.id;
          state.poseFrame = 0;
          state.poseT = 0;
          if (live.kind !== "pocket") {
            state.flash = 0.85;
            const colors =
              live.kind === "rest"
                ? ["#9bb0d0", "#e7eef8"]
                : live.kind === "welcome"
                  ? ["#7ee0d0", "#f4e6cf", "#f0c14b"]
                  : ["#f0c14b", "#fff6d0", "#d63a32", "#7ee0d0"];
            for (let i = 0; i < 16; i++) {
              const angle = -Math.PI * 0.15 - Math.random() * Math.PI * 0.85;
              const speed = 28 + Math.random() * 70;
              state.motes.push({
                x: state.x,
                y: GROUND - 48,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.7 + Math.random() * 0.3,
                max: 1,
                color: colors[i % colors.length]!,
                size: 2 + (i % 3),
              });
            }
          }
        }
        if ((live.kind === "award" || live.kind === "redeem") && state.boomId !== live.id) {
          const t = (Date.now() - live.at) / 1000;
          if (t >= 1.35) {
            state.boomId = live.id;
            state.flash = 1;
            state.shake = 6;
            caveAudio.cue("hit");
            for (let i = 0; i < 18; i++) {
              const angle = (Math.PI * 2 * i) / 18;
              state.floaters.push({
                x: W / 2,
                y: 86,
                vx: Math.cos(angle) * (40 + (i % 4) * 16),
                vy: Math.sin(angle) * (30 + (i % 3) * 14) - 20,
                life: 1.6,
              });
            }
          }
        }
        state.poseT += dt;
        if (state.poseT > 0.2) {
          state.poseT = 0;
          state.poseFrame += 1;
        }
      } else if (state.questT >= 0) {
        state.sceneId = "";
      } else {
        state.sceneId = "";
        if (target.growth < 0.95) state.mode = "walk";
        if (state.mode === "walk") {
          if (target.growth < 0.95) {
            state.frameT += dt;
            if (state.frameT > 0.2) {
              state.frameT = 0;
              state.frame = (state.frame + 1) % Math.max(1, state.walk.length);
            }
          } else {
            const dir = Math.sign(stopX - state.x) || 1;
            state.facing = dir;
            const next = state.x + dir * 38 * dt;
            if ((dir > 0 && next >= stopX) || (dir < 0 && next <= stopX)) {
              state.x = stopX;
              state.mode = "mine";
              state.frame = 0;
              state.frameT = 0;
              state.swings = 0;
            } else {
              state.x = next;
            }
            state.frameT += dt;
            if (state.frameT > 0.16) {
              state.frameT = 0;
              state.frame = (state.frame + 1) % Math.max(1, state.walk.length);
              if (state.frame % 2 === 0) caveAudio.cue("step");
            }
          }
        } else {
          state.facing = 1;
          state.frameT += dt;
          const frameDur = 0.16;
          if (state.frameT > frameDur) {
            state.frameT = 0;
            const count = Math.max(1, state.mine.length);
            const prev = state.frame;
            state.frame = (state.frame + 1) % count;
            if (prev === 2 || (count < 3 && state.frame === 0)) {
              state.spark = 1;
              state.shake = 3.2;
              state.squash = 0.18;
              burst(target.x, GROUND - 36);
              caveAudio.cue("hit");
            }
            if (state.frame === 0) {
              state.swings += 1;
              if (state.swings >= 3) {
                target.growth = 0;
                state.chunks.push({ id: state.chunkSeq, ore: target.ore, x: target.x, carried: false });
                state.chunkSeq += 1;
                state.mode = "walk";
                state.node = (state.node + 1) % state.nodes.length;
                state.frame = 0;
                state.frameT = 0;
              }
            }
          }
        }
      }

      const loose = state.chunks.find((chunk) => !chunk.carried);
      const carriedChunk = state.chunks.find((chunk) => chunk.carried);
      const payShow = Boolean(live && (live.kind === "award" || live.kind === "redeem"));
      const spot = Math.max(28, Math.min(W - 28, state.x + (state.rosieX < state.x ? -62 : 62)));
      const questingNow = state.questT >= 0;
      if ((carriedChunk || (loose && !payShow)) && !(questingNow && !carriedChunk)) {
        state.rosieCheered = false;
        const goal = carriedChunk
          ? CHESTS.reduce((best, x) => (Math.abs(x - state.rosieX) < Math.abs(best - state.rosieX) ? x : best), CHESTS[0]!)
          : loose!.x;
        const gap = goal - state.rosieX;
        if (Math.abs(gap) > 10) {
          const dir = Math.sign(gap) || 1;
          state.rosieFacing = dir;
          state.rosieX += dir * 36 * dt;
          state.rosieT += dt;
          if (state.rosieT > 0.16) {
            state.rosieT = 0;
            state.rosieFrame += 1;
          }
        } else if (carriedChunk) {
          state.chunks = state.chunks.filter((chunk) => chunk.id !== carriedChunk.id);
          burst(goal, GROUND - 24);
          caveAudio.cue("hop");
        } else if (loose) {
          loose.carried = true;
        }
      } else if (live || questingNow) {
        state.rosieGoal = spot;
        const gap = state.rosieGoal - state.rosieX;
        if (Math.abs(gap) > 4) {
          const dir = Math.sign(gap) || 1;
          state.rosieFacing = dir;
          state.rosieX += dir * (live ? 42 : 28) * dt;
          state.rosieT += dt;
          if (state.rosieT > 0.16) {
            state.rosieT = 0;
            state.rosieFrame += 1;
          }
        } else {
          if (!state.rosieCheered) {
            state.rosieCheered = true;
            if (live) caveAudio.cue("hop");
          }
          state.rosieFacing = state.x > state.rosieX ? 1 : -1;
          state.rosieT += dt;
          if (state.rosieT > 0.14) {
            state.rosieT = 0;
            state.rosieFrame += 1;
          }
        }
      } else {
        state.rosieCheered = false;
        if (Date.now() > state.rosieMoodUntil) {
          if (state.rosieMood === "wander" && Math.random() < 0.45) {
            state.rosieMood = "sleep";
            state.rosieMoodUntil = Date.now() + 5000 + Math.random() * 4000;
            caveAudio.cue("sleep");
          } else {
            state.rosieMood = "wander";
            let next = 40 + Math.random() * (W - 80);
            for (let attempt = 0; attempt < 6 && Math.abs(next - state.x) < 90; attempt++) {
              next = 40 + Math.random() * (W - 80);
            }
            state.rosieGoal = next;
            state.rosieMoodUntil = Date.now() + 7000 + Math.random() * 4000;
          }
        }
        if (state.rosieMood === "sleep") {
          state.rosieFrame = 0;
        } else {
          const gap = state.rosieGoal - state.rosieX;
          if (Math.abs(gap) > 4) {
            const dir = Math.sign(gap) || 1;
            state.rosieFacing = dir;
            state.rosieX += dir * 22 * dt;
            state.rosieT += dt;
            if (state.rosieT > 0.2) {
              state.rosieT = 0;
              state.rosieFrame += 1;
            }
          }
        }
        if (!state.tipNext) state.tipNext = Date.now() + 1800;
        if (Date.now() > state.tipNext) {
          state.tip = nextTip();
          state.tipUntil = Date.now() + 7000;
          state.tipNext = state.tipUntil + 4000;
          caveAudio.cue("tip");
        }
      }
      for (const floater of state.floaters) {
        floater.life -= dt * 0.55;
        floater.vy += 70 * dt;
        floater.x += floater.vx * dt;
        floater.y += floater.vy * dt;
      }
      state.floaters = state.floaters.filter((floater) => floater.life > 0);

      for (const mote of state.motes) {
        mote.life -= dt;
        mote.vy += 90 * dt;
        mote.x += mote.vx * dt;
        mote.y += mote.vy * dt;
      }
      state.motes = state.motes.filter((mote) => mote.life > 0);
      if (!reduced) {
        for (const drift of state.drifts) {
          drift.y -= drift.speed * dt;
          drift.x += Math.sin(drift.phase + drift.y * 0.05) * 6 * dt;
          if (drift.y < 28) {
            drift.y = 176;
            drift.x = (drift.x + 80) % W;
          }
        }
      }
    };

    const tickQuiet = (dt: number) => {
      if (useDojo.getState().ceremony) {
        state.questT = -1;
        state.quietSince = 0;
        state.questSting = false;
        return;
      }
      const live = liveScene();
      if (live) {
        state.questT = -1;
        state.quietSince = 0;
        state.questSting = false;
        return;
      }
      if (state.plantSprites.length === 0) return;
      if (state.questT >= 0) {
        state.questT += dt;
        if (state.questT > 1.05) {
          state.poseT += dt;
          if (state.poseT > 0.32) {
            state.poseT = 0;
            state.poseFrame += 1;
          }
        }
        if (!state.questSting && state.questT >= 2.15) {
          state.questSting = true;
          caveAudio.cue("quest");
        }
        if (state.questT >= QUEST_LEN) {
          if (state.mode === "mine") {
            state.frame = Math.max(0, state.mine.length - 1);
            state.frameT = 0;
          }
          state.questT = -1;
          state.quietSince = Date.now();
          state.quietFor = rollQuiet();
          state.questSting = false;
          state.tipNext = Date.now() + 5000;
        }
        return;
      }
      if (!state.quietSince) {
        state.quietSince = Date.now();
        state.quietFor = rollQuiet();
      }
      if (Date.now() - state.quietSince >= state.quietFor) {
        state.questLine = questCall();
        state.questT = 0;
        state.poseFrame = 0;
        state.poseT = 0;
        state.questSting = false;
      }
    };

    let last = performance.now();
    const loop = (now: number) => {
      if (!alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (useDojo.getState().ceremony) {
        state.questT = -1;
        state.quietSince = 0;
        state.questSting = false;
        state.sceneId = "";
        raf = requestAnimationFrame(loop);
        return;
      }
      tickQuiet(dt);
      if (!reduced) step(dt);
      draw(now / 1000);
      raf = requestAnimationFrame(loop);
    };

    void (async () => {
      try {
        const [cave, walk, mine, sparks, ruby, emerald, coin, chest, greet, rosie, hop, girlWalk, girlMine, girlGreet, reward, boyPlant, girlPlantFrames] =
          await Promise.all([
          loadImage("/art/cave.jpg"),
          loadFrames("/art/sprites/walk/walk-", ["1", "2", "3", "4"]),
          Promise.all([1, 2, 3, 4].map((frame) => loadImage(`/art/sprites/mine/attack-${frame}.png?v=2`))),
          loadFrames("/art/sprites/sparks/impact-", ["1", "2", "3", "4"]),
          loadImage("/art/sprites/props/prop-2.png"),
          loadImage("/art/sprites/props/prop-3.png"),
          loadImage("/art/sprites/props/prop-1.png"),
          loadImage("/art/sprites/props/prop-4.png"),
          loadFrames("/art/sprites/greet/idle-", ["1", "2", "3", "4"]),
          loadFrames("/art/sprites/rosie/walk-", ["1", "2", "3", "4"]),
          loadFrames("/art/sprites/rosie-hop/jump-", ["1", "2", "3", "4"]),
          loadFrames("/art/sprites/girl-walk/walk-", ["1", "2", "3", "4"]),
          loadFrames("/art/sprites/girl-mine/attack-", ["1", "2", "3", "4"]),
          loadFrames("/art/sprites/girl-greet/idle-", ["1", "2", "3", "4"]),
          loadFrames("/art/sprites/reward/burst-", ["1", "2", "3", "4"]),
          Promise.all([1, 2, 3, 4].map((frame) => loadImage(`/art/sprites/plant/plant-${frame}.png?v=2`))),
          Promise.all([1, 2, 3, 4].map((frame) => loadImage(`/art/sprites/girl-plant/plant-${frame}.png?v=2`))),
        ]);
        if (!alive) return;
        state.cave = cave;
        state.walk = walk;
        state.mine = mine;
        state.walkSprites = walk.map(measureSprite);
        state.mineSprites = mine.map(measureSprite);
        state.greetSprites = greet.map(measureSprite);
        state.girlWalk = girlWalk.map(measureSprite);
        state.girlMine = girlMine.map(measureSprite);
        state.girlGreet = girlGreet.map(measureSprite);
        state.plantSprites = boyPlant.map(measureSprite);
        state.girlPlant = girlPlantFrames.map(measureSprite);
        state.reward = reward.map(measureSprite);
        state.rosieSprites = rosie.map(measureSprite);
        state.hopSprites = hop.map(measureSprite);
        state.sparks = sparks;
        state.ruby = ruby;
        state.emerald = emerald;
        state.coin = coin;
        state.chest = chest;
      } catch {
        /* cave fill already covers a failed asset */
      }
      raf = requestAnimationFrame(loop);
    })();

    return () => {
      alive = false;
      caveAudio.armMusic(false);
      cancelAnimationFrame(raf);
    };
  }, [PLANT_REV]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full bg-bg-deep object-contain"
      style={{ imageRendering: "pixelated" }}
      aria-label="A ninja mining crystals in a lantern-lit cave"
    />
  );
}
