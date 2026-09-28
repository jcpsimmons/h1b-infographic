"use client";

import { Bar, BarChart, Legend, XAxis, YAxis } from "recharts";
import data from "@/data/computer-share-by-year.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { AXIS_TICK, CHART_MARGIN, INK_SOFT, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = {
  year: number;
  group_code: string;
  group_name: string;
  applications: number;
  total: number;
  share: number;
};

export const meta = {
  id: "computer-share-by-year",
  section: "occupations",
  order: 20,
  title: "Share of certified H-1B applications by occupation group",
  width: "half",
  sources: ["LCA-PERM/filing_current"],
  caveat:
    "Counts certified applications (LCAs, status CERTIFIED) by SOC major group, the first two digits of soc_code, for decision years 2010 to 2025; shares are of all certified applications. Codes that are missing or unreadable are shown in grey (2.2% in 2011, 3.4% in 2012, under 0.1% in other years); in 2012 about six in ten of them have 'manager' in the job title, so Management is understated in 2011 and 2012. Group names are from the BLS 2018 SOC major groups page, https://www.bls.gov/soc/2018/major_groups.htm; 'Other' is every remaining group.",
} satisfies ChartMeta;

const pctOne = (x: number) => `${x.toFixed(1)}%`;

const KEYS = [
  { code: "15", name: "Computer and Mathematical", color: SERIES[1], opacity: 1 },
  { code: "13", name: "Business and Financial Operations", color: SERIES[0], opacity: 1 },
  { code: "17", name: "Architecture and Engineering", color: SERIES[2], opacity: 1 },
  { code: "11", name: "Management", color: SERIES[3], opacity: 1 },
  { code: "29", name: "Healthcare Practitioners and Technical", color: SERIES[4], opacity: 1 },
  { code: "19", name: "Life, Physical, and Social Science", color: SERIES[0], opacity: 0.5 },
  { code: "other", name: "Other", color: SERIES[5], opacity: 1 },
  { code: "unreadable", name: "Code missing or unreadable", color: INK_SOFT, opacity: 0.3 },
] as const;

function computerRows(rows: Datum[]) {
  return rows.filter((r) => r.group_code === "15").sort((a, b) => a.year - b.year);
}

export function takeaway(rows: Datum[]): string {
  const c = computerRows(rows);
  const first = c[0];
  const last = c[c.length - 1];
  const peak = c.reduce((a, b) => (b.share > a.share ? b : a));
  return `Computer and Mathematical occupations were ${pctOne(first.share)} of certified applications in ${first.year} and peaked at ${pctOne(peak.share)} in ${peak.year}; in ${last.year} they were ${pctOne(last.share)}.`;
}

export default function ComputerShareByYear() {
  const rows = data as Datum[];
  const years = Array.from(new Set(rows.map((r) => r.year))).sort((a, b) => a - b);
  const wide = years.map((y) => {
    const o: Record<string, number> = { year: y };
    for (const k of KEYS) {
      o[k.code] = rows.find((r) => r.year === y && r.group_code === k.code)?.share ?? 0;
    }
    return o;
  });
  return (
    <Exhibit meta={meta} takeaway={takeaway(rows)}>
      <Plot height={420}>
        <BarChart data={wide} margin={CHART_MARGIN}>
          <GreenbarGrid />
          <XAxis dataKey="year" tick={AXIS_TICK} tickLine={false} axisLine={false} interval={1} />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={48}
            domain={[0, 100]}
            tickFormatter={(v: number) => `${v}%`}
          />
          <ChartTooltip valueFormat={(v: number) => pctOne(v)} />
          <Legend />
          {KEYS.map((k) => (
            <Bar
              key={k.code}
              dataKey={k.code}
              name={k.name}
              stackId="s"
              fill={k.color}
              fillOpacity={k.opacity}
              stroke="#fff"
              strokeWidth={0.5}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </Plot>
    </Exhibit>
  );
}
