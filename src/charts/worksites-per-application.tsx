"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import data from "@/data/worksites-per-application.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { pct } from "@/lib/format";
import { AXIS_TICK, CHART_MARGIN, SEQUENTIAL, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = {
  year: number;
  w1: number;
  w2: number;
  w3_5: number;
  w6_plus: number;
  total: number;
  q1_total: number;
  q1_multi: number;
};

const raw = data as Datum[];
const y2020 = raw[0];
const multiShare = (r: Datum) => pct((r.total - r.w1) / r.total);
const earlyShare = pct(y2020.q1_multi / y2020.q1_total);

export const meta = {
  id: "worksites-per-application",
  section: "practice",
  order: 30,
  title: "Share of certified H-1B applications by number of worksites listed",
  width: "half",
  sources: ["LCA-PERM/filing_current"],
  caveat: `Counts certified applications (LCAs, status CERTIFIED) by the number of worksites declared on the filing, as a share of each year. Worksite counts are only published from late 2019 (2019 is mostly blank), so the chart starts in 2020; the field stops at 10, so the top group is 6 or more. The share listing more than one worksite rose during ${y2020.year}: ${earlyShare} of January to March decisions, ${multiShare(y2020)} of the full year.`,
} satisfies ChartMeta;

const GROUPS = [
  { key: "w1", name: "1 worksite", color: SEQUENTIAL[1] },
  { key: "w2", name: "2 worksites", color: SEQUENTIAL[2] },
  { key: "w3_5", name: "3 to 5", color: SEQUENTIAL[3] },
  { key: "w6_plus", name: "6 or more", color: SERIES[1] },
] as const;

/** One sentence computed from the data, so the text can never drift from the chart. */
export function takeaway(rows: Datum[]): string {
  const first = rows[0];
  const last = rows[rows.length - 1];
  return `${multiShare(last)} of certified applications in ${last.year} listed more than one worksite, up from ${multiShare(first)} in ${first.year}; ${pct(last.w6_plus / last.total, 1)} listed six or more.`;
}

export default function WorksitesPerApplication() {
  const rows = raw.map((r) => ({
    year: r.year,
    w1: r.w1 / r.total,
    w2: r.w2 / r.total,
    w3_5: r.w3_5 / r.total,
    w6_plus: r.w6_plus / r.total,
  }));
  return (
    <Exhibit meta={meta} takeaway={takeaway(raw)}>
      <Plot height={360}>
        <BarChart data={rows} margin={CHART_MARGIN}>
          <GreenbarGrid />
          <XAxis dataKey="year" tick={AXIS_TICK} tickLine={false} axisLine={false} />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            domain={[0, 1]}
            ticks={[0, 0.25, 0.5, 0.75, 1]}
            tickFormatter={(v: number) => pct(v)}
            width={44}
          />
          <ChartTooltip valueFormat={(n) => pct(n, 1)} />
          {GROUPS.map((g) => (
            <Bar key={g.key} dataKey={g.key} name={g.name} stackId="w" fill={g.color} isAnimationActive={false} />
          ))}
        </BarChart>
      </Plot>
    </Exhibit>
  );
}
