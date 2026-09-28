#!/usr/bin/env node
// Builds src/data/facts.json from facts/config.json and the query results in src/data/facts/<id>.json.
// Every number on the page is generated here from a query result; nothing is typed by hand.
//
// Templates use {formatter:column}, e.g. "{int:cases} cases, {pct1:share} certified".
// Formatters: int, compact, pct0, pct1 (column holds a fraction 0-1), pp1 (column already in percent), usd, usdCompact, num1, num2, raw.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const config = JSON.parse(readFileSync(path.join(root, "facts", "config.json"), "utf8"));

const nf = (o) => new Intl.NumberFormat("en-US", o);
const F = {
  int: (n) => nf({ maximumFractionDigits: 0 }).format(n),
  compact: (n) => nf({ notation: "compact", maximumFractionDigits: 1 }).format(n),
  pct0: (n) => `${(n * 100).toFixed(0)}%`,
  pct1: (n) => `${(n * 100).toFixed(1)}%`,
  pp1: (n) => `${Number(n).toFixed(1)}%`,
  usd: (n) => nf({ style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n),
  usdCompact: (n) => nf({ style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(n),
  num1: (n) => Number(n).toFixed(1),
  num2: (n) => Number(n).toFixed(2),
  raw: (v) => String(v),
};

const fill = (tpl, row, id) =>
  tpl.replace(/\{(\w+):(\w+)\}/g, (_, fmt, col) => {
    if (!(fmt in F)) throw new Error(`${id}: unknown formatter "${fmt}"`);
    if (!(col in row) || row[col] === null) throw new Error(`${id}: column "${col}" missing from query result (has: ${Object.keys(row).join(", ")})`);
    const v = typeof row[col] === "string" && /^-?\d+(\.\d+)?$/.test(row[col]) ? Number(row[col]) : row[col];
    return F[fmt](v);
  });

const out = config
  .slice()
  .sort((a, b) => a.rank - b.rank)
  .map((c) => {
    const rows = JSON.parse(readFileSync(path.join(root, "src", "data", "facts", `${c.id}.json`), "utf8"));
    const row = rows[0];
    return {
      rank: c.rank,
      value: fill(c.value, row, c.id),
      headline: fill(c.headline, row, c.id),
      detail: c.detail ? fill(c.detail, row, c.id) : "",
      how: fill(c.how, row, c.id),
      query: `queries/facts/${c.id}.sql`,
    };
  });

writeFileSync(path.join(root, "src", "data", "facts.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`facts: wrote ${out.length} facts`);
for (const f of out) console.log(`  ${f.rank}. ${f.value}  ${f.headline}`);
