"use client";

import { Bar, BarChart, Legend, XAxis, YAxis } from "recharts";
import data from "@/data/decisions-outcomes-by-year.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { AXIS_TICK, CHART_MARGIN, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = {
  year: number;
  certified: number;
  certified_withdrawn: number;
  withdrawn: number;
  denied: number;
  other: number;
  total: number;
};

const otherTotal = (data as { other: number }[]).reduce((s, r) => s + r.other, 0);

export const meta = {
  id: "decisions-outcomes-by-year",
  section: "volume",
  order: 20,
  title: "Final outcome of H-1B applications by year of decision",
  width: "full",
  sources: ["LCA-PERM/filing_current"],
  caveat: `Counts applications (LCAs), not workers or visas, by the Department of Labor's final status. 'Certified' is CERTIFIED only; 'Certified then withdrawn' is CERTIFIEDWITHDRAWN. 'Other' (${otherTotal} applications in all) are cases still pending review or rejected. 2009 (form change) and 2026 (partial year) are left out.`,
} satisfies ChartMeta;

const pctOne = (x: number) => `${(x * 100).toFixed(1)}%`;

/** One or two sentences computed from the data, so the text can never drift from the chart. */
export function takeaway(rows: Datum[]): string {
  const share = (r: Datum) => r.denied / r.total;
  const first = rows[0];
  const last = rows[rows.length - 1];
  const hi = rows.reduce((a, b) => (share(b) > share(a) ? b : a));
  const lo = rows.reduce((a, b) => (share(b) < share(a) ? b : a));
  return `Denied applications were ${pctOne(share(first))} of decisions in ${first.year} and ${pctOne(share(last))} in ${last.year}. The yearly share ranged from ${pctOne(share(lo))} (${lo.year}) to ${pctOne(share(hi))} (${hi.year}).`;
}

const KEYS = [
  { key: "certified", name: "Certified", color: SERIES[0] },
  { key: "certified_withdrawn", name: "Certified then withdrawn", color: SERIES[3] },
  { key: "withdrawn", name: "Withdrawn", color: SERIES[2] },
  { key: "denied", name: "Denied", color: SERIES[1] },
  { key: "other", name: "Other", color: SERIES[5] },
] as const;

export default function DecisionsOutcomesByYear() {
  const rows = data as Datum[];
  // Shares are computed here from the counts so the tooltip shows percentages of all decisions that year.
  const shares = rows.map((r) => ({
    year: r.year,
    certified: r.certified / r.total,
    certified_withdrawn: r.certified_withdrawn / r.total,
    withdrawn: r.withdrawn / r.total,
    denied: r.denied / r.total,
    other: r.other / r.total,
  }));
  return (
    <Exhibit meta={meta} takeaway={takeaway(rows)}>
      <Plot height={380}>
        <BarChart data={shares} margin={CHART_MARGIN}>
          <GreenbarGrid />
          <XAxis dataKey="year" tick={AXIS_TICK} tickLine={false} axisLine={false} interval={0} />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={48}
            domain={[0, 1]}
            tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
          />
          <ChartTooltip valueFormat={(v: number) => pctOne(v)} />
          <Legend />
          {KEYS.map((k) => (
            <Bar key={k.key} dataKey={k.key} name={k.name} stackId="s" fill={k.color} isAnimationActive={false} />
          ))}
        </BarChart>
      </Plot>
    </Exhibit>
  );
}
