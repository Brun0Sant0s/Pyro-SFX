// components/MobileMenu.jsx
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import LanguageMenu from "./LanguageMenu";
import i18n from "../i18n";
import { useTranslation } from "react-i18next";

export default function MobileMenu({ open, onClose, activeSection }) {
  const { t } = useTranslation();

  const links = [
    { id: "sobre", label: t("navbar.about") },
    { id: "servicos", label: t("navbar.services") },
    { id: "portfolio", label: t("navbar.portfolio") },
    { id: "contactos", label: t("navbar.contacts") },
  ];

  const base = "block px-4 py-3 text-sm transition-colors";
  const inactive = "text-white/70 hover:text-white";
  const activeText = "text-white";

  // Fecha o menu quando o idioma muda (evita UI inconsistente)
  React.useEffect(() => {
    const handle = () => onClose?.();
    i18n.on("languageChanged", handle);
    return () => i18n.off("languageChanged", handle);
  }, [onClose]);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40"
          role="dialog"
          aria-modal="true"
          aria-label={t("navbar.mobileMenu", { defaultValue: "Menu móvel" })}
        >
          {/* Overlay: fecha ao clicar fora */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Painel do menu */}
          <motion.div
            initial={{ y: -12 }}
            animate={{ y: 0, transition: { duration: 0.18, ease: "easeOut" } }}
            className="absolute top-16 left-0 right-0 bg-black/30 backdrop-blur border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Seletor de idioma */}
            <div className="flex items-center justify-end px-3 py-2">
              <LanguageMenu direction="left" />
            </div>

            {/* Links */}
            <nav className="pb-2 divide-y divide-white/10">
              {links.map((l) => {
                const isActive = activeSection === l.id;
                return (
                  <a
                    key={l.id}
                    href={`#${l.id}`}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={`${base} ${isActive ? activeText : inactive} relative`}
                  >
                    <span className="relative inline-block">
                      {l.label}
                      <span
                        className={`absolute left-0 -bottom-[5px] h-[2px] bg-red-500 transition-all duration-300 ease-out ${
                          isActive ? "w-full" : "w-0 hover:w-full"
                        }`}
                      />
                    </span>
                  </a>
                );
              })}
            </nav>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
