import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";

const h = React.createElement;

const getDemandColor = (score) => {
  if (score >= 81) return "#ef4444";
  if (score >= 61) return "#f59e0b";
  if (score >= 41) return "#3b82f6";
  if (score >= 21) return "#10b981";
  return "#64748b";
};

const legendItems = [
  ["bg-emerald-500", "Watch"],
  ["bg-blue-500", "Elevated"],
  ["bg-amber-500", "High"],
  ["bg-red-500", "Critical"],
];

const MatrixTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return h(
    "div",
    { className: "bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-xs font-mono space-y-1 shadow-xl" },
    h("p", { className: "font-bold font-sans" }, data.fullName),
    h("p", { className: "text-blue-300" }, `Demand Scale: ${data.score}/100`),
    h("p", { className: "text-emerald-400" }, `Risk Band: ${data.risk}`),
    h("p", { className: "text-slate-300" }, `Trend: ${data.trend}`),
    h("p", { className: "text-slate-300" }, `News Signals: ${data.news}`)
  );
};

export default function DemandBenchmarkGraph({ data }) {
  const hasData = data.length > 0;

  return h(
    "div",
    { className: "lg:col-span-7 border border-slate-200 p-4 rounded-xl bg-slate-50/50 min-h-80 flex flex-col" },
    h(
      "div",
      { className: "flex items-center justify-between gap-3 mb-2" },
      h(
        "div",
        null,
        h(
          "span",
          { className: "block text-[10px] font-mono text-slate-400 uppercase tracking-wider" },
          "Benchmarking Matrix (0-100 Demand Scale)"
        ),
        h(
          "span",
          { className: "block text-[10px] font-mono text-slate-500 mt-1" },
          "Stored analyses ranked against sourcing pressure thresholds."
        )
      ),
      h(
        "div",
        { className: "hidden sm:flex items-center gap-2 text-[9px] font-mono text-slate-400" },
        ...legendItems.map(([colorClass, label]) =>
          h(
            "span",
            { key: label, className: "inline-flex items-center gap-1" },
            h("span", { className: `h-2 w-2 ${colorClass} rounded-sm` }),
            label
          )
        )
      )
    ),
    hasData
      ? h(
          "div",
          { className: "flex-1 min-h-60 w-full" },
          h(
            ResponsiveContainer,
            { width: "100%", height: "100%" },
            h(
              BarChart,
              { data, layout: "vertical", margin: { top: 8, right: 26, left: 22, bottom: 8 } },
              h(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e2e8f0", horizontal: false }),
              h(XAxis, {
                type: "number",
                domain: [0, 100],
                ticks: [0, 20, 40, 60, 80, 100],
                tick: { fill: "#64748b", fontSize: 9, fontFamily: "JetBrains Mono" },
                tickLine: false,
                axisLine: false,
              }),
              h(YAxis, {
                type: "category",
                dataKey: "name",
                width: 118,
                tick: { fill: "#334155", fontSize: 10, fontFamily: "JetBrains Mono", fontWeight: 700 },
                tickLine: false,
                axisLine: false,
              }),
              h(ReferenceLine, { x: 60, stroke: "#f59e0b", strokeDasharray: "4 4" }),
              h(ReferenceLine, { x: 80, stroke: "#ef4444", strokeDasharray: "4 4" }),
              h(Tooltip, { content: h(MatrixTooltip) }),
              h(
                Bar,
                {
                  dataKey: "score",
                  radius: [0, 5, 5, 0],
                  maxBarSize: 24,
                  label: { position: "right", fill: "#475569", fontSize: 10, fontFamily: "JetBrains Mono" },
                },
                ...data.map((entry, index) =>
                  h(Cell, {
                    key: `benchmark-cell-${entry.fullName}-${index}`,
                    fill: getDemandColor(entry.score),
                  })
                )
              )
            )
          )
        )
      : h(
          "div",
          { className: "flex-1 min-h-48 flex items-center justify-center text-slate-400 italic text-xs font-mono" },
          "Synthesize an evaluation run to populate chart benchmark matrices."
        )
  );
}
