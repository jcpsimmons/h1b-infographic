"use client";

import { Line, LineChart, XAxis, YAxis } from "recharts";
import data from "@/data/tech-vs-services.json";
import { Exhibit } from "@/components/Exhibit";
import { Plot } from "@/components/Plot";
import { GreenbarGrid } from "@/components/GreenbarGrid";
import { ChartTooltip } from "@/components/ChartTooltip";
import { compact, int } from "@/lib/format";
import { AXIS_TICK, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = { year: number; tech: number; services: number };

export const meta = {
  id: "tech-vs-services",
  section: "employers",
  order: 40,
  title: "Certified H-1B applications: five big tech employers vs five IT-services majors",
  width: "full",
  sources: ["LCA-PERM/filing_current", "STAFFING-MAJORS"],
  caveat:
    "Counts applications (LCAs) with final status CERTIFIED, by decision year 2010 to 2025. Tech = Amazon, Google, Microsoft, Meta/Facebook and Apple, matched on employer name with explicit patterns, so some subsidiaries and spellings are missed, and staffing or contractor filings made for these companies are not counted. Services = the five IT-services firms in the dataset's curated list with the most certified applications in 2025 (Cognizant, TCS, Infosys, Accenture, HCL); attribution is an apparent data relationship, not proof of anything.",
} satisfies ChartMeta;

export function takeaway(rows: Datum[]): string {
  const peak = rows.reduce((a, b) => (b.services > a.services ? b : a));
  const last = rows[rows.length - 1];
  const cross = rows.find((r, i) => rows.slice(i).every((x) => x.tech > x.services));
  const when = cross ? `Tech passed the services group in ${cross.year} and has stayed ahead. ` : "";
  return `${when}Services applications peaked at ${int(peak.services)} in ${peak.year}; by ${last.year} they were ${int(last.services)}, against ${int(last.tech)} for the five tech employers.`;
}

const LINES = [
  { key: "tech", label: "Five tech employers", color: SERIES[0] },
  { key: "services", label: "Five IT-services majors", color: SERIES[1] },
] as const;

export default function TechVsServices() {
  const rows = data as Datum[];
  const lastYear = rows[rows.length - 1].year;
  return (
    <Exhibit meta={meta} takeaway={takeaway(rows)}>
      <Plot height={380}>
        <LineChart data={rows} margin={{ top: 8, right: 150, bottom: 4, left: 4 }}>
          <GreenbarGrid />
          <XAxis dataKey="year" tick={AXIS_TICK} tickLine={false} axisLine={false} interval={1} />
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={compact} width={48} />
          <ChartTooltip valueFormat={int} />
          {LINES.map((l) => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.label}
              stroke={l.color}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
              label={(p: { x?: number | string; y?: number | string; index?: number }) =>
                rows[p.index ?? -1]?.year === lastYear ? (
                  <text key={l.key} x={Number(p.x ?? 0) + 8} y={Number(p.y ?? 0) + 4} fill={l.color} fontSize={12} fontWeight={600}>
                    {l.label}
                  </text>
                ) : (
                  <g key={`${l.key}-${p.index}`} />
                )
              }
            />
          ))}
        </LineChart>
      </Plot>
    </Exhibit>
  );
}
