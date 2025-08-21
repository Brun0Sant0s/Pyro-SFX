// components/LanguageMenu.jsx
import React from "react";
import i18n from "../i18n";
import ReactCountryFlag from "react-country-flag";

const LANGS = [
  { code: "pt", label: "Português", country: "PT" },
  { code: "en", label: "English",   country: "GB" },
  { code: "es", label: "Español",   country: "ES" },
];

const FLAG = 20;
const ITEM_W = 30;
const ITEM_H = 20;
const GAP_H = 6;
const GAP = 0;
const R_COLLAPSED = 12;
const R_EXPANDED = 16;
const MENU_PAD = 6;

const STYLES = `
.lang-frame{
  position:absolute; right:0; top:0; z-index:-1;
  border:1px solid rgba(255,255,255,.1);
  background:rgba(0,0,0,.6);
  backdrop-filter:blur(8px);
  box-shadow:0 8px 32px rgba(0,0,0,.45);
  pointer-events:none;
  transition: height 220ms cubic-bezier(.2,.8,.2,1), width 200ms ease, border-radius 200ms ease;
}
.lang-btn{ transition: transform 160ms ease; }
.lang-menu{ will-change: opacity, transform; }
.lang-menu[aria-hidden="true"]{ opacity:0; pointer-events:none; }
.lang-menu[aria-hidden="false"]{ opacity:1; pointer-events:auto; }
.lang-menu.v[aria-hidden="true"]{ transform: translateY(6px); }
.lang-menu.v[aria-hidden="false"]{ transform: translateY(0); }
.lang-reveal-v{ transition: clip-path 200ms ease; will-change: clip-path; }
.lang-reveal-v.closed{ clip-path: inset(0% 0% 100% 0%); }
.lang-reveal-v.open{   clip-path: inset(0% 0% 0% 0%); }
.lang-menu.h[aria-hidden="true"]{ transform: translateX(6px); }
.lang-menu.h[aria-hidden="false"]{ transform: translateX(0); }
.lang-reveal-h{
  display:flex; flex-direction:row-reverse; align-items:center;
  gap:${GAP_H}px; white-space:nowrap;
  transition: clip-path 200ms ease; will-change: clip-path;
}
.lang-reveal-h.closed{ clip-path: inset(0% 100% 0% 0%); }
.lang-reveal-h.open{   clip-path: inset(0% 0%   0% 0%); }
.lang-item{ transition: opacity 140ms ease, transform 140ms ease; }
.lang-item.closed{ opacity:0; transform: translateX(8px); }
.lang-item.open{   opacity:1; transform: translateX(0); }
@keyframes flagIn{ from{opacity:0; transform:translateY(2px) scale(.96) rotate(-6deg);} to{opacity:1; transform:none;} }
.lang-menu.v::before{
  content:""; position:absolute; left:0; right:0; top:-${GAP}px; height:${GAP}px;
}
.lang-menu.h::before{
  content:""; position:absolute; top:0; bottom:0; right:-${GAP}px; width:${GAP}px;
}
`;

