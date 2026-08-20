import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  VALID: "#16a34a",
  INVALID: "#dc2626",
  TAMPERED: "#dc2626",
  REVOKED: "#d97706",
  EXPIRED: "#d97706",
  ACTIVE: "#16a34a",
  DRAFT: "#d97706",
  PENDING: "#d97706",
  CONFIRMED: "#16a34a",
  FAILED: "#dc2626",
  ADMIN: "#143C8C",
  INSTITUTION: "#3b82f6",
  STUDENT: "#16a34a",
};

export function BarsChart({
  data,
  xKey = "month",
  color = "#143C8C",
  height = 260,
}: {
  data: ChartPoint[];
  xKey?: string;
  color?: string;
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }} role="img" aria-label="Bar chart">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusPieChart({
  data,
  height = 240,
  labelKey = "status",
}: {
  data: ChartPoint[];
  height?: number;
  labelKey?: string;
}) {
  return (
    <div style={{ width: "100%", height }} role="img" aria-label="Pie chart">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey={labelKey} innerRadius={50} outerRadius={90} paddingAngle={2}>
            {data.map((entry) => {
              const row = entry as unknown as { [k: string]: string | number | undefined };
              const label = String(row[labelKey]);
              return <Cell key={label} fill={STATUS_COLORS[label] ?? "#94a3b8"} />;
            })}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendLineChart({
  data,
  xKey = "day",
  height = 260,
}: {
  data: ChartPoint[];
  xKey?: string;
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }} role="img" aria-label="Line chart">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}