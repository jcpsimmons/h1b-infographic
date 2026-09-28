"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import data from "@/data/employer-vs-worksite-state.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { compact, int, pct } from "@/lib/format";
import { AXIS_TICK, CHART_MARGIN, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = {
  pair: string;
  employer_st: string;
  worksite_st: string;
  applications: number;
  total_apps: number;
  differing_apps: number;
};

export const meta = {
  id: "employer-vs-worksite-state",
  section: "geography",
  order: 40,
  title: "Largest employer-state to worksite-state pairs where the two differ",
  width: "full",
  sources: ["LCA-PERM/filing_current"],
  caveat:
    "Counts certified H-1B applications (status CERTIFIED) with decision years 2023 to 2025. Employer address state and worksite state are both normalized to the 50 states and DC; applications where either is missing or not a state are left out. Each bar reads employer address state, then worksite state.",
} satisfies ChartMeta;

export function takeaway(rows: Datum[]): string {
  const r = rows[0];
  const top = rows.reduce((a, b) => (b.applications > a.applications ? b : a));
  return `${pct(r.differing_apps / r.total_apps)} of certified applications (${int(r.differing_apps)} of ${int(r.total_apps)}) list a worksite state different from the employer's address state; the largest single pair is ${top.employer_st} to ${top.worksite_st} with ${int(top.applications)}.`;
}

export default function EmployerVsWorksiteState() {
  const rows = data as Datum[];
  return (
    <Exhibit meta={meta} takeaway={takeaway(rows)}>
      <Plot height={rows.length * 28 + 50}>
        <BarChart data={rows} layout="vertical" margin={CHART_MARGIN}>
          <GreenbarGrid />
          <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={compact} />
          <YAxis type="category" dataKey="pair" tick={AXIS_TICK} tickLine={false} axisLine={false} width={80} interval={0} />
          <ChartTooltip />
          <Bar dataKey="applications" name="Applications" fill={SERIES[0]} isAnimationActive={false} />
        </BarChart>
      </Plot>
    </Exhibit>
  );
}
