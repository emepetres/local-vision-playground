#!/usr/bin/env node
// Rasterize SVG slide images to PNG with a headless Chromium browser (Edge or
// Chrome), which renders SVG filters and system fonts exactly as a browser does.
// Node stdlib only; no npm install.
//
// CLI: node rasterize.mjs <file.svg>... [--transparent]
//      Writes <file>.png beside each SVG, at the pixel size of the root <svg>
//      width/height attributes (1920x1080 when absent). --transparent keeps
//      whatever the SVG leaves unpainted transparent, for images that sit on a
//      template's own background. Exit 0 when every PNG was written.
//
// Each run uses a throwaway browser profile: without one, a browser already open
// on the machine swallows the headless call and no PNG is written.
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const CANDIDATES = [
  process.env.KEYNOTE_BROWSER,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/microsoft-edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const args = process.argv.slice(2);
const transparent = args.includes("--transparent");
const files = args.filter((a) => a !== "--transparent");
if (files.length === 0) {
  console.error("usage: node rasterize.mjs <file.svg>... [--transparent]");
  process.exit(2);
}

// Pixel size from the root element's width/height attributes.
function svgSize(path) {
  const root = readFileSync(path, "utf8").match(/<svg\b[^>]*>/)?.[0] ?? "";
  const w = Number(root.match(/\swidth="(\d+(?:\.\d+)?)(?:px)?"/)?.[1]);
  const h = Number(root.match(/\sheight="(\d+(?:\.\d+)?)(?:px)?"/)?.[1]);
  return w > 0 && h > 0 ? [Math.round(w), Math.round(h)] : [1920, 1080];
}

const browser = CANDIDATES.find((p) => existsSync(p));
if (!browser) {
  console.error("no Edge or Chrome found; set KEYNOTE_BROWSER to a Chromium executable");
  process.exit(2);
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function waitForFile(path, before, timeoutMs) {
  let lastSize = -1;
  for (let waited = 0; waited < timeoutMs; waited += 250) {
    if (existsSync(path)) {
      const { mtimeMs, size } = statSync(path);
      if (mtimeMs > before && size > 0 && size === lastSize) return true;
      lastSize = size;
    }
    sleep(250);
  }
  return false;
}

const profile = mkdtempSync(join(tmpdir(), "keynote-raster-"));
let failed = 0;
for (const file of files) {
  const svg = resolve(file);
  const png = svg.replace(/\.svg$/i, ".png");
  const before = existsSync(png) ? statSync(png).mtimeMs : 0;
  spawnSync(browser, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    ...(transparent ? ["--default-background-color=00000000"] : []),
    `--window-size=${svgSize(svg).join(",")}`,
    `--user-data-dir=${profile}`,
    `--screenshot=${png}`,
    pathToFileURL(svg).href,
  ], { stdio: "ignore", timeout: 60_000 });
  // On Windows the launcher can exit while a child process still renders:
  // wait until the PNG is written and its size stops changing.
  if (waitForFile(png, before, 30_000)) {
    console.log(`${png}`);
  } else {
    failed++;
    console.error(`FAILED ${svg}`);
  }
}
// The browser may still hold the profile for a moment; a leftover temp folder is harmless.
sleep(1000);
try {
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
} catch {}
process.exit(failed === 0 ? 0 : 1);
