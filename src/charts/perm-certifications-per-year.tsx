"use client";

import { Bar, BarChart, Legend, XAxis, YAxis } from "recharts";
import data from "@/data/perm-certifications-per-year.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { compact, int } from "@/lib/format";
import { AXIS_TICK, CHART_MARGIN, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = { year: number; certified: number; denied: number; withdrawn: number };

export const meta = {
  id: "perm-certifications-per-year",
  section: "volume",
  order: 30,
  title: "PERM case outcomes by year of decision",
  width: "half",
  sources: ["LCA-PERM/filing_current"],
  caveat:
    "Counts PERM cases (old form, new form and backlog files together) by final status. 'Certified' means CERTIFIED plus CERTIFIEDEXPIRED (a certification that lapsed unused); no certified-then-withdrawn cases appear in this window. October 2025 has only 21 decisions in the data, and 2026 (partial year) is left out.",
} satisfies ChartMeta;

export function takeaway(rows: Datum[]): string {
  const peak = rows.reduce((a, b) => (b.certified > a.certified ? b : a));
  const last = rows[rows.length - 1];
  const total = last.certified + last.denied + last.withdrawn;
  const denyShare = ((last.denied / total) * 100).toFixed(1);
  return `${int(peak.certified)} PERM cases were certified in ${peak.year}, the most in any year shown; denials were ${denyShare}% of ${last.year} decisions.`;
}

export default function PermCertificationsPerYear() {
  const rows = data as Datum[];
  return (
    <Exhibit meta={meta} takeaway={takeaway(rows)}>
      <Plot>
        <BarChart data={rows} margin={CHART_MARGIN}>
          <GreenbarGrid />
          <XAxis dataKey="year" tick={AXIS_TICK} tickLine={false} axisLine={false} interval={1} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={compact} width={48} />
          <ChartTooltip valueFormat={int} />
          <Legend />
          <Bar dataKey="certified" name="Certified" stackId="a" fill={SERIES[0]} isAnimationActive={false} />
          <Bar dataKey="withdrawn" name="Withdrawn" stackId="a" fill={SERIES[2]} isAnimationActive={false} />
          <Bar dataKey="denied" name="Denied" stackId="a" fill={SERIES[1]} isAnimationActive={false} />
        </BarChart>
      </Plot>
    </Exhibit>
  );
}
