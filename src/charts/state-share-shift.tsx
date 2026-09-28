"use client";

import data from "@/data/state-share-shift.json";
import { Exhibit } from "@/components/Exhibit";
import { INK, INK_SOFT, GREENBAR, SERIES } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = {
  state: string;
  n_2010: number;
  share_2010: number;
  n_2025: number;
  share_2025: number;
  change_pp: number;
};

export const meta = {
  id: "state-share-shift",
  section: "geography",
  order: 20,
  title: "Share of certified H-1B applications by employer's state, 2010 and 2025",
  width: "full",
  sources: ["LCA-PERM/filing_current"],
  caveat:
    "Counts applications (LCAs) by the employer's state, because the worksite state is mostly blank in 2010. 'Certified' means final status CERTIFIED. Shares are of certified applications with a U.S. state or DC; the 12 states with the largest 2025 share are shown.",
} satisfies ChartMeta;

const pp = (n: number) => `${Math.abs(n).toFixed(1)} percentage points`;

export function takeaway(rows: Datum[]): string {
  const up = rows.reduce((a, b) => (b.change_pp > a.change_pp ? b : a));
  const down = rows.reduce((a, b) => (b.change_pp < a.change_pp ? b : a));
  return `Counting by the employer's state, ${up.state} gained the most share among these 12 states, up ${pp(up.change_pp)} to ${up.share_2025.toFixed(1)}%. ${down.state} lost the most, down ${pp(down.change_pp)} to ${down.share_2025.toFixed(1)}%.`;
}

export default function StateShareShift() {
  const rows = data as Datum[];
  const W = 760;
  const rowH = 32;
  const top = 34;
  const left = 48;
  const right = 24;
  const H = top + rows.length * rowH + 12;
  const max = Math.ceil(Math.max(...rows.flatMap((r) => [r.share_2010, r.share_2025])) / 5) * 5;
  const x = (v: number) => left + (v / max) * (W - left - right);
  const ticks = Array.from({ length: max / 5 + 1 }, (_, i) => i * 5);
  const up = rows.reduce((a, b) => (b.change_pp > a.change_pp ? b : a)).state;
  const down = rows.reduce((a, b) => (b.change_pp < a.change_pp ? b : a)).state;

  return (
    <Exhibit meta={meta} takeaway={takeaway(rows)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Dumbbell chart of each top employer state's share of certified H-1B applications in 2010 and 2025"
        style={{ width: "100%", height: "auto" }}
      >
        {rows.map((r, i) =>
          i % 2 === 0 ? (
            <rect key={r.state} x={0} y={top + i * rowH} width={W} height={rowH} fill={GREENBAR} />
          ) : null,
        )}
        {ticks.map((t) => (
          <text key={t} x={x(t)} y={top - 10} textAnchor="middle" fontSize={13} fill={INK_SOFT}>
            {t}%
          </text>
        ))}
        {rows.map((r, i) => {
          const cy = top + i * rowH + rowH / 2;
          const emph = r.state === up || r.state === down;
          const line = emph ? SERIES[1] : INK_SOFT;
          return (
            <g key={r.state}>
              <title>{`${r.state}: ${r.share_2010.toFixed(1)}% in 2010 (${r.n_2010.toLocaleString("en-US")} applications), ${r.share_2025.toFixed(1)}% in 2025 (${r.n_2025.toLocaleString("en-US")})`}</title>
              <text x={8} y={cy + 5} fontSize={14} fontWeight={emph ? 700 : 500} fill={INK}>
                {r.state}
              </text>
              <line x1={x(r.share_2010)} x2={x(r.share_2025)} y1={cy} y2={cy} stroke={line} strokeWidth={3} />
              <circle cx={x(r.share_2010)} cy={cy} r={6} fill="#fff" stroke={INK_SOFT} strokeWidth={2.5} />
              <circle cx={x(r.share_2025)} cy={cy} r={6.5} fill={SERIES[0]} />
              {emph ? (
                <text
                  x={Math.max(x(r.share_2010), x(r.share_2025)) + 14}
                  y={cy + 5}
                  fontSize={13}
                  fontWeight={700}
                  fill={SERIES[1]}
                >
                  {r.change_pp > 0 ? "+" : "-"}
                  {Math.abs(r.change_pp).toFixed(1)} pp
                </text>
              ) : null}
            </g>
          );
        })}
        <g transform={`translate(${W - 200}, ${H - 8 - rowH * 2.2})`} fontSize={13} fill={INK}>
          <circle cx={6} cy={0} r={6} fill="#fff" stroke={INK_SOFT} strokeWidth={2.5} />
          <text x={20} y={5}>2010</text>
          <circle cx={86} cy={0} r={6.5} fill={SERIES[0]} />
          <text x={100} y={5}>2025</text>
        </g>
      </svg>
    </Exhibit>
  );
}
