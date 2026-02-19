import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";

export default function Enrollments({ role }) {
  const [tab, setTab] = useState("enroll"); // "enroll" | "registered"

  const [students, setStudents] = useState([]);
  const [available, setAvailable] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔎 buscadores
  const [studentQuery, setStudentQuery] = useState("");
  const [scheduleQuery, setScheduleQuery] = useState("");

  // Modal cambiar
  const [changeOpen, setChangeOpen] = useState(false);
  const [changing, setChanging] = useState(null); // enrollment object
  const [newScheduleId, setNewScheduleId] = useState("");

  const isAdmin = role === "ADMIN";
  const isInstructor = role === "INSTRUCTOR";

  const card =
    "rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur";

  const loadAll = async () => {
    setError("");
    setLoading(true);
    try {
      const [st, av, en] = await Promise.all([
        apiFetch("/api/students"),
        apiFetch("/api/enrollments/available"),
        apiFetch("/api/enrollments"),
      ]);

      const stArr = Array.isArray(st) ? st : [];
      setStudents(stArr);
      setAvailable(Array.isArray(av) ? av : []);
      setEnrollments(Array.isArray(en) ? en : []);

      // set default student if empty
      if (!selectedStudentId && stArr.length > 0) {
        setSelectedStudentId(String(stArr[0].id));
      }
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

  const selectedStudent = useMemo(() => {
    return students.find((s) => String(s.id) === String(selectedStudentId)) || null;
  }, [students, selectedStudentId]);

  const enrollCount = useMemo(() => available.length, [available]);
  const registeredCount = useMemo(() => enrollments.length, [enrollments]);

  // ✅ alumnos filtrados
  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return students;

    return students.filter((s) => {
      const full = `${s.first_name ?? ""} ${s.last_name ?? ""}`.toLowerCase();
      const id = String(s.id ?? "");
      return full.includes(q) || id.includes(q);
    });
  }, [students, studentQuery]);

  // ✅ horarios filtrados
  const filteredAvailable = useMemo(() => {
    const q = scheduleQuery.trim().toLowerCase();
    if (!q) return available;

    return available.filter((s) => {
      const scheduleId = String(s.schedule_id ?? s.id ?? "");
      const className = String(s.class_name ?? "").toLowerCase();
      const level = String(s.level ?? s.class_level ?? s.classLevel ?? "").toLowerCase();
      const instructor = String(s.instructor_email ?? "").toLowerCase();
      const day = String(s.day_of_week ?? "").toLowerCase();
      const start = String(s.start_time ?? "").toLowerCase();
      const end = String(s.end_time ?? "").toLowerCase();
      const room = String(s.room ?? "").toLowerCase();

      const blob = `${scheduleId} ${className} ${level} ${instructor} ${day} ${start} ${end} ${room}`;
      return blob.includes(q);
    });
  }, [available, scheduleQuery]);

  // Si el alumno seleccionado no está en la lista filtrada, no lo rompas:
  useEffect(() => {
    if (!selectedStudentId) return;
    const exists = students.some((s) => String(s.id) === String(selectedStudentId));
    if (!exists && students.length > 0) setSelectedStudentId(String(students[0].id));
  }, [students, selectedStudentId]);

  const onEnroll = async (scheduleId) => {
    if (!selectedStudentId) {
      setError("Selecciona un alumno primero.");
      return;
    }
    setError("");
    try {
      await apiFetch("/api/enrollments", {
        method: "POST",
        body: JSON.stringify({
          student_id: Number(selectedStudentId),
          schedule_id: Number(scheduleId),
        }),
      });
      await loadAll();
      setTab("registered");
    } catch (e) {
      setError(e.message || "No se pudo inscribir.");
    }
  };

  const onCancel = async (enrollmentId) => {
    if (!confirm("¿Cancelar inscripción?")) return;
    setError("");
    try {
      await apiFetch(`/api/enrollments/${enrollmentId}`, { method: "DELETE" });
      await loadAll();
    } catch (e) {
      setError(e.message || "No se pudo cancelar.");
    }
  };

  const openChange = (enr) => {
    setChanging(enr);
    setNewScheduleId("");
    setChangeOpen(true);
  };

  const saveChange = async (e) => {
    e.preventDefault();
    if (!changing) return;
    if (!newScheduleId) {
      setError("Selecciona el nuevo horario.");
      return;
    }
    setError("");
    try {
      await apiFetch(`/api/enrollments/${changing.id}`, {
        method: "PUT",
        body: JSON.stringify({ schedule_id: Number(newScheduleId) }),
      });
      setChangeOpen(false);
      setChanging(null);
      setNewScheduleId("");
      await loadAll();
    } catch (e2) {
      setError(e2.message || "No se pudo cambiar la inscripción.");
    }
  };

  return (
    <div className={`${card} p-6 min-w-0`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h3 className="text-3xl font-extrabold">Inscripciones</h3>
          <p className="text-zinc-400 mt-1">
            Inscribe alumnos a <b>horarios</b> con cupos disponibles y permite cancelar o cambiar.
          </p>

          {/* Tabs */}
          <div className="mt-4 inline-flex rounded-2xl border border-white/10 bg-black/20 p-1">
            <TabButton
              active={tab === "enroll"}
              onClick={() => setTab("enroll")}
              label={`Inscribir (${enrollCount})`}
            />
            <TabButton
              active={tab === "registered"}
              onClick={() => setTab("registered")}
              label={`Registradas (${registeredCount})`}
            />
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

      {/* TAB: INSCRIBIR */}
      {tab === "enroll" && (
        <div className="mt-6 space-y-6 min-w-0">
          {/* Selector alumno */}
          <div className={`${card} p-6 bg-black/20 min-w-0`}>
            <h4 className="text-xl font-bold">Selecciona un alumno</h4>
            <p className="text-zinc-400 mt-1">
              Luego elige un horario disponible y presiona <b>Inscribir</b>.
            </p>

            <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">
              <div className="min-w-0">
                <label className="text-xs text-zinc-400">Buscar alumno</label>
                <input
                  value={studentQuery}
                  onChange={(e) => setStudentQuery(e.target.value)}
                  placeholder="Ej: Juan, Pérez o ID 8"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-4 py-3 outline-none focus:border-yellow-400/60 focus:ring-4 focus:ring-yellow-400/10"
                />

                <label className="text-xs text-zinc-400 mt-4 block">Alumno</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-4 py-3 outline-none focus:border-yellow-400/60 focus:ring-4 focus:ring-yellow-400/10"
                >
                  {filteredStudents.map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {s.first_name} {s.last_name} (ID: {s.id})
                    </option>
                  ))}

                  {filteredStudents.length === 0 && (
                    <option value="">No hay coincidencias</option>
                  )}
                </select>

                <p className="text-xs text-zinc-500 mt-2">
                  Mostrando: {filteredStudents.length} de {students.length}
                </p>
              </div>

              <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs text-zinc-400">Seleccionado</p>
                <p className="text-2xl font-extrabold mt-1 truncate">
                  {selectedStudent
                    ? `${selectedStudent.first_name} ${selectedStudent.last_name} (ID: ${selectedStudent.id})`
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Tabla horarios disponibles */}
          <div className={`${card} p-6 min-w-0`}>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
              <div>
                <h4 className="text-xl font-bold">Horarios disponibles</h4>
                <p className="text-zinc-400 text-sm">Solo se muestran horarios con cupos.</p>
              </div>

              <div className="w-full lg:w-[380px] min-w-0">
                <label className="text-xs text-zinc-400">Buscar horario</label>
                <input
                  value={scheduleQuery}
                  onChange={(e) => setScheduleQuery(e.target.value)}
                  placeholder="Ej: Yoga, LUN, instructor2, BASICO, ID..."
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-4 py-3 outline-none focus:border-yellow-400/60 focus:ring-4 focus:ring-yellow-400/10"
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Mostrando: {filteredAvailable.length} de {available.length}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 overflow-hidden min-w-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[980px]">
                  <thead className="bg-white/5">
                    <tr className="text-left whitespace-nowrap">
                      <Th>ID</Th>
                      <Th>Clase</Th>
                      <Th>Nivel</Th>
                      <Th>Instructor</Th>
                      <Th>Día</Th>
                      <Th>Inicio</Th>
                      <Th>Fin</Th>
                      <Th>Sala</Th>
                      <Th>Capacidad</Th>
                      <Th>Inscritos</Th>
                      <Th>Cupos</Th>
                      <Th className="text-right">Acción</Th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAvailable.map((s) => {
                      const scheduleId = s.schedule_id ?? s.id; // id real
                      const level = s.level ?? s.class_level ?? s.classLevel; // nivel real

                      return (
                        <tr key={scheduleId} className="border-t border-white/10 hover:bg-white/5">
                          <Td className="whitespace-nowrap">{scheduleId}</Td>
                          <Td className="font-semibold whitespace-nowrap">{s.class_name}</Td>
                          <Td className="whitespace-nowrap">{level}</Td>
                          <Td className="whitespace-nowrap">{s.instructor_email}</Td>
                          <Td className="whitespace-nowrap">{s.day_of_week}</Td>
                          <Td className="whitespace-nowrap">{formatTime(s.start_time)}</Td>
                          <Td className="whitespace-nowrap">{formatTime(s.end_time)}</Td>
                          <Td className="whitespace-nowrap">{s.room ?? "—"}</Td>
                          <Td className="whitespace-nowrap">{s.capacity}</Td>
                          <Td className="whitespace-nowrap">{s.enrolled}</Td>
                          <Td className="whitespace-nowrap">
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full border border-white/10 bg-white/5">
                              {s.spots_left}
                            </span>
                          </Td>

                          <Td className="text-right whitespace-nowrap">
                            <button
                              onClick={() => onEnroll(scheduleId)}
                              className="inline-flex items-center justify-center px-5 py-2 rounded-2xl bg-yellow-300 text-zinc-950 font-extrabold hover:bg-yellow-200"
                            >
                              Inscribir
                            </button>
                          </Td>
                        </tr>
                      );
                    })}

                    {filteredAvailable.length === 0 && (
                      <tr className="border-t border-white/10">
                        <td colSpan={12} className="p-6 text-center text-zinc-400">
                          No hay horarios que coincidan con la búsqueda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              Si te sale “ya está inscrito”, es correcto: lo bloquea el UNIQUE en BD (y el backend).
            </p>
          </div>
        </div>
      )}

      {/* TAB: REGISTRADAS */}
      {tab === "registered" && (
        <div className="mt-6 min-w-0">
          <div className={`${card} p-6 min-w-0`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-xl font-bold">Inscripciones registradas</h4>
              </div>
              <span className="text-xs text-zinc-400">{enrollments.length} inscripción(es)</span>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 overflow-hidden min-w-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[980px]">
                  <thead className="bg-white/5">
                    <tr className="text-left whitespace-nowrap">
                      <Th>ID</Th>
                      <Th>Alumno</Th>
                      <Th>Clase</Th>
                      <Th>Instructor</Th>
                      <Th>Día</Th>
                      <Th>Inicio</Th>
                      <Th>Fin</Th>
                      <Th>Sala</Th>
                      <Th className="text-right">Acciones</Th>
                    </tr>
                  </thead>

                  <tbody>
                    {enrollments.map((e) => {
                      const enrollmentId = e.enrollment_id ?? e.enrollmentId ?? e.id;
                      const level = e.class_level ?? e.level ?? e.classLevel;

                      return (
                        <tr key={enrollmentId} className="border-t border-white/10 hover:bg-white/5">
                          <Td className="whitespace-nowrap">{enrollmentId}</Td>

                          <Td className="whitespace-nowrap">
                            {e.student_name} (ID: {e.student_id})
                          </Td>

                          <Td className="whitespace-nowrap">
                            {e.class_name} ({level})
                          </Td>

                          <Td className="whitespace-nowrap">{e.instructor_email}</Td>
                          <Td className="whitespace-nowrap">{e.day_of_week}</Td>
                          <Td className="whitespace-nowrap">{formatTime(e.start_time)}</Td>
                          <Td className="whitespace-nowrap">{formatTime(e.end_time)}</Td>
                          <Td className="whitespace-nowrap">{e.room ?? "—"}</Td>

                          <Td className="text-right whitespace-nowrap">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => openChange({ ...e, id: enrollmentId })}
                                className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10"
                              >
                                Cambiar
                              </button>

                              <button
                                onClick={() => onCancel(enrollmentId)}
                                className="px-4 py-2 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/15"
                              >
                                Cancelar
                              </button>
                            </div>
                          </Td>
                        </tr>
                      );
                    })}

                    {enrollments.length === 0 && (
                      <tr className="border-t border-white/10">
                        <td colSpan={9} className="p-6 text-center text-zinc-400">
                          No hay inscripciones registradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal cambiar inscripción */}
      {changeOpen && changing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm grid place-items-center p-4 z-50">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-zinc-950 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h4 className="text-xl font-bold">Cambiar inscripción</h4>
                <p className="text-sm text-zinc-400 mt-1 truncate">
                  Alumno: <b>{changing.student_name}</b> · Clase: <b>{changing.class_name}</b>
                </p>
              </div>

              <button
                onClick={() => {
                  setChangeOpen(false);
                  setChanging(null);
                  setNewScheduleId("");
                }}
                className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={saveChange} className="mt-5 space-y-4">
              <div>
                <label className="text-xs text-zinc-400">Nuevo horario (con cupos)</label>
                <select
                  value={newScheduleId}
                  onChange={(e) => setNewScheduleId(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-4 py-3 outline-none focus:border-yellow-400/60 focus:ring-4 focus:ring-yellow-400/10"
                >
                  <option value="">-- Selecciona --</option>
                  {available.map((s) => {
                    const id = s.schedule_id ?? s.id;
                    const lvl = s.level ?? s.class_level ?? s.classLevel;
                    return (
                      <option key={id} value={String(id)}>
                        #{id} · {s.class_name} ({lvl}) · {s.day_of_week}{" "}
                        {formatTime(s.start_time)}-{formatTime(s.end_time)} · {s.instructor_email} · Cupos:{" "}
                        {s.spots_left}
                      </option>
                    );
                  })}
                </select>
                <p className="text-xs text-zinc-500 mt-2">
                  *La lista muestra horarios con cupos. Si no aparece ninguno, crea más horarios o libera cupos.
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setChangeOpen(false);
                    setChanging(null);
                    setNewScheduleId("");
                  }}
                  className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 rounded-2xl bg-yellow-300 text-zinc-950 font-extrabold hover:bg-yellow-200">
                  Guardar cambio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

function Th({ children, className = "" }) {
  return <th className={`p-4 text-zinc-300 font-semibold ${className}`}>{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`p-4 text-zinc-200 ${className}`}>{children}</td>;
}

function formatTime(t) {
  if (!t) return "—";
  const s = String(t);
  return s.length >= 5 ? s.slice(0, 5) : s;
}
