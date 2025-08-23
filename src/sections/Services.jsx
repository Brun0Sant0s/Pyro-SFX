import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, ChevronRight, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { services, extras } from "../data/services";

/* ------- carregamento dinâmico do detalhe (nível 3) ------- */
const DETAIL_VIEWS = import.meta.glob("../services/*.{jsx,tsx}");
function loadDetailView({ viewPath, viewId }) {
  if (viewPath) {
    const path = viewPath.startsWith("../services/") ? viewPath : `../services/${viewPath}`;
    return DETAIL_VIEWS[path] || null;
  }
  if (viewId) {
    return DETAIL_VIEWS[`../services/${viewId}.jsx`] || DETAIL_VIEWS[`../services/${viewId}.tsx`] || null;
  }
  return null;
}

/* ------- animações ------- */
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const transitionVariants = {
  initial: (dir = 1) =>
    prefersReducedMotion() ? { opacity: 0 } : { opacity: 0, x: dir * 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: prefersReducedMotion() ? { duration: 0 } : { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir = 1) =>
    prefersReducedMotion()
      ? { opacity: 0 }
      : { opacity: 0, x: dir * -20, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};

/* ------- UI ------- */
const Breadcrumb = ({ items = [] }) => {
  const visible = items.filter(Boolean);
  if (!visible.length) return null;
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-white/70 select-none">
      {visible.map((label, i) => (
        <React.Fragment key={`${label}-${i}`}>
          <span className={i === visible.length - 1 ? "text-white" : "text-white/70"}>{label}</span>
          {i < visible.length - 1 && (
            <ChevronRight className="h-3.5 w-3.5 text-white/60 opacity-60" aria-hidden="true" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

const BackButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 pl-2.5 pr-3 py-1.5 text-sm text-white/70 
               hover:border-white/20 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
    aria-label="Voltar"
    title="Voltar"
  >
    <ChevronLeft className="w-4 h-4" />
  </button>
);

const GridCard = ({ title, desc, image, cta, onClick }) => (
  <motion.button
    type="button"
    onClick={onClick}
    className="group relative block overflow-hidden rounded-xl w-full aspect-[4/3] text-left focus:outline-none"
    whileTap={{ scale: prefersReducedMotion() ? 1 : 0.985 }}
  >
    <img
      src={image.src}
      alt={image.alt}
      loading="lazy"
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
    />
    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
    <div className="relative z-10 flex h-full items-end p-5">
      <div>
        <h3 className="text-lg sm:text-xl text-white">{title}</h3>
        <span className="block mt-1 h-px w-10 bg-red-500" />
        {desc && <p className="mt-2 text-sm text-white/70">{desc}</p>}
        {cta && (
          <span className="mt-3 inline-flex items-center gap-1.5 text-sm text-white/90">
            <span className="relative">
              {cta}
              <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-white transition-all duration-300 ease-out group-hover:w-full" />
            </span>
            <ArrowRight className="size-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
          </span>
        )}
      </div>
    </div>
  </motion.button>
);

/* ===================== Componente Principal ===================== */
export default function Services() {
  const { t } = useTranslation();

  // seleção por níveis
  const [level1ServiceId, setLevel1ServiceId] = useState(null); // nível 1: serviço primário
  const [level2ExtraId, setLevel2ExtraId] = useState(null);     // nível 2: serviço secundário (extra)
  const [Level3DetailView, setLevel3DetailView] = useState(null); // nível 3: componente de detalhe
  const [detailMeta, setDetailMeta] = useState(null);             // dados passados ao detalhe (label + imgMain)

  // cálculo do nível atual (para animações)
  const currentLevel = Level3DetailView ? 3 : level1ServiceId ? (level2ExtraId ? 2 : 1) : 0;
  const prevLevelRef = useRef(currentLevel);
  const direction = currentLevel > prevLevelRef.current ? 1 : -1;
  useEffect(() => { prevLevelRef.current = currentLevel; }, [currentLevel]);

  // títulos para breadcrumb
  const level1Title = level1ServiceId ? services.find(s => s.id === level1ServiceId)?.title : null;
  const level2Title = level1ServiceId && level2ExtraId
    ? extras[level1ServiceId]?.find(e => e.id === level2ExtraId)?.title
    : null;

  // abrir detalhe (nível 3)
  async function mountDetail(extra) {
    const loader = loadDetailView(extra);
    if (!loader) return setLevel3DetailView(null);
    try {
      const mod = await loader();
      setLevel3DetailView(() => (mod?.default ? mod.default : null));
    } catch {
      setLevel3DetailView(null);
    }
  }

  // cliques por nível
  function onClickLevel1(service) {
    setLevel1ServiceId(service.id);
    setLevel2ExtraId(null);
    setLevel3DetailView(null);
    setDetailMeta(null);
  }

  function onClickLevel2(extra) {
    setLevel2ExtraId(extra.id);
    setLevel3DetailView(null);
    setDetailMeta({ label: extra.title, imgMain: extra.image?.src }); // passamos a imagem e o título do card clicado
    if (extra.viewPath || extra.viewId) mountDetail(extra);
  }

  // back
  function goBack() {
    if (currentLevel === 3) {
      setLevel3DetailView(null);
      if (level2ExtraId) setLevel2ExtraId(null);
      else if (!extras[level1ServiceId]?.length) setLevel1ServiceId(null);
      setDetailMeta(null);
    } else if (currentLevel === 2 || currentLevel === 1) {
      setLevel1ServiceId(null);
      setDetailMeta(null);
    }
  }

  return (
    <section id="servicos" className="relative isolate text-white scroll-mt-16">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-6xl">
         
          {/* Breadcrumb + voltar */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-4">
              {currentLevel > 0 && <BackButton onClick={goBack} />}
              <Breadcrumb items={[level1Title, level2Title].filter(Boolean)} />
            </div>
          </div>

          {/* Conteúdo por nível */}
          <div className="relative">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              {/* Nível 0: lista de serviços (primário) */}
              {currentLevel === 0 && (
                <motion.div
                  key="level-1-list"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={transitionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  custom={direction}
                >
                  {services.map((service) => (
                    <GridCard
                      key={service.id}
                      {...service}
                      cta={t("services.cta")}
                      onClick={() => onClickLevel1(service)}
                    />
                  ))}
                </motion.div>
              )}

              {/* Nível 1: extras (serviços secundários) */}
              {currentLevel === 1 && level1ServiceId && (
                <motion.div
                  key="level-2-list"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={transitionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  custom={direction}
                >
                  {(extras[level1ServiceId] ?? []).map((extra) => (
                    <GridCard
                      key={extra.id}
                      {...extra}
                      cta={t("services.cta")}
                      onClick={() => onClickLevel2(extra)}
                    />
                  ))}
                </motion.div>
              )}

              {/* Nível 2: detalhe do serviço (componente dinâmico) */}
              {currentLevel === 3 && Level3DetailView && (
                <motion.div
                  key="level-3-detail"
                  className="max-w-6xl mx-auto text-left"
                  variants={transitionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  custom={direction}
                >
                  <Level3DetailView meta={detailMeta} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
