"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import data from "@/data/wage-levels-by-year.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { pct } from "@/lib/format";
import { AXIS_TICK, CHART_MARGIN, SEQUENTIAL, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = {
  year: number;
  level_i: number;
  level_ii: number;
  level_iii: number;
  level_iv: number;
  not_stated: number;
  total: number;
};

export const meta = {
  id: "wage-levels-by-year",
  section: "money",
  order: 30,
  title: "Prevailing wage level of certified H-1B applications, by year of decision",
  width: "half",
  sources: ["LCA-PERM/filing_current"],
  caveat:
    "Counts certified applications (LCAs, status CERTIFIED) by the prevailing wage level I to IV stated on the filing, as a share of all certified applications that year; 'Not stated' means the level is blank. Only 2020 to 2025 are shown: in 2010 to 2019 the level is blank for whole months of each year, so those years would compare different parts of the year.",
} satisfies ChartMeta;

const LEVELS = [
  { key: "level_i", name: "Level I", color: SEQUENTIAL[1] },
  { key: "level_ii", name: "Level II", color: SEQUENTIAL[2] },
  { key: "level_iii", name: "Level III", color: SEQUENTIAL[3] },
  { key: "level_iv", name: "Level IV", color: SEQUENTIAL[4] },
  { key: "not_stated", name: "Not stated", color: SERIES[5] },
] as const;

/** One sentence computed from the data, so the text can never drift from the chart. */
export function takeaway(rows: Datum[]): string {
  const first = rows[0];
  const last = rows[rows.length - 1];
  const s = (r: Datum, k: "level_i" | "level_iv") => pct(r[k] / r.total, 1);
  return `Level I made up ${s(first, "level_i")} of certified applications in ${first.year} and ${s(last, "level_i")} in ${last.year}; level IV made up ${s(first, "level_iv")} and ${s(last, "level_iv")}.`;
}

export default function WageLevelsByYear() {
  const rows = (data as Datum[]).map((r) => ({
    year: r.year,
    level_i: r.level_i / r.total,
    level_ii: r.level_ii / r.total,
    level_iii: r.level_iii / r.total,
    level_iv: r.level_iv / r.total,
    not_stated: r.not_stated / r.total,
  }));
  return (
    <Exhibit meta={meta} takeaway={takeaway(data as Datum[])}>
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
          {LEVELS.map((l) => (
            <Bar
              key={l.key}
              dataKey={l.key}
              name={l.name}
              stackId="w"
              fill={l.color}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </Plot>
      <ul
        aria-label="Legend"
        style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", listStyle: "none", margin: "8px 0 0", padding: 0, fontSize: 13 }}
      >
        {LEVELS.map((l) => (
          <li key={l.key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 11, height: 11, background: l.color, display: "inline-block" }} />
            {l.name}
          </li>
        ))}
      </ul>
    </Exhibit>
  );
}
