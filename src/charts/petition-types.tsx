"use client";

import { Bar, BarChart, Legend, XAxis, YAxis } from "recharts";
import data from "@/data/petition-types.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { compact, pct } from "@/lib/format";
import { AXIS_TICK, CHART_MARGIN, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = {
  year: number;
  applications: number;
  populated_apps: number;
  new_employment: number;
  continued: number;
  change_employer: number;
  amended: number;
  multi_type: number;
  none_declared: number;
};

export const meta = {
  id: "petition-types",
  section: "practice",
  order: 20,
  title: "Certified H-1B applications by employment type declared",
  width: "half",
  sources: ["LCA-PERM/filing_current"],
  caveat:
    "Counts certified applications (status CERTIFIED). An application counts under each type it declares (a count or flag above zero), so the bars can add up to more than the applications; applications declaring no type are not shown. The fields are blank for 2010 to 2015 and only 13.5% filled in 2016, so the chart starts in 2017; partial 2026 is left out.",
} satisfies ChartMeta;

export function takeaway(rows: Datum[]): string {
  const first = rows[0];
  const last = rows[rows.length - 1];
  const peak = rows.reduce((a, b) => (b.change_employer / b.applications > a.change_employer / a.applications ? b : a));
  const share = (r: Datum) => r.new_employment / r.applications;
  return `New employment was declared on ${pct(share(first))} of certified applications in ${first.year} and ${pct(share(last))} in ${last.year}. Change of employer peaked at ${pct(peak.change_employer / peak.applications)} in ${peak.year}.`;
}

export default function PetitionTypes() {
  const rows = data as Datum[];
  return (
    <Exhibit meta={meta} takeaway={takeaway(rows)}>
      <Plot height={360}>
        <BarChart data={rows} margin={CHART_MARGIN}>
          <GreenbarGrid />
          <XAxis dataKey="year" tick={AXIS_TICK} tickLine={false} axisLine={false} interval={0} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={compact} width={48} />
          <ChartTooltip />
          <Legend />
          <Bar dataKey="new_employment" name="New employment" stackId="t" fill={SERIES[0]} isAnimationActive={false} />
          <Bar dataKey="continued" name="Continued employment" stackId="t" fill={SERIES[3]} isAnimationActive={false} />
          <Bar dataKey="change_employer" name="Change of employer" stackId="t" fill={SERIES[1]} isAnimationActive={false} />
          <Bar dataKey="amended" name="Amended petition" stackId="t" fill={SERIES[2]} isAnimationActive={false} />
        </BarChart>
      </Plot>
    </Exhibit>
  );
}
