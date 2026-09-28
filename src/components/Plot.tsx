"use client";

import { cloneElement, useEffect, useRef, useState, type ReactElement } from "react";

const SERVER_WIDTH = 880;
/** Below this width a chart stops shrinking and scrolls sideways inside its frame instead, so labels stay legible on phones. */
const MIN_WIDTH = 460;

/**
 * Sized wrapper for a Recharts chart. Always pass the chart element (AreaChart, BarChart,
 * LineChart, ComposedChart, ScatterChart...) as the single direct child; Plot supplies width and height.
 * It renders at a fixed width on the server, then fits its container.
 */
export function Plot({ children, height = 340 }: { children: ReactElement<{ width?: number; height?: number }>; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(SERVER_WIDTH);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => setWidth(Math.floor(el.getBoundingClientRect().width));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ width: "100%", overflowX: "auto", overflowY: "hidden" }}>
      {cloneElement(children, { width: Math.max(width, MIN_WIDTH), height })}
    </div>
  );
}
