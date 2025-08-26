// src/components/ServiceDetail.jsx
import * as Lucide from "lucide-react";

function parseHighlight(h) {
  // Aceita objetos {icon,title,desc} ou linhas "Icon|Título|Descrição"
  if (typeof h === "string") {
    const [icon = "", title = "", ...rest] = h.split("|").map(s => s.trim());
    return { icon, title, desc: rest.join(" | ") };
  }
  const icon = (h?.icon || "").trim();
  const title = (h?.title || "").trim();
  const desc = (h?.desc || "").trim();
  return { icon, title, desc };
}

function resolveIconComponent(name) {
  if (!name) return Lucide.Sparkles;
  const Comp = Lucide?.[name];
  // sanidade: só usa se for componente React, senão fallback
  const isComp =
    typeof Comp === "function" ||
    (Comp && typeof Comp === "object" && ("$$typeof" in Comp || "render" in Comp));
  return isComp ? Comp : Lucide.Sparkles;
}

export default function ServiceDetail({ data }) {
  const {
    label,
    imgMain,
    description,
    gallery = [],
    highlights = [],
  } = data;

  // normaliza highlights
  const normalizedHighlights = Array.isArray(highlights)
    ? highlights.map(parseHighlight).filter(h => h.title || h.desc || h.icon)
    : [];

  return (
    <section className="relative isolate text-white">
      <div className="w-full">
        {/* Cabeçalho com imagem e descrição */}
        <div className="grid items-center gap-8 md:gap-12 md:grid-cols-2">
          <div className="relative w-full aspect-[16/10] overflow-hidden rounded-xl">
            <img
              src={imgMain}
              alt={label}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl tracking-tight">{label}</h2>
            <p className="mt-3 text-base leading-relaxed text-white/80 max-w-prose">
              {description}
            </p>
          </div>
        </div>

        {/* Galeria */}
        {!!gallery.length && (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.map((src, i) => (
              <div
                key={i}
                className="relative w-full aspect-[16/10] overflow-hidden rounded-xl"
              >
                <img
                  src={src}
                  alt={`${label} imagem ${i + 1}`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Highlights */}
        {!!normalizedHighlights.length && (
          <section className="mt-12 md:mt-16">
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {normalizedHighlights.map(({ icon, title, desc }, idx) => {
                const Icon = resolveIconComponent(icon);
                return (
                  <li
                    key={`${title || icon || idx}-${idx}`}
                    className="flex flex-col items-start gap-2"
                  >
                    <Icon className="h-12 w-12 text-red-500" aria-hidden="true" />
                    <div className="text-base font-medium">{title}</div>
                    <p className="text-sm text-white/75 leading-relaxed">{desc}</p>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </section>
  );
}
