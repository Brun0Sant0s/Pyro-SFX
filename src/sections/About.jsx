import React, { useMemo, useRef, useState } from "react";
import { Star, Music2, ShieldCheck, Shield, Handshake, Leaf, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import imgHistoria from "../assets/services_1.png";
import imgMissao from "../assets/services_2.png";
import imgVisao from "../assets/services_3.png";

const baseBtn =
  "inline-flex items-center justify-center gap-2 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-black px-4 py-1.5 text-sm";

const btnVariants = (active) =>
  active
    ? "border border-white/20 bg-white/10 text-white"
    : "border border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10";

const Btn = React.forwardRef(({ active, children, className = "", ...p }, ref) => (
  <button ref={ref} {...p} className={`${baseBtn} ${btnVariants(active)} ${className}`}>
    {children}
  </button>
));

export default function About() {
  const values = [
    { icon: Star, title: "Excelência", desc: "Do conceito à execução, foco total na qualidade para experiências superiores." },
    { icon: Music2, title: "Espetáculos", desc: "Criatividade e originalidade constantes para surpreender e cativar." },
    { icon: ShieldCheck, title: "Integridade", desc: "Ética, transparência e relação de confiança com clientes e parceiros." },
    { icon: Shield, title: "Segurança", desc: "Operações seguras para equipa, artistas e público em todos os eventos." },
    { icon: Handshake, title: "Colaboração", desc: "Trabalho em equipa, respeito mútuo e execução coordenada." },
    { icon: Leaf, title: "Responsabilidade Social", desc: "Atuação responsável e sustentável, com impacto positivo nas comunidades." },
  ];

  const sections = [
    { key: "historia", label: "História", title: "De paixão a referência", text: "A Pyro Entertainment & SFX nasce da paixão por pirotecnia e efeitos especiais. Unimos criatividade e tecnologia para elevar o nível dos espetáculos ao vivo em Portugal, combinando pirotecnia, piromusicais e SFX para experiências memoráveis.", img: imgHistoria },
    { key: "missao", label: "Missão", title: "Impacto com precisão", text: "Criar experiências inesquecíveis e seguras com efeitos de alta qualidade e sincronização precisa — inspirar e impactar o público em cada evento.", img: imgMissao },
    { key: "visao", label: "Visão", title: "Inovar para emocionar", text: "Ser a referência em entretenimento ao vivo, onde inovação, criatividade e emoção transformam momentos em memórias fortes.", img: imgVisao },
  ];

  const prefersReducedMotion = useReducedMotion();

  const [activeKey, setActiveKey] = useState(sections[0].key);
  const active = useMemo(() => sections.find((s) => s.key === activeKey) || sections[0], [activeKey]);
  const currentIndex = sections.findIndex((s) => s.key === activeKey);

  const tabRefs = useRef([]);

  const go = (dir) => {
    const next = (currentIndex + dir + sections.length) % sections.length;
    setActiveKey(sections[next].key);
    tabRefs.current[next]?.focus();
  };

  const onTabsKeyDown = (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    else if (e.key === "Home") { e.preventDefault(); setActiveKey(sections[0].key); tabRefs.current[0]?.focus(); }
    else if (e.key === "End") { e.preventDefault(); setActiveKey(sections[sections.length - 1].key); tabRefs.current[sections.length - 1]?.focus(); }
  };

  const textAnim = prefersReducedMotion ? { initial: false, animate: { opacity: 1, y: 0 } } : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.25 } };
  const imgAnim = prefersReducedMotion ? { initial: false, animate: { opacity: 1, scale: 1 } } : { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.98 }, transition: { duration: 0.25 } };

  return (
    <section id="sobre" className="relative isolate text-white scroll-mt-16">
      <div className="mx-auto max-w-7xl w-full px-6 pt-12 pb-6">
        <header className="text-center">
          <h2 className="text-3xl sm:text-4xl tracking-tight">Sobre nós</h2>
         
        </header>
      </div>

      <div className="mx-auto max-w-7xl w-full px-6 pb-12 sm:pb-16 space-y-10">
        <div className="rounded-2xl border border-white/15 bg-black/30 backdrop-blur-sm p-3 sm:p-4">
          <div role="tablist" aria-label="Secções Sobre nós" className="flex flex-wrap items-center gap-2" onKeyDown={onTabsKeyDown}>
            {sections.map((s, i) => (
              <Btn key={s.key} role="tab" id={`tab-${s.key}`} aria-controls={`panel-${s.key}`} aria-selected={activeKey === s.key} tabIndex={activeKey === s.key ? 0 : -1} ref={(el) => (tabRefs.current[i] = el)} onClick={() => setActiveKey(s.key)} active={activeKey === s.key}>
                {s.label}
              </Btn>
            ))}
            <div className="ml-auto flex gap-2">
              <Btn onClick={() => go(-1)} aria-label="Anterior"><ChevronLeft className="h-4 w-4" /></Btn>
              <Btn onClick={() => go(1)} aria-label="Seguinte"><ChevronRight className="h-4 w-4" /></Btn>
            </div>
          </div>

          <div className="mt-4 grid md:grid-cols-2 gap-6 md:gap-8 items-center">
            <AnimatePresence mode="wait">
              <motion.div key={active.key + "-text"} {...textAnim} className="order-2 md:order-1" role="tabpanel" id={`panel-${active.key}`} aria-labelledby={`tab-${active.key}`}>
                <div className="text-left">
                  <h3 className="mt-3 text-2xl">{active.title}</h3>
                  <p className="mt-6 text-sm">{active.text}</p>
                </div>
              </motion.div>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.div key={active.key + "-img"} {...imgAnim} className="order-1 md:order-2">
                <div className="relative w-full h-56 sm:h-72">
                  <img src={active.img} alt={active.label} loading="lazy" className="w-full h-full object-cover rounded-xl border border-white/10 " />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <section className="mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl text-center w-full">Valores</h3>
          </div>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="group relative overflow-hidden rounded-2xl border border-white/15 p-5 ">
                <div className="flex items-start gap-4">
                    <Icon className="h-8 w-8 text-red-500" aria-hidden />
                  <div>
                    <h4 className="text-sm font-semibold">{title}</h4>
                    <p className="mt-1.5 text-xs text-white/70 leading-relaxed">{desc}</p>
                  </div>
                </div>
                <div aria-hidden className="pointer-events-none absolute -inset-px opacity-0 transition-opacity" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}