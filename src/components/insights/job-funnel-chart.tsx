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

type JobFunnelChartProps = {
  data: Array<{ label: string; count: number; percent: number }>;
};

const barColors = ["#14b8a6", "#60a5fa", "#f59e0b", "#fb7185"];

export function JobFunnelChart({ data }: JobFunnelChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value, name, item) => [
              `${value} 个`,
              item.payload.percent === 100 ? "数量" : `数量（${item.payload.percent}%）`
            ]}
          />
          <Bar dataKey="count" barSize={28} radius={[6, 6, 0, 0]}>
            {data.map((item, index) => (
              <Cell key={item.label} fill={barColors[index % barColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
