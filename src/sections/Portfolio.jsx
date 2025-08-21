import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  ChevronRight, ChevronLeft, Sparkles, Wind, Flame, Zap, PartyPopper, Droplets, X as XIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import bgPyro from "../assets/services_1.png";
import bgPiromusical from "../assets/services_2.png";
import bgSfx from "../assets/services_3.png";
import { portfolioItems } from "../data/portfolioItems";

/* ==== IDs ============================================================= */
const MAIN = ["pyro", "piromusical", "sfx"];
const SFX_SUB = ["all", "flames", "co2", "lasers", "bubbles", "confetti"];
const TOP = ["all", ...MAIN];
const MAX = 6;

/* ==== Looks =========================================================== */
const BG = { pyro: bgPyro, piromusical: bgPiromusical, sfx: bgSfx, flames: bgSfx, co2: bgSfx, lasers: bgSfx, bubbles: bgSfx, confetti: bgSfx };
const TAG_ICON = { fireworks: Sparkles, co2: Wind, flames: Flame, lasers: Zap, bubbles: Droplets, confetti: PartyPopper };

const STYLES = `
@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
@keyframes scaleIn { from { opacity:.96; transform:scale(.995) } to { opacity:1; transform:scale(1) } }
@media (prefers-reduced-motion: no-preference) {
  .collapsible { transition: max-height 260ms ease, opacity 220ms ease, margin-top 220ms ease; will-change: max-height, opacity; }
}
`;

