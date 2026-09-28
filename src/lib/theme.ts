// Design tokens shared by every chart. Colors mirror the CSS variables in globals.css.
export const INK = "#14213D";
export const INK_SOFT = "#4A5570";
export const PAPER = "#F6F9F4";
export const GREENBAR = "#E1EEDF";
export const STAMP = "#C8372D";
export const HIGHLIGHT = "#E0A526";

/** Categorical series colors, in order of use. Federal blue leads; red is the stamp color. */
export const SERIES = ["#1F4E9C", "#C8372D", "#E0A526", "#1E8C7A", "#7B4B94", "#5A6B7D"] as const;

/** Light-to-deep sequential ramp for choropleths and heat cells (5 classes). */
export const SEQUENTIAL = ["#DCEBDD", "#9CCBB0", "#4FA08E", "#23777C", "#154A66"] as const;

export const AXIS_TICK = {
  fill: INK_SOFT,
  fontSize: 12,
  fontFamily: "var(--font-body), system-ui, sans-serif",
} as const;

export const CHART_MARGIN = { top: 8, right: 16, bottom: 4, left: 4 } as const;
