import { useState } from "react";
import { apiFetch } from "./api";

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      onSuccess?.(profile.user);
    } catch (err) {
      setError(err.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-stretch">
    
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-black/10 p-8">
        <p className="text-xs tracking-[0.35em] text-zinc-400 font-bold">
          ACCESO SEGURO
        </p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight">
          Entrena y gestiona
          <span className="text-yellow-300"> sin fricción</span>.
        </h1>
        <p className="mt-3 text-zinc-400">
          Login con JWT + roles (ADMIN / INSTRUCTOR). Gestiona el sistema desde un
          panel moderno.
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

     
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
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
              placeholder=""
            />
          </Field>

          <Field label="Password">
            <input
              className="w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-4 py-3 outline-none focus:border-yellow-400/60 focus:ring-4 focus:ring-yellow-400/10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
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
