#!/usr/bin/env node
// Re-runs every fact query and confirms the stored result is exactly what the query returns today.
//   node scripts/verify-facts.mjs
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dataDir = process.env.H1B_DATA_DIR ?? path.join(homedir(), "github", "h1b");
const config = JSON.parse(readFileSync(path.join(root, "facts", "config.json"), "utf8"));
let bad = 0;
for (const c of config) {
  const sql = readFileSync(path.join(root, "queries", "facts", `${c.id}.sql`), "utf8").replaceAll("{{DATA}}", dataDir);
  const r = spawnSync("duckdb", ["-json", "-c", "SET threads=4", "-c", "SET memory_limit='4GB'", "-c", sql], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) {
    console.log(`FAIL ${c.id}: ${r.stderr.trim().split("\n")[0]}`);
    bad++;
    continue;
  }
  const fresh = JSON.stringify(JSON.parse(r.stdout));
  const stored = JSON.stringify(JSON.parse(readFileSync(path.join(root, "src", "data", "facts", `${c.id}.json`), "utf8")));
  if (fresh === stored) console.log(`ok   ${c.id}`);
  else {
    console.log(`DIFF ${c.id}\n  stored ${stored.slice(0, 200)}\n  fresh  ${fresh.slice(0, 200)}`);
    bad++;
  }
}
process.exit(bad ? 1 : 0);
