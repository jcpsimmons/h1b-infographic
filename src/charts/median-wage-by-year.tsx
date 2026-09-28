"use client";

import { Line, LineChart, XAxis, YAxis } from "recharts";
import data from "@/data/median-wage-by-year.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { usd } from "@/lib/format";
import { AXIS_TICK, CHART_MARGIN, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = {
  year: number;
  applications: number;
  offered_coverage_pct: number;
  prevailing_coverage_pct: number;
  months_covered: number;
  offered: number | null;
  prevailing: number | null;
};

const ALL = data as Datum[];
const gapYears = ALL.filter((r) => r.offered === null).map((r) => r.year).join(", ");
const partial = ALL.filter((r) => r.offered !== null && r.months_covered < 12);
const partialText = partial.length
  ? `${partial.map((r) => r.year).join(" and ")} ${partial.length === 1 ? "is" : "are"} plotted but ${partial.length === 1 ? "has" : "have"} wages for only ${Array.from(new Set(partial.map((r) => r.months_covered))).join(" or ")} of 12 months, so ${partial.length === 1 ? "that median describes" : "those medians describe"} those months alone.`
  : "";

export const meta = {
  id: "median-wage-by-year",
  section: "money",
  order: 10,
  title: "Median offered and prevailing wage on certified H-1B applications",
  width: "full",
  sources: ["LCA-PERM/filing_current"],
  caveat: `Certified applications (LCAs) with final status CERTIFIED, by decision year, in the dollars filed (not adjusted for inflation). Offered wage is wage_from, the low end of the stated range; both wages are annualized (hourly x2080, weekly x52, bi-weekly x26, monthly x12) and values under $15,000 or over $1,000,000 a year are dropped. Years where fewer than 80% of applications have a usable wage are left as gaps: ${gapYears}. ${partialText}`,
} satisfies ChartMeta;

/** One or two sentences computed from the data, so the text can never drift from the chart. */
export function takeaway(rows: Datum[]): string {
  const ok = rows.filter((r) => r.offered !== null && r.prevailing !== null);
  const first = ok[0];
  const last = ok[ok.length - 1];
  const gap = (last.offered as number) - (last.prevailing as number);
  const growth = (last.offered as number) / (first.offered as number);
  return `The median offered wage rose from ${usd(first.offered as number)} in ${first.year} to ${usd(last.offered as number)} in ${last.year}, ${growth.toFixed(1)} times as much, ${usd(gap)} above the median prevailing wage of ${usd(last.prevailing as number)}.`;
}

type LabelProps = { x?: number | string; y?: number | string; index?: number; value?: unknown };

function endLabel(text: string, color: string, lastIndex: number, dy: number) {
  const Label = ({ x, y, index, value }: LabelProps) =>
    index === lastIndex && value != null && x != null && y != null ? (
      <text x={Number(x) - 6} y={Number(y) + dy} textAnchor="end" fill={color} fontSize={13} fontWeight={600}>
        {text}
      </text>
    ) : null;
  return Label;
}

export default function MedianWageByYear() {
  const rows = data as Datum[];
  const last = rows.length - 1;
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
            domain={[40000, 130000]}
            tickFormatter={(n: number) => `$${n / 1000}k`}
            width={52}
          />
          <ChartTooltip valueFormat={(v: number) => usd(v)} />
          <Line
            type="monotone"
            dataKey="offered"
            name="Median offered wage"
            stroke={SERIES[1]}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            connectNulls={false}
            isAnimationActive={false}
            label={endLabel("Offered", SERIES[1], last, -12)}
          />
          <Line
            type="monotone"
            dataKey="prevailing"
            name="Median prevailing wage"
            stroke={SERIES[0]}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            connectNulls={false}
            isAnimationActive={false}
            label={endLabel("Prevailing", SERIES[0], last, 22)}
          />
        </LineChart>
      </Plot>
    </Exhibit>
  );
}
