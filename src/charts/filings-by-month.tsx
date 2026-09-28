"use client";

import data from "@/data/filings-by-month.json";
import { Exhibit } from "@/components/Exhibit";
import { compact, int, pct } from "@/lib/format";
import { INK, INK_SOFT, SEQUENTIAL } from "@/lib/theme";
import type { ChartMeta } from "@/lib/types";

type Datum = { year: number; month: number; n: number; gap: boolean };

const gapMonths = (data as Datum[]).filter((r) => r.gap);
const MONTH_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const gapText = gapMonths.length
  ? `${gapMonths.map((r) => `${MONTH_LONG[r.month - 1]} ${r.year}`).join(", ")} ${gapMonths.length === 1 ? "has" : "have"} almost no records in the data (${gapMonths.map((r) => int(r.n)).join(", ")} applications), so ${gapMonths.length === 1 ? "it is" : "they are"} shown as missing, not as a low month. `
  : "";

export const meta = {
  id: "filings-by-month",
  section: "volume",
  order: 40,
  title: "H-1B applications received, by month and year",
  width: "full",
  sources: ["LCA-PERM/filing_current"],
  caveat: `Counts applications (LCAs) by the month the Department of Labor received them, 2010 to 2025, whatever their final status. Shade classes are quintiles of the monthly counts. ${gapText}Monthly shares in the takeaway use only years with no missing month. 2026 (partial year) is left out.`,
} satisfies ChartMeta;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Years in which no month is flagged as missing data. */
function completeYears(rows: Datum[]): Set<number> {
  const all = new Set(rows.map((r) => r.year));
  for (const r of rows) if (r.gap) all.delete(r.year);
  return all;
}

/** Share of each year's applications received in each month (index 0 = January), complete years only. */
function yearShares(rows: Datum[]): Map<number, number[]> {
  const ok = completeYears(rows);
  const totals = new Map<number, number>();
  for (const r of rows) if (ok.has(r.year)) totals.set(r.year, (totals.get(r.year) ?? 0) + r.n);
  const out = new Map<number, number[]>();
  for (const r of rows) {
    if (!ok.has(r.year)) continue;
    const arr = out.get(r.year) ?? new Array(12).fill(0);
    arr[r.month - 1] = r.n / (totals.get(r.year) as number);
    out.set(r.year, arr);
  }
  return out;
}

/** Average share of a year's applications that arrive in each month (index 0 = January). */
function monthShares(rows: Datum[]): number[] {
  const ys = yearShares(rows);
  const shares = new Array(12).fill(0);
  for (const arr of ys.values()) arr.forEach((v, i) => (shares[i] += v / ys.size));
  return shares;
}

/** Lower edges of the 5 quantile classes (4 inner breakpoints), over months that are not missing. */
function breaks(rows: Datum[]): number[] {
  const v = rows.filter((r) => !r.gap).map((r) => r.n).sort((a, b) => a - b);
  return [1, 2, 3, 4].map((k) => v[Math.floor((k * v.length) / 5)]);
}

export function takeaway(rows: Datum[]): string {
  const s = monthShares(rows);
  const hi = s.indexOf(Math.max(...s));
  const lo = s.indexOf(Math.min(...s));
  // How much the busiest month's share of a year varies from year to year.
  const byYear = [...yearShares(rows).entries()].map(([year, arr]) => ({ year, v: arr[hi] }));
  const top = byYear.reduce((a, b) => (b.v > a.v ? b : a));
  const bottom = byYear.reduce((a, b) => (b.v < a.v ? b : a));
  return `${MONTH_NAMES[hi]} is the busiest month, averaging ${pct(s[hi], 1)} of a year's applications; ${MONTH_NAMES[lo]} is the quietest at ${pct(s[lo], 1)}. ${MONTH_NAMES[hi]}'s share ranged from ${pct(top.v, 1)} in ${top.year} to ${pct(bottom.v, 1)} in ${bottom.year}.`;
}

export default function FilingsByMonth() {
  const rows = data as Datum[];
  const years = Array.from(new Set(rows.map((r) => r.year))).sort((a, b) => a - b);
  const cuts = breaks(rows);
  const cls = (n: number) => cuts.filter((c) => n >= c).length;
  const byKey = new Map(rows.map((r) => [`${r.year}-${r.month}`, r.n]));
  const gapKeys = new Set(rows.filter((r) => r.gap).map((r) => `${r.year}-${r.month}`));

  const left = 52, top = 30, cw = 64, ch = 34, gap = 2;
  const gridW = 12 * cw;
  const gridH = years.length * ch;
  const legendY = top + gridH + 26;
  const W = left + gridW + 8;
  const H = legendY + 30;
  const label = (i: number) => {
    const lo = i === 0 ? 0 : cuts[i - 1];
    return i === 4 ? `${compact(lo)}+` : `${compact(lo)} to ${compact(cuts[i] - 1)}`;
  };

  return (
    <Exhibit meta={meta} takeaway={takeaway(rows)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Heat grid of H-1B applications received per month, years 2010 to 2025; October 2025 is marked as missing data"
        style={{ width: "100%", height: "auto" }}
      >
        {MONTHS.map((m, i) => (
          <text key={m} x={left + i * cw + cw / 2} y={top - 10} textAnchor="middle" fontSize={13} fill={INK_SOFT}>
            {m}
          </text>
        ))}
        {years.map((y, ri) => (
          <g key={y}>
            <text x={left - 8} y={top + ri * ch + ch / 2 + 4} textAnchor="end" fontSize={13} fill={INK_SOFT}>
              {y}
            </text>
            {MONTHS.map((m, ci) => {
              const n = byKey.get(`${y}-${ci + 1}`) ?? 0;
              if (gapKeys.has(`${y}-${ci + 1}`)) {
                return (
                  <g key={m}>
                    <rect x={left + ci * cw} y={top + ri * ch} width={cw - gap} height={ch - gap} rx={2} fill="none" stroke={INK_SOFT} strokeDasharray="4 3">
                      <title>{`${MONTH_NAMES[ci]} ${y}: almost no records in the data (${int(n)} applications), shown as missing`}</title>
                    </rect>
                    <text x={left + ci * cw + (cw - gap) / 2} y={top + ri * ch + ch / 2 + 3} textAnchor="middle" fontSize={12} fill={INK_SOFT} pointerEvents="none">
                      no data
                    </text>
                  </g>
                );
              }
              const c = cls(n);
              return (
                <g key={m}>
                  <rect x={left + ci * cw} y={top + ri * ch} width={cw - gap} height={ch - gap} rx={2} fill={SEQUENTIAL[c]}>
                    <title>{`${MONTH_NAMES[ci]} ${y}: ${int(n)} applications`}</title>
                  </rect>
                  <text
                    x={left + ci * cw + (cw - gap) / 2}
                    y={top + ri * ch + ch / 2 + 3}
                    textAnchor="middle"
                    fontSize={12}
                    fill={c >= 3 ? "#FFFFFF" : INK}
                    pointerEvents="none"
                  >
                    {compact(n)}
                  </text>
                </g>
              );
            })}
          </g>
        ))}
        <text x={left} y={legendY + 12} fontSize={12} fill={INK_SOFT}>
          Applications per month
        </text>
        {SEQUENTIAL.map((col, i) => (
          <g key={col}>
            <rect x={left + 170 + i * 120} y={legendY} width={18} height={16} rx={2} fill={col} />
            <text x={left + 170 + i * 120 + 24} y={legendY + 13} fontSize={12} fill={INK_SOFT}>
              {label(i)}
            </text>
          </g>
        ))}
      </svg>
    </Exhibit>
  );
}
