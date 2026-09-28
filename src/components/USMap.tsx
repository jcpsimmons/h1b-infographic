import { feature } from "topojson-client";
import { geoPath } from "d3-geo";
import { scaleQuantile } from "d3-scale";
import type { FeatureCollection, Geometry } from "geojson";
import type { Topology, GeometryCollection } from "topojson-specification";
import topology from "us-atlas/states-albers-10m.json";
import { STATE_BY_FIPS } from "@/lib/states";
import { GREENBAR, INK, INK_SOFT, PAPER, SEQUENTIAL } from "@/lib/theme";

const topo = topology as unknown as Topology<{ states: GeometryCollection<{ name: string }> }>;
const states = feature(topo, topo.objects.states) as unknown as FeatureCollection<Geometry, { name: string }>;
const path = geoPath();

/**
 * Choropleth of US states in five quantile classes.
 * values: postal abbreviation -> number (missing states are drawn pale).
 * Native <title> tooltips work without JavaScript.
 */
export function USMap({
  values,
  format,
  label,
}: {
  values: Record<string, number | null | undefined>;
  format: (n: number) => string;
  /** accessible description, e.g. "Certified H-1B filings by worksite state" */
  label: string;
}) {
  const nums = Object.values(values).filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  const scale = scaleQuantile<string>().domain(nums).range([...SEQUENTIAL]);
  const cuts = scale.quantiles();
  const lo = nums.length ? Math.min(...nums) : 0;
  const hi = nums.length ? Math.max(...nums) : 0;
  const edges = [lo, ...cuts, hi];

  return (
    <div style={{ width: "100%" }}>
      <svg viewBox="0 0 975 610" role="img" aria-label={label} style={{ width: "100%", height: "auto", display: "block" }}>
        {states.features.map((f, i) => {
          const fips = String((f as { id?: string | number }).id ?? "").padStart(2, "0");
          const info = STATE_BY_FIPS[fips];
          const v = info ? values[info.abbr] : undefined;
          const has = typeof v === "number" && Number.isFinite(v);
          return (
            <path key={i} d={path(f) ?? ""} fill={has ? scale(v as number) : GREENBAR} stroke={PAPER} strokeWidth={1}>
              <title>{`${info?.name ?? f.properties.name}: ${has ? format(v as number) : "no data"}`}</title>
            </path>
          );
        })}
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, color: INK_SOFT }}>
        <span>Lower</span>
        {SEQUENTIAL.map((c, i) => (
          <span key={c} style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ width: 44, height: 12, background: c, border: `1px solid ${INK}` }} />
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              {format(edges[i])} to {format(edges[i + 1])}
            </span>
          </span>
        ))}
        <span>Higher</span>
      </div>
    </div>
  );
}
