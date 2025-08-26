import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { API_BASE } from "../lib/apiBase";

export default function RequireAuth({ children }) {
  const [ok, setOk] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/me`, { credentials: "include" })
      .then((r) => setOk(r.ok))
      .catch(() => setOk(false));
  }, []);

  if (ok === null) return null; // podes renderizar um spinner aqui
  return ok ? children : <Navigate to="/backoffice/login" replace />;
}
