"use client";

import { Bar, ComposedChart, Line, XAxis, YAxis } from "recharts";
import data from "@/data/texas-deep-dive.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { compact, int } from "@/lib/format";
import { AXIS_TICK, CHART_MARGIN, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = {
  year: number;
  texas: number | null;
  share: number | null;
  rank: number | null;
  coverage: number;
};

export const meta = {
  id: "texas-deep-dive",
  section: "geography",
  order: 50,
  title: "Texas worksite applications and Texas' share of certified H-1B filings",
  width: "full",
  sources: ["LCA-PERM/filing_current"],
  caveat:
    "Counts applications (LCAs) by primary worksite state, not workers; 'certified' means final status CERTIFIED. Share is of certified applications with a recognized U.S. state or DC worksite. 2010, 2018 and 2019 are left blank because worksite state is missing on more than 10% of applications (79%, 14% and 84% missing).",
} satisfies ChartMeta;

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
};

const valueFormat = (n: number) => (n > 1000 ? int(n) : `${n.toFixed(1)}%`);

export function takeaway(rows: Datum[]): string {
  const valid = rows.filter((r) => r.texas !== null && r.share !== null && r.rank !== null);
  const first = valid[0];
  const last = valid[valid.length - 1];
  return `In ${last.year}, ${int(last.texas as number)} certified applications had a Texas worksite, ${(last.share as number).toFixed(1)}% of the U.S. total and ${ordinal(last.rank as number)} among states, up from ${(first.share as number).toFixed(1)}% in ${first.year}.`;
}

export default function TexasDeepDive() {
  const rows = data as Datum[];
  return (
    <Exhibit meta={meta} takeaway={takeaway(rows)}>
      <Plot height={360}>
        <ComposedChart data={rows} margin={{ ...CHART_MARGIN, right: 40 }}>
          <GreenbarGrid />
          <XAxis dataKey="year" tick={AXIS_TICK} tickLine={false} axisLine={false} interval={0} />
          <YAxis yAxisId="left" tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={compact} width={48} />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 20]}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${v}%`}
            width={44}
          />
          <ChartTooltip valueFormat={valueFormat} />
          <Bar
            yAxisId="left"
            dataKey="texas"
            name="Texas applications"
            fill={SERIES[0]}
            fillOpacity={0.85}
            isAnimationActive={false}
          />
          <Line
            yAxisId="right"
            dataKey="share"
            name="Share of U.S. total"
            type="monotone"
            stroke={SERIES[1]}
            strokeWidth={2.5}
            dot={{ r: 3, fill: SERIES[1], stroke: SERIES[1] }}
            connectNulls={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </Plot>
    </Exhibit>
  );
}
