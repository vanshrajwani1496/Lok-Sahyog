export const PIE_COLORS = [
  "oklch(0.72 0.13 218)",
  "oklch(0.72 0.15 155)",
  "oklch(0.78 0.15 88)",
  "oklch(0.68 0.18 35)",
  "oklch(0.62 0.16 285)",
];

export const chartAxis = {
  grid: {
    stroke: "oklch(0.28 0.016 250)",
    strokeDasharray: "3 3",
    vertical: false,
  },
  axis: {
    stroke: "oklch(0.45 0.016 250)",
    tick: { fill: "oklch(0.68 0.015 250)", fontSize: 11 },
    tickLine: false,
    axisLine: false,
  },
} as const;

export const chartTooltip = {
  contentStyle: {
    background: "oklch(0.22 0.016 250)",
    border: "1px solid oklch(0.32 0.016 250)",
    borderRadius: 8,
    fontSize: 12,
    color: "oklch(0.95 0.006 250)",
  },
  labelStyle: { color: "oklch(0.68 0.015 250)", fontSize: 11 },
  itemStyle: { color: "oklch(0.95 0.006 250)" },
} as const;
