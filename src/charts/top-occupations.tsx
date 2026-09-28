"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import data from "@/data/top-occupations.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { compact, int } from "@/lib/format";
import { AXIS_TICK, CHART_MARGIN, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = { soc_code: string; soc_title: string; certified: number; share_pct: number };

export const meta = {
  id: "top-occupations",
  section: "occupations",
  order: 10,
  title: "Top 20 occupations by certified H-1B applications, 2023 to 2025",
  width: "full",
  sources: ["LCA-PERM/filing_current"],
  caveat:
    "Counts applications (LCAs), decision years 2023 to 2025; 'certified' means final status CERTIFIED. Occupations are the detailed SOC codes as filed (a .00 suffix is treated as none), so related jobs such as data scientists and business intelligence analysts stay separate; 14 filings with a malformed code are left out.",
} satisfies ChartMeta;

const label = (d: Datum) => {
  const t = d.soc_title;
  return t.length > 44 ? `${t.slice(0, 43)}…` : t;
};

/** One or two sentences computed from the data, so the text can never drift from the chart. */
export function takeaway(rows: Datum[]): string {
  const [a, b] = rows;
  return `${a.soc_title} accounts for ${int(a.certified)} certified applications, ${a.share_pct.toFixed(1)}% of all certified applications from 2023 to 2025 and ${(a.certified / b.certified).toFixed(1)} times the next occupation, ${b.soc_title}.`;
}

export default function TopOccupations() {
  const rows = (data as Datum[]).map((d) => ({ ...d, name: label(d) }));
  return (
    <Exhibit meta={meta} takeaway={takeaway(data as Datum[])}>
      <Plot height={20 * 26 + 30}>
        <BarChart data={rows} layout="vertical" margin={CHART_MARGIN}>
          <GreenbarGrid />
          <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={compact} />
          <YAxis type="category" dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} width={260} interval={0} />
          <ChartTooltip valueFormat={int} />
          <Bar dataKey="certified" name="Certified applications" fill={SERIES[0]} isAnimationActive={false} />
        </BarChart>
      </Plot>
    </Exhibit>
  );
}
