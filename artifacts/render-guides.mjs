import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const executablePath = "/opt/pw-browsers/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell";
const jobs = [
  {
    html: "/workspace/artifacts/blockdojo-guide.html",
    pdf: "/workspace/artifacts/BLOCKDOJO-staff-guide.pdf",
    shot: "/workspace/screenshots/staff-guide",
  },
  {
    html: "/workspace/artifacts/blockdojo-families.html",
    pdf: "/workspace/artifacts/BLOCKDOJO-families.pdf",
    shot: "/workspace/screenshots/family-guide",
  },
];

const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });
for (const job of jobs) {
  await mkdir(job.shot, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
  await page.goto(`file://${job.html}`, { waitUntil: "networkidle" });
  await page.pdf({
    path: job.pdf,
    printBackground: true,
    preferCSSPageSize: true,
  });
  const pages = await page.$$(".page");
  for (let i = 0; i < pages.length; i++) {
    const box = await pages[i].boundingBox();
    await pages[i].screenshot({ path: `${job.shot}/page-${String(i + 1).padStart(2, "0")}.png` });
    console.log(job.shot, i + 1, box ? `${Math.round(box.width)}x${Math.round(box.height)}` : "no-box");
  }
  await page.close();
}
await browser.close();
console.log("done");
