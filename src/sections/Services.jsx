import React, { useMemo, useState, useRef, useEffect } from "react";
import { ArrowRight, ChevronRight, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

// dados
import { services, extras, detailsBySub } from "../data/services";

/* ─────────────────────────────────────────────────────────────────────────────
   Lazy loader para subviews (um ficheiro por (sub)serviço) via import.meta.glob
   Coloca os ficheiros em: src/subviews/<qualquerNome>.jsx  (export default)
----------------------------------------------------------------------------- */
const SUB_VIEWS = import.meta.glob("../services/*.{jsx,tsx}");

function resolveLoader({ viewPath, viewId }) {
  // Normaliza para uma key do SUB_VIEWS
  if (viewPath) {
    const normalized =
      viewPath.startsWith("../services/") ? viewPath : `../services/${viewPath}`;
    return SUB_VIEWS[normalized];
  }
  if (viewId) {
    return SUB_VIEWS[`../services/${viewId}.jsx`] || SUB_VIEWS[`../services/${viewId}.tsx`];
  }
  return null;
}

function LazySubView({ viewPath, viewId, fallbackLabel }) {
  const loader = resolveLoader({ viewPath, viewId });

  if (!loader) {
    return (
      <div className="text-white/80">
        Não existe vista definida{fallbackLabel ? <> para <code>{fallbackLabel}</code></> : null}.
        Define <code>viewPath</code> (ex.: <code>nome.jsx</code>) ou <code>viewId</code> (ex.: <code>nome</code>)
        nos teus dados e cria o ficheiro em <code>src/subviews/</code>.
      </div>
    );
  }

  const Comp = React.lazy(loader);

  return (
    <React.Suspense fallback={<div className="text-white/60">A carregar…</div>}>
      <ErrorBoundary>
        <Comp />
      </ErrorBoundary>
    </React.Suspense>
  );
}

/* Pequeno ErrorBoundary para apanhar erros de runtime do subcomponente */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message ?? "Erro desconhecido" };
  }
  componentDidCatch(error, info) {
    // opcional: logger
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">
          Ocorreu um erro ao renderizar a vista.
          <div className="mt-1 text-xs opacity-80">{this.state.message}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Motion helpers
----------------------------------------------------------------------------- */
const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const navVariants = {
  initial: (dir = 1) =>
    prefersReduced()
      ? { opacity: 0 }
      : { opacity: 0, x: dir * 20 },
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

/* ─────────────────────────────────────────────────────────────────────────────
   UI components
----------------------------------------------------------------------------- */
function Breadcrumb({ items = [] }) {
  const visible = items.filter(Boolean);
  if (!visible.length) return null;

  return (
    <nav
      aria-label="breadcrumb"
      className="flex items-center justify-center gap-2 text-sm text-white/70 select-none"
    >
      {visible.map((label, i) => (
        <React.Fragment key={`${label}-${i}`}>
          <span className={i === visible.length - 1 ? "text-white" : "text-white/70"}>
            {label}
          </span>
          {i < visible.length - 1 && (
            <ChevronRight className="h-3.5 w-3.5 opacity-60 text-white/60" aria-hidden="true" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-full mr-[10px] top-1/2 -translate-y-1/2
                 inline-flex items-center justify-center rounded-2xl
                 border border-white/15 bg-white/5 p-2
                 text-sm text-white/90 hover:bg-white/10"
      aria-label="Voltar"
      title="Voltar"
    >
      <ChevronLeft className="w-4 h-4" />
    </button>
  );
}

function Card({ title, desc, image, cta, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="group relative block overflow-hidden rounded-2xl border border-white/10
                 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20
                 transition-[transform,box-shadow] duration-300 ease-out
                 w-[300px] sm:w-[340px] lg:w-[360px] xl:w-[380px] aspect-[4/3] text-left"
      whileTap={{ scale: prefersReduced() ? 1 : 0.985 }}
      style={{ willChange: "transform" }}
    >
      <img
        src={image.src}
        alt={image.alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out
                   group-hover:scale-[1.03] motion-reduce:transition-none"
      />
      <div className="absolute inset-0 bg-black/30 transition-opacity duration-300 ease-out group-hover:opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

      <div className="relative z-10 flex h-full items-end p-5 sm:p-6">
        <div className="w-full">
          <div className="text-xl sm:text-2xl text-white mt-12">{title}</div>
          <div className="mt-1 h-[2px] w-12 bg-red-500" />
          {desc && <p className="mt-2 text-sm text-white/80">{desc}</p>}
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
}

/* ─────────────────────────────────────────────────────────────────────────────
   Página
----------------------------------------------------------------------------- */
export default function Services() {
  const { t } = useTranslation();

  // estado
  const [openBlock, setOpenBlock] = useState(null);       // serviço selecionado (id)
  const [selectedSub, setSelectedSub] = useState(null);   // subserviço selecionado (id)
  const [selectedView, setSelectedView] = useState(null); // { viewPath?, viewId? } quando vamos renderizar

  // cálculo do nível consoante o que está selecionado
  const level = selectedView ? 2 : openBlock ? 1 : 0;

  // direção para animação
  const prevLevelRef = useRef(level);
  const dir = level > prevLevelRef.current ? 1 : -1;
  useEffect(() => {
    prevLevelRef.current = level;
  }, [level]);

  // títulos para breadcrumb
  const serviceTitle = openBlock ? services.find((s) => s.id === openBlock)?.title : null;

  const subTitle =
    openBlock && selectedSub
      ? extras[openBlock]?.find((e) => e.id === selectedSub)?.title ||
        detailsBySub[selectedSub]?.title
      : null;

  // Handlers de clique
  const handleClickService = (service) => {
    const { id, viewPath, viewId } = service || {};
    if (viewPath || viewId) {
      // vai direto ao componente definido para o serviço
      setOpenBlock(id);
      setSelectedSub(null);
      setSelectedView({ viewPath, viewId });
    } else {
      // abre os extras
      setOpenBlock(id);
      setSelectedSub(null);
      setSelectedView(null);
    }
  };

  const handleClickSub = (sub) => {
    const { id, viewPath, viewId } = sub || {};
    setSelectedSub(id);
    setSelectedView(viewPath || viewId ? { viewPath, viewId } : null);
  };

  return (
    <section id="servicos" className="relative isolate text-white scroll-mt-16">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 text-center">
        <header className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl tracking-tight">{t("services.title")}</h2>
        </header>

        <div className="relative flex justify-center items-center mb-8 min-h-[20px]">
          <div className="relative inline-flex items-center">
            {level > 0 && (
              <BackButton
                onClick={() => {
                  if (level === 2) {
                    // se o serviço tinha view direta, ao voltar cai para 1 (lista de extras) se existirem, senão vai para 0
                    setSelectedView(null);
                    if (selectedSub) {
                      setSelectedSub(null);
                    } else if (!extras[openBlock]?.length) {
                      setOpenBlock(null);
                    }
                  } else {
                    setOpenBlock(null);
                  }
                }}
              />
            )}
            <Breadcrumb items={[serviceTitle, subTitle].filter(Boolean)} />
          </div>
        </div>

        <div className="relative mx-auto min-h-[380px]">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            {/* Nível 0 — serviços */}
            {level === 0 && (
              <motion.div
                key="nivel-0"
                className="flex flex-wrap justify-center gap-5 sm:gap-6"
                variants={navVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                custom={dir}
              >
                {services.map((s) => (
                  <Card
                    key={s.id}
                    {...s}
                    cta={t("services.cta")}
                    onClick={() => handleClickService(s)}
                  />
                ))}
              </motion.div>
            )}

            {/* Nível 1 — extras do serviço (se o serviço não for direto para uma view) */}
            {level === 1 && openBlock && (
              <motion.div
                key="nivel-1"
                className="flex flex-wrap justify-center gap-5 sm:gap-6"
                variants={navVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                custom={dir}
              >
                {(extras[openBlock] ?? []).map((e) => (
                  <Card
                    key={e.id}
                    {...e}
                    cta={t("services.cta")}
                    onClick={() => handleClickSub(e)}
                  />
                ))}
              </motion.div>
            )}

            {/* Nível 2 — render da view (de serviço ou subserviço) */}
            {level === 2 && selectedView && (
              <motion.div
                key="nivel-2"
                className="max-w-6xl mx-auto text-left"
                variants={navVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                custom={dir}
              >
                <LazySubView
                  viewPath={selectedView.viewPath}
                  viewId={selectedView.viewId}
                  fallbackLabel={subTitle || serviceTitle}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
