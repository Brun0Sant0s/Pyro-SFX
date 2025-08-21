import React from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import logoGlow from "../assets/logo_glow.png";

export default function Hero() {
  const { t } = useTranslation();
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-transparent text-white overflow-hidden">
 

      <motion.div
        style={{ scale }}
        className="relative z-10 mx-auto max-w-7xl px-6 pt-24 pb-16 text-center"
      >
        <div className="size-256 mx-auto">
          <img
            src={logoGlow}
            alt={t("hero.logoAlt")}
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}
