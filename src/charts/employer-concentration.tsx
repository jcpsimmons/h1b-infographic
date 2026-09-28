"use client";

import { Line, LineChart, XAxis, YAxis } from "recharts";
import data from "@/data/employer-concentration.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { int } from "@/lib/format";
import { AXIS_TICK, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = { year: number; total: number; employers: number; top10: number; top100: number; top1000: number };

export const meta = {
  id: "employer-concentration",
  section: "employers",
  order: 20,
  title: "Share of certified H-1B applications filed by the largest employers",
  width: "half",
  sources: ["LCA-PERM/filing_current"],
  caveat:
    "Counts applications (LCAs) with final status CERTIFIED, 2010 to 2025 by decision year. Employers are ranked each year on employer_key, a grouping hint, so employers as named on the filings may be split or merged.",
} satisfies ChartMeta;

export function takeaway(rows: Datum[]): string {
  const last = rows[rows.length - 1];
  const peak = rows.reduce((a, b) => (b.top10 > a.top10 ? b : a));
  return `In ${last.year}, the top 1,000 of ${int(last.employers)} employers as named on the filings filed ${last.top1000.toFixed(0)}% of certified applications; the top 10 filed ${last.top10.toFixed(0)}%, down from a peak of ${peak.top10.toFixed(0)}% in ${peak.year}.`;
}

const LINES = [
  { key: "top1000", label: "Top 1,000", color: SERIES[0] },
  { key: "top100", label: "Top 100", color: SERIES[3] },
  { key: "top10", label: "Top 10", color: SERIES[1] },
] as const;

const pctLabel = (v: number) => `${v.toFixed(1)}%`;

export default function EmployerConcentration() {
  const rows = data as Datum[];
  const lastYear = rows[rows.length - 1].year;
  return (
    <Exhibit meta={meta} takeaway={takeaway(rows)}>
      <Plot>
        <LineChart data={rows} margin={{ top: 8, right: 84, bottom: 4, left: 4 }}>
          <GreenbarGrid />
          <XAxis dataKey="year" tick={AXIS_TICK} tickLine={false} axisLine={false} interval={2} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} width={44} domain={[0, 70]} ticks={[0, 20, 40, 60]} />
          <ChartTooltip valueFormat={pctLabel} />
          {LINES.map((l) => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.label}
              stroke={l.color}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
              label={(p: { x?: number | string; y?: number | string; index?: number }) =>
                rows[p.index ?? -1]?.year === lastYear ? (
                  <text key={l.key} x={Number(p.x ?? 0) + 8} y={Number(p.y ?? 0) + 4} fill={l.color} fontSize={12} fontWeight={600}>
                    {l.label}
                  </text>
                ) : (
                  <g key={`${l.key}-${p.index}`} />
                )
              }
            />
          ))}
        </LineChart>
      </Plot>
    </Exhibit>
  );
}
