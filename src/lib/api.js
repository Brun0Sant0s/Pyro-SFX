// src/lib/api.js
const raw = import.meta.env.VITE_API_URL || "";
const API_BASE =
  (typeof window !== "undefined" && raw ? raw : raw)        // usa .env se existir
    .toString()
    .replace(/\/+$/, "");                                   // remove barra final

console.log("[API_BASE] =", API_BASE || "(none)");

async function jsonOrText(r) {
  const t = await r.text();
  try { return JSON.parse(t); } catch { return t; }
}

export async function getServices() {
  const url = `${API_BASE || ""}/api/services`.replace(/^(https?:\/\/[^/]+)?\/+/, (m, g1) => (g1 ? g1 + "/" : "/")) + ""; 
  console.log("[getServices] URL =", url);
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText} - ${JSON.stringify(await jsonOrText(r))}`);
  return r.json();
}

export async function getExtras(serviceId, locale = "pt") {
  const base = API_BASE || "";
  const url = `${base}/api/extras?service_id=${encodeURIComponent(serviceId)}&locale=${locale}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Falha a obter extras: ${r.status}`);
  return r.json();
}

export async function getDetail(viewId, locale = "pt") {
  const base = API_BASE || "";
  const url = `${base}/api/details?view_id=${encodeURIComponent(viewId)}&locale=${locale}`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(`Falha a obter detalhe: ${r.status}`);
  return r.json();
}
