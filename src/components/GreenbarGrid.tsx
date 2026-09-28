"use client";

import { CartesianGrid } from "recharts";
import { GREENBAR } from "@/lib/theme";

/**
 * The alternating green bands of continuous-feed printout paper. They replace gridlines.
 * Use inside any Recharts cartesian chart. The default bands run behind each y-axis row, which is right for
 * line, area, column and horizontal-bar charts alike. `vertical` adds vertical bands instead (rarely needed).
 */
export function GreenbarGrid({ vertical = false }: { vertical?: boolean }) {
  return (
    <CartesianGrid
      stroke="none"
      horizontal={!vertical}
      vertical={vertical}
      horizontalFill={[GREENBAR, "transparent"]}
      verticalFill={[GREENBAR, "transparent"]}
      fillOpacity={1}
    />
  );
}
