#!/usr/bin/env node
// Runs queries/<id>.sql against the H1B parquet dataset with DuckDB and writes src/data/<id>.json.
//   node scripts/run-query.mjs certified-per-year
//   node scripts/run-query.mjs facts/top-employer-share
// The SQL may use {{DATA}} for the dataset root (default ~/github/h1b, override with H1B_DATA_DIR).
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import path from "node:path";

const id = process.argv[2];
if (!id) {
  console.error("usage: node scripts/run-query.mjs <id>   (reads queries/<id>.sql)");
  process.exit(2);
}
const root = path.resolve(import.meta.dirname, "..");
const dataDir = process.env.H1B_DATA_DIR ?? path.join(homedir(), "github", "h1b");
const sql = readFileSync(path.join(root, "queries", `${id}.sql`), "utf8").replaceAll("{{DATA}}", dataDir);

// Columns that could identify a person or contact. Aggregates must never carry them.
const FORBIDDEN = /(email|phone|poc_|attorney|street|addr|first_name|last_name|ssn|fein|contact)/i;

const run = spawnSync(
  "duckdb",
  ["-json", "-c", "SET threads=2", "-c", "SET memory_limit='2GB'", "-c", "SET temp_directory='/tmp/duckdb-h1b-infographic'", "-c", sql],
  { encoding: "utf8", maxBuffer: 512 * 1024 * 1024 },
);
if (run.status !== 0) {
  console.error(run.stderr || run.stdout);
  process.exit(1);
}

let rows;
try {
  rows = JSON.parse(run.stdout.trim() || "[]");
} catch {
  console.error("DuckDB output was not JSON. Query must end with a single SELECT.\n", run.stdout.slice(0, 500));
  process.exit(1);
}
if (!Array.isArray(rows) || rows.length === 0) {
  console.error("Query returned no rows.");
  process.exit(1);
}
if (rows.length > 5000) {
  console.error(`Query returned ${rows.length} rows; aggregate to at most 5000.`);
  process.exit(1);
}
const bad = Object.keys(rows[0]).filter((k) => FORBIDDEN.test(k));
if (bad.length) {
  console.error(`Refusing to write columns that may identify people or contacts: ${bad.join(", ")}`);
  process.exit(1);
}

const out = path.join(root, "src", "data", `${id}.json`);
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(rows));
const kb = statSync(out).size / 1024;
if (kb > 400) {
  console.error(`Output is ${kb.toFixed(0)} KB (limit 400 KB). Aggregate further.`);
  process.exit(1);
}
console.log(`wrote src/data/${id}.json  rows=${rows.length}  ${kb.toFixed(1)} KB  columns=${Object.keys(rows[0]).join(",")}`);
