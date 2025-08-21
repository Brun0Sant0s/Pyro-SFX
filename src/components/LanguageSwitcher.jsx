// components/LanguageMenu.jsx
import React from "react";
import i18n from "../i18n";
import ReactCountryFlag from "react-country-flag";

const LANGS = [
  { code: "pt", label: "Português", country: "PT" },
  { code: "en", label: "English",   country: "GB" },
  { code: "es", label: "Español",   country: "ES" },
];

const GAP = 8; // px entre botão e dropdown
const R_COLLAPSED = 12; // ~ rounded-xl
const R_EXPANDED = 16;  // ~ rounded-2xl

// CSS-only animations (sem framer-motion)
const STYLES = `
  .lang-frame {
    position:absolute; right:0; top:0; z-index:-1;
    border:1px solid rgba(255,255,255,0.10);
    background:rgba(0,0,0,0.60);
    backdrop-filter:saturate(100%) blur(8px);
    box-shadow:0 8px 32px rgba(0,0,0,0.45);
    pointer-events:none;
    transition:
      height 220ms cubic-bezier(.2,.8,.2,1),
      width 200ms ease,
      border-radius 200ms ease,
      box-shadow 200ms ease;
  }
  .lang-btn { transition: transform 160ms ease; }

  /* Vertical (down) */
  .lang-menu { transition: opacity 140ms ease, transform 140ms ease; will-change: opacity, transform; }
  .lang-menu[aria-hidden="true"] { opacity:0; transform: translateY(6px); pointer-events:none; }
  .lang-menu[aria-hidden="false"] { opacity:1; transform: translateY(0); }
  .lang-reveal { transition: clip-path 220ms ease; will-change: clip-path; }
  .lang-reveal.closed { clip-path: inset(0% 0% 100% 0%); }
  .lang-reveal.open   { clip-path: inset(0% 0% 0% 0%); }

  /* Horizontal (right -> left) */
  .lang-menu.x[aria-hidden="true"] { opacity:0; transform: translateX(6px); pointer-events:none; }
  .lang-menu.x[aria-hidden="false"] { opacity:1; transform: translateX(0); }
  .lang-reveal-x { transform-origin: right center; transition: transform 220ms ease; will-change: transform; display:flex; align-items:center; gap:4px; }
  .lang-reveal-x.closed { transform: scaleX(0); }
  .lang-reveal-x.open   { transform: scaleX(1); }

  @keyframes flagIn { from { opacity:0; transform: translateY(2px) scale(.96) rotate(-6deg); } to { opacity:1; transform:none; } }
`;

export default function LanguageMenu({ className = "", direction = "down" }) {
  const [lng, setLng] = React.useState(i18n.resolvedLanguage || "pt");
  const [open, setOpen] = React.useState(false);

  const isLeft = direction === "left";

  const wrapperRef = React.useRef(null);
  const buttonRef = React.useRef(null);
  const menuRef   = React.useRef(null);

  const [dims, setDims] = React.useState({ btnW: 0, btnH: 0, menuW: 0, menuH: 0 });

  React.useEffect(() => {
    const onChange = () => setLng(i18n.resolvedLanguage);
    i18n.on("languageChanged", onChange);
    return () => i18n.off("languageChanged", onChange);
  }, []);

  const current = (lng || "pt").slice(0, 2);
  const active = LANGS.find((l) => l.code === current) || LANGS[0];

  const measure = React.useCallback(() => {
    const btn = buttonRef.current;
    const mnu = menuRef.current;
    if (!btn) return;
    const btnRect = btn.getBoundingClientRect();
    const menuRect = mnu ? mnu.getBoundingClientRect() : { width: 0, height: 0 };
    setDims({ btnW: btnRect.width, btnH: btnRect.height, menuW: menuRect.width, menuH: menuRect.height });
  }, []);

  React.useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (buttonRef.current) ro.observe(buttonRef.current);
    if (menuRef.current) ro.observe(menuRef.current);
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => { ro.disconnect(); window.removeEventListener("resize", onResize); };
  }, [open, measure]);

  React.useEffect(() => { measure(); }, [lng, measure]);

  const frameW = isLeft
    ? dims.btnW + (open ? GAP + dims.menuW : 0)
    : Math.max(dims.btnW, open ? dims.menuW : 0);
  const frameH = isLeft
    ? Math.max(dims.btnH, open ? dims.menuH : 0)
    : dims.btnH + (open ? GAP + dims.menuH : 0);

  const change = (code) => {
    setOpen(false); // fecha e deixa a animação correr
    if (code !== current) i18n.changeLanguage(code);
  };

  const onKeyDown = (e) => { if (e.key === "Escape") setOpen(false); };

  return (
    <div
      ref={wrapperRef}
      className={`relative inline-block ${className}
                  after:content-[''] after:absolute after:left-0 after:right-0
                  after:top-full after:h-3`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}
      onKeyDown={onKeyDown}
    >
      <style>{STYLES}</style>

      {/* Moldura única (border + vidro) que engloba botão + dropdown ao abrir */}
      <div
        aria-hidden
        className="lang-frame"
        style={{
          width: frameW || undefined,
          height: frameH || undefined,
          borderRadius: open ? R_EXPANDED : R_COLLAPSED,
        }}
      />

      {/* Botão: cresce no hover/aberto, sem border própria (usa a moldura) */}
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        title={active.label}
        onClick={() => setOpen((v) => !v)}
        className="lang-btn relative inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        style={{ padding: 8, transform: open ? "scale(1.03)" : "scale(1)" }}
      >
        {/* Flag ativa com transição ao trocar de língua (CSS keyframes) */}
        <span className="relative z-10 block" aria-label={active.label}>
          <span key={current} className="block" style={{ animation: "flagIn 180ms ease-out" }}>
            <ReactCountryFlag
              countryCode={active.country}
              svg
              style={{ width: 22, height: 22, borderRadius: 4 }}
              aria-label={active.label}
            />
          </span>
        </span>
      </button>

      {/* Dropdown sempre no DOM para permitir animação de fecho suave */}
      <div
        ref={menuRef}
        role="menu"
        className={`lang-menu ${isLeft ? "x" : ""} absolute z-[60] p-1`}
        style={isLeft ? { right: (dims.btnW || 0) + GAP, top: 0 } : { right: 0, top: (dims.btnH || 0) + GAP }}
        aria-hidden={!open}
      >
        {/* Revela de cima para baixo dentro da moldura */}
        <div className={`${isLeft ? "lang-reveal-x" : "lang-reveal"} ${open ? "open" : "closed"} relative z-10 ${isLeft ? "flex flex-row-reverse items-center gap-1" : "flex flex-col items-center gap-px"}`}>
          {LANGS.map(({ code, label, country }, idx) => {
            const isActive = code === current;
            return (
              <button
                key={code}
                type="button"
                onClick={() => change(code)}
                role="menuitem"
                aria-pressed={isActive}
                title={label}
                aria-label={label}
                className={
                  "rounded-md p-1 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30 " +
                  (isActive ? "bg-white/10 cursor-default" : "hover:bg-white/10")
                }
                style={{
                  transition: "opacity 120ms ease, transform 120ms ease",
                  transitionDelay: open ? `${80 + (isLeft ? (LANGS.length - 1 - idx) : idx) * 40}ms` : "0ms",
                  opacity: open ? 1 : 0,
                  transform: open ? "translate(0)" : (isLeft ? "translateX(6px)" : "translateY(6px)"),
                }}
              >
                <ReactCountryFlag
                  countryCode={country}
                  svg
                  style={{ width: 22, height: 22, borderRadius: 4 }}
                  aria-label={label}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
