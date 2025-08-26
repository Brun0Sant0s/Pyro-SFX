// src/backoffice/Dashboard.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE } from "../lib/apiBase";
import { Search, Save, Trash2, Pencil, X } from "lucide-react";

/* =============== Design tokens (classes tailwind) =============== */
const ui = {
  card: "rounded-2xl border border-white/10 bg-zinc-900/40 p-3 sm:p-4",
  input:
    "w-full rounded-xl border border-white/10 bg-zinc-900/40 px-3 py-2 text-sm placeholder-white/40 " +
    "outline-none focus:outline-none focus:ring-0 focus:border-red-500/50 transition-colors",
  textarea:
    "w-full rounded-xl border border-white/10 bg-zinc-900/40 px-3 py-2 text-sm min-h-24 sm:min-h-28 " +
    "outline-none focus:outline-none focus:ring-0 focus:border-red-500/50 transition-colors",
  btn:
    "rounded-xl px-3 py-2 text-sm transition-colors outline-none focus:outline-none focus:ring-0",
  btnPrimary: "bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white",
  btnWarn: "bg-yellow-600 hover:bg-yellow-700 text-black/90",
  btnDanger: "bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white",
  btnGhost: "border border-white/20 hover:bg-white/10",
  btnIcon:
    "flex items-center justify-center rounded-lg border border-white/10 bg-zinc-900/40 hover:bg-white/10 " +
    "outline-none focus:outline-none focus:ring-0 w-8 h-8", // ícone compacto
  pickerBtn:
    "flex items-center justify-center rounded-xl border border-white/10 bg-zinc-900/40 px-3 py-2 " +
    "outline-none focus:outline-none focus:ring-0 hover:bg-zinc-900/60 transition-colors",
  panel:
    "absolute z-50 mt-2 w-[30rem] max-w-[92vw] rounded-xl border border-white/10 bg-zinc-900/95 backdrop-blur " +
    "p-3 shadow-2xl",
  gridIconBtn:
    "group flex flex-col items-center gap-1 rounded-lg border border-white/10 bg-zinc-900/40 px-2 py-2 " +
    "hover:bg-white/10 transition-colors",
};

/* ===================== Utils ===================== */
const slugify = (s = "") =>
  s
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 64);

