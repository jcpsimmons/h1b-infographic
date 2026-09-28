"use client";

import { Line, LineChart, XAxis, YAxis } from "recharts";
import data from "@/data/processing-time.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { int } from "@/lib/format";
import { AXIS_TICK, CHART_MARGIN, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = {
  year: number;
  certified_median: number;
  certified_p90: number;
  denied_median: number;
  certified_n: number;
  denied_n: number;
  dropped: number;
};

const minDenied = Math.min(...(data as Datum[]).map((r) => r.denied_n));
const dropped = (data as Datum[]).reduce((s, r) => s + r.dropped, 0);

export const meta = {
  id: "processing-time",
  section: "volume",
  order: 50,
  title: "Calendar days from receipt to decision, by year of decision",
  width: "half",
  sources: ["LCA-PERM/filing_current"],
  caveat: `Applications (LCAs) with status CERTIFIED or DENIED, 2010 to 2025; days run from received_date to decision_date. ${int(dropped)} application${dropped === 1 ? "" : "s"} with a missing or negative duration ${dropped === 1 ? "was" : "were"} dropped; same-day decisions are kept. Denied medians rest on far fewer applications (as few as ${int(minDenied)}) and move more from year to year.`,
} satisfies ChartMeta;

export function takeaway(rows: Datum[]): string {
  const first = rows[0];
  const last = rows[rows.length - 1];
  return `Half of certified applications were decided within ${first.certified_median} days in ${first.year} and within ${last.certified_median} in ${last.year}; nine in ten took ${last.certified_p90} days or fewer in ${last.year}.`;
}

export default function ProcessingTime() {
  const rows = data as Datum[];
  return (
    <Exhibit meta={meta} takeaway={takeaway(rows)}>
      <Plot>
        <LineChart data={rows} margin={CHART_MARGIN}>
          <GreenbarGrid />
          <XAxis dataKey="year" tick={AXIS_TICK} tickLine={false} axisLine={false} interval={1} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={40} domain={[0, "dataMax + 1"]} allowDecimals={false} />
          <ChartTooltip valueFormat={(v: number) => `${v} days`} />
          <Line type="monotone" dataKey="certified_median" name="Certified, median" stroke={SERIES[0]} strokeWidth={2.5} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="certified_p90" name="Certified, 90th percentile" stroke={SERIES[2]} strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="denied_median" name="Denied, median" stroke={SERIES[1]} strokeWidth={2.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </Plot>
    </Exhibit>
  );
}
