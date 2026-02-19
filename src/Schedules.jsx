import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";

const DAYS = [
  { value: "LUN", label: "Lun" },
  { value: "MAR", label: "Mar" },
  { value: "MIE", label: "Mié" },
  { value: "JUE", label: "Jue" },
  { value: "VIE", label: "Vie" },
  { value: "SAB", label: "Sáb" },
  { value: "DOM", label: "Dom" },
];

export default function Schedules({ role }) {
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [instructors, setInstructors] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // create (solo admin)
  const [class_id, setClassId] = useState("");
  const [instructor_id, setInstructorId] = useState("");
  const [day_of_week, setDay] = useState("LUN");
  const [start_time, setStart] = useState("08:00");
  const [end_time, setEnd] = useState("09:00");
  const [room, setRoom] = useState("");

  // edit (solo admin)
  const [editing, setEditing] = useState(null); // schedule object
  const [editClassId, setEditClassId] = useState("");
  const [editInstructorId, setEditInstructorId] = useState("");
  const [editDay, setEditDay] = useState("LUN");
  const [editStart, setEditStart] = useState("08:00");
  const [editEnd, setEditEnd] = useState("09:00");
  const [editRoom, setEditRoom] = useState("");

  const isAdmin = role === "ADMIN";

  const instructorOptions = useMemo(() => {
    // si tu backend ya trae solo INSTRUCTOR, perfecto.
    // si trae ADMIN también, filtramos.
    return instructors.filter((i) => i.role === "INSTRUCTOR");
  }, [instructors]);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const [sch, cls, inst] = await Promise.all([
  apiFetch("/api/schedules"),
  apiFetch("/api/classes"),
  isAdmin ? apiFetch("/api/auth/instructors") : Promise.resolve([]),
]);


      setSchedules(Array.isArray(sch) ? sch : []);
      setClasses(Array.isArray(cls) ? cls : []);
      setInstructors(Array.isArray(inst) ? inst : []);

      // valores por defecto (admin)
      if (!class_id && cls?.length) setClassId(String(cls[0].id));
      if (!instructor_id && inst?.length) {
        const firstInstructor = inst.find((x) => x.role === "INSTRUCTOR");
        if (firstInstructor) setInstructorId(String(firstInstructor.id));
      }
    } catch (e) {
      setError(e.message || "Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  load();
}, [role]);

  const resetCreate = () => {
    if (classes.length) setClassId(String(classes[0].id));
    const firstInstructor = instructorOptions[0];
    if (firstInstructor) setInstructorId(String(firstInstructor.id));
    setDay("LUN");
    setStart("08:00");
    setEnd("09:00");
    setRoom("");
  };

  const createSchedule = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    setError("");

    if (!class_id || !instructor_id || !day_of_week || !start_time || !end_time) {
      setError("Completa los campos obligatorios");
      return;
    }
    if (start_time >= end_time) {
      setError("La hora de inicio debe ser menor que la hora fin");
      return;
    }

    try {
      await apiFetch("/api/schedules", {
        method: "POST",
        body: JSON.stringify({
          class_id: Number(class_id),
          instructor_id: Number(instructor_id),
          day_of_week,
          start_time,
          end_time,
          room: room?.trim() ? room.trim() : null,
        }),
      });
      resetCreate();
      load();
    } catch (e) {
      setError(e.message || "Error creando horario");
    }
  };

  const startEdit = (s) => {
    setEditing(s);
    setEditClassId(String(s.class_id));
    setEditInstructorId(String(s.instructor_id));
    setEditDay(s.day_of_week);
    setEditStart((s.start_time || "").slice(0, 5));
    setEditEnd((s.end_time || "").slice(0, 5));
    setEditRoom(s.room || "");
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditClassId("");
    setEditInstructorId("");
    setEditDay("LUN");
    setEditStart("08:00");
    setEditEnd("09:00");
    setEditRoom("");
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!isAdmin || !editing) return;

    setError("");

    if (!editClassId || !editInstructorId || !editDay || !editStart || !editEnd) {
      setError("Completa los campos obligatorios");
      return;
    }
    if (editStart >= editEnd) {
      setError("La hora de inicio debe ser menor que la hora fin");
      return;
    }

    try {
      await apiFetch(`/api/schedules/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({
          class_id: Number(editClassId),
          instructor_id: Number(editInstructorId),
          day_of_week: editDay,
          start_time: editStart,
          end_time: editEnd,
          room: editRoom?.trim() ? editRoom.trim() : null,
        }),
      });
      cancelEdit();
      load();
    } catch (e) {
      setError(e.message || "Error editando horario");
    }
  };

  const deleteSchedule = async (id) => {
    if (!isAdmin) return;
    if (!confirm("¿Eliminar horario?")) return;

    setError("");
    try {
      await apiFetch(`/api/schedules/${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e.message || "Error eliminando horario");
    }
  };

  const card =
    "rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]";
  const input =
    "w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 outline-none focus:border-white/20";
  const btn =
    "rounded-xl px-3 py-2 bg-white/10 border border-white/10 hover:bg-white/15 transition";
  const btnDanger =
    "rounded-xl px-3 py-2 bg-red-500/10 border border-red-400/20 hover:bg-red-500/15 transition text-red-200";
  const badge =
    "inline-flex items-center gap-2 rounded-full px-3 py-1 bg-white/10 border border-white/10";

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold">Horarios</h2>
        <div className={badge}>
          <span className="text-white/70 text-sm">Rol:</span>
          <span className="font-semibold">{role}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-200">
          {error}
        </div>
      )}

      {/* Crear horario (solo admin) */}
      {isAdmin && (
        <div className={`${card} p-5 mb-6`}>
          <h3 className="text-lg font-semibold mb-4">Crear horario</h3>

          <form onSubmit={createSchedule} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/70">Clase</label>
              <select className={input} value={class_id} onChange={(e) => setClassId(e.target.value)}>
                <option value="">Selecciona clase...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.level})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-white/70">Instructor</label>
              <select
                className={input}
                value={instructor_id}
                onChange={(e) => setInstructorId(e.target.value)}
              >
                <option value="">Selecciona instructor...</option>
                {instructorOptions.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-white/70">Día</label>
              <select className={input} value={day_of_week} onChange={(e) => setDay(e.target.value)}>
                {DAYS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-white/70">Sala (opcional)</label>
              <input className={input} value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Ej: Sala 1" />
            </div>

            <div>
              <label className="text-sm text-white/70">Inicio</label>
              <input className={input} type="time" value={start_time} onChange={(e) => setStart(e.target.value)} />
            </div>

            <div>
              <label className="text-sm text-white/70">Fin</label>
              <input className={input} type="time" value={end_time} onChange={(e) => setEnd(e.target.value)} />
            </div>

            <div className="flex items-center gap-2">
              <button type="submit" className={btn}>
                Crear
              </button>
              <button type="button" className={btn} onClick={resetCreate}>
                Limpiar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      <div className={`${card} p-5`}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold">Lista de horarios</h3>
          <button className={btn} onClick={load} disabled={loading}>
            {loading ? "Cargando..." : "Recargar"}
          </button>
        </div>

        {/* Modal/Panel de edición inline */}
        {isAdmin && editing && (
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Editando horario #{editing.id}</h4>
              <button className={btn} onClick={cancelEdit}>
                Cancelar
              </button>
            </div>

            <form onSubmit={saveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/70">Clase</label>
                <select className={input} value={editClassId} onChange={(e) => setEditClassId(e.target.value)}>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-white/70">Instructor</label>
                <select className={input} value={editInstructorId} onChange={(e) => setEditInstructorId(e.target.value)}>
                  {instructorOptions.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-white/70">Día</label>
                <select className={input} value={editDay} onChange={(e) => setEditDay(e.target.value)}>
                  {DAYS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-white/70">Sala (opcional)</label>
                <input className={input} value={editRoom} onChange={(e) => setEditRoom(e.target.value)} placeholder="Ej: Sala 1" />
              </div>

              <div>
                <label className="text-sm text-white/70">Inicio</label>
                <input className={input} type="time" value={editStart} onChange={(e) => setEditStart(e.target.value)} />
              </div>

              <div>
                <label className="text-sm text-white/70">Fin</label>
                <input className={input} type="time" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} />
              </div>

              <div className="flex gap-2">
                <button type="submit" className={btn}>
                  Guardar
                </button>
                <button type="button" className={btn} onClick={cancelEdit}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/70">
              <tr className="border-b border-white/10">
                <th className="text-left py-3 pr-3">ID</th>
                <th className="text-left py-3 pr-3">Clase</th>
                <th className="text-left py-3 pr-3">Instructor</th>
                <th className="text-left py-3 pr-3">Día</th>
                <th className="text-left py-3 pr-3">Inicio</th>
                <th className="text-left py-3 pr-3">Fin</th>
                <th className="text-left py-3 pr-3">Sala</th>
                {isAdmin && <th className="text-left py-3">Acciones</th>}
              </tr>
            </thead>

            <tbody>
              {schedules.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-3 pr-3">{s.id}</td>
                  <td className="py-3 pr-3">
                    <div className="font-medium">{s.class_name}</div>
                    <div className="text-white/60 text-xs">{s.class_level}</div>
                  </td>
                  <td className="py-3 pr-3">{s.instructor_email}</td>
                  <td className="py-3 pr-3">{s.day_of_week}</td>
                  <td className="py-3 pr-3">{(s.start_time || "").slice(0, 5)}</td>
                  <td className="py-3 pr-3">{(s.end_time || "").slice(0, 5)}</td>
                  <td className="py-3 pr-3">{s.room || "-"}</td>

                  {isAdmin && (
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button className={btn} onClick={() => startEdit(s)}>
                          Editar
                        </button>
                        <button className={btnDanger} onClick={() => deleteSchedule(s.id)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {!schedules.length && (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-6 text-center text-white/60">
                    No hay horarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        
      </div>
    </div>
  );
}
