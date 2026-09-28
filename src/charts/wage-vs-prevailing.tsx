"use client";

import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import data from "@/data/wage-vs-prevailing.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { compact, int, pct } from "@/lib/format";
import { AXIS_TICK, CHART_MARGIN, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = { bin_order: number; bin: string; applications: number };

export const meta = {
  id: "wage-vs-prevailing",
  section: "money",
  order: 20,
  title: "Offered wage as a multiple of the prevailing wage, 2023-2025",
  width: "half",
  sources: ["LCA-PERM/filing_current"],
  caveat:
    "Certified H-1B applications (status CERTIFIED) decided 2023-2025, the three most recent complete years. Offered wage is the low end of the stated range; both wages are annualized (year x1, month x12, bi-weekly x26, week x52, hour x2080) and applications with either annual figure under 15,000 or over 1,000,000 are dropped (about 0.1%).",
} satisfies ChartMeta;

/** One or two sentences computed from the data, so the text can never drift from the chart. */
export function takeaway(rows: Datum[]): string {
  const total = rows.reduce((s, r) => s + r.applications, 0);
  const near = rows.filter((r) => r.bin_order <= 2).reduce((s, r) => s + r.applications, 0);
  const below = rows.find((r) => r.bin_order === 0)?.applications ?? 0;
  return `${pct(near / total, 1)} of applications offered less than 10% above the prevailing wage. Only ${int(below)} of ${compact(total)} offered less than the prevailing wage (${pct(below / total, 3)}).`;
}

export default function WageVsPrevailing() {
  const rows = data as Datum[];
  return (
    <Exhibit meta={meta} takeaway={takeaway(rows)}>
      <Plot height={340}>
        <BarChart data={rows} margin={CHART_MARGIN}>
          <GreenbarGrid />
          <XAxis dataKey="bin" tick={AXIS_TICK} tickLine={false} axisLine={false} interval={0} angle={-40} textAnchor="end" height={64} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={compact} width={48} />
          <ChartTooltip valueFormat={(v: number) => int(v)} />
          <Bar dataKey="applications" name="Applications" isAnimationActive={false}>
            {rows.map((r) => (
              <Cell key={r.bin} fill={r.bin_order === 0 ? SERIES[1] : SERIES[0]} />
            ))}
          </Bar>
        </BarChart>
      </Plot>
    </Exhibit>
  );
}
