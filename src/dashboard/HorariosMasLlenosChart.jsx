import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function buildChartData(items) {
  const list = Array.isArray(items) ? items : [];

  // arma etiquetas cortas para el eje X
  return list.map((it) => {
    const dia = String(it.day_of_week ?? it.dia ?? "—").toUpperCase();
    const start = String(it.start_time ?? it.inicio ?? "").slice(0, 5);
    const end = String(it.end_time ?? it.fin ?? "").slice(0, 5);
    const clase = it.class_name ?? it.clase ?? "—";

    // 👇 acá es donde hoy te está fallando (no llega enrolled)
    const inscritos = Number(
      it.enrolled ?? it.inscritos ?? it.enrollments ?? it.total_enrolled ?? 0
    );

    return {
      label: `${dia} ${start}-${end} · ${clase}`,
      inscritos,
      dia,
      start,
      end,
      clase,
      instructor: it.instructor_email ?? it.instructor ?? "—",
    };
  });
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const d = payload[0].payload;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950/90 px-4 py-3 backdrop-blur">
      <p className="text-xs text-zinc-400">{d.label}</p>
      <p className="text-sm text-zinc-300 mt-1">
        Instructor: <b className="text-zinc-100">{d.instructor}</b>
      </p>
      <p className="text-base font-bold text-zinc-100 mt-2">
        Inscritos: {d.inscritos}
      </p>
    </div>
  );
}

export default function HorariosMasLlenosChart({ data }) {
  const chartData = buildChartData(data);

  const total = chartData.reduce((acc, x) => acc + (x.inscritos || 0), 0);

  return (
    <div style={{ width: "100%", height: 320 }}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-zinc-400">Inscritos por horario (Top)</p>
        <span className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5 text-zinc-200">
          Total inscritos (Top): <b>{total}</b>
        </span>
      </div>

      <ResponsiveContainer>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            interval={0}
            tick={{ fontSize: 11 }}
            angle={-10}
            textAnchor="end"
            height={70}
          />
          <YAxis allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="inscritos" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
