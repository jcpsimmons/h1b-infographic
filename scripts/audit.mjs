#!/usr/bin/env node
// Pre-publish audit: personal data, accusatory wording, oversized data, secrets.
//   node scripts/audit.mjs
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const problems = [];
const walk = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git", "out", ".tmp"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};
const files = walk(root);

// 1. Personal data patterns anywhere in published data and text.
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
const PHONE = /\b\(?\d{3}\)?[-. ]\d{3}[-. ]\d{4}\b/;
const SSN = /\b\d{3}-\d{2}-\d{4}\b/;
const FORBIDDEN_COL = /"(\w*(email|phone|poc_|attorney|street|addr|first_name|last_name|ssn|fein|contact)\w*)"\s*:/i;

// 2. Words that would read as accusation. Data-neutral wording only.
const BANNED = /\b(fraud\w*|scam\w*|illegal\w*|cheat\w*|exploit\w*|abus\w*|gaming the|criminal\w*|crooked|shady|rigged|bodyshop|body shop)\b/i;

for (const f of files) {
  const rel = path.relative(root, f);
  const isData = rel.startsWith(path.join("src", "data"));
  const isText = /\.(tsx?|json|md|sql|mjs|mts|css)$/.test(f);
  if (!isText || rel === "package-lock.json" || rel === path.join("scripts", "audit.mjs")) continue;
  const text = readFileSync(f, "utf8");
  if (isData) {
    if (EMAIL.test(text)) problems.push(`${rel}: email address`);
    if (PHONE.test(text)) problems.push(`${rel}: phone number`);
    if (SSN.test(text)) problems.push(`${rel}: SSN-like number`);
    if (FORBIDDEN_COL.test(text)) problems.push(`${rel}: forbidden column name ${text.match(FORBIDDEN_COL)[1]}`);
    if (statSync(f).size > 400 * 1024) problems.push(`${rel}: over 400 KB`);
  }
  const published = rel.startsWith("src") && !rel.endsWith(".css");
  if (published) {
    const m = text.match(BANNED);
    if (m) problems.push(`${rel}: banned wording "${m[0]}"`);
  }
  if (/(gho_|ghp_|sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16})/.test(text)) problems.push(`${rel}: looks like a secret`);
  if (/\.onion\b/.test(text) && !rel.startsWith("scripts")) problems.push(`${rel}: onion address (keep the dataset's address out of the public site unless intended)`);
}

if (problems.length) {
  console.error(`audit: ${problems.length} problem(s)`);
  for (const p of problems) console.error(" - " + p);
  process.exit(1);
}
console.log(`audit: clean (${files.length} files scanned)`);
