"use client";

import { Line, LineChart, XAxis, YAxis } from "recharts";
import data from "@/data/h1b-dependent-share.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { pctPoints } from "@/lib/format";
import { AXIS_TICK, CHART_MARGIN, PAPER, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = {
  year: number;
  certified: number;
  answered: number;
  dependent: number;
  months_answered: number;
  coverage_pct: number;
  share_pct: number;
  share_jan_sep_pct: number;
};

const rows = data as Datum[];
const partial = rows.filter((r) => r.months_answered < 12);
const partialNote = partial
  .map((r) => `${r.year} has answers for January to September only (${pctPoints(r.coverage_pct, 0)} of applications, hollow dot)`)
  .join("; ");
// Largest gap between the January-September share and the full-year share in the years with a full 12 months.
const maxGap = Math.max(...rows.filter((r) => r.months_answered === 12).map((r) => Math.abs(r.share_pct - r.share_jan_sep_pct)));

export const meta = {
  id: "h1b-dependent-share",
  section: "practice",
  order: 40,
  title: "Share of certified H-1B applications marked H-1B dependent by the employer",
  width: "full",
  sources: ["LCA-PERM/filing_current"],
  caveat: `Share of certified applications (status CERTIFIED) on which the employer answered YES to the H-1B dependent question on the form; this is the employer's own declaration, computed over applications that carry an answer. The field is blank before October 2021, so the chart starts in 2022. ${partialNote}. In the full years, the January to September share is within ${maxGap.toFixed(1)} points of the full-year share.`,
} satisfies ChartMeta;

export function takeaway(rows: Datum[]): string {
  const first = rows[0];
  const last = rows[rows.length - 1];
  const lowest = rows.every((r) => r.share_pct >= last.share_pct);
  return `Employers declared themselves H-1B dependent on ${pctPoints(first.share_pct, 1)} of certified applications in ${first.year} and ${pctPoints(last.share_pct, 1)} in ${last.year}${lowest ? ", the lowest of the years shown" : ""}.`;
}

export default function H1bDependentShare() {
  return (
    <Exhibit meta={meta} takeaway={takeaway(rows)}>
      <Plot>
        <LineChart data={rows} margin={CHART_MARGIN}>
          <GreenbarGrid />
          <XAxis dataKey="year" tick={AXIS_TICK} tickLine={false} axisLine={false} interval={0} />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            domain={[0, 40]}
            tickFormatter={(n: number) => `${n}%`}
            width={44}
          />
          <ChartTooltip valueFormat={(v: number) => pctPoints(v, 1)} />
          <Line
            type="monotone"
            dataKey="share_pct"
            name="Declared H-1B dependent"
            stroke={SERIES[0]}
            strokeWidth={2.5}
            dot={(p: { cx?: number; cy?: number; index?: number; payload?: Datum }) => {
              const hollow = (p.payload?.months_answered ?? 12) < 12;
              return (
                <circle
                  key={p.index}
                  cx={p.cx}
                  cy={p.cy}
                  r={5}
                  stroke={SERIES[0]}
                  strokeWidth={2.5}
                  fill={hollow ? PAPER : SERIES[0]}
                />
              );
            }}
            isAnimationActive={false}
          />
        </LineChart>
      </Plot>
    </Exhibit>
  );
}
