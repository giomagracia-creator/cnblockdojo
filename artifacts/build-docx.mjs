import { chromium } from "playwright";
import { Document, HeadingLevel, ImageRun, Packer, Paragraph, TextRun } from "docx";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const executablePath = "/opt/pw-browsers/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell";

const jobs = [
  {
    html: "/workspace/artifacts/blockdojo-guide.html",
    out: "/workspace/artifacts/BLOCKDOJO-staff-guide.docx",
    title: "BLOCKDOJO staff guide",
  },
  {
    html: "/workspace/artifacts/blockdojo-families.html",
    out: "/workspace/artifacts/BLOCKDOJO-families.docx",
    title: "BLOCKDOJO for ninjas and families",
  },
];

function fit(width, height) {
  const maxW = 540;
  const maxH = 300;
  const safeW = width || 1200;
  const safeH = height || 675;
  const scale = Math.min(maxW / safeW, maxH / safeH);
  return { width: Math.max(80, Math.round(safeW * scale)), height: Math.max(60, Math.round(safeH * scale)) };
}

function paragraphFor(block, baseDir) {
  if (block.kind === "img") {
    const file = resolve(baseDir, block.src);
    const data = readFileSync(file);
    const ext = file.toLowerCase().endsWith(".png") ? "png" : "jpg";
    const size = fit(block.w, block.h);
    return new Paragraph({
      spacing: { before: 120, after: 120 },
      children: [new ImageRun({ type: ext, data, transformation: size, altText: { title: block.alt || "Image", description: block.alt || "Image", name: block.alt || "Image" } })],
    });
  }
  const text = block.text;
  if (block.kind === "h1") {
    return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 280, after: 80 }, children: [new TextRun({ text, bold: true, color: "1A120C", size: 40 })] });
  }
  if (block.kind === "h2") {
    return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 }, children: [new TextRun({ text, bold: true, color: "1A120C", size: 32 })] });
  }
  if (block.kind === "h3") {
    return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 160, after: 40 }, children: [new TextRun({ text, bold: true, color: "6B3A12", size: 24 })] });
  }
  if (block.kind === "li") {
    return new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text, size: 22, color: "1A120C" })] });
  }
  const mark = block.cls.includes("mark") || block.cls.includes("kicker");
  return new Paragraph({
    spacing: { after: mark ? 40 : 80 },
    children: [new TextRun({ text, bold: mark, color: mark ? "8A5A12" : "1A120C", size: mark ? 18 : 22 })],
  });
}

const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });
for (const job of jobs) {
  const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
  await page.goto(`file://${job.html}`, { waitUntil: "networkidle" });
  const pages = await page.evaluate(() => {
    const interesting = new Set(["H1", "H2", "H3", "P", "LI", "IMG"]);
    const blocks = [];
    const walk = (el) => {
      if (el.classList?.contains("foot")) return;
      if (el.tagName === "IMG") {
        blocks.push({ kind: "img", src: el.getAttribute("src"), alt: el.alt || "", w: el.naturalWidth, h: el.naturalHeight });
        return;
      }
      if (interesting.has(el.tagName)) {
        const nested = [...el.children].some((child) => interesting.has(child.tagName) || child.tagName === "UL" || child.tagName === "OL" || child.tagName === "DIV");
        if (!nested) {
          const text = el.innerText.replace(/\s+/g, " ").trim();
          if (text) blocks.push({ kind: el.tagName.toLowerCase(), text, cls: el.className || "" });
        }
      }
      for (const child of el.children) walk(child);
    };
    document.querySelectorAll(".page").forEach((pageEl, index) => {
      if (index) blocks.push({ kind: "break" });
      walk(pageEl);
    });
    return blocks;
  });
  const baseDir = dirname(job.html);
  const children = [
    new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: job.title, bold: true, color: "1A120C", size: 48 })],
    }),
  ];
  for (const block of pages) {
    if (block.kind === "break") {
      children.push(new Paragraph({ children: [], pageBreakBefore: true }));
      continue;
    }
    children.push(paragraphFor(block, baseDir));
  }
  const doc = new Document({
    title: job.title,
    styles: { default: { document: { styles: [{ id: "Normal", run: { font: "Calibri", size: 22 } }] } } },
    sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } }, children }],
  });
  const buffer = await Packer.toBuffer(doc);
  const { writeFileSync } = await import("node:fs");
  writeFileSync(job.out, buffer);
  console.log(job.out, buffer.length, "blocks", pages.length);
  await page.close();
}
await browser.close();
