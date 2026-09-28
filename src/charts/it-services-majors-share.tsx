"use client";

import { Bar, BarChart, Legend, XAxis, YAxis } from "recharts";
import data from "@/data/it-services-majors-share.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { AXIS_TICK, CHART_MARGIN, INK, SEQUENTIAL, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = { year: number; firm: string; apps: number; total: number; share_pct: number };

const LABELS: Record<string, string> = {
  infosys: "Infosys",
  tcs: "TCS",
  cognizant: "Cognizant",
  wipro: "Wipro",
  accenture: "Accenture",
  hcl: "HCL",
  techm: "Tech Mahindra",
  ltimindtree: "LTIMindtree",
  other_majors: "Other majors",
};

export const meta = {
  id: "it-services-majors-share",
  section: "employers",
  order: 30,
  title: "Share of certified H-1B applications filed by 33 IT-services firms",
  width: "full",
  sources: ["LCA-PERM/filing_current", "STAFFING-MAJORS"],
  caveat:
    "Each bar is the share of all certified H-1B applications (LCAs; status CERTIFIED) decided that year, 2010 to 2025, that belong to the 33 IT-services firms compiled in the STAFFING-MAJORS dataset. Firms are matched by curated name, domain and identifier lists, including acquired entities from their ownership dates; this is an apparent data relationship, not a finding of fact, and most filings are lawful. The eight firms with the most applications are shown; the other 25 are 'Other majors'.",
} satisfies ChartMeta;

const rows = data as Datum[];

function byYear(rs: Datum[]) {
  const m = new Map<number, { year: number; total: number; combined: number; [k: string]: number }>();
  for (const r of rs) {
    const e = m.get(r.year) ?? { year: r.year, total: r.total, combined: 0 };
    e[r.firm] = r.share_pct;
    e.combined += r.share_pct;
    m.set(r.year, e);
  }
  return [...m.values()].sort((a, b) => a.year - b.year);
}

/** Firm keys ordered by total applications, largest first, with 'other_majors' last. */
function firmOrder(rs: Datum[]) {
  const t = new Map<string, number>();
  for (const r of rs) t.set(r.firm, (t.get(r.firm) ?? 0) + r.apps);
  return [...t.entries()]
    .filter(([f]) => f !== "other_majors")
    .sort((a, b) => b[1] - a[1])
    .map(([f]) => f)
    .concat("other_majors");
}

export function takeaway(rs: Datum[]): string {
  const ys = byYear(rs);
  const peak = ys.reduce((a, b) => (b.combined > a.combined ? b : a));
  const last = ys[ys.length - 1];
  const firstY = ys[0];
  const seen = new Map<number, number>();
  for (const r of rs) seen.set(r.year, r.total);
  const totalAll = [...seen.values()].reduce((a, b) => a + b, 0);
  const appsAll = rs.reduce((a, r) => a + r.apps, 0);
  return `Across ${firstY.year} to ${last.year}, the firms compiled in the dataset filed ${((100 * appsAll) / totalAll).toFixed(1)}% of certified H-1B applications; the yearly share peaked at ${peak.combined.toFixed(1)}% in ${peak.year} and was ${last.combined.toFixed(1)}% in ${last.year}.`;
}

const COLORS = [SERIES[0], SERIES[1], SERIES[2], SERIES[3], SERIES[4], INK, SEQUENTIAL[2], SEQUENTIAL[4], SERIES[5]];

export default function ItServicesMajorsShare() {
  const order = firmOrder(rows);
  const ys = byYear(rows);
  return (
    <Exhibit meta={meta} takeaway={takeaway(rows)}>
      <Plot height={400}>
        <BarChart data={ys} margin={CHART_MARGIN}>
          <GreenbarGrid />
          <XAxis dataKey="year" tick={AXIS_TICK} tickLine={false} axisLine={false} interval={0} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${v}%`} width={44} />
          <ChartTooltip valueFormat={(v: number) => `${Number(v).toFixed(1)}%`} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {order.map((f, i) => (
            <Bar
              key={f}
              dataKey={f}
              name={LABELS[f] ?? f}
              stackId="s"
              fill={COLORS[i % COLORS.length]}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </Plot>
    </Exhibit>
  );
}
