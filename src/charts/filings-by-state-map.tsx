"use client";

import data from "@/data/filings-by-state-map.json";
import { Exhibit } from "@/components/Exhibit";
import { USMap } from "@/components/USMap";
import { int, pct } from "@/lib/format";
import type { ChartMeta } from "@/lib/types";

type Datum = { state: string; certified: number };

export const meta = {
  id: "filings-by-state-map",
  section: "geography",
  order: 10,
  title: "Certified H-1B applications by worksite state, 2023 to 2025",
  width: "half",
  sources: ["LCA-PERM/filing_current"],
  caveat:
    "Counts applications (LCAs) by the primary worksite state, decision years 2023 to 2025 combined; 'certified' means final status CERTIFIED. Applications with a territory or blank worksite state (2,531) are left out; DC is included.",
} satisfies ChartMeta;

export function takeaway(rows: Datum[]): string {
  const sorted = [...rows].sort((a, b) => b.certified - a.certified);
  const total = rows.reduce((s, r) => s + r.certified, 0);
  const top5 = sorted.slice(0, 5);
  const share = top5.reduce((s, r) => s + r.certified, 0) / total;
  return `${top5.map((r) => r.state).join(", ")} account for ${pct(share)} of the ${int(total)} certified applications; ${sorted[0].state} alone has ${int(sorted[0].certified)}.`;
}

export default function FilingsByStateMap() {
  const rows = data as Datum[];
  const values = Object.fromEntries(rows.map((r) => [r.state, r.certified]));
  return (
    <Exhibit meta={meta} takeaway={takeaway(rows)}>
      <USMap values={values} format={int} label="Certified H-1B applications by worksite state, 2023 to 2025" />
    </Exhibit>
  );
}
