"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import data from "@/data/fuel-forecourt-worksites.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { int, pctPoints } from "@/lib/format";
import { AXIS_TICK, CHART_MARGIN, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = {
  year: number;
  certified: number;
  resolvable: number;
  unresolvable: number;
  tank_matches: number;
  tank_matches_gas_naics: number;
  match_pct: number;
};

const rows = data as Datum[];
const unresolvableTotal = rows.reduce((s, r) => s + r.unresolvable, 0);
const certifiedTotal = rows.reduce((s, r) => s + r.certified, 0);

export const meta = {
  id: "fuel-forecourt-worksites",
  section: "linked",
  order: 20,
  title: "Certified H-1B applications at an address registered as a fuel tank facility",
  width: "full",
  sources: ["LCA-PERM/filing_current", "LCA-PERM/worksite_addr_key", "FUEL-PUMPS/facility"],
  caveat: `Share of certified applications (status CERTIFIED) with a resolvable primary worksite address whose address key (house number, first street word, city, state) matches an EPA-registered underground tank facility with at least one open tank. A match shows only that the address is on the tank register, not what the premises are or what work is done there; facilities without a house-numbered address cannot be matched. ${int(unresolvableTotal)} of ${int(certifiedTotal)} applications (${pctPoints((unresolvableTotal / certifiedTotal) * 100, 1)}) have an unresolvable address key and are left out of the share, not counted as non-matches. Shown for 2020 to 2025 only, because worksite addresses are blank before 2019 and mostly blank in 2019.`,
} satisfies ChartMeta;

/** One or two sentences computed from the data, so the text can never drift from the chart. */
export function takeaway(rows: Datum[]): string {
  const lo = rows.reduce((a, b) => (b.match_pct < a.match_pct ? b : a));
  const hi = rows.reduce((a, b) => (b.match_pct > a.match_pct ? b : a));
  const matches = rows.reduce((s, r) => s + r.tank_matches, 0);
  const gas = rows.reduce((s, r) => s + r.tank_matches_gas_naics, 0);
  return `Between ${pctPoints(lo.match_pct, 1)} (${lo.year}) and ${pctPoints(hi.match_pct, 1)} (${hi.year}) of applications sit at a registered tank address; ${int(gas)} of the ${int(matches)} matches list a gasoline-station industry code.`;
}

export default function FuelForecourtWorksites() {
  return (
    <Exhibit meta={meta} takeaway={takeaway(rows)}>
      <Plot>
        <BarChart data={rows} margin={CHART_MARGIN}>
          <GreenbarGrid />
          <XAxis dataKey="year" tick={AXIS_TICK} tickLine={false} axisLine={false} />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={44}
            domain={[0, 8]}
            tickFormatter={(v: number) => `${v}%`}
          />
          <ChartTooltip valueFormat={(v: number) => pctPoints(v, 2)} />
          <Bar dataKey="match_pct" name="Share at a tank address" fill={SERIES[0]} isAnimationActive={false} />
        </BarChart>
      </Plot>
    </Exhibit>
  );
}
