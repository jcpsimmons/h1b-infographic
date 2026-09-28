"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import data from "@/data/top-job-titles.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { compact, int } from "@/lib/format";
import { AXIS_TICK, CHART_MARGIN, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = { title: string; certified: number };

export const meta = {
  id: "top-job-titles",
  section: "occupations",
  order: 30,
  title: "Top 15 job titles on certified H-1B applications, 2023 to 2025",
  width: "half",
  sources: ["LCA-PERM/filing_current"],
  caveat:
    "Counts applications (LCAs) by the job title text the employer typed, decision years 2023 to 2025; 'certified' means final status CERTIFIED. Titles are free text, uppercased, trimmed and with repeated spaces collapsed; similar titles are not merged, so 'Software Engineer' and 'Software Developer' are counted separately.",
} satisfies ChartMeta;

/** Sentence-ish display case: capitalize words, but keep roman numerals (II) and codes with digits (JC50) in capitals. */
const title = (s: string) =>
  s
    .split(/(\s+)/)
    .map((w) =>
      /^(I|II|III|IV|V|VI|VII|VIII|IX|X)$/.test(w) || /\d/.test(w)
        ? w
        : w.toLowerCase().replace(/(^|[/-])([a-z])/g, (_, a, b) => a + b.toUpperCase()),
    )
    .join("");
const label = (s: string) => {
  const t = title(s);
  return t.length > 28 ? `${t.slice(0, 27)}…` : t;
};

/** One or two sentences computed from the data, so the text can never drift from the chart. */
export function takeaway(rows: Datum[]): string {
  const [a, b] = rows;
  return `"${title(a.title)}" is the most common title with ${int(a.certified)} certified applications, ${(a.certified / b.certified).toFixed(1)} times "${title(b.title)}" in second place. Titles are free text, so similar titles are counted separately.`;
}

export default function TopJobTitles() {
  const rows = (data as Datum[]).map((d) => ({ ...d, name: label(d.title) }));
  return (
    <Exhibit meta={meta} takeaway={takeaway(data as Datum[])}>
      <Plot height={15 * 26 + 30}>
        <BarChart data={rows} layout="vertical" margin={CHART_MARGIN}>
          <GreenbarGrid />
          <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={compact} />
          <YAxis type="category" dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} width={190} interval={0} />
          <ChartTooltip valueFormat={int} />
          <Bar dataKey="certified" name="Certified applications" fill={SERIES[0]} isAnimationActive={false} />
        </BarChart>
      </Plot>
    </Exhibit>
  );
}
