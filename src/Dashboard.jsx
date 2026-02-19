import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";
import ClasesDemandadasChart from "./dashboard/ClasesDemandadasChart";
import HorariosMasLlenosChart from "./dashboard/HorariosMasLlenosChart";
import ResumenKpiChart from "./dashboard/ResumenKpiChart";


export default function Dashboard({ role }) {
  const [tab, setTab] = useState("summary"); 

  const [stats, setStats] = useState(null);
  const [topClasses, setTopClasses] = useState([]);
  const [topSchedules, setTopSchedules] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const card =
    "rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur";

  const loadAll = async () => {
    setError("");
    setLoading(true);
    try {
      const [s, tc, ts] = await Promise.all([
        apiFetch("/api/dashboard/stats"),
        apiFetch("/api/dashboard/top-classes"),
        apiFetch("/api/dashboard/top-schedules"),
      ]);

      setStats(s || null);
      setTopClasses(Array.isArray(tc) ? tc : []);
      setTopSchedules(Array.isArray(ts) ? ts : []);
    } catch (e) {
      setError(e.message || "Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabs = useMemo(
    () => [
      { key: "summary", label: "Resumen" },
      { key: "topClasses", label: "Clases más demandadas" },
      { key: "topSchedules", label: "Horarios más llenos" },
    ],
    []
  );

  // ---------- DATA PARA CHARTS ----------
  // Top clases: barras "inscritos por clase"
  const topClassesChartData = useMemo(() => {
    return (topClasses || []).map((c) => ({
      clase: c.class_name ?? "—",
      inscritos: Number(c.enrolled ?? 0),
    }));
  }, [topClasses]);

  // Top horarios: barras "total inscritos por día"
  const topSchedulesByDayChartData = useMemo(() => {
    const counts = {};

    (topSchedules || []).forEach((s) => {
      const raw = s.day_of_week ?? "—";
      const day = String(raw).toUpperCase();

      // suma inscritos (mejor KPI que solo contar filas)
      counts[day] = (counts[day] || 0) + Number(s.enrolled ?? 0);
    });

    const order = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"];

    return order
      .filter((d) => counts[d] != null)
      .map((d) => ({ dia: d, cantidad: counts[d] }));
  }, [topSchedules]);


    const resumenChartData = useMemo(() => {
    return [
      { name: "Alumnos", value: Number(stats?.students ?? 0) },
      { name: "Clases", value: Number(stats?.classes ?? 0) },
      { name: "Horarios", value: Number(stats?.schedules ?? 0) },
      { name: "Inscripciones", value: Number(stats?.enrollments ?? 0) },
    ];
  }, [stats]);


  return (
    <div className={`${card} p-6 min-w-0`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h3 className="text-3xl font-extrabold">Dashboard</h3>
          <p className="text-zinc-400 mt-1">Resumen de KPIs del sistema.</p>

          {/* Tabs */}
          <div className="mt-4 inline-flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-black/20 p-2">
            {tabs.map((t) => (
              <TabButton
                key={t.key}
                active={tab === t.key}
                onClick={() => setTab(t.key)}
                label={t.label}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5">
            Rol: <b>{role}</b>
          </span>
          <button
            onClick={loadAll}
            className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10"
          >
            {loading ? "Cargando..." : "Recargar"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
          {error}
        </div>
      )}

      {/* CONTENT */}
      <div className="mt-6 space-y-6 min-w-0">
        {/* SUMMARY */}
        {tab === "summary" && (
        <div className="space-y-4 min-w-0">
            {/* CHART RESUMEN */}
            <div className={`${card} p-6 bg-black/20 min-w-0`}>
            <div className="flex items-start justify-between gap-3">
                <div>
                <h4 className="text-2xl font-bold">Resumen</h4>
                <p className="text-zinc-400 mt-1">Vista general del sistema</p>
                </div>
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 min-w-0">
                <p className="text-sm text-zinc-400 mb-3">KPIs principales</p>
                <ResumenKpiChart data={resumenChartData} />
            </div>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <KpiCard title="Alumnos" value={stats?.students ?? "—"} />
            <KpiCard title="Clases" value={stats?.classes ?? "—"} />
            <KpiCard title="Horarios" value={stats?.schedules ?? "—"} />
            <KpiCard title="Inscripciones" value={stats?.enrollments ?? "—"} />
            </div>
        </div>
        )}


        {/* TOP CLASSES */}
        {tab === "topClasses" && (
          <div className={`${card} p-6 bg-black/20 min-w-0`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-2xl font-bold">Clases más demandadas</h4>
                <p className="text-zinc-400 mt-1">Ranking por inscritos</p>
              </div>
              <span className="text-xs text-zinc-400">
                {topClasses.length} item(s)
              </span>
            </div>

            {/* CHART */}
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 min-w-0">
              <p className="text-sm text-zinc-400 mb-3">Inscritos por clase</p>
              <ClasesDemandadasChart data={topClassesChartData} />
            </div>

            {/* TABLE */}
            <div className="mt-4 rounded-3xl border border-white/10 overflow-hidden min-w-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[720px]">
                  <thead className="bg-white/5">
                    <tr className="text-left whitespace-nowrap">
                      <Th>Clase</Th>
                      <Th>Nivel</Th>
                      <Th className="text-right">Inscritos</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {topClasses.map((c, idx) => (
                      <tr
                        key={`${c.class_id ?? c.id ?? c.class_name}-${idx}`}
                        className="border-t border-white/10 hover:bg-white/5"
                      >
                        <Td className="font-semibold whitespace-nowrap">
                          {c.class_name}
                        </Td>
                        <Td className="whitespace-nowrap">
                          {c.level ?? c.class_level ?? "—"}
                        </Td>
                        <Td className="text-right whitespace-nowrap">
                          {c.enrolled ?? 0}
                        </Td>
                      </tr>
                    ))}

                    {topClasses.length === 0 && (
                      <tr className="border-t border-white/10">
                        <td
                          colSpan={3}
                          className="p-6 text-center text-zinc-400"
                        >
                          No hay datos aún.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TOP SCHEDULES */}
        {tab === "topSchedules" && (
          <div className={`${card} p-6 bg-black/20 min-w-0`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-2xl font-bold">Horarios más llenos</h4>
                <p className="text-zinc-400 mt-1">Ranking por inscritos</p>
              </div>
              <span className="text-xs text-zinc-400">
                {topSchedules.length} item(s)
              </span>
            </div>

            {/* CHART */}
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 min-w-0">
              <p className="text-sm text-zinc-400 mb-3">
                Total inscritos por día
              </p>
              <HorariosMasLlenosChart data={topSchedulesByDayChartData} />
            </div>

            {/* TABLE */}
            <div className="mt-4 rounded-3xl border border-white/10 overflow-hidden min-w-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[980px]">
                  <thead className="bg-white/5">
                    <tr className="text-left whitespace-nowrap">
                      <Th>Clase</Th>
                      <Th>Instructor</Th>
                      <Th>Día</Th>
                      <Th>Horario</Th>
                      <Th className="text-right">Inscritos</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSchedules.map((s, idx) => (
                      <tr
                        key={`${s.schedule_id ?? s.id ?? "sch"}-${idx}`}
                        className="border-t border-white/10 hover:bg-white/5"
                      >
                        <Td className="whitespace-nowrap">
                          {s.class_name} ({s.level ?? s.class_level ?? "—"})
                        </Td>
                        <Td className="whitespace-nowrap">
                          {s.instructor_email ?? "—"}
                        </Td>
                        <Td className="whitespace-nowrap">
                          {s.day_of_week ?? "—"}
                        </Td>
                        <Td className="whitespace-nowrap">
                          {formatTime(s.start_time)} - {formatTime(s.end_time)}
                        </Td>
                        <Td className="text-right whitespace-nowrap">
                          {s.enrolled ?? 0}
                        </Td>
                      </tr>
                    ))}

                    {topSchedules.length === 0 && (
                      <tr className="border-t border-white/10">
                        <td
                          colSpan={5}
                          className="p-6 text-center text-zinc-400"
                        >
                          No hay datos aún.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- UI helpers ---------- */

function TabButton({ active, onClick, label }) {
  const base = "px-4 py-2 rounded-xl text-sm font-semibold transition border";
  const cls = active
    ? "bg-white/10 border-white/20"
    : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10";
  return (
    <button onClick={onClick} className={`${base} ${cls}`}>
      {label}
    </button>
  );
}

function KpiCard({ title, value }) {
  const card =
    "rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur";
  return (
    <div className={`${card} p-6`}>
      <p className="text-sm text-zinc-400">{title}</p>
      <p className="mt-2 text-5xl font-extrabold">{value}</p>
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th className={`p-4 text-zinc-300 font-semibold ${className}`}>
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return <td className={`p-4 text-zinc-200 ${className}`}>{children}</td>;
}

function formatTime(t) {
  if (!t) return "—";
  const s = String(t);
  return s.length >= 5 ? s.slice(0, 5) : s;
}
