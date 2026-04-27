import { useEffect, useMemo, useState } from "react";
import Students from "./Students";
import Classes from "./Classes";
import Schedules from "./Schedules";
import Instructors from "./Instructors";
import { apiFetch } from "./api";
import Enrollments from "./Enrollments";
import Dashboard from "./Dashboard";
import Reports from "./Reports";

export default function App() {
  const [email, setEmail] = useState("admin@gym.com");
  const [password, setPassword] = useState("Admin123");
  const [me, setMe] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // menú actual
  const [active, setActive] = useState("students");

  const role = me?.role || "";
  const isAdmin = role === "ADMIN";
  const isInstructor = role === "INSTRUCTOR";

  // Auto-cargar sesión si hay token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    (async () => {
      try {
        const profile = await apiFetch("/me");
        setMe(profile.user);

        // por defecto, que aterrice en alumnos
        setActive("students");
      } catch {
        localStorage.removeItem("token");
        setMe(null);
      }
    })();
  }, []);

  // Items permitidos por rol
  const navItems = useMemo(() => {
    const items = [
      { key: "students", label: "Alumnos", sub: "Gestionar", show: isAdmin || isInstructor },
      { key: "classes", label: "Clases", sub: "Gestionar", show: isAdmin || isInstructor },
      { key: "schedules", label: "Horarios", sub: "Gestionar", show: isAdmin || isInstructor },
      { key: "enrollments", label: "Inscripciones", sub: "Gestionar", show: isAdmin || isInstructor },
      { key: "instructors", label: "Instructores", sub: "Gestionar", show: isAdmin },

      // SOLO ADMIN
      { key: "dashboard", label: "Dashboard", sub: "Resumen", show: isAdmin },
      { key: "reports", label: "Reportes", sub: "Inscripciones", show: isAdmin },
    ];

    return items.filter((i) => i.show);
  }, [isAdmin, isInstructor]);

  // si cambias de usuario/rol y el "active" ya no existe, corrige
  useEffect(() => {
    if (!me) return;

    const exists = navItems.some((x) => x.key === active);
    if (!exists) {
      setActive(navItems[0]?.key || "students");
      return;
    }

    // Extra seguridad: si no es admin y está en dashboard/reports, lo mandas a students
    if (!isAdmin && (active === "dashboard" || active === "reports")) {
      setActive("students");
    }
  }, [me, navItems, active, isAdmin]);

  const login = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem("token", data.token);

      const profile = await apiFetch("/me");
      setMe(profile.user);

      // al iniciar sesión, abrir alumnos
      setActive("students");
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setMe(null);
    setActive("students");
  };

  const card =
    "rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top bar */}
      <div className="border-b border-white/10 bg-zinc-950/60 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-yellow-400/15 border border-yellow-400/30 grid place-items-center">
              <span className="text-yellow-300 font-black">GY</span>
            </div>
            <div>
              <p className="text-sm tracking-widest text-zinc-400">GYM SYSTEM</p>
              <p className="font-semibold leading-tight">Panel de gestión</p>
            </div>
          </div>

          {me && (
            <div className="flex items-center gap-3">
              <span className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5">
                {me.email}
              </span>
              <span
                className={`text-xs px-3 py-1 rounded-full border ${
                  me.role === "ADMIN"
                    ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-200"
                    : "border-sky-400/30 bg-sky-400/10 text-sky-200"
                }`}
              >
                {me.role}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {!me ? (
          // LOGIN
          <div className="grid lg:grid-cols-2 gap-6 items-stretch">
            <div className={`${card} p-8 bg-gradient-to-b from-white/5 to-black/10`}>
              <p className="text-xs tracking-[0.35em] text-zinc-400 font-bold">ACCESO SEGURO</p>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight">
                Entrena y gestiona
                <span className="text-yellow-300"> sin fricción</span>.
              </h1>
              <p className="mt-3 text-zinc-400">
                Login con JWT + roles (ADMIN / INSTRUCTOR). Gestiona alumnos desde un panel moderno.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <Badge text="JWT" />
                <Badge text="Roles" />
                <Badge text="MySQL" />
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Estado del sistema</p>
                  <span className="text-yellow-200 font-bold">ONLINE</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-2/3 bg-yellow-300 rounded-full" />
                </div>
                <p className="mt-3 text-sm text-zinc-400">
                  Tip: si expira el token, inicia sesión otra vez.
                </p>
              </div>
            </div>

            <div className={`${card} p-8`}>
              <h2 className="text-2xl font-bold">Iniciar sesión</h2>
              <p className="mt-1 text-zinc-400">
                Usa tu cuenta de <b>ADMIN</b> o <b>INSTRUCTOR</b>.
              </p>

              {error && (
                <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
                  {error}
                </div>
              )}

              <form onSubmit={login} className="mt-6 space-y-4">
                <Field label="Email">
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-4 py-3 outline-none focus:border-yellow-400/60 focus:ring-4 focus:ring-yellow-400/10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gym.com"
                  />
                </Field>

                <Field label="Password">
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-4 py-3 outline-none focus:border-yellow-400/60 focus:ring-4 focus:ring-yellow-400/10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    type="password"
                  />
                </Field>

                <button
                  disabled={loading}
                  className="w-full rounded-2xl bg-yellow-300 text-zinc-950 font-extrabold py-3 hover:bg-yellow-200 disabled:opacity-70"
                >
                  {loading ? "Ingresando..." : "Entrar"}
                </button>

                <div className="text-xs text-zinc-500">
                  ¿No tienes token? Se genera automáticamente al hacer login.
                </div>
              </form>
            </div>
          </div>
        ) : (
          // PANEL
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
            {/* Sidebar */}
            <aside className={`${card} p-5 h-fit`}>
              <p className="text-xs tracking-[0.25em] text-zinc-400 font-bold mb-4">MENÚ</p>
              <div className="space-y-2">
                {navItems.map((item) => {
                  const activeCls =
                    active === item.key
                      ? "bg-white/10 border-white/20"
                      : "bg-white/5 border-white/10 hover:bg-white/10";
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActive(item.key)}
                      className={`w-full text-left rounded-2xl border ${activeCls} px-4 py-3 transition`}
                    >
                      <div className="text-lg font-semibold">{item.label}</div>
                      <div className="text-sm text-zinc-400">{item.sub}</div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Contenido */}
            <main className="space-y-6 min-w-0">
              {active === "students" && <Students role={role} />}
              {active === "classes" && <Classes role={role} />}
              {active === "schedules" && <Schedules role={role} />}
              {active === "enrollments" && <Enrollments role={role} />}
              {active === "instructors" && isAdmin && <Instructors role={role} />}

              {/* SOLO ADMIN */}
              {active === "dashboard" && isAdmin && <Dashboard role={role} />}
              {active === "reports" && isAdmin && <Reports role={role} />}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-zinc-400">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Badge({ text }) {
  return (
    <span className="text-xs px-3 py-2 rounded-2xl border border-white/10 bg-white/5 text-zinc-200">
      {text}
    </span>
  );
}