export default function LanguageMenu({ className = "", direction = "down" }) {
  const [lng, setLng]   = React.useState(i18n.resolvedLanguage || "pt");
  const [open, setOpen] = React.useState(false);
  const isLeft = direction === "left";

  const buttonRef = React.useRef(null);
  const innerRef  = React.useRef(null);

  const [dims, setDims] = React.useState({ btnW: 0, btnH: 0, menuW: 0, menuH: 0 });

  React.useEffect(() => {
    const onChange = () => setLng(i18n.resolvedLanguage);
    i18n.on("languageChanged", onChange);
    return () => i18n.off("languageChanged", onChange);
  }, []);

  const current = (lng || "pt").slice(0, 2);
  const active  = LANGS.find(l => l.code === current) || LANGS[0];
  const others  = LANGS.filter(l => l.code !== current);
  const dropdownLangs = others.slice(0, 2);
  const orderedDropdown = isLeft ? [...dropdownLangs].reverse() : dropdownLangs;

  const measureVertical = React.useCallback(() => {
    const btn = buttonRef.current;
    const inner = innerRef.current;
    if (!btn) return;
    const br = btn.getBoundingClientRect();
    const menuW = inner ? inner.scrollWidth  : 0;
    const menuH = inner ? inner.scrollHeight : 0;
    setDims({ btnW: br.width, btnH: br.height, menuW, menuH });
  }, []);

  React.useEffect(() => {
    if (isLeft) {
      const br = buttonRef.current?.getBoundingClientRect();
      setDims(d => ({ ...d, btnW: br?.width || d.btnW, btnH: br?.height || d.btnH }));
      return;
    }
    measureVertical();
    const ro = new ResizeObserver(measureVertical);
    if (buttonRef.current) ro.observe(buttonRef.current);
    if (innerRef.current)  ro.observe(innerRef.current);
    const onResize = () => measureVertical();
    window.addEventListener("resize", onResize);
    return () => { ro.disconnect(); window.removeEventListener("resize", onResize); };
  }, [isLeft, measureVertical]);

  React.useEffect(() => {
    if (!isLeft) measureVertical();
  }, [lng, isLeft, measureVertical]);

  const count = dropdownLangs.length;
  const horizW = count * ITEM_W + (count - 1) * GAP_H;
  const frameW = isLeft
   ? (dims.btnW || 0) + (open ? GAP + (horizW + MENU_PAD * 2) : 0) 
    : Math.max(dims.btnW, open ? dims.menuW : 0);      

  const frameH = isLeft
    ? Math.max(dims.btnH, ITEM_H + MENU_PAD * 2)
    : (dims.btnH || 0) + (open ? GAP + (dims.menuH || 0) + MENU_PAD * 2 : 0);

  const change = (code) => {
    setOpen(false);
    if (code !== current) i18n.changeLanguage(code);
  };

  const mobileTop = Math.max(0, ((dims.btnH || 0) - (ITEM_H + MENU_PAD * 2)) / 2);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <style>{STYLES}</style>

      <div
        aria-hidden
        className="lang-frame"
        style={{
          width: frameW || undefined,
          height: frameH || undefined,
          borderRadius: open ? R_EXPANDED : R_COLLAPSED,
        }}
      />

      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        title={active.label}
        onClick={() => setOpen(v => !v)}
        className="lang-btn relative inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        style={{ padding: 8, transform: open ? "scale(1.03)" : "scale(1)" }}
      >
        <span className="relative z-10 block" aria-label={active.label}>
          <span key={current} className="block pb-1 pl-1 pr-1" style={{ animation: "flagIn 180ms ease-out " }}>
            <ReactCountryFlag
              countryCode={active.country}
              svg
              style={{ width: FLAG, height: FLAG, borderRadius: 4 }}
              aria-label={active.label}
            />
          </span>
        </span>
      </button>

      <div
        role="menu"
        className={`lang-menu ${isLeft ? "h" : "v"} absolute z-[60] p-1`}
        aria-hidden={!open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        style={
          isLeft
            ? { right: (dims.btnW || 0) + GAP, top: mobileTop }
            : { right: 0, top: (dims.btnH || 0) + GAP }
        }
      >
        <div
          ref={innerRef}
          className={`${isLeft ? "lang-reveal-h" : "lang-reveal-v"} ${open ? "open" : "closed"} relative z-10 ${isLeft ? "" : "flex flex-col items-center gap-px"}`}
        >
          {orderedDropdown.map(({ code, label, country }, idx) => {
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
                className={`lang-item ${open ? "open" : "closed"} inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${isActive ? "bg-white/10 cursor-default" : "hover:bg-white/10"}`}
                style={{
                  width: isLeft ? ITEM_W : undefined,
                  height: isLeft ? ITEM_H : undefined,
                  padding: isLeft ? 0 : 4,
                  transitionDelay: open ? `${60 + idx * 40}ms` : "0ms",
                }}
              >
                <ReactCountryFlag
                  countryCode={country}
                  svg
                  style={{ width: FLAG, height: FLAG, borderRadius: 4, marginRight: 3 }} // 👈 só aqui
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
