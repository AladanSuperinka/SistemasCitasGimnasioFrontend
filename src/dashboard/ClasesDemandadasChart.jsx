import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function ClasesDemandadasChart({ data }) {
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="clase" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="inscritos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
