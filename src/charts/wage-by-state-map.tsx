"use client";

import data from "@/data/wage-by-state-map.json";
import { Exhibit } from "@/components/Exhibit";
import { USMap } from "@/components/USMap";
import { usd } from "@/lib/format";
import type { ChartMeta } from "@/lib/types";

type Datum = { state: string; applications: number; median_wage: number | null };

export const meta = {
  id: "wage-by-state-map",
  section: "money",
  order: 50,
  title: "Median offered annual wage by worksite state, 2023 to 2025",
  width: "full",
  sources: ["LCA-PERM/filing_current"],
  caveat:
    "Counts certified (status CERTIFIED) H-1B applications decided 2023 to 2025, using the low end of the offered wage annualized to a year (hourly x2,080). Annual values under 15,000 or over 1,000,000 are dropped; states with fewer than 300 applications are shown as no data.",
} satisfies ChartMeta;

export function takeaway(rows: Datum[]): string {
  const ok = rows.filter((r): r is Datum & { median_wage: number } => r.median_wage !== null);
  const hi = ok.reduce((a, b) => (b.median_wage > a.median_wage ? b : a));
  const lo = ok.reduce((a, b) => (b.median_wage < a.median_wage ? b : a));
  return `The median offered wage runs from ${usd(lo.median_wage)} in ${lo.state} to ${usd(hi.median_wage)} in ${hi.state}, a gap of ${(hi.median_wage / lo.median_wage).toFixed(1)} times, among the states and DC.`;
}

export default function WageByStateMap() {
  const rows = data as Datum[];
  const values: Record<string, number | null> = {};
  for (const r of rows) values[r.state] = r.median_wage;
  return (
    <Exhibit meta={meta} takeaway={takeaway(rows)}>
      <USMap values={values} format={usd} label="Median offered annual wage of certified H-1B applications by worksite state, 2023 to 2025" />
    </Exhibit>
  );
}
