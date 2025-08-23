import React from "react";
import { Stars, Timer } from "lucide-react";

import img1 from "../assets/services/espetaculo_pirotecnico_1.png";
import img2 from "../assets/services/espetaculo_pirotecnico_2.png";
import img3 from "../assets/services/espetaculo_pirotecnico_3.png";

const highlights = [
  { icon: Stars, title: "Pintura no C\u00e9u", desc: "Bombas, cometas e cascatas." },
  { icon: Timer, title: "Ritmo Planeado", desc: "Sequ\u00eancia detalhada." }
];

export default function EspetaculoPirotecnico({ meta }) {
  const { label, imgMain } = meta;

  const description = "Show aéreo de grande escala com bombas, cometas, palmeiras e cascatas. Design do desenho de céu, perímetros e aprovações incluídas.";
  const gallery = [img1, img2, img3];

  return (
    <section className="relative isolate text-white">
      <div className="w-full">
        <div className="grid items-center gap-8 md:gap-12 md:grid-cols-2">
          <div className="relative w-full aspect-[16/10] overflow-hidden rounded-xl">
            <img src={imgMain} alt={label} className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-3xl sm:text-4xl tracking-tight">{label}</h2>
            </div>
            <p className="text-base leading-relaxed text-white/80 max-w-prose">{description}</p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((src, i) => (
            <div key={i} className="relative w-full aspect-[16/10] overflow-hidden rounded-xl">
              <img src={src} alt={`${label} imagem ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" />
            </div>
          ))}
        </div>

        <section className="mt-12 md:mt-16">
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {highlights.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex flex-col items-start gap-2">
                <Icon className="h-12 w-12 text-red-500" aria-hidden="true" />
                <div className="text-base font-medium">{title}</div>
                <p className="text-sm text-white/75 leading-relaxed">{desc}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
