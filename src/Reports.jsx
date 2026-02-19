import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";

export default function Reports({ role }) {
  const [tab, setTab] = useState("byClass"); // byClass | byStudent
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const card =
    "rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur";

  /* ===============================
     LOADERS
  =============================== */

  const loadByClass = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/reports/enrollments-by-class");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Error cargando reporte por clase");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const loadByStudent = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/reports/enrollments-by-student");
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Error cargando reporte por alumno");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     EFFECT
  =============================== */

  useEffect(() => {
    if (tab === "byClass") loadByClass();
    if (tab === "byStudent") loadByStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  /* ===============================
     TOTALS
  =============================== */

  const total = useMemo(() => {
    if (tab === "byClass") {
      return rows.reduce((acc, r) => acc + Number(r.total_enrolled || 0), 0);
    }
    if (tab === "byStudent") {
      return rows.reduce((acc, r) => acc + Number(r.total_enrollments || 0), 0);
    }
    return 0;
  }, [rows, tab]);

  return (
    <div className={`${card} p-6 min-w-0`}>
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h3 className="text-3xl font-extrabold">Reportes</h3>
          <p className="text-zinc-400 mt-1">
            Reportes de inscripciones por clase y por alumno.
          </p>

          {/* TABS */}
          <div className="mt-4 inline-flex rounded-2xl border border-white/10 bg-black/20 p-1">
            <TabButton
              active={tab === "byClass"}
              onClick={() => setTab("byClass")}
              label="Por clase"
            />
            <TabButton
              active={tab === "byStudent"}
              onClick={() => setTab("byStudent")}
              label="Por alumno"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5">
            Rol: <b>{role}</b>
          </span>
          <button
            onClick={() => (tab === "byClass" ? loadByClass() : loadByStudent())}
            className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10"
          >
            {loading ? "Cargando..." : "Recargar"}
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
          {error}
        </div>
      )}

      {/* ===============================
          TAB: POR CLASE
      =============================== */}
      {tab === "byClass" && (
        <div className="mt-6">
          <div className={`${card} p-6 bg-black/20`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-xl font-bold">Inscritos por clase</h4>
                <p className="text-zinc-400 text-sm">
                  Total de inscripciones agrupadas por clase.
                </p>
              </div>
              <span className="text-xs text-zinc-400">
                {rows.length} fila(s) · Total inscritos: {total}
              </span>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead className="bg-white/5">
                    <tr>
                      <Th>ID</Th>
                      <Th>Clase</Th>
                      <Th>Nivel</Th>
                      <Th className="text-right">Inscritos</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.class_id}
                        className="border-t border-white/10 hover:bg-white/5"
                      >
                        <Td>{r.class_id}</Td>
                        <Td className="font-semibold">{r.class_name}</Td>
                        <Td>{r.class_level}</Td>
                        <Td className="text-right">
                          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
                            {r.total_enrolled}
                          </span>
                        </Td>
                      </tr>
                    ))}

                    {rows.length === 0 && !loading && (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-zinc-400">
                          No hay datos para mostrar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              Fuente: /api/reports/enrollments-by-class
            </p>
          </div>
        </div>
      )}

      {/* ===============================
          TAB: POR ALUMNO
      =============================== */}
      {tab === "byStudent" && (
        <div className="mt-6">
          <div className={`${card} p-6 bg-black/20`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-xl font-bold">Inscritos por alumno</h4>
                <p className="text-zinc-400 text-sm">
                  Total de inscripciones agrupadas por alumno.
                </p>
              </div>
              <span className="text-xs text-zinc-400">
                {rows.length} alumno(s) · Total inscripciones: {total}
              </span>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead className="bg-white/5">
                    <tr>
                      <Th>ID</Th>
                      <Th>Alumno</Th>
                      <Th>DNI</Th>
                      <Th className="text-right">Inscripciones</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.student_id}
                        className="border-t border-white/10 hover:bg-white/5"
                      >
                        <Td>{r.student_id}</Td>
                        <Td className="font-semibold">{r.student_name}</Td>
                        <Td>{r.dni}</Td>
                        <Td className="text-right">
                          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5">
                            {r.total_enrollments}
                          </span>
                        </Td>
                      </tr>
                    ))}

                    {rows.length === 0 && !loading && (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-zinc-400">
                          No hay datos para mostrar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              Fuente: /api/reports/enrollments-by-student
            </p>
          </div>
        </div>

        
      )}
      
    </div>
  );
}

/* ===============================
   UI HELPERS
=============================== */

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
