// Checks one chart module: metadata, data file, takeaway text, and a full server render.
//   npx tsx scripts/check-chart.mts certified-per-year
import { JSDOM } from "jsdom";
import { existsSync, readFileSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";


// Browser-like environment: Recharts draws its SVG on the client only.
const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", { pretendToBeVisual: true });
const g = globalThis as Record<string, unknown>;
g.window = dom.window;
g.document = dom.window.document;
g.HTMLElement = dom.window.HTMLElement;
g.SVGElement = dom.window.SVGElement;
g.Node = dom.window.Node;
g.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 0);
g.cancelAnimationFrame = (n: number) => clearTimeout(n);
g.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
g.IS_REACT_ACT_ENVIRONMENT = true;
dom.window.Element.prototype.getBoundingClientRect = () => ({ width: 880, height: 340, top: 0, left: 0, right: 880, bottom: 340, x: 0, y: 0, toJSON() {} }) as DOMRect;
const { createElement } = await import("react");
const { createRoot } = await import("react-dom/client");
const { act } = await import("react");

const id = process.argv[2];
if (!id) {
  console.error("usage: npx tsx scripts/check-chart.mts <chart-id>");
  process.exit(2);
}
const root = path.resolve(import.meta.dirname, "..");
const problems: string[] = [];
const fail = (m: string) => problems.push(m);

const file = path.join(root, "src", "charts", `${id}.tsx`);
if (!existsSync(file)) {
  console.error(`missing src/charts/${id}.tsx`);
  process.exit(1);
}
if (!existsSync(path.join(root, "queries", `${id}.sql`))) fail(`missing queries/${id}.sql`);
const dataFile = path.join(root, "src", "data", `${id}.json`);
if (!existsSync(dataFile)) fail(`missing src/data/${id}.json (run: node scripts/run-query.mjs ${id})`);

// 1. Typecheck this chart and everything it imports, in isolation from other agents' files.
const tmpDir = path.join(root, ".tmp");
mkdirSync(tmpDir, { recursive: true });
const tsconfig = path.join(tmpDir, `tsconfig.${id}.json`);
writeFileSync(
  tsconfig,
  JSON.stringify({
    extends: "../tsconfig.json",
    compilerOptions: { noEmit: true, incremental: false },
    include: [`../src/charts/${id}.tsx`, "../next-env.d.ts"],
  }),
);
const tsc = spawnSync("npx", ["tsc", "-p", tsconfig], { cwd: root, encoding: "utf8" });
rmSync(tsconfig, { force: true });
if (tsc.status !== 0) fail(`typecheck failed:\n${(tsc.stdout + tsc.stderr).trim().split("\n").slice(0, 25).join("\n")}`);

// 2. Load the module and validate its contract.
const SECTIONS = ["volume", "money", "geography", "employers", "occupations", "practice", "linked"];
try {
  const mod = await import(file);
  const meta = mod.meta;
  if (!meta) fail("no exported `meta`");
  else {
    if (meta.id !== id) fail(`meta.id "${meta.id}" must equal "${id}"`);
    if (!SECTIONS.includes(meta.section)) fail(`meta.section must be one of ${SECTIONS.join(", ")}`);
    if (typeof meta.order !== "number") fail("meta.order must be a number");
    if (!meta.title || meta.title.length > 80) fail("meta.title required, max 80 chars");
    if (/\bFY\d{2,4}\b/.test(meta.title ?? "")) fail("decision_year is a calendar year; do not label it FY");
    if (!["half", "full"].includes(meta.width)) fail('meta.width must be "half" or "full"');
    if (!Array.isArray(meta.sources) || meta.sources.length === 0) fail("meta.sources must list dataset folders");
    if (!meta.caveat) fail("meta.caveat is required: define what is counted and note partial or missing years");
  }
  if (typeof mod.takeaway !== "function") fail("no exported `takeaway(data)` function");
  else if (existsSync(dataFile)) {
    const data = JSON.parse(readFileSync(dataFile, "utf8"));
    const t = mod.takeaway(data);
    if (typeof t !== "string" || t.length < 20 || t.length > 240) fail(`takeaway must be a 20-240 char string, got: ${String(t)}`);
    if (/NaN|undefined|null|\[object|Infinity/.test(String(t))) fail(`takeaway contains a bad value: ${t}`);
    console.log(`takeaway: ${t}`);
  }
  if (typeof mod.default !== "function") fail("no default export component");
  else {
    const container = document.getElementById("root")!;
    const root = createRoot(container);
    const errors: string[] = [];
    const origError = console.error;
    console.error = (...a: unknown[]) => { errors.push(a.map(String).join(" ").slice(0, 300)); };
    await act(async () => { root.render(createElement(mod.default)); });
    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });
    console.error = origError;
    const html = container.innerHTML;
    const svgs = [...container.querySelectorAll("svg")];
    const count = (s: Element) => s.querySelectorAll("path, rect, circle, line, text").length;
    const bigSvg = svgs.sort((x, y) => count(y) - count(x))[0];
    if (!bigSvg) fail("no chart <svg> after render: wrap a Recharts chart in <Plot>, or use <USMap> or a custom <svg>");
    else {
      const marks = count(bigSvg);
      if (marks < 8) fail(`chart svg has only ${marks} drawn marks; is the data empty or the key wrong?`);
      if (/NaN/.test(bigSvg.outerHTML)) fail("chart svg contains NaN (bad data key, scale or domain)");
    }
    if (errors.length) fail(`React/Recharts logged errors:\n  ${errors.slice(0, 3).join("\n  ")}`);
    if (meta && !html.includes("exhibit-title")) fail("chart must render inside <Exhibit>");
    console.log(`rendered ${(html.length / 1024).toFixed(0)} KB, svg marks ok=${!!bigSvg}`);
  }
} catch (e) {
  fail(`module failed to load or render: ${(e as Error).stack?.split("\n").slice(0, 6).join("\n")}`);
}

if (problems.length) {
  console.error(`\n${id}: ${problems.length} problem(s)`);
  for (const p of problems) console.error(` - ${p}`);
  process.exit(1);
}
console.log(`${id}: OK`);
