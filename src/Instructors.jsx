import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";

export default function Instructors({ role }) {
  const [instructors, setInstructors] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // create
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // edit
  const [editing, setEditing] = useState(null); // instructor object
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const canManage = role === "ADMIN";

  const card = useMemo(
    () =>
      "rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur p-6",
    []
  );

  const input =
    "w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25 focus:ring-2 focus:ring-white/10";

  const btn =
    "rounded-2xl px-4 py-2 text-sm font-semibold border border-white/10 bg-white/10 hover:bg-white/15 transition";

  const btnDanger =
    "rounded-2xl px-4 py-2 text-sm font-semibold border border-red-500/30 bg-red-500/10 hover:bg-red-500/15 text-red-200 transition";

  const btnPrimary =
    "rounded-2xl px-4 py-2 text-sm font-semibold bg-[#F7E64B] text-black hover:brightness-95 transition";

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/api/instructors"); // GET /api/instructors (ADMIN)
      setInstructors(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManage) load();
  }, [canManage]);

  const createInstructor = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiFetch("/api/instructors", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setEmail("");
      setPassword("");
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const startEdit = (inst) => {
    setEditing(inst);
    setEditEmail(inst.email || "");
    setEditPassword("");
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditEmail("");
    setEditPassword("");
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {};
    if (editEmail.trim()) payload.email = editEmail.trim();
    if (editPassword.trim()) payload.password = editPassword.trim();

    if (Object.keys(payload).length === 0) {
      setError("No hay cambios para guardar.");
      return;
    }

    try {
      await apiFetch(`/api/instructors/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      cancelEdit();
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteInstructor = async (id) => {
    if (!confirm("¿Eliminar instructor?")) return;
    setError("");
    try {
      await apiFetch(`/api/instructors/${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (!canManage) return null;
  

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-white">Instructores</h2>
        <div className="flex gap-2">
          <button className={btn} onClick={load} disabled={loading}>
            {loading ? "Cargando..." : "Recargar"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      )}

      {/* Crear */}
      <div className={card}>
        <h3 className="text-lg font-bold text-white">Crear instructor</h3>
        <p className="text-sm text-white/55 mt-1">
          Se creará un usuario con rol <b>INSTRUCTOR</b>.
        </p>

        <form onSubmit={createInstructor} className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs text-white/60">Email</label>
            <input
              className={input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="instructor@gym.com"
            />
          </div>

          <div>
            <label className="text-xs text-white/60">Password</label>
            <input
              className={input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button className={btnPrimary} type="submit">
              Crear
            </button>
            <button
              className={btn}
              type="button"
              onClick={() => {
                setEmail("");
                setPassword("");
              }}
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>

      {/* Editar */}
      {editing && (
        <div className={card}>
          <h3 className="text-lg font-bold text-white">Editar instructor</h3>
          <p className="text-sm text-white/55 mt-1">
            ID: <b>{editing.id}</b>
          </p>

          <form onSubmit={saveEdit} className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs text-white/60">Email</label>
              <input
                className={input}
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="nuevo@email.com"
              />
            </div>

            <div>
              <label className="text-xs text-white/60">Nuevo password (opcional)</label>
              <input
                className={input}
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="dejar vacío si no cambia"
              />
            </div>

            <div className="md:col-span-2 flex gap-2">
              <button className={btnPrimary} type="submit">
                Guardar cambios
              </button>
              <button className={btn} type="button" onClick={cancelEdit}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      <div className={card}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Lista de instructores</h3>
          <span className="text-xs text-white/45">
            {instructors.length} registro(s)
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm text-white/80">
            <thead className="text-xs text-white/50">
              <tr className="border-b border-white/10">
                <th className="py-3 text-left">ID</th>
                <th className="py-3 text-left">Email</th>
                <th className="py-3 text-left">Rol</th>
                <th className="py-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {instructors.length === 0 ? (
                <tr>
                  <td className="py-6 text-white/45" colSpan={4}>
                    No hay instructores registrados.
                  </td>
                </tr>
              ) : (
                instructors.map((i) => (
                  <tr key={i.id} className="border-b border-white/10">
                    <td className="py-3">{i.id}</td>
                    <td className="py-3">{i.email}</td>
                    <td className="py-3">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
                        {i.role}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        <button className={btn} onClick={() => startEdit(i)}>
                          Editar
                        </button>
                        <button className={btnDanger} onClick={() => deleteInstructor(i.id)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