/* ==== Helpers UI ====================================================== */
const Btn = ({ active, children, className = "", ...p }) => (
  <button
    {...p}
    className={
      `rounded-2xl border transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20 ` +
      (active ? "border-white/20 bg-white/10 text-white " : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 ") +
      className
    }
  >
    {children}
  </button>
);

const TagIcon = ({ tag }) => {
  const I = TAG_ICON[tag] || Sparkles;
  return <I className="size-3.5" 
/>;
};

/* ==== Componente ====================================================== */
export default function Portfolio() {
  const { t } = useTranslation();

  const LABEL = {
    all: t("portfolio.filters.all"),
    pyro: t("services.pyroTitle"),
    piromusical: t("services.piromusicalTitle"),
    sfx: t("services.sfxTitle"),
    flames: t("portfolio.filters.sfx.chamas"),
    co2: t("portfolio.filters.sfx.co2"),
    lasers: t("portfolio.filters.sfx.lasers"),
    bubbles: t("portfolio.filters.sfx.bubbles"),
    confetti: t("portfolio.filters.sfx.confetti"),
  };

  const TAG_LABEL = {
    fireworks: t("tags.fireworks"),
    co2: t("tags.co2"),
    flames: t("tags.flames"),
    lasers: t("tags.lasers"),
    bubbles: t("tags.bubbles"),
    confetti: t("tags.confetti"),
  };

  const tagLabel = (id) => TAG_LABEL[id] || LABEL[id] || id;
  const serviceLabel = (id) => LABEL[id] || id;

  const [main, setMain] = useState("all");
  const [sfx, setSfx] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const [fade, setFade] = useState(false);

  const [project, setProject] = useState(null);
  const [idx, setIdx] = useState(0);
  const tmo = useRef(null);

  const hasServiceId = (services = [], id) => Array.isArray(services) && services.includes(id);
  const inSfx = (services) => hasServiceId(services, "sfx") || SFX_SUB.slice(1).some((sub) => hasServiceId(services, sub));

  const filtered = useMemo(() => {
    if (main === "all") return portfolioItems;
    if (main === "sfx") return portfolioItems.filter((it) => inSfx(it.services) && (sfx === "all" || hasServiceId(it.services, sfx)));
    return portfolioItems.filter((it) => hasServiceId(it.services, main));
  }, [main, sfx]);

  const visible = useMemo(() => (expanded ? filtered : filtered.slice(0, MAX)), [expanded, filtered]);
  const showSeeAll = !expanded && filtered.length > MAX;

  /* Evento externo (espera receber IDs) */
  useEffect(() => {
    const onSet = (e) => {
      const v = e?.detail;
      if (typeof v !== "string") return;
      if (TOP.includes(v)) applyMain(v);
      else if (SFX_SUB.includes(v)) { applyMain("sfx"); applySfx(v); }
    };
    window.addEventListener("portfolio:setFilter", onSet);
    return () => window.removeEventListener("portfolio:setFilter", onSet);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [main, sfx]);

  useEffect(() => () => clearTimeout(tmo.current), []);

  const scrollTop = () => document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const microFade = (fn) => { setFade(true); clearTimeout(tmo.current); tmo.current = setTimeout(() => { fn(); requestAnimationFrame(() => setFade(false)); }, 160); };

  const applyMain = (nextId) => {
    const target = TOP.includes(nextId) ? nextId : "all";
    if (target === main) return scrollTop();
    microFade(() => { setMain(target); if (target === "sfx") setSfx("all"); setExpanded(false); });
    scrollTop();
  };

  const applySfx = (nextId) => {
    const target = SFX_SUB.includes(nextId) ? nextId : "all";
    if (target === sfx) return scrollTop();
    microFade(() => { setSfx(target); setExpanded(false); });
    scrollTop();
  };

  /* Modal */
  const open = (p, i = 0) => { setProject(p); setIdx(i); document.body.style.overflow = "hidden"; };
  const close = () => { setProject(null); setIdx(0); document.body.style.overflow = ""; };
  const next = () => setIdx((i) => (i + 1) % (project?.media?.length || 1));
  const prev = () => setIdx((i) => (i - 1 + (project?.media?.length || 1)) % (project?.media?.length || 1));
  const media = project?.media?.[idx];

  useEffect(() => {
    if (!project) return;
    const onKey = (e) => { if (e.key === "Escape") close(); if (e.key === "ArrowRight") next(); if (e.key === "ArrowLeft") prev(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, idx]);

  const primaryId = (services = []) => {
    for (const id of [...MAIN, ...SFX_SUB.slice(1)]) if (hasServiceId(services, id)) return id;
    return "pyro";
  };

  return (
    <section id="portfolio" className="relative isolate text-white scroll-mt-16 min-h-[54svh]" aria-labelledby="portfolio-title">
      <style>{STYLES}</style>

      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28">
        <header className="text-center">
          <h2 id="portfolio-title" className="text-3xl sm:text-4xl tracking-tight">{t("portfolio.title")}</h2>
          <p className="mx-auto mt-12 max-w-2xl text-white/75">{t("portfolio.lead")}</p>
        </header>

        {/* Filtros principais */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {TOP.map((f) => (
            <Btn key={f} active={main === f} onClick={() => applyMain(f)} className="px-3 py-1.5 text-sm">
              {LABEL[f] ?? f}
            </Btn>
          ))}
        </div>

        {/* Subfiltros SFX */}
        <div className={`collapsible overflow-hidden ${main === "sfx" ? "mt-3 max-h-24 opacity-100" : "mt-0 max-h-0 opacity-0 pointer-events-none"}`} aria-hidden={main !== "sfx"}>
          <div className="flex flex-wrap justify-center gap-2">
            {SFX_SUB.map((sf) => (
              <Btn key={sf} active={sfx === sf} onClick={() => applySfx(sf)} className="px-3 py-1 text-xs" tabIndex={main === "sfx" ? 0 : -1}>
                {LABEL[sf] ?? sf}
              </Btn>
            ))}
          </div>
        </div>

        {/* GRID */}
        <div className={`mt-10 overflow-hidden transition-all duration-500 ease-out ${fade ? "opacity-0" : "opacity-100"}`}
             style={{ maxHeight: expanded ? `${filtered.length * 300}px` : `${MAX * 300}px` }}>
          <div className="flex flex-wrap justify-center gap-5 sm:gap-6">
            {visible.length === 0 && <div className="w-full text-center text-white/60 text-sm">{t("portfolio.empty")}</div>}

            {visible.map((it) => {
              const pid = primaryId(it.services);
              const bg = it.cover || BG[pid] || bgPyro;

              return (
                <a key={it.id} href="#"
                   onClick={(e) => { e.preventDefault(); open(it, 0); }}
                   className="group relative block overflow-hidden rounded-2xl border border-white/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20 transition-[transform,box-shadow] duration-300 ease-out w-[300px] sm:w-[340px] lg:w-[360px] xl:w-[380px] aspect-[4/3]">
                  <img src={bg} alt={it.title} loading="lazy" decoding="async"
                       className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none" />
                  <div className="absolute inset-0 bg-black/30 transition-opacity duration-300 ease-out group-hover:opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

                  {/* badge */}
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-xl border border-white/10 bg-black/50 px-2 py-1 text-xs text-white/80 backdrop-blur">
                    <TagIcon tag={it.tag} />
                    <span>{tagLabel(it.tag)}</span>
                  </div>

                  <div className="relative z-10 flex h-full items-end p-5 sm:p-6">
                    <div className="w-full">
                      <div className="text-lg sm:text-xl font-medium text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">{it.title}</div>
                      <div className="text-[12px] text-white/70 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                        {Array.isArray(it.services) ? it.services.map(serviceLabel).join(" · ") : serviceLabel(it.services)}
                      </div>
                      <div className="mt-1 h-[2px] w-12 bg-red-500" />
                      <div className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/90">
                        <span className="relative">
                          {t("portfolio.preview")}
                          <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-white transition-all duration-300 ease-out group-hover:w-full" />
                        </span>
                        <ChevronRight className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Ver todos */}
        {showSeeAll && (
          <div className="mt-8 flex justify-center">
            <Btn onClick={() => setExpanded(true)} className="px-4 py-2 text-sm border-white/15 bg-white/10 backdrop-blur hover:bg-white/15">
              {t("portfolio.seeAll")}
            </Btn>
          </div>
        )}
      </div>

      {/* MODAL */}
      {project && createPortal(
        <div className="fixed inset-0 z-[100000] bg-black/85 animate-[fadeIn_120ms_ease-out]" onClick={close}>
          <div className="group/modal relative mx-auto my-0 flex min-h-screen max-w-6xl items-center justify-center px-4 animate-[scaleIn_140ms_ease-out]"
               onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
                <div key={idx} className="h-full w-full">
                  {media?.type === "image" ? (
                    <img src={media.src} alt={media?.alt || ""} className="h-full w-full object-contain" />
                  ) : (
                    <video src={media?.src} poster={media?.poster} className="h-full w-full object-contain" controls autoPlay muted playsInline />
                     )}
                </div>

                {(project.media?.length || 0) > 1 && (
                  <>
                    <button onClick={prev} aria-label={t("portfolio.modal.prev")} className="absolute left-0 top-0 h-full w-1/5 md:w-1/4 focus:outline-none" />
                    <button onClick={next} aria-label={t("portfolio.modal.next")} className="absolute right-0 top-0 h-full w-1/5 md:w-1/4 focus:outline-none" />
                    <button aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 rounded-md bg-black/40 p-2 opacity-0 transition-opacity duration-150 group-hover/modal:opacity-100">
                      <ChevronLeft className="size-5 text-white" />
                    </button>
                    <button aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-black/40 p-2 opacity-0 transition-opacity duration-150 group-hover/modal:opacity-100">
                      <ChevronRight className="size-5 text-white" />
                    </button>
                  </>
                )}

                <button onClick={close} aria-label={t("portfolio.modal.close")} className="absolute right-3 top-3 rounded-md bg-black/45 p-2 text-white/90 transition hover:bg-black/60 focus:outline-none">
                  <XIcon className="size-5" />
                </button>

                {(project.media?.length || 0) > 1 && (
                  <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
                    {project.media.map((_, i) => (
                      <button key={i} onClick={() => setIdx(i)} aria-label={t("portfolio.modal.goto", { n: i + 1 })}
                              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-red-500" : "w-2 bg-white/50 hover:bg-white/80"}`} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
