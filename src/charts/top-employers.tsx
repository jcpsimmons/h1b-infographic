"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import data from "@/data/top-employers.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { compact, int, pct } from "@/lib/format";
import { AXIS_TICK, CHART_MARGIN, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = {
  employer: string;
  applications: number;
  all_certified: number;
};

export const meta = {
  id: "top-employers",
  section: "employers",
  order: 10,
  title: "Employers with the most certified H-1B applications, 2021 to 2025",
  width: "full",
  sources: ["LCA-PERM/filing_current"],
  caveat:
    "Certified H-1B applications (status CERTIFIED only) decided 2021 to 2025, grouped on employer_key and labeled with the most frequent employer name for that key, as named on the filings. Entities of one corporate family may appear separately, so a company's true total can be larger.",
} satisfies ChartMeta;

const label = (s: string) => (s.length > 28 ? `${s.slice(0, 27)}…` : s);

export function takeaway(rows: Datum[]): string {
  const top = rows[0];
  const sum = rows.reduce((a, r) => a + r.applications, 0);
  return `The 20 largest filers account for ${pct(sum / top.all_certified)} of all ${int(top.all_certified)} certified applications. ${top.employer} is first with ${int(top.applications)}.`;
}

export default function TopEmployers() {
  const rows = (data as Datum[]).map((r) => ({ ...r, name: label(r.employer) }));
  return (
    <Exhibit meta={meta} takeaway={takeaway(data as Datum[])}>
      <Plot height={20 * 26 + 40}>
        <BarChart data={rows} layout="vertical" margin={{ ...CHART_MARGIN, right: 56 }}>
          <GreenbarGrid />
          <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(n: number) => compact(n)} />
          <YAxis type="category" dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} width={190} interval={0} />
          <ChartTooltip valueFormat={int} />
          <Bar dataKey="applications" name="Certified applications" fill={SERIES[0]} isAnimationActive={false}>
            <LabelList dataKey="applications" position="right" formatter={(v: unknown) => compact(Number(v))} style={{ fontSize: 12 }} />
          </Bar>
        </BarChart>
      </Plot>
    </Exhibit>
  );
}
