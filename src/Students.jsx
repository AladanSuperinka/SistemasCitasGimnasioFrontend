import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";

export default function Students({ role }) {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // create (solo admin)
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [phone, setPhone] = useState("");

  // edit (admin + instructor)
  const [editing, setEditing] = useState(null); // student object
  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");
  const [editDni, setEditDni] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const canCreate = role === "ADMIN";
  const canDelete = role === "ADMIN";
  const canEdit = role === "ADMIN" || role === "INSTRUCTOR";

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/api/students");
      setStudents(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createStudent = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiFetch("/api/students", {
        method: "POST",
        body: JSON.stringify({ first_name, last_name, dni, phone }),
      });
      setFirstName("");
      setLastName("");
      setDni("");
      setPhone("");
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const openEdit = (s) => {
    setEditing(s);
    setEditFirst(s.first_name ?? "");
    setEditLast(s.last_name ?? "");
    setEditDni(s.dni ?? "");
    setEditPhone(s.phone ?? "");
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setError("");
    try {
      await apiFetch(`/api/students/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({
          first_name: editFirst,
          last_name: editLast,
          dni: editDni,
          phone: editPhone,
        }),
      });
      setEditing(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const deleteStudent = async (id) => {
    if (!confirm("¿Eliminar alumno?")) return;
    setError("");
    try {
      await apiFetch(`/api/students/${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const count = useMemo(() => students.length, [students]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">Alumnos</h3>
          <p className="text-zinc-400 text-sm">
            Total: <span className="text-yellow-200 font-semibold">{count}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10"
          >
            {loading ? "Cargando..." : "Recargar"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
          {error}
        </div>
      )}

      {/* Crear alumno */}
      {canCreate && (
        <form
          onSubmit={createStudent}
          className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Crear alumno</h4>
            <span className="text-xs px-3 py-1 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-200">
              Solo ADMIN
            </span>
          </div>

          <div className="mt-4 grid md:grid-cols-2 gap-3">
            <Input value={first_name} onChange={setFirstName} placeholder="Nombre" />
            <Input value={last_name} onChange={setLastName} placeholder="Apellido" />
            <Input value={dni} onChange={setDni} placeholder="DNI" />
            <Input value={phone} onChange={setPhone} placeholder="Teléfono" />
          </div>

          <button className="mt-4 w-full md:w-auto px-5 py-2.5 rounded-2xl bg-yellow-300 text-zinc-950 font-extrabold hover:bg-yellow-200">
            Crear
          </button>
        </form>
      )}

      {/* Tabla */}
      <div className="mt-6 overflow-x-auto rounded-3xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="text-left">
              <Th>ID</Th>
              <Th>Nombre</Th>
              <Th>Apellido</Th>
              <Th>DNI</Th>
              <Th>Teléfono</Th>
              {(canEdit || canDelete) && <Th>Acciones</Th>}
            </tr>
          </thead>

          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-white/10 hover:bg-white/5">
                <Td>{s.id}</Td>
                <Td>{s.first_name}</Td>
                <Td>{s.last_name}</Td>
                <Td>{s.dni}</Td>
                <Td>{s.phone}</Td>

                {(canEdit || canDelete) && (
                  <Td>
                    <div className="flex gap-2">
                      {canEdit && (
                        <button
                          onClick={() => openEdit(s)}
                          className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
                        >
                          Editar
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => deleteStudent(s.id)}
                          className="px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/15"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </Td>
                )}
              </tr>
            ))}

            {students.length === 0 && (
              <tr className="border-t border-white/10">
                <td colSpan={6} className="p-6 text-center text-zinc-400">
                  No hay alumnos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal editar */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm grid place-items-center p-4 z-50">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-zinc-950 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-xl font-bold">Editar alumno</h4>
                <p className="text-sm text-zinc-400">
                  ID: <span className="text-yellow-200">{editing.id}</span>
                </p>
              </div>

              <button
                onClick={() => setEditing(null)}
                className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={saveEdit} className="mt-5 grid gap-3">
              <div className="grid md:grid-cols-2 gap-3">
                <Input value={editFirst} onChange={setEditFirst} placeholder="Nombre" />
                <Input value={editLast} onChange={setEditLast} placeholder="Apellido" />
                <Input value={editDni} onChange={setEditDni} placeholder="DNI" />
                <Input value={editPhone} onChange={setEditPhone} placeholder="Teléfono" />
              </div>

              <div className="flex flex-col md:flex-row gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 rounded-2xl bg-yellow-300 text-zinc-950 font-extrabold hover:bg-yellow-200">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ value, onChange, placeholder }) {
  return (
    <input
      className="w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-4 py-3 outline-none focus:border-yellow-400/60 focus:ring-4 focus:ring-yellow-400/10"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function Th({ children }) {
  return <th className="p-4 text-zinc-300 font-semibold">{children}</th>;
}
function Td({ children }) {
  return <td className="p-4 text-zinc-200">{children}</td>;
}
