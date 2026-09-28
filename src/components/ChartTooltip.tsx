"use client";

import { Tooltip } from "recharts";
import { int } from "@/lib/format";
import { INK, INK_SOFT, PAPER } from "@/lib/theme";

type Entry = { name?: unknown; value?: unknown; color?: string; dataKey?: unknown };

/** Themed Recharts tooltip. valueFormat formats each number, labelFormat formats the axis label. */
export function ChartTooltip({
  valueFormat = int,
  labelFormat = (l: unknown) => String(l),
}: {
  valueFormat?: (n: number) => string;
  labelFormat?: (label: unknown) => string;
}) {
  return (
    <Tooltip
      isAnimationActive={false}
      cursor={{ stroke: INK_SOFT, strokeDasharray: "3 3" }}
      content={({ active, payload, label }: { active?: boolean; payload?: readonly Entry[]; label?: unknown }) => {
        if (!active || !payload || payload.length === 0) return null;
        return (
          <div
            style={{
              background: PAPER,
              border: `1px solid ${INK}`,
              padding: "8px 10px",
              fontFamily: "var(--font-body), system-ui, sans-serif",
              fontSize: 13,
              color: INK,
              boxShadow: "3px 3px 0 rgba(20,33,61,0.18)",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{labelFormat(label)}</div>
            {payload.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                <span style={{ width: 10, height: 10, background: p.color, display: "inline-block" }} />
                <span>{String(p.name ?? p.dataKey ?? "")}</span>
                <span style={{ marginLeft: "auto", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                  {typeof p.value === "number" ? valueFormat(p.value) : String(p.value ?? "")}
                </span>
              </div>
            ))}
          </div>
        );
      }}
    />
  );
}
