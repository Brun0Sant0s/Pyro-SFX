import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { API_BASE } from "../lib/apiBase";
import logoGlow from "../assets/logo_glow.png";

/* === animações (iguais ao Services) === */
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const transitionVariants = {
  initial: (dir = 1) =>
    prefersReducedMotion()
      ? { opacity: 0 }
      : { opacity: 0, x: dir * 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: prefersReducedMotion()
      ? { duration: 0 }
      : { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir = 1) =>
    prefersReducedMotion()
      ? { opacity: 0 }
      : { opacity: 0, x: dir * -20, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};

export default function Login() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");

  // sessão existente -> dashboard
  useEffect(() => {
    fetch(`${API_BASE}/api/auth/me`, { credentials: "include" }).then((r) => {
      if (r.ok) nav("/backoffice/dashboard", { replace: true });
    });
  }, [nav]);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    const r = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    if (r.ok) nav("/backoffice/dashboard");
    else setErr("Credenciais inválidas.");
  };

  return (
    <section className="min-h-screen grid place-items-center bg-black text-white">
      <motion.form
        variants={transitionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full max-w-sm bg-white/5 border border-white/10 rounded-xl shadow p-6 sm:p-8"
        onSubmit={submit}
      >
        {/* topo com logo (estilo card do site) */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={logoGlow}
            alt="Logo"
            className="h-28"
          />
          <span className="mt-4 block h-px w-12 bg-red-500/80" />
        </div>

        {/* USERNAME */}
        <label className="block text-sm text-white/80 mb-1">Username</label>
        <div className="relative mb-4">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/50">
            <User className="w-4 h-4" aria-hidden="true" />
          </span>
          <input
            className="w-full rounded-xl border border-white/10 bg-black/30 pl-9 pr-3 py-2 text-white placeholder-white/40
               hover:border-white/20 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="Username"   // 👈
          />
        </div>

        {/* PASSWORD */}
        <label className="block text-sm text-white/80 mb-1">Password</label>
        <div className="relative mb-4">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/50">
            <Lock className="w-4 h-4" aria-hidden="true" />
          </span>
          <input
            type={showPw ? "text" : "password"}
            className="w-full rounded-xl border border-white/10 bg-black/30 pl-9 pr-10 py-2 text-white placeholder-white/40
               hover:border-white/20 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Password"  // 👈
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white"
            aria-label={showPw ? "Esconder password" : "Mostrar password"}
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>


        {err && <p className="text-red-400 text-sm mb-3">{err}</p>}

        <button
          className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700
                     text-white font-semibold py-2 rounded-xl transition"
        >
          Entrar
        </button>
      </motion.form>
    </section>
  );
}
