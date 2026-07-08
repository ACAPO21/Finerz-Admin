import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MetricPoint } from "../api";

export function MetricChart(props: {
  data: MetricPoint[];
  color: string;
  unitSuffix?: string;
  height?: number;
}) {
  if (props.data.length === 0) {
    return <p className="empty-note">Aucune donnée sur cette période.</p>;
  }

  const chartData = props.data.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    value: point.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={props.height ?? 160}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11, fill: "var(--muted)" }}
          interval="preserveStartEnd"
          axisLine={{ stroke: "rgba(15, 26, 46, 0.12)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted)" }}
          width={46}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => [`${Number(value).toFixed(2)}${props.unitSuffix ?? ""}`, ""]}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid rgba(15, 26, 46, 0.08)",
            fontSize: "0.8rem",
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={props.color}
          dot={false}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
