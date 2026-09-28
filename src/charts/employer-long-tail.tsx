"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import data from "@/data/employer-long-tail.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { AXIS_TICK, CHART_MARGIN, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = {
  bucket: string;
  employers: number;
  applications: number;
  employer_share: number;
  application_share: number;
};

export const meta = {
  id: "employer-long-tail",
  section: "employers",
  order: 50,
  title: "Employer size buckets in 2025: share of employers vs share of applications",
  width: "half",
  sources: ["LCA-PERM/filing_current"],
  caveat:
    "Employers as named on the filings: employer_key is a grouping hint, not an identity, so it can split one company across spellings or merge different ones. Counts certified H-1B applications (status CERTIFIED) decided in 2025; each bucket is the number of certified applications per employer key.",
} satisfies ChartMeta;

export function takeaway(rows: Datum[]): string {
  const first = rows[0];
  return `Employers with a single certified application in 2025 were ${first.employer_share.toFixed(1)}% of employers but ${first.application_share.toFixed(1)}% of applications.`;
}

const pctLabel = (n: number) => `${n.toFixed(1)}%`;

export default function EmployerLongTail() {
  const rows = data as Datum[];
  return (
    <Exhibit meta={meta} takeaway={takeaway(rows)}>
      <div style={{ display: "flex", gap: 16, fontSize: 13, marginBottom: 4 }}>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: SERIES[0], marginRight: 6 }} />Share of employers</span>
        <span><span style={{ display: "inline-block", width: 10, height: 10, background: SERIES[1], marginRight: 6 }} />Share of applications</span>
      </div>
      <Plot height={340}>
        <BarChart data={rows} margin={CHART_MARGIN}>
          <GreenbarGrid />
          <XAxis dataKey="bucket" tick={AXIS_TICK} tickLine={false} axisLine={false} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} width={44} />
          <ChartTooltip valueFormat={pctLabel} labelFormat={(l) => `${String(l)} applications per employer`} />
          <Bar dataKey="employer_share" name="Share of employers" fill={SERIES[0]} isAnimationActive={false} />
          <Bar dataKey="application_share" name="Share of applications" fill={SERIES[1]} isAnimationActive={false} />
        </BarChart>
      </Plot>
    </Exhibit>
  );
}
