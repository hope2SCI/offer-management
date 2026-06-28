"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type StatusChartProps = {
  data: Array<{ status: string; name: string; value: number }>;
};

const STATUS_COLORS: Record<string, string> = {
  INTERESTED: "#64748b",
  APPLIED: "#0284c7",
  WRITTEN_TEST: "#7c3aed",
  FIRST_INTERVIEW: "#4f46e5",
  SECOND_INTERVIEW: "#2563eb",
  HR_INTERVIEW: "#0891b2",
  OFFER: "#059669",
  ENDED: "#e11d48"
};

export function StatusChart({ data }: StatusChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="34%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            contentStyle={{
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              boxShadow: "0 8px 24px rgb(15 23 42 / 0.08)"
            }}
          />
          <Bar
            dataKey="value"
            barSize={22}
            isAnimationActive={false}
            radius={[6, 6, 0, 0]}
          >
            {data.map((item) => (
              <Cell
                key={item.status}
                fill={STATUS_COLORS[item.status] ?? "#0f766e"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
