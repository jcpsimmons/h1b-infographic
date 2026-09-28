"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import data from "@/data/top-cities.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { compact, int } from "@/lib/format";
import { AXIS_TICK, CHART_MARGIN, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = { city: string; state: string; certified: number };

export const meta = {
  id: "top-cities",
  section: "geography",
  order: 30,
  title: "Top 20 worksite cities by certified H-1B applications, 2023 to 2025",
  width: "half",
  sources: ["LCA-PERM/filing_current"],
  caveat:
    "Counts applications (LCAs) by the worksite city and state on the filing, decision years 2023 to 2025; 'certified' means final status CERTIFIED. City text is uppercased and trimmed and only obvious spelling variants are merged, so other variants may remain and boroughs such as Brooklyn are counted apart from New York.",
} satisfies ChartMeta;

const title = (s: string) => s.toLowerCase().replace(/(^|[\s-])([a-z])/g, (_, a, b) => a + b.toUpperCase());
const label = (d: Datum) => {
  const t = `${title(d.city)}, ${d.state}`;
  return t.length > 28 ? `${t.slice(0, 27)}…` : t;
};

/** One or two sentences computed from the data, so the text can never drift from the chart. */
export function takeaway(rows: Datum[]): string {
  const [a, b] = rows;
  return `${title(a.city)}, ${a.state} leads with ${int(a.certified)} certified applications, ${(a.certified / b.certified).toFixed(1)} times ${title(b.city)}, ${b.state} in second place.`;
}

export default function TopCities() {
  const rows = (data as Datum[]).map((d) => ({ ...d, name: label(d) }));
  return (
    <Exhibit meta={meta} takeaway={takeaway(data as Datum[])}>
      <Plot height={20 * 26 + 30}>
        <BarChart data={rows} layout="vertical" margin={CHART_MARGIN}>
          <GreenbarGrid />
          <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={compact} />
          <YAxis type="category" dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} width={150} interval={0} />
          <ChartTooltip valueFormat={int} />
          <Bar dataKey="certified" name="Certified applications" fill={SERIES[0]} isAnimationActive={false} />
        </BarChart>
      </Plot>
    </Exhibit>
  );
}
