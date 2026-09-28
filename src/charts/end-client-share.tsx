"use client";

import { Line, LineChart, XAxis, YAxis } from "recharts";
import data from "@/data/end-client-share.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { int, pctPoints } from "@/lib/format";
import { AXIS_TICK, CHART_MARGIN, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = {
  year: number;
  total: number;
  named: number;
  placeholder: number;
  yes_no_name: number;
  named_pct: number;
  placeholder_pct: number;
  yes_no_name_pct: number;
};

export const meta = {
  id: "end-client-share",
  section: "practice",
  order: 10,
  title: "Share of certified H-1B applications that name an end client",
  width: "full",
  sources: ["LCA-PERM/filing_current"],
  caveat:
    "Counts certified applications (status CERTIFIED). 'Names an end client' means the secondary-entity field is Yes and the secondary name is a non-blank name that does not match a home or remote-work placeholder such as 'home address', 'beneficiary's residence' or 'remote'; the placeholder pattern is not exhaustive, so some placeholders still count as named. The field is only fully populated from 2020, so earlier years and the partial year 2026 are left out.",
} satisfies ChartMeta;

export function takeaway(rows: Datum[]): string {
  const first = rows[0];
  const last = rows[rows.length - 1];
  return `${pctPoints(first.named_pct, 1)} of certified applications named an end client in ${first.year}, falling to ${pctPoints(last.named_pct, 1)} in ${last.year} (${int(last.named)} of ${int(last.total)}). A further ${pctPoints(last.placeholder_pct, 1)} answered Yes but gave a home or remote-work placeholder instead of a name.`;
}

export default function EndClientShare() {
  const rows = data as Datum[];
  return (
    <Exhibit meta={meta} takeaway={takeaway(rows)}>
      <Plot>
        <LineChart data={rows} margin={{ ...CHART_MARGIN, right: 200 }}>
          <GreenbarGrid />
          <XAxis dataKey="year" tick={AXIS_TICK} tickLine={false} axisLine={false} />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => pctPoints(v)}
            width={48}
            domain={[0, 40]}
          />
          <ChartTooltip valueFormat={(v: number) => pctPoints(v, 1)} />
          <Line
            type="monotone"
            dataKey="named_pct"
            name="Names an end client"
            stroke={SERIES[0]}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            isAnimationActive={false}
            label={(p: { x?: number | string; y?: number | string; index?: number }) =>
              p.index === rows.length - 1 ? (
                <text key="a" x={Number(p.x ?? 0) + 10} y={Number(p.y ?? 0) + 4} fontSize={13} fill={SERIES[0]}>
                  Names an end client
                </text>
              ) : (
                <g key={`a${p.index}`} />
              )
            }
          />
          <Line
            type="monotone"
            dataKey="placeholder_pct"
            name="Yes, but a home or remote placeholder"
            stroke={SERIES[1]}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            isAnimationActive={false}
            label={(p: { x?: number | string; y?: number | string; index?: number }) =>
              p.index === rows.length - 1 ? (
                <text key="b" x={Number(p.x ?? 0) + 10} y={Number(p.y ?? 0) - 6} fontSize={13} fill={SERIES[1]}>
                  Home or remote placeholder
                </text>
              ) : (
                <g key={`b${p.index}`} />
              )
            }
          />
        </LineChart>
      </Plot>
    </Exhibit>
  );
}
