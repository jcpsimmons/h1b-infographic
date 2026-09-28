"use client";

import { Area, AreaChart, XAxis, YAxis } from "recharts";
import data from "@/data/certified-per-year.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { compact, int } from "@/lib/format";
import { AXIS_TICK, CHART_MARGIN, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = { year: number; certified: number };

export const meta = {
  id: "certified-per-year",
  section: "volume",
  order: 10,
  title: "Certified H-1B applications by year of decision",
  width: "full",
  sources: ["LCA-PERM/filing_current"],
  caveat:
    "Counts applications (LCAs), not workers or visas. 'Certified' means the Department of Labor's final status is CERTIFIED. 2009 (form change) and 2026 (partial year) are left out.",
} satisfies ChartMeta;

/** One sentence computed from the data, so the text can never drift from the chart. */
export function takeaway(rows: Datum[]): string {
  const peak = rows.reduce((a, b) => (b.certified > a.certified ? b : a));
  const last = rows[rows.length - 1];
  const first = rows[0];
  const growth = last.certified / first.certified;
  return `${int(peak.certified)} applications were certified in ${peak.year}, the high point; ${last.year} came in at ${int(last.certified)}, ${growth.toFixed(1)} times the ${first.year} count.`;
}

export default function CertifiedPerYear() {
  const rows = data as Datum[];
  return (
    <Exhibit meta={meta} takeaway={takeaway(rows)}>
      <Plot>
        <AreaChart data={rows} margin={CHART_MARGIN}>
          <GreenbarGrid />
          <XAxis dataKey="year" tick={AXIS_TICK} tickLine={false} axisLine={false} interval={1} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={compact} width={48} />
          <ChartTooltip />
          <Area
            type="monotone"
            dataKey="certified"
            name="Certified"
            stroke={SERIES[0]}
            strokeWidth={2.5}
            fill={SERIES[0]}
            fillOpacity={0.22}
            isAnimationActive={false}
          />
        </AreaChart>
      </Plot>
    </Exhibit>
  );
}
