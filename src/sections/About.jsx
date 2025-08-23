import React from "react";
import { Star, Music2, ShieldCheck, Shield, Handshake, Leaf } from "lucide-react";

import imgHistoria from "../assets/services_1.png";
import imgMissao from "../assets/services_2.png";
import imgVisao from "../assets/services_3.png";

// Dados
const rows = [
  {
    key: "historia",
    label: "História",
    text:
      "A Pyro Entertainment & SFX nasceu da paixão pela pirotecnia e pela vontade de renovar o setor em Portugal. Unimos pirotecnia e efeitos especiais para criar experiências únicas e memoráveis, explorando novas técnicas para momentos ainda mais imersivos.",
    img: imgHistoria,
  },
  {
    key: "missao",
    label: "Missão",
    text:
      "A nossa missão é criar momentos inesquecíveis, unindo arte, emoção e segurança em espetáculos que tocam, surpreendem e ficam na memória.",
    img: imgMissao,
  },
  {
    key: "visao",
    label: "Visão",
    text:
      "Cada evento é uma narrativa. Criatividade, inovação e emoção transformam momentos comuns em memórias extraordinárias. Queremos ser referência em entretenimento ao vivo.",
    img: imgVisao,
  },
];

const values = [
  { icon: Star, title: "Excelência", desc: "Qualidade do conceito à execução." },
  { icon: Music2, title: "Criatividade", desc: "Originalidade para surpreender." },
  { icon: ShieldCheck, title: "Integridade", desc: "Ética e transparência." },
  { icon: Shield, title: "Segurança", desc: "Proteção de equipa, artistas e público." },
  { icon: Handshake, title: "Colaboração", desc: "Respeito e trabalho conjunto." },
  { icon: Leaf, title: "Responsabilidade Social", desc: "Sustentabilidade e impacto positivo." },
];

function Row({ item, reverse = false }) {
  return (
    <div className={`grid items-center gap-8 md:gap-12 md:grid-cols-2`}>
      <div className={`relative w-full aspect-[16/10] overflow-hidden rounded-xl ${reverse ? "md:order-2" : ""}`}>
        <img src={item.img} alt={item.label} className="absolute inset-0 h-full w-full object-cover" />
      </div>

      <div className={reverse ? "md:order-1" : ""}>
        <span className="text-2xl text-white">{item.label}</span>
        <span className="block mt-1 h-[1px] w-10 bg-red-500" />
        <p className="mt-3 text-base leading-relaxed text-white/80 max-w-prose">{item.text}</p>
      </div>
    </div>
  );
}

export default function About() {
  return (
    <section id="sobre" className="relative isolate text-white">
      <div className="w-full">
     

        <div className="flex flex-col gap-12 md:gap-16">
          {rows.map((item, i) => (
            <Row key={item.key} item={item} reverse={i % 2 === 1} />
          ))}
        </div>

        <section className="mt-12 md:mt-16">
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-4">
                <Icon className="mt-1 h-10 w-10 sm:h-12 sm:w-12 text-red-500 shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-base">{title}</div>
                  <p className="mt-2 text-sm text-white/75 leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
