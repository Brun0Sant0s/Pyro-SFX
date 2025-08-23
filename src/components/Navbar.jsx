import React from "react";
import { Menu as MenuIcon, X as XIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageMenu from "./LanguageMenu";

export default function Navbar({ onToggleMenu, open, activeSection }) {
  const { t } = useTranslation();

  const links = [
    { id: "sobre", label: t("navbar.about") },
    { id: "servicos", label: t("navbar.services") },
    { id: "portfolio", label: t("navbar.portfolio") },
    { id: "contactos", label: t("navbar.contacts") },
  ];

  const base = "transition-colors";
  const inactive = "text-white/70 hover:text-white";
  const activeText = "text-white";

  // altura da navbar (h-16 = 64px)
  const NAVBAR_HEIGHT = 64;

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - NAVBAR_HEIGHT;
    window.scrollTo({ top: y, behavior: "smooth" });
    if (open && typeof onToggleMenu === "function") onToggleMenu(); // fecha menu mobile se aberto
  };

  return (
    <div
      id="navbar-root"
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur border-b border-white/10 bg-black/30"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        {/* Links desktop */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-6 text-sm">
          {links.map((l) => {
            const isActive = activeSection === l.id;
            return (
              <a
                key={l.id}
                href={`#${l.id}`}
                aria-current={isActive ? "page" : undefined}
                className={`${base} ${isActive ? activeText : inactive} relative`}
                onClick={(e) => handleNavClick(e, l.id)}
              >
                <span className="relative">
                  {l.label}
                  <span
                    className={`absolute left-0 -bottom-[5px] h-[1px] bg-red-500 transition-all duration-300 ease-out ${
                      isActive ? "w-full" : "w-0 hover:w-full"
                    }`}
                  />
                </span>
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:block fixed top-[10px] right-[20px] z-50">
            <LanguageMenu />
          </div>

          {/* Botão hamburger */}
          <button
            onClick={onToggleMenu}
            className="md:hidden text-white/80 hover:text-white transition-colors"
            aria-label={open ? t("navbar.closeMenu") : t("navbar.openMenu")}
          >
            {open ? <XIcon className="size-6" /> : <MenuIcon className="size-6" />}
          </button>
        </div>
      </div>
    </div>
  );
}