function ensureUniqueSlug(base, takenSet) {
  if (!takenSet.has(base)) return base;
  let i = 2;
  while (takenSet.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

const parseList = (str = "") =>
  str
    .split(/[\r\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

// cache-busting
const ts = () => `_ts=${Date.now()}`;

// tentar ler mensagem de erro da API (opcional, não altera design)
async function readError(r, fallback = "Erro") {
  let msg = fallback;
  try {
    const j = await r.json();
    if (j?.error) msg = j.error;
  } catch {}
  return msg;
}

/* ===================== UI bits ===================== */
function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`px-4 py-3 rounded-xl shadow border ${
          toast.type === "error"
            ? "bg-red-600/90 border-red-500"
            : "bg-emerald-600/90 border-emerald-500"
        } text-white text-sm sm:text-base`}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold">{toast.title}</span>
          <button
            onClick={onClose}
            className={`${ui.btn} ${ui.btnGhost} px-2 py-1`}
            title="Fechar"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        {toast.msg && (
          <div className="text-xs sm:text-sm opacity-90 mt-1">{toast.msg}</div>
        )}
      </div>
    </div>
  );
}

function Field({ label, hint, ...props }) {
  return (
    <label className="text-xs sm:text-sm space-y-1 block">
      <div className="text-white/70 flex items-center gap-2">
        <span>{label}</span>
        {hint && (
          <span className="text-[10px] sm:text-[11px] text-white/40">
            {hint}
          </span>
        )}
      </div>
      <input {...props} className={`${ui.input} ${props.className || ""}`} />
    </label>
  );
}

function TextArea({ label, ...props }) {
  return (
    <label className="text-xs sm:text-sm space-y-1 block">
      <div className="text-white/70">{label}</div>
      <textarea
        {...props}
        className={`${ui.textarea} ${props.className || ""}`}
      />
    </label>
  );
}

/* =============== IconPicker =============== */
function IconPicker({ value, onChange, compact = false }) {
  const [open, setOpen] = useState(false);
  const [iconsModule, setIconsModule] = useState(null);
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const panelRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setQuery(rawQuery), 150);
    return () => clearTimeout(t);
  }, [rawQuery]);

  useEffect(() => {
    if (!open || iconsModule) return;
    (async () => {
      const mod = await import("lucide-react");
      setIconsModule(mod);
    })();
  }, [open, iconsModule]);

  useEffect(() => {
    if (!value || iconsModule) return;
    (async () => {
      const mod = await import("lucide-react");
      setIconsModule(mod);
    })();
  }, [value, iconsModule]);

  useEffect(() => {
    function onDocClick(e) {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const isReactComponent = (x) =>
    typeof x === "function" ||
    (x && typeof x === "object" && ("$$typeof" in x || "render" in x));

  const allIcons = useMemo(() => {
    if (!iconsModule) return [];
    return Object.entries(iconsModule)
      .filter(
        ([name, exp]) =>
          /^[A-Z][A-Za-z0-9]*$/.test(name) &&
          isReactComponent(exp) &&
          exp.displayName === name
      )
      .map(([name, Comp]) => ({ name, Comp }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [iconsModule]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allIcons;
    return allIcons.filter(({ name }) => name.toLowerCase().includes(q));
  }, [allIcons, query]);

  const CurrentIcon = useMemo(() => {
    if (!iconsModule || !value) return null;
    const Comp = iconsModule[value];
    return Comp && Comp.displayName === value ? Comp : null;
  }, [iconsModule, value]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={`${ui.pickerBtn} ${compact ? "w-10 h-10 px-0" : "w-full"}`}
        title={value || "(Ícone)"}
        aria-label="Escolher ícone"
      >
        {CurrentIcon ? (
          <CurrentIcon className="h-5 w-5" />
        ) : (
          <Search className="h-5 w-5 opacity-80" />
        )}
      </button>

      {open && (
        <div ref={panelRef} className={ui.panel}>
          <input
            autoFocus
            placeholder="Procurar ícone…"
            className={`${ui.input} mb-3`}
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
          />

          {!iconsModule ? (
            <div className="text-white/60 text-sm px-1 py-4">
              A carregar ícones…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-white/60 text-sm px-1 py-4">
              Sem resultados
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-80 overflow-auto pr-1">
              {filtered.map(({ name, Comp }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange?.(name);
                    setOpen(false);
                  }}
                  className={`${ui.gridIconBtn} ${
                    value === name ? "ring-1 ring-red-500" : ""
                  }`}
                  title={name}
                >
                  <Comp className="h-6 w-6" />
                  <span className="text-[10px] text-white/70 truncate w-full text-center">
                    {name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ===================== Aux: Galeria ===================== */
function UrlListEditor({ label, values = [], onChange }) {
  const list = Array.isArray(values) ? values : [];
  function setItem(i, val) {
    const next = [...list];
    next[i] = val;
    onChange(next);
  }
  function addEmpty() {
    onChange([...list, ""]);
  }
  function removeAt(i) {
    const next = list.filter((_, idx) => idx !== i);
    onChange(next);
  }
  function handlePaste(e) {
    const text = e.clipboardData?.getData("text") || "";
    if (text.includes("\n") || text.includes(",")) {
      e.preventDefault();
      const extra = text
        .split(/[\r\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      onChange([...list, ...extra]);
    }
  }

  return (
    <div className="text-xs sm:text-sm space-y-2">
      <div className="text-white/70">{label}</div>
      <div className="grid gap-2">
        {list.map((url, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={url}
              onChange={(e) => setItem(i, e.target.value)}
              onPaste={handlePaste}
              placeholder="https://…"
              className={ui.input}
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className={`${ui.btnIcon} bg-red-600/20 hover:bg-red-600/30`}
              title="Remover"
              aria-label="Remover"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={addEmpty}
            className={`${ui.btn} ${ui.btnPrimary}`}
            title="Adicionar imagem"
          >
            + Adicionar imagem
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== Helpers para highlights "Icon|Título|Descrição" ===== */
function parseHighlight(str = "") {
  const [icon = "", title = "", ...rest] = str.split("|").map((s) => s.trim());
  const desc = rest.join(" | ");
  return { icon, title, desc };
}
function serializeHighlight({ icon, title, desc }) {
  return [icon, title, desc]
    .map((s) => (s || "").trim())
    .filter(Boolean)
    .join(" | ");
}

/* ===================== Aux: Highlights ===================== */
function HighlightListEditor({ label, values = [], onChange }) {
  const items = (Array.isArray(values) ? values : []).map(parseHighlight);
  function setItem(i, patch) {
    const next = items.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    onChange(next.map(serializeHighlight));
  }
  function addEmpty() {
    onChange(
      [...items, { icon: "", title: "", desc: "" }].map(serializeHighlight)
    );
  }
  function removeAt(i) {
    const next = items.filter((_, idx) => idx !== i);
    onChange(next.map(serializeHighlight));
  }

  return (
    <div className="text-xs sm:text-sm space-y-2">
      <div className="text-white/70">{label}</div>
      <div className="grid gap-3">
        {items.map((it, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-12">
            <div className="sm:col-span-1">
              <IconPicker
                value={it.icon}
                onChange={(name) => setItem(i, { icon: name })}
                compact
              />
            </div>
            <input
              value={it.title}
              onChange={(e) => setItem(i, { title: e.target.value })}
              placeholder="Título"
              className={`${ui.input} sm:col-span-4`}
            />
            <input
              value={it.desc}
              onChange={(e) => setItem(i, { desc: e.target.value })}
              placeholder="Descrição (opcional)"
              className={`${ui.input} sm:col-span-6`}
            />
            <div className="sm:col-span-1 flex justify-end">
              <button
                type="button"
                onClick={() => removeAt(i)}
                className={`${ui.btnIcon} bg-red-600/20 hover:bg-red-600/30`}
                title="Remover"
                aria-label="Remover"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={addEmpty}
            className={`${ui.btn} ${ui.btnPrimary}`}
            title="Adicionar highlight"
          >
            + Adicionar highlight
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== Main ===================== */
export default function Dashboard() {
  /* ------- State ------- */
  const [services, setServices] = useState([]);
  const [extrasByService, setExtrasByService] = useState({});
  const [detailByViewId, setDetailByViewId] = useState({});

  const [loading, setLoading] = useState({
    svc: false,
    ex: {},
    det: {},
    act: false,
  });
  const [toast, setToast] = useState(null);

  const [svcNew, setSvcNew] = useState({ title: "", imageUrl: "" });
  const [svcEdit, setSvcEdit] = useState({});

  const [exNew, setExNew] = useState({ title: "", imageUrl: "" });
  const [exEdit, setExEdit] = useState({});

  const [detEdit, setDetEdit] = useState({});

  // seleção para os 3 painéis
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedExtraId, setSelectedExtraId] = useState(null);

  // procura serviços e extras c/ debounce
  const [svcFilter, setSvcFilter] = useState("");
  const debouncedSvcFilter = useDebounce(svcFilter, 200);

  const [exFilter, setExFilter] = useState("");
  const debouncedExFilter = useDebounce(exFilter, 200);
  useEffect(() => {
    setExFilter("");
  }, [selectedServiceId]);

  /* ------- Helpers ------- */
  const ok = (title, msg) => setToast({ type: "ok", title, msg });
  const err = (title, msg) => setToast({ type: "error", title, msg });
  const clearToast = () => setToast(null);

  function logout() {
    fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
      .catch(() => {})
      .finally(() =>
        setTimeout(() => (window.location.href = "/backoffice/login"), 60)
      );
  }

  /* ===================== Loaders ===================== */
  async function loadServices() {
    setLoading((s) => ({ ...s, svc: true }));
    try {
      const r = await fetch(`${API_BASE}/api/services?${ts()}`, {
        credentials: "include",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await r.json();
      const list = Array.isArray(data) ? data : [];

      setServices(list.map((s) => ({ ...s, _extrasCount: undefined })));

      if (list.length && !selectedServiceId) setSelectedServiceId(list[0].id);

      for (const svc of list) {
        try {
          const res = await fetch(
            `${API_BASE}/api/extras?service_id=${svc.id}&locale=pt&${ts()}`,
            { credentials: "include", headers: { "Cache-Control": "no-cache" } }
          );
          const arr = await res.json();
          const extras = Array.isArray(arr) ? arr : [];
          setExtrasByService((prev) => ({ ...prev, [svc.id]: extras }));
          setServices((prev) =>
            prev.map((s) =>
              s.id === svc.id ? { ...s, _extrasCount: extras.length } : s
            )
          );
        } catch {
          setServices((prev) =>
            prev.map((s) => (s.id === svc.id ? { ...s, _extrasCount: 0 } : s))
          );
        }
      }
    } finally {
      setLoading((s) => ({ ...s, svc: false }));
    }
  }

  async function loadExtras(serviceId) {
    setLoading((s) => ({ ...s, ex: { ...s.ex, [serviceId]: true } }));
    try {
      const r = await fetch(
        `${API_BASE}/api/extras?service_id=${serviceId}&locale=pt&${ts()}`,
        { credentials: "include", headers: { "Cache-Control": "no-cache" } }
      );
      const data = await r.json();
      const arr = Array.isArray(data) ? data : [];
      setExtrasByService((prev) => ({ ...prev, [serviceId]: arr }));
      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId ? { ...s, _extrasCount: arr.length } : s
        )
      );
      if (!arr.some((x) => x.id === selectedExtraId)) setSelectedExtraId(null);
      return arr;
    } finally {
      setLoading((s) => ({ ...s, ex: { ...s.ex, [serviceId]: false } }));
    }
  }

  async function loadDetail(viewId) {
    if (!viewId) return;
    setLoading((s) => ({ ...s, det: { ...s.det, [viewId]: true } }));
    try {
      const r = await fetch(
        `${API_BASE}/api/details?view_id=${encodeURIComponent(
          viewId
        )}&locale=pt&${ts()}`,
        { headers: { "Cache-Control": "no-cache" } }
      );
      if (r.ok) {
        const d = await r.json();
        setDetailByViewId((p) => ({ ...p, [viewId]: d }));
        setDetEdit((p) => ({
          ...p,
          [viewId]: {
            description: d.description || "",
            galleryUrls: Array.isArray(d.galleryUrls)
              ? d.galleryUrls
              : parseList(d.galleryUrls || ""),
            highlights: Array.isArray(d.highlights)
              ? d.highlights.map((h) => {
                  if (typeof h === "string") return h;
                  const icon = (h?.icon || "").trim();
                  const title = (h?.title || "").trim();
                  const desc = (h?.desc || "").trim();
                  return [icon, title, desc].filter(Boolean).join(" | ");
                })
              : parseList(d.highlights || ""),
          },
        }));
      } else {
        setDetailByViewId((p) => ({ ...p, [viewId]: null }));
        setDetEdit((p) => ({
          ...p,
          [viewId]: { description: "", galleryUrls: [], highlights: [] },
        }));
      }
    } finally {
      setLoading((s) => ({ ...s, det: { ...s.det, [viewId]: false } }));
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (selectedServiceId && !extrasByService[selectedServiceId]) {
      loadExtras(selectedServiceId);
    }
  }, [selectedServiceId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const extra = currentExtras.find((x) => x.id === selectedExtraId);
    if (extra && detailByViewId[extra.viewId] === undefined)
      loadDetail(extra.viewId);
  }, [selectedExtraId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ===================== Derived ===================== */
  const filteredServices = useMemo(() => {
    const q = debouncedSvcFilter.trim().toLowerCase();
    return q
      ? services.filter((s) => s.title?.toLowerCase().includes(q))
      : services;
  }, [services, debouncedSvcFilter]);

  const currentExtras = useMemo(() => {
    return extrasByService[selectedServiceId] || [];
  }, [extrasByService, selectedServiceId]);

  const filteredExtras = useMemo(() => {
    const q = debouncedExFilter.trim().toLowerCase();
    return q
      ? currentExtras.filter((x) => x.title?.toLowerCase().includes(q))
      : currentExtras;
  }, [currentExtras, debouncedExFilter]);

  const selectedExtra = useMemo(() => {
    return currentExtras.find((x) => x.id === selectedExtraId) || null;
  }, [currentExtras, selectedExtraId]);

  /* ===================== Actions: Serviço ===================== */
  async function createService(e) {
    e.preventDefault();
    setLoading((s) => ({ ...s, act: true }));
    try {
      const title = (svcNew.title || "").trim();
      if (!title) throw new Error("Título é obrigatório.");
      const r = await fetch(`${API_BASE}/api/services`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          imageUrl: (svcNew.imageUrl || "").trim(),
        }),
      });
      if (!r.ok) throw new Error(await readError(r, "Falha ao criar serviço"));
      setSvcNew({ title: "", imageUrl: "" });
      await loadServices();
      ok(`Serviço (${title}) criado com sucesso`, "");
    } catch (e) {
      err("Erro", e.message);
    } finally {
      setLoading((s) => ({ ...s, act: false }));
    }
  }
  function startEditService(s) {
    setSvcEdit((p) => ({
      ...p,
      [s.id]: { id: s.id, title: s.title, imageUrl: s.imageUrl },
    }));
  }
  function cancelEditService(id) {
    setSvcEdit((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
  }
  async function saveEditService(e, id) {
    e.preventDefault();
    setLoading((s) => ({ ...s, act: true }));
    try {
      const form = svcEdit[id];
      const title = (form.title || "").trim();
      if (!title) throw new Error("Título é obrigatório.");
      const r = await fetch(`${API_BASE}/api/services/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          imageUrl: (form.imageUrl || "").trim(),
        }),
      });
      if (!r.ok) throw new Error(await readError(r, "Falha ao guardar serviço"));
      cancelEditService(id);
      await loadServices();
      ok(`Serviço (${title}) guardado com sucesso`, "");
    } catch (e) {
      err("Erro", e.message);
    } finally {
      setLoading((s) => ({ ...s, act: false }));
    }
  }
  async function deleteServiceCascade(id) {
    if (!confirm("Eliminar serviço e respetivos extras/detalhes?")) return;
    setLoading((s) => ({ ...s, act: true }));
    try {
      const svc = services.find((s) => s.id === id);
      const r = await fetch(`${API_BASE}/api/services/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!r.ok) throw new Error(await readError(r, "Falha ao eliminar serviço"));
      setExtrasByService((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      });
      if (selectedServiceId === id) {
        setSelectedServiceId(null);
        setSelectedExtraId(null);
      }
      await loadServices();
      ok(`Serviço (${svc?.title || id}) eliminado com sucesso`, "");
    } catch (e) {
      err("Erro", e.message);
    } finally {
      setLoading((s) => ({ ...s, act: false }));
    }
  }

  /* ===================== Actions: Extra ===================== */
  function setNewExtraField(field, value) {
    setExNew((p) => ({ ...p, [field]: value }));
  }
  async function createExtra(e) {
    e.preventDefault();
    if (!selectedServiceId) return;
    setLoading((s) => ({ ...s, act: true }));
    try {
      const base = slugify(exNew.title || "");
      if (!base) throw new Error("Título do extra é obrigatório.");
      const taken = new Set(
        (extrasByService[selectedServiceId] || [])
          .map((x) => x.viewId)
          .filter(Boolean)
      );
      const viewId = ensureUniqueSlug(base, taken);
      const r = await fetch(`${API_BASE}/api/extras`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: Number(selectedServiceId),
          title: exNew.title,
          imageUrl: exNew.imageUrl,
          viewId,
          locale: "pt",
          isActive: 1,
        }),
      });
      if (!r.ok) throw new Error(await readError(r, "Falha ao criar extra"));

      const createdTitle = exNew.title;
      setExNew({ title: "", imageUrl: "" });

      const arr = await loadExtras(selectedServiceId);
      const created = arr.find((x) => x.viewId === viewId);
      if (created) setSelectedExtraId(created.id);
      ok(`Extra (${createdTitle}) criado com sucesso`, "");
    } catch (e) {
      err("Erro", e.message);
    } finally {
      setLoading((s) => ({ ...s, act: false }));
    }
  }
  function startEditExtra(extra) {
    setExEdit((p) => ({
      ...p,
      [extra.id]: {
        id: extra.id,
        title: extra.title,
        imageUrl: extra.imageUrl,
      },
    }));
  }
  function cancelEditExtra(extraId) {
    setExEdit((p) => {
      const n = { ...p };
      delete n[extraId];
      return n;
    });
  }
  async function saveEditExtra(e, extra) {
    e.preventDefault();
    setLoading((s) => ({ ...s, act: true }));
    try {
      const form = exEdit[extra.id];
      const title = (form.title || "").trim();
      if (!title) throw new Error("Título é obrigatório.");
      const r = await fetch(`${API_BASE}/api/extras/${extra.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          imageUrl: (form.imageUrl || "").trim(),
          viewId: extra.viewId,
          locale: "pt",
          isActive: 1,
        }),
      });
      if (!r.ok) throw new Error(await readError(r, "Falha ao guardar extra"));
      cancelEditExtra(extra.id);
      await loadExtras(selectedServiceId);
      ok(`Extra (${title}) guardado com sucesso`, "");
    } catch (e) {
      err("Erro", e.message);
    } finally {
      setLoading((s) => ({ ...s, act: false }));
    }
  }
  async function deleteExtra(extra) {
    if (!confirm("Eliminar extra (e respetivo detalhe)?")) return;
    setLoading((s) => ({ ...s, act: true }));
    try {
      const r = await fetch(`${API_BASE}/api/extras/${extra.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!r.ok) throw new Error(await readError(r, "Falha ao eliminar extra"));
      await loadExtras(selectedServiceId);
      if (selectedExtraId === extra.id) setSelectedExtraId(null);
      ok(`Extra (${extra.title}) eliminado com sucesso`, "");
    } catch (e) {
      err("Erro", e.message);
    } finally {
      setLoading((s) => ({ ...s, act: false }));
    }
  }

  /* ===================== Actions: Detalhe ===================== */
  async function saveDetail(e) {
    e.preventDefault();
    if (!selectedExtra) return;
    setLoading((s) => ({ ...s, act: true }));
    try {
      const form =
        detEdit[selectedExtra.viewId] || {
          description: "",
          galleryUrls: [],
          highlights: [],
        };

      const galleryUrls = Array.isArray(form.galleryUrls)
        ? form.galleryUrls.filter(Boolean)
        : parseList(form.galleryUrls);

      const highlightLines = Array.isArray(form.highlights)
        ? form.highlights
        : parseList(form.highlights);

      const payload = {
        viewId: selectedExtra.viewId,
        locale: "pt",
        description: form.description,
        galleryUrls,
        highlights: highlightLines,
      };

      const r = await fetch(`${API_BASE}/api/details`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(await readError(r, "Falha ao guardar detalhe"));
      await loadDetail(selectedExtra.viewId);
      ok(`Detalhe (${selectedExtra.title}) guardado com sucesso`, "");
    } catch (e) {
      err("Erro", e.message);
    } finally {
      setLoading((s) => ({ ...s, act: false }));
    }
  }
  async function deleteDetail() {
    if (!selectedExtra) return;
    if (!confirm("Eliminar detalhe (locale pt) deste extra?")) return;
    setLoading((s) => ({ ...s, act: true }));
    try {
      const r = await fetch(
        `${API_BASE}/api/details?view_id=${encodeURIComponent(
          selectedExtra.viewId
        )}&locale=pt`,
        { method: "DELETE", credentials: "include" }
      );
      if (!r.ok) throw new Error(await readError(r, "Falha ao eliminar detalhe"));
      setDetailByViewId((p) => ({ ...p, [selectedExtra.viewId]: null }));
      setDetEdit((p) => ({
        ...p,
        [selectedExtra.viewId]: {
          description: "",
          galleryUrls: [],
          highlights: [],
        },
      }));
      ok(`Detalhe (${selectedExtra.title}) eliminado com sucesso`, "");
    } catch (e) {
      err("Erro", e.message);
    } finally {
      setLoading((s) => ({ ...s, act: false }));
    }
  }

  /* ===================== Render ===================== */
  return (
    <section className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-12">
      <div className="max-w-8xl mx-auto flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold">
            Backoffice · Dashboard
          </h1>
          <button
            onClick={logout}
            className={`${ui.btn} ${ui.btnGhost}`}
            title="Logout"
          >
            Logout
          </button>
        </div>

        {/* 3 painéis: Serviço | Extra | Detalhe */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-6 sm:pt-8 lg:pt-12">
          {/* Painel 1: Serviços */}
          <div className={ui.card}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-sm sm:text-base">Serviços</div>
              <span className="text-[11px] sm:text-xs text-white/60">
                {services.length} total
              </span>
            </div>

            {/* Add serviço */}
            <form onSubmit={createService} className="space-y-2 mb-4">
              <Field
                label="Nome"
                value={svcNew.title}
                onChange={(e) =>
                  setSvcNew({ ...svcNew, title: e.target.value })
                }
                placeholder="Insere o nome do serviço..."
              />
              {svcNew.title && (
                <div className="text-[10px] sm:text-[11px] text-white/50">
                  Sugestão de slug: {slugify(svcNew.title)}
                </div>
              )}
              <Field
                label="URL da imagem"
                value={svcNew.imageUrl}
                onChange={(e) =>
                  setSvcNew({ ...svcNew, imageUrl: e.target.value })
                }
                placeholder="Insere o URL da imagem..."
              />
              {svcNew.imageUrl && (
                <img
                  src={svcNew.imageUrl}
                  alt="preview"
                  className="h-9 w-14 sm:h-10 sm:w-16 object-cover rounded border border-white/10"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
              <div className="flex justify-end">
                <button
                  disabled={loading.act}
                  className={`${ui.btn} ${ui.btnPrimary}`}
                  title="Adicionar serviço"
                >
                  + Adicionar Serviço
                </button>
              </div>
            </form>

            {/* Search Serviços */}
            <div className="mb-3">
              <input
                placeholder="Procurar serviço…"
                className={ui.input}
                value={svcFilter}
                onChange={(e) => setSvcFilter(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-auto space-y-2">
              {loading.svc && !services.length && (
                <div className="text-white/60">A carregar serviços…</div>
              )}
              {filteredServices.map((s) => {
                const editing = !!svcEdit[s.id];
                const selected = selectedServiceId === s.id;
                return (
                  <div
                    key={s.id}
                    className={`bg-black/20 ${
                      selected
                        ? "border border-red-600 sm:border-2 sm:border-red-600"
                        : "border border-white/10"
                    } rounded-xl`}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <img
                        src={s.imageUrl || "/img/placeholder-service.jpg"}
                        alt={s.title}
                        className="h-10 w-14 sm:h-12 sm:w-16 object-cover rounded-lg border border-white/10"
                        onError={(e) =>
                          (e.currentTarget.src = "/img/placeholder-service.jpg")
                        }
                      />

                      {!editing ? (
                        <button
                          className="flex-1 text-left outline-none focus:outline-none"
                          onClick={() => setSelectedServiceId(s.id)}
                          title="Selecionar serviço"
                        >
                          <div className="font-semibold text-sm sm:text-base truncate">
                            {s.title}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-white/50">
                            {s._extrasCount ?? "…"} extras
                          </div>
                        </button>
                      ) : (
                        <form
                          onSubmit={(e) => saveEditService(e, s.id)}
                          className="flex-1 grid gap-2"
                        >
                          <input
                            className={ui.input}
                            value={svcEdit[s.id].title}
                            onChange={(e) =>
                              setSvcEdit((p) => ({
                                ...p,
                                [s.id]: { ...p[s.id], title: e.target.value },
                              }))
                            }
                          />
                          <div className="flex items-center gap-2">
                            <input
                              className={`${ui.input} flex-1`}
                              value={svcEdit[s.id].imageUrl}
                              onChange={(e) =>
                                setSvcEdit((p) => ({
                                  ...p,
                                  [s.id]: {
                                    ...p[s.id],
                                    imageUrl: e.target.value,
                                  },
                                }))
                              }
                            />
                            {svcEdit[s.id].imageUrl && (
                              <img
                                src={svcEdit[s.id].imageUrl}
                                alt="preview"
                                className="h-7 w-10 sm:h-8 sm:w-12 object-cover rounded border border-white/10"
                                onError={(e) =>
                                  (e.currentTarget.style.display = "none")
                                }
                              />
                            )}
                          </div>
                        </form>
                      )}

                      <div className="flex gap-2">
                        {!editing ? (
                          <>
                            <button
                              className={ui.btnIcon}
                              onClick={() => startEditService(s)}
                              title="Editar"
                              aria-label="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              disabled={loading.act}
                              className={`${ui.btnIcon} bg-red-600/20 hover:bg-red-600/30`}
                              onClick={() => deleteServiceCascade(s.id)}
                              title="Eliminar"
                              aria-label="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              disabled={loading.act}
                              className={`${ui.btnIcon} bg-red-600 hover:bg-red-700 text-white border-transparent`}
                              onClick={(e) => saveEditService(e, s.id)}
                              title="Guardar"
                              aria-label="Guardar"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              className={ui.btnIcon}
                              onClick={() => cancelEditService(s.id)}
                              title="Cancelar"
                              aria-label="Cancelar"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Painel 2: Extras */}
          <div className={ui.card}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-sm sm:text-base">Extras</div>
              <span className="text-[11px] sm:text-xs text-white/60">
                {selectedServiceId ? currentExtras.length + " itens" : "—"}
              </span>
            </div>

            {!selectedServiceId ? (
              <div className="text-white/60 text-sm">
                Seleciona um serviço para gerir extras.
              </div>
            ) : (
              <>
                <form onSubmit={createExtra} className="grid gap-2 mb-4">
                  <Field
                    label="Nome"
                    value={exNew.title}
                    onChange={(e) => setNewExtraField("title", e.target.value)}
                    placeholder="Insere o nome do serviço..."
                  />
                  <Field
                    label="URL da imagem"
                    value={exNew.imageUrl}
                    onChange={(e) => setNewExtraField("imageUrl", e.target.value)}
                    placeholder="Insere o URL da imagem..."
                  />
                  {exNew.imageUrl && (
                    <img
                      src={exNew.imageUrl}
                      alt="preview"
                      className="h-9 w-14 sm:h-10 sm:w-16 object-cover rounded border border-white/10"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                  <div className="flex justify-end">
                    <button
                      disabled={loading.act}
                      className={`${ui.btn} ${ui.btnPrimary}`}
                      title="Adicionar extra"
                    >
                      + Adicionar Extra
                    </button>
                  </div>
                </form>

                {loading.ex[selectedServiceId] && (
                  <div className="text-white/60 mb-2">A carregar extras…</div>
                )}

                {/* Search Extras */}
                <div className="mb-3">
                  <input
                    placeholder="Procurar extra…"
                    className={ui.input}
                    value={exFilter}
                    onChange={(e) => setExFilter(e.target.value)}
                    disabled={!selectedServiceId}
                  />
                </div>

                <div className="flex-1 overflow-auto space-y-2">
                  {filteredExtras.map((x) => {
                    const editingExtra = !!exEdit[x.id];
                    const selected = selectedExtraId === x.id;
                    return (
                      <div
                        key={x.id}
                        className={`bg-black/20 ${
                          selected
                            ? "border border-red-600 sm:border-2 sm:border-red-600"
                            : "border border-white/10"
                        } rounded-xl`}
                      >
                        <div className="flex items-center gap-3 p-3">
                          <img
                            src={x.imageUrl || "/img/placeholder-service.jpg"}
                            alt={x.title}
                            className="h-10 w-14 sm:h-12 sm:w-16 object-cover rounded-lg border border-white/10"
                            onError={(e) =>
                              (e.currentTarget.src =
                                "/img/placeholder-service.jpg")
                            }
                          />
                          {!editingExtra ? (
                            <button
                              className="flex-1 text-left outline-none focus:outline-none"
                              onClick={() => setSelectedExtraId(x.id)}
                              title="Selecionar extra"
                            >
                              <div className="font-semibold truncate text-sm sm:text-base">
                                {x.title}
                              </div>
                            </button>
                          ) : (
                            <form
                              onSubmit={(e) => saveEditExtra(e, x)}
                              className="flex-1 grid gap-2"
                            >
                              <input
                                className={ui.input}
                                value={exEdit[x.id].title}
                                onChange={(e) =>
                                  setExEdit((p) => ({
                                    ...p,
                                    [x.id]: {
                                      ...p[x.id],
                                      title: e.target.value,
                                    },
                                  }))
                                }
                              />
                              <div className="flex items-center gap-2">
                                <input
                                  className={`${ui.input} flex-1`}
                                  value={exEdit[x.id].imageUrl}
                                  onChange={(e) =>
                                    setExEdit((p) => ({
                                      ...p,
                                      [x.id]: {
                                        ...p[x.id],
                                        imageUrl: e.target.value,
                                      },
                                    }))
                                  }
                                />
                                {exEdit[x.id].imageUrl && (
                                  <img
                                    src={exEdit[x.id].imageUrl}
                                    alt="preview"
                                    className="h-7 w-10 sm:h-8 sm:w-12 object-cover rounded border border-white/10"
                                    onError={(e) =>
                                      (e.currentTarget.style.display = "none")
                                    }
                                  />
                                )}
                              </div>
                            </form>
                          )}

                          <div className="flex gap-2">
                            {!editingExtra ? (
                              <>
                                <button
                                  className={ui.btnIcon}
                                  onClick={() => startEditExtra(x)}
                                  title="Editar"
                                  aria-label="Editar"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  disabled={loading.act}
                                  className={`${ui.btnIcon} bg-red-600/20 hover:bg-red-600/30`}
                                  onClick={() => deleteExtra(x)}
                                  title="Eliminar"
                                  aria-label="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  disabled={loading.act}
                                  className={`${ui.btnIcon} bg-red-600 hover:bg-red-700 text-white border-transparent`}
                                  onClick={(e) => saveEditExtra(e, x)}
                                  title="Guardar"
                                  aria-label="Guardar"
                                >
                                  <Save className="h-4 w-4" />
                                </button>
                                <button
                                  className={ui.btnIcon}
                                  onClick={() => cancelEditExtra(x.id)}
                                  title="Cancelar"
                                  aria-label="Cancelar"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Painel 3: Detalhe */}
          <div className={ui.card}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-sm sm:text-base">Detalhe</div>
            </div>

            {!selectedExtra ? (
              <div className="text-white/60 text-sm">
                Seleciona um extra para editar o detalhe.
              </div>
            ) : (
              <>
                {loading.det[selectedExtra.viewId] && (
                  <div className="text-white/60 mb-2">A carregar detalhe…</div>
                )}

                <form onSubmit={saveDetail} className="grid gap-3">
                  <TextArea
                    label="Descrição"
                    value={detEdit[selectedExtra.viewId]?.description || ""}
                    onChange={(e) =>
                      setDetEdit((p) => ({
                        ...p,
                        [selectedExtra.viewId]: {
                          ...(p[selectedExtra.viewId] || {}),
                          description: e.target.value,
                        },
                      }))
                    }
                  />

                  <UrlListEditor
                    label="Galeria (URLs)"
                    values={
                      Array.isArray(detEdit[selectedExtra.viewId]?.galleryUrls)
                        ? detEdit[selectedExtra.viewId].galleryUrls
                        : (detEdit[selectedExtra.viewId]?.galleryUrls || "")
                            .split(/[\r\n,]+/)
                            .map((s) => s.trim())
                            .filter(Boolean)
                    }
                    onChange={(arr) =>
                      setDetEdit((p) => ({
                        ...p,
                        [selectedExtra.viewId]: {
                          ...(p[selectedExtra.viewId] || {}),
                          galleryUrls: arr,
                        },
                      }))
                    }
                  />

                  <HighlightListEditor
                    label="Highlights (Ícone, Título, Descrição)"
                    values={
                      Array.isArray(detEdit[selectedExtra.viewId]?.highlights)
                        ? detEdit[selectedExtra.viewId].highlights
                        : (detEdit[selectedExtra.viewId]?.highlights || "")
                            .split(/[\r\n]+/)
                            .map((s) => s.trim())
                            .filter(Boolean)
                    }
                    onChange={(arr) =>
                      setDetEdit((p) => ({
                        ...p,
                        [selectedExtra.viewId]: {
                          ...(p[selectedExtra.viewId] || {}),
                          highlights: arr,
                        },
                      }))
                    }
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      disabled={loading.act}
                      className={`${ui.btnIcon} bg-red-600 hover:bg-red-700 text-white border-transparent`}
                      title="Guardar detalhe"
                      aria-label="Guardar detalhe"
                      onClick={saveDetail}
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className={`${ui.btnIcon} bg-red-600/20 hover:bg-red-600/30`}
                      onClick={deleteDetail}
                      title="Eliminar detalhe"
                      aria-label="Eliminar detalhe"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <Toast toast={toast} onClose={clearToast} />
    </section>
  );
}

/* ===================== Hooks ===================== */
function useDebounce(value, delay = 200) {
  const [debounced, setDebounced] = useState(value);
  const timer = useRef(null);
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer.current);
  }, [value, delay]);
  return debounced;
}
