"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import data from "@/data/industries.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { compact, int, pct } from "@/lib/format";
import { AXIS_TICK, CHART_MARGIN, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = { code: string; certified: number; share_pct: number; total: number };

export const meta = {
  id: "industries",
  section: "occupations",
  order: 40,
  title: "Top 12 industries by certified H-1B applications, 2023 to 2025",
  width: "full",
  sources: ["LCA-PERM/filing_current"],
  caveat:
    "Counts applications (LCAs) by the employer-declared NAICS sector (first two digits of the code), decision years 2023 to 2025; 'certified' means final status CERTIFIED. Sectors are used because the 2022 NAICS revision moved codes at 3 digits and below between versions, and filings in this window use both. About 150 applications with an invalid code are left out. Sector titles, shortened here, are from the Census Bureau: https://www.census.gov/naics/2022NAICS/2-6%20digit_2022_Codes.xlsx.",
} satisfies ChartMeta;

const LABELS: Record<string, string> = {
  "54": "Professional and technical services",
  "31-33": "Manufacturing",
  "51": "Information",
  "52": "Finance and insurance",
  "61": "Educational services",
  "44-45": "Retail trade",
  "62": "Health care, social assistance",
  "56": "Administrative and support",
  "42": "Wholesale trade",
  "55": "Management of companies",
  "23": "Construction",
  "48-49": "Transportation, warehousing",
};
const name = (c: string) => LABELS[c] ?? c;

/** One or two sentences computed from the data, so the text can never drift from the chart. */
export function takeaway(rows: Datum[]): string {
  const a = rows[0];
  const b = rows[1];
  return `${name(a.code)} accounts for ${pct(a.certified / a.total)} of all ${int(a.total)} certified applications, ${(a.certified / b.certified).toFixed(1)} times the next industry (${name(b.code)}).`;
}

export default function Industries() {
  const rows = (data as Datum[]).map((d) => ({ ...d, name: name(d.code) }));
  return (
    <Exhibit meta={meta} takeaway={takeaway(data as Datum[])}>
      <Plot height={12 * 26 + 40}>
        <BarChart data={rows} layout="vertical" margin={CHART_MARGIN}>
          <GreenbarGrid />
          <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={compact} />
          <YAxis type="category" dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} width={215} interval={0} />
          <ChartTooltip valueFormat={int} />
          <Bar dataKey="certified" name="Certified applications" fill={SERIES[0]} isAnimationActive={false} />
        </BarChart>
      </Plot>
    </Exhibit>
  );
}
