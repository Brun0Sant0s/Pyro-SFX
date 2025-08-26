// src/sections/Services.jsx
import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, ChevronRight, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import ServiceDetail from "./Services_detail";
import { getServices, getExtras, getDetail } from "../lib/api";

/* animações */
const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const transitionVariants = {
  initial: (dir = 1) => (prefersReducedMotion() ? { opacity: 0 } : { opacity: 0, x: dir * 20 }),
  animate: { opacity: 1, x: 0, transition: prefersReducedMotion() ? { duration: 0 } : { duration: 0.26, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir = 1) => (prefersReducedMotion() ? { opacity: 0 } : { opacity: 0, x: dir * -20, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }),
};

/* UI */
const Breadcrumb = ({ items = [] }) => {
  const visible = items.filter(Boolean);
  if (!visible.length) return null;
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-white/70 select-none">
      {visible.map((label, i) => (
        <React.Fragment key={`${label}-${i}`}>
          <span className={i === visible.length - 1 ? "text-white" : "text-white/70"}>{label}</span>
          {i < visible.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-white/60 opacity-60" aria-hidden="true" />}
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
      src={image?.src || "/img/placeholder-service.jpg"}
      alt={image?.alt || ""}
      loading="lazy"
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
      onError={(e) => { e.currentTarget.src = "/img/placeholder-service.jpg"; }}
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

  // estado
  const [services, setServices] = useState([]);               // nível 0
  const [extrasByService, setExtrasByService] = useState({}); // cache nível 1
  const [level1Service, setLevel1Service] = useState(null);
  const [level2Extra, setLevel2Extra] = useState(null);
  const [detailData, setDetailData] = useState(null);         // nível 3
  const [loading, setLoading] = useState({ svc: false, ex: false, det: false });
  const [error, setError] = useState(null);

  // animação
  const currentLevel = detailData ? 3 : level1Service ? (level2Extra ? 2 : 1) : 0;
  const prevLevelRef = useRef(currentLevel);
  const direction = currentLevel > prevLevelRef.current ? 1 : -1;
  useEffect(() => { prevLevelRef.current = currentLevel; }, [currentLevel]);

  // carregar serviços
  useEffect(() => {
    setLoading(s => ({ ...s, svc: true }));
    setError(null);
    getServices()
      .then(list => {
        const normalized = (Array.isArray(list) ? list : []).map(s => ({
          id: s.id,
          title: s.title,
          imageUrl: s.imageUrl ?? s.image_url ?? "",
        }));
        console.log("[Services] normalizado =", normalized);
        setServices(normalized);
      })
      .catch(err => {
        console.error("getServices falhou:", err);
        setError("Falha a obter serviços");
        setServices([]);
      })
      .finally(() => setLoading(s => ({ ...s, svc: false })));
  }, []);


  const level1Title = level1Service?.title ?? null;
  const level2Title = level2Extra?.title ?? null;
  const extras = level1Service ? (extrasByService[level1Service.id] ?? []) : [];

  async function onClickLevel1(service) {
    setLevel1Service(service);
    setLevel2Extra(null);
    setDetailData(null);

    if (!extrasByService[service.id]) {
      setLoading(s => ({ ...s, ex: true }));
      try {
        const list = await getExtras(service.id, "pt");
        // normalizar extras
        const normalized = (Array.isArray(list) ? list : []).map(e => ({
          id: e.id,
          title: e.title,
          imageUrl: e.imageUrl ?? e.image_url ?? "",
          viewId: e.viewId ?? e.view_id,
        }));
        setExtrasByService(prev => ({ ...prev, [service.id]: normalized }));
      } catch (e) {
        console.error("getExtras falhou:", e);
        setExtrasByService(prev => ({ ...prev, [service.id]: [] }));
      } finally {
        setLoading(s => ({ ...s, ex: false }));
      }
    }
  }

  async function onClickLevel2(extra) {
    setLevel2Extra(extra);
    setDetailData(null);

    setLoading(s => ({ ...s, det: true }));
    try {
      const d = await getDetail(extra.viewId, "pt"); // { description, galleryUrls, highlights }
      setDetailData({
        label: extra.title,
        imgMain: extra.imageUrl,
        description: d.description,
        gallery: d.galleryUrls,
        highlights: d.highlights
      });
    } catch (e) {
      console.error("Falha a obter detalhe", e);
      setDetailData(null);
    } finally {
      setLoading(s => ({ ...s, det: false }));
    }
  }

  function goBack() {
    if (currentLevel === 3) {
      setDetailData(null);
      setLevel2Extra(null);
    } else if (currentLevel === 2) {
      setLevel2Extra(null);
    } else if (currentLevel === 1) {
      setLevel1Service(null);
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
            {error && <p className="text-red-400 mb-4">{error}</p>}

            <AnimatePresence mode="wait" initial={false} custom={direction}>
              {/* Nível 0 */}
              {currentLevel === 0 && (
                <motion.div
                  key="level-1-list"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={transitionVariants}
                  initial="initial" animate="animate" exit="exit" custom={direction}
                >
                  {loading.svc && !services.length ? (
                    <div className="text-white/70">A carregar…</div>
                  ) : services.length ? (
                    services.map((s) => (
                      <GridCard
                        key={s.id}
                        title={s.title}
                        desc=""
                        image={{ src: s.imageUrl, alt: s.title }}
                        cta={t("services.cta")}
                        onClick={() => onClickLevel1(s)}
                      />
                    ))
                  ) : (
                    <div className="text-white/70">Sem serviços. (count={services.length})</div>
                  )}

                </motion.div>
              )}

              {/* Nível 1 */}
              {currentLevel === 1 && level1Service && (
                <motion.div
                  key="level-2-list"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  variants={transitionVariants}
                  initial="initial" animate="animate" exit="exit" custom={direction}
                >
                  {loading.ex && !extras.length ? (
                    <div className="text-white/70">A carregar…</div>
                  ) : extras.length ? (
                    extras.map((e) => (
                      <GridCard
                        key={e.id}
                        title={e.title}
                        desc=""
                        image={{ src: e.imageUrl, alt: e.title }}
                        cta={t("services.cta")}
                        onClick={() => onClickLevel2(e)}
                      />
                    ))
                  ) : (
                    <div className="text-white/70">Sem extras para este serviço.</div>
                  )}
                </motion.div>
              )}

              {/* Nível 3 */}
              {currentLevel === 3 && detailData && (
                <motion.div
                  key="level-3-detail"
                  className="max-w-6xl mx-auto text-left"
                  variants={transitionVariants}
                  initial="initial" animate="animate" exit="exit" custom={direction}
                >
                  {loading.det ? <div className="text-white/70">A carregar…</div> : <ServiceDetail data={detailData} />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
