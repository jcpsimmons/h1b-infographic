"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import data from "@/data/wage-by-occupation.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { int, usd } from "@/lib/format";
import { AXIS_TICK, CHART_MARGIN, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = {
  soc_code: string;
  occupation: string;
  applications: number;
  with_wage: number;
  median_wage: number;
};

export const meta = {
  id: "wage-by-occupation",
  section: "money",
  order: 40,
  title: "Median offered wage in the 15 most common H-1B occupations",
  width: "full",
  sources: ["LCA-PERM/filing_current"],
  caveat:
    "Certified H-1B applications (status CERTIFIED) decided 2023 to 2025, grouped on SOC code (codes written with and without the .00 suffix are combined) and labeled with the most common SOC title; the 15 largest occupations, each with at least 1,000 applications. Offered wage is wage_from, the low end of the stated range, annualized (hourly x2,080, weekly x52, bi-weekly x26, monthly x12); values under $15,000 or over $1,000,000 a year are dropped from the medians.",
} satisfies ChartMeta;

const label = (s: string) => (s.length > 28 ? `${s.slice(0, 27)}…` : s);

export function takeaway(rows: Datum[]): string {
  const hi = rows.reduce((a, b) => (b.median_wage > a.median_wage ? b : a));
  const lo = rows.reduce((a, b) => (b.median_wage < a.median_wage ? b : a));
  const big = rows.reduce((a, b) => (b.applications > a.applications ? b : a));
  return `Among these occupations the median offered wage runs from ${usd(lo.median_wage)} (${lo.occupation.toLowerCase()}) to ${usd(hi.median_wage)} (${hi.occupation.toLowerCase()}). The largest, ${big.occupation.toLowerCase()}, has ${int(big.applications)} applications and a median of ${usd(big.median_wage)}.`;
}

export default function WageByOccupation() {
  const rows = (data as Datum[]).map((r) => ({ ...r, name: label(r.occupation) }));
  return (
    <Exhibit meta={meta} takeaway={takeaway(data as Datum[])}>
      <Plot height={15 * 28 + 40}>
        <BarChart data={rows} layout="vertical" margin={{ ...CHART_MARGIN, right: 64 }}>
          <GreenbarGrid />
          <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(n: number) => `$${n / 1000}k`} />
          <YAxis type="category" dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} width={190} interval={0} />
          <ChartTooltip valueFormat={usd} />
          <Bar dataKey="median_wage" name="Median offered wage" fill={SERIES[0]} isAnimationActive={false}>
            <LabelList dataKey="median_wage" position="right" formatter={(v: unknown) => usd(Number(v))} style={{ fontSize: 12 }} />
          </Bar>
        </BarChart>
      </Plot>
    </Exhibit>
  );
}
