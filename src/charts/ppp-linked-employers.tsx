"use client";

import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import data from "@/data/ppp-linked-employers.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { compact, int, pct, usdCompact } from "@/lib/format";
import { AXIS_TICK, CHART_MARGIN, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = { ord: number; bracket: string; employers: number; loans: number; dollars: number };

export const meta = {
  id: "ppp-linked-employers",
  section: "linked",
  order: 10,
  title: "H-1B employers that appear in both public datasets with a PPP loan record",
  width: "full",
  sources: ["LCA-PERM/filing_current", "SBA/CROSSWALK"],
  caveat:
    "Employers, as named on the filings, with at least one CERTIFIED H-1B application decided 2015 to 2025 that the SBA crosswalk apparently matches to a PPP loan record by normalized name and state. This is an apparent data relationship, not proof of identity, and PPP was a lawful relief program. Personal-name matches and names shared by three or more matched loans are excluded, and each employer is placed in a bracket by the total of its matched approved loan amounts.",
} satisfies ChartMeta;

export function takeaway(rows: Datum[]): string {
  const total = rows.reduce((a, r) => a + r.employers, 0);
  const dollars = rows.reduce((a, r) => a + r.dollars, 0);
  const top = rows[rows.length - 1];
  return `${int(total)} employers with certified H-1B applications appear in both datasets according to the crosswalk, with ${usdCompact(dollars)} in matched approved loan amounts; the ${int(top.employers)} in the largest bracket account for ${pct(top.dollars / dollars)} of those dollars.`;
}

export default function PppLinkedEmployers() {
  const rows = (data as Datum[]).map((r) => ({
    ...r,
    lbl: `${int(r.employers)} employers, ${usdCompact(r.dollars)}`,
  }));
  return (
    <Exhibit meta={meta} takeaway={takeaway(data as Datum[])}>
      <Plot height={5 * 52 + 50}>
        <BarChart data={rows} layout="vertical" margin={{ ...CHART_MARGIN, right: 170 }}>
          <GreenbarGrid />
          <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(n: number) => compact(n)} />
          <YAxis type="category" dataKey="bracket" tick={AXIS_TICK} tickLine={false} axisLine={false} width={120} interval={0} />
          <ChartTooltip valueFormat={int} />
          <Bar dataKey="employers" name="Matched employers" fill={SERIES[0]} isAnimationActive={false}>
            <LabelList dataKey="lbl" position="right" style={{ fontSize: 12 }} />
          </Bar>
        </BarChart>
      </Plot>
    </Exhibit>
  );
}
