import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";

export default function Classes({ role }) {
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // create (solo admin)
  const [name, setName] = useState("");
  const [level, setLevel] = useState("BASICO");
  const [capacity, setCapacity] = useState(20);
  const [description, setDescription] = useState("");

  // edit (admin + instructor)
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");
  const [editLevel, setEditLevel] = useState("BASICO");
  const [editCapacity, setEditCapacity] = useState(20);
  const [editDescription, setEditDescription] = useState("");

  const canCreate = role === "ADMIN";
  const canDelete = role === "ADMIN";
  const canEdit = role === "ADMIN" || role === "INSTRUCTOR";

  const levelOptions = useMemo(() => ["BASICO", "INTERMEDIO", "AVANZADO"], []);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/api/classes");
      setClasses(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (c) => {
    setEditing(c);
    setEditName(c.name ?? "");
    setEditLevel(c.level ?? "BASICO");
    setEditCapacity(c.capacity ?? 20);
    setEditDescription(c.description ?? "");
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditName("");
    setEditLevel("BASICO");
    setEditCapacity(20);
    setEditDescription("");
  };

  const createClass = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiFetch("/api/classes", {
        method: "POST",
        body: JSON.stringify({
          name,
          level,
          capacity: Number(capacity),
          description,
        }),
      });
      setName("");
      setLevel("BASICO");
      setCapacity(20);
      setDescription("");
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const updateClass = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setError("");
    try {
      await apiFetch(`/api/classes/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editName,
          level: editLevel,
          capacity: Number(editCapacity),
          description: editDescription,
        }),
      });
      cancelEdit();
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteClass = async (id) => {
    if (!confirm("¿Eliminar clase?")) return;
    setError("");
    try {
      await apiFetch(`/api/classes/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Clases</h2>
          <p className="text-sm text-white/60">
            Listado, edición y mantenimiento de clases
          </p>
        </div>

        <button
          onClick={load}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
        >
          {loading ? "Cargando..." : "Recargar"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Create (ADMIN) */}
      {canCreate && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="mb-3 text-base font-semibold text-white">Crear clase</h3>

          <form onSubmit={createClass} className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-1">
              <label className="mb-1 block text-xs text-white/60">Nombre</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-lime-400/60"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Funcional"
                required
              />
            </div>

            <div className="md:col-span-1">
              <label className="mb-1 block text-xs text-white/60">Nivel</label>
              <select
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-lime-400/60"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                {levelOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="mb-1 block text-xs text-white/60">Capacidad</label>
              <input
                type="number"
                min={1}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-lime-400/60"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-white/60">Descripción</label>
              <textarea
                className="min-h-[90px] w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-lime-400/60"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalles de la clase..."
              />
            </div>

            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="rounded-xl bg-lime-400 px-4 py-2 text-sm font-semibold text-black hover:brightness-110"
              >
                Crear
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit (ADMIN + INSTRUCTOR) */}
      {canEdit && editing && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="mb-3 text-base font-semibold text-white">
            Editar clase #{editing.id}
          </h3>

          <form onSubmit={updateClass} className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-white/60">Nombre</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-lime-400/60"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Nivel</label>
              <select
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-lime-400/60"
                value={editLevel}
                onChange={(e) => setEditLevel(e.target.value)}
              >
                {levelOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-white/60">Capacidad</label>
              <input
                type="number"
                min={1}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-lime-400/60"
                value={editCapacity}
                onChange={(e) => setEditCapacity(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-white/60">Descripción</label>
              <textarea
                className="min-h-[90px] w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-lime-400/60"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>

            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="rounded-xl bg-lime-400 px-4 py-2 text-sm font-semibold text-black hover:brightness-110"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-white/5">
            <tr className="text-left text-white/70">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Nivel</th>
              <th className="px-4 py-3">Capacidad</th>
              <th className="px-4 py-3">Descripción</th>
              {(canEdit || canDelete) && <th className="px-4 py-3">Acciones</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {classes.map((c) => (
              <tr key={c.id} className="text-white/90">
                <td className="px-4 py-3">{c.id}</td>
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">{c.level}</td>
                <td className="px-4 py-3">{c.capacity}</td>
                <td className="px-4 py-3 text-white/70">{c.description}</td>

                {(canEdit || canDelete) && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {canEdit && (
                        <button
                          onClick={() => startEdit(c)}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10"
                        >
                          Editar
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => deleteClass(c.id)}
                          className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/20"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}

            {classes.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-white/50"
                >
                  No hay clases registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
