import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Wind,
  Flame,
  Zap,
  PartyPopper,
  Droplets,
  X as XIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

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
const BG = {
  pyro: bgPyro,
  piromusical: bgPiromusical,
  sfx: bgSfx,
  flames: bgSfx,
  co2: bgSfx,
  lasers: bgSfx,
  bubbles: bgSfx,
  confetti: bgSfx,
};
const TAG_ICON = {
  fireworks: Sparkles,
  co2: Wind,
  flames: Flame,
  lasers: Zap,
  bubbles: Droplets,
  confetti: PartyPopper,
};

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const navVariants = {
  initial: (dir = 1) =>
    prefersReduced() ? { opacity: 0 } : { opacity: 0, x: dir * 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: prefersReduced()
      ? { duration: 0 }
      : { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir = 1) =>
    prefersReduced()
      ? { opacity: 0 }
      : {
        opacity: 0,
        x: dir * -20,
        transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
      },
};

/* ==== Helpers ====================================================== */
const Btn = ({ active, children, className = "", ...p }) => (
  <button
    {...p}
    className={
      `rounded-xl border transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20 ` +
      (active
        ? "border-white/20 bg-white/10 text-white "
        : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 ") +
      className
    }
  >
    {children}
  </button>
);

const TagIcon = ({ tag }) => {
  const I = TAG_ICON[tag] || Sparkles;
  return <I className="size-3.5" />;
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

  const [project, setProject] = useState(null);
  const [idx, setIdx] = useState(0);

  const hasServiceId = (services = [], id) =>
    Array.isArray(services) && services.includes(id);
  const inSfx = (services) =>
    hasServiceId(services, "sfx") ||
    SFX_SUB.slice(1).some((sub) => hasServiceId(services, sub));

  const filtered = useMemo(() => {
    if (main === "all") return portfolioItems;
    if (main === "sfx")
      return portfolioItems.filter(
        (it) =>
          inSfx(it.services) &&
          (sfx === "all" || hasServiceId(it.services, sfx))
      );
    return portfolioItems.filter((it) => hasServiceId(it.services, main));
  }, [main, sfx]);

  const visible = useMemo(
    () => (expanded ? filtered : filtered.slice(0, MAX)),
    [expanded, filtered]
  );
  const showSeeAll = !expanded && filtered.length > MAX;

  const open = (p, i = 0) => {
    setProject(p);
    setIdx(i);
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    setProject(null);
    setIdx(0);
    document.body.style.overflow = "";
  };
  const next = () => setIdx((i) => (i + 1) % (project?.media?.length || 1));
  const prev = () =>
    setIdx(
      (i) => (i - 1 + (project?.media?.length || 1)) % (project?.media?.length || 1)
    );
  const media = project?.media?.[idx];

  const primaryId = (services = []) => {
    for (const id of [...MAIN, ...SFX_SUB.slice(1)])
      if (hasServiceId(services, id)) return id;
    return "pyro";
  };

  // atalhos de teclado no modal
  useEffect(() => {
    if (!project) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, idx]);

  return (
    <section id="portfolio" className="relative isolate text-white scroll-mt-16">
      <div className="max-w-7xl mx-auto">
       

        {/* Filtros principais */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TOP.map((f) => (
            <Btn
              key={f}
              active={main === f}
              onClick={() => setMain(f)}
              className="px-3 py-1.5 text-sm"
            >
              {LABEL[f] ?? f}
            </Btn>
          ))}
        </div>

        {/* Subfiltros SFX */}
        {main === "sfx" && (
          <div className="flex flex-wrap gap-2 mb-6">
            {SFX_SUB.map((sf) => (
              <Btn
                key={sf}
                active={sfx === sf}
                onClick={() => setSfx(sf)}
                className="px-3 py-1 text-xs"
              >
                {LABEL[sf] ?? sf}
              </Btn>
            ))}
          </div>
        )}

        {/* GRID animado como Services */}
        <div className="relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={main + sfx}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={navVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {visible.length === 0 && (
                <div className="col-span-full text-center text-white/60 text-sm">
                  {t("portfolio.empty")}
                </div>
              )}

              {visible.map((it) => {
                const pid = primaryId(it.services);
                const bg = it.cover || BG[pid] || bgPyro;

                return (
                  <motion.button
                    key={it.id}
                    type="button"
                    onClick={() => open(it, 0)}
                    className="group relative block overflow-hidden rounded-xl focus:outline-none transition-transform duration-300 ease-out w-full aspect-[4/3] text-left"
                    whileTap={{ scale: prefersReduced() ? 1 : 0.985 }}
                  >
                    <img
                      src={bg}
                      alt={it.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
                    <div className="relative z-10 flex h-full items-end p-5">
                      <div>
                        <h3 className="text-lg sm:text-xl text-white">{it.title}</h3>
                        <span className="block mt-1 h-[1px] w-10 bg-red-500" />
                        <p className="mt-2 text-sm text-white/70">
                          {Array.isArray(it.services)
                            ? it.services.map(serviceLabel).join(" · ")
                            : serviceLabel(it.services)}
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1.5 text-sm text-white/90">
                          <span className="relative">
                            {t("portfolio.preview")}
                            <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-white transition-all duration-300 ease-out group-hover:w-full" />
                          </span>
                          <ChevronRight className="size-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Ver todos */}
        {showSeeAll && (
          <div className="mt-8 flex justify-center">
            <Btn
              onClick={() => setExpanded(true)}
              className="px-4 py-2 text-sm border-white/15 bg-white/10 backdrop-blur hover:border-white/20 hover:bg-white/15 hover:text-white"
            >
              {t("portfolio.seeAll")}
            </Btn>

          </div>
        )}
      </div>

      {/* MODAL — minimal, botões iguais aos filtros */}
      {project &&
        createPortal(
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={prefersReduced() ? { duration: 0 } : { duration: 0.18 }}
            className="fixed inset-0 z-[100000] bg-black/85"
            onClick={close}
          >
            <div
              className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={prefersReduced() ? {} : { opacity: 0.98, scale: 0.995 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.98, scale: 0.995 }}
                transition={
                  prefersReduced()
                    ? { duration: 0 }
                    : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }
                }
                className="relative w-full overflow-hidden rounded-2xl bg-black/80"
              >
                {/* MEDIA */}
                <div className="relative aspect-video">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={prefersReduced() ? { duration: 0 } : { duration: 0.18 }}
                      className="absolute inset-0"
                    >
                      {media?.type === "image" ? (
                        <img
                          src={media.src}
                          alt={media?.alt || project?.title || ""}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <video
                          src={media?.src}
                          poster={media?.poster}
                          className="h-full w-full object-contain"
                          controls
                          autoPlay
                          muted
                          playsInline
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* SETAS com estilo dos filtros */}
                  {(project.media?.length || 0) > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prev}
                        aria-label={t("portfolio.modal.prev")}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-white/80 hover:border-white/20 hover:bg-white/10 focus:outline-none"
                      >
                        <ChevronLeft className="size-5" />
                      </button>
                      <button
                        type="button"
                        onClick={next}
                        aria-label={t("portfolio.modal.next")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-white/80 hover:border-white/20 hover:bg-white/10 focus:outline-none"
                      >
                        <ChevronRight className="size-5" />
                      </button>
                    </>
                  )}

                  {/* DOTS */}
                  {(project.media?.length || 0) > 1 && (
                    <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-2">
                      {project.media.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setIdx(i)}
                          aria-label={t("portfolio.modal.goto", { n: i + 1 })}
                          className={`h-1.5 rounded-full transition-all ${i === idx
                              ? "w-6 bg-white"
                              : "w-2 bg-white/40 hover:bg-white/70"
                            }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* CLOSE com estilo dos filtros */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      close();
                    }}
                    aria-label={t("portfolio.modal.close")}
                    className="absolute right-3 top-3 z-20 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-white/80 hover:border-white/20 hover:bg-white/10 focus:outline-none"
                  >
                    <XIcon className="size-4" />
                  </button>
                </div>

                {/* TÍTULO + linha vermelha + DESCRIÇÃO */}
                <div className="px-5 sm:px-6 py-4">
                  <h3 className="mt-4 text-lg sm:text-xl text-white">{project.title}</h3>
                  <span className="block mt-1 h-[1px] w-10 bg-red-500" />
                  {project.description && (
                    <p className="mt-2 text-sm text-white/70">{project.description}</p>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>,
          document.body
        )}



    </section>
  );
}
