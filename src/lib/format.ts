const compactFmt = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const intFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const usdFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usdCompactFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

/** 1,234,567 -> "1.2M" */
export const compact = (n: number) => compactFmt.format(n);
/** 1234567 -> "1,234,567" */
export const int = (n: number) => intFmt.format(n);
/** 85000 -> "$85,000" */
export const usd = (n: number) => usdFmt.format(n);
/** 1250000 -> "$1.3M" */
export const usdCompact = (n: number) => usdCompactFmt.format(n);
/** Fraction to percent: 0.4321 -> "43%" (digits = 1 -> "43.2%") */
export const pct = (fraction: number, digits = 0) => `${(fraction * 100).toFixed(digits)}%`;
/** Percentage points already scaled to 0-100: 43.21 -> "43%" */
export const pctPoints = (points: number, digits = 0) => `${points.toFixed(digits)}%`;
