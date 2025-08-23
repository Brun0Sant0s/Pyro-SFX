import imgPyro from "../assets/services_2.png";
import imgSfx from "../assets/services_3.png";

export const services = [
  {
    id: "1",
    title: "Pirotecnia",
    desc: "Fogo de artifício sincronizado para todo o tipo de evento.",
    image: { src: imgPyro, alt: "Fogo de artifício sobre multidão" },
  },
  {
    id: "2",
    title: "Efeitos Especiais",
    desc: "Impacto imediato com chamas, CO₂, confettis e muito mais.",
    image: { src: imgSfx, alt: "Jatos de CO₂ e chamas no palco" },
  },
  {
    id: "3",
    title: "Design & Custom",
    desc: "Conceito, modelação 3D e personalização para cenários e efeitos.",
    image: { src: imgPyro, alt: "Planeamento e design customizado" },
  },
];

export const extras = {
  1: [
    {
      id: "4",
      title: "Espetáculos Pirotécnicos",
      desc: "Shows aéreos com aprovações de segurança incluídas.",
      image: { src: imgPyro, alt: "Fogo de artifício" },
      viewId: "espetaculo_pirotecnico",
    },
    {
      id: "5",
      title: "Espetáculos Piromusicais",
      desc: "Coreografia de pirotecnia sincronizada com música.",
      image: { src: imgPyro, alt: "Pirotecnia musical" },
      viewId: "espetaculo_piromusical",
    },
    {
      id: "6",
      title: "Indoor",
      desc: "Pirotecnia segura para espaços interiores.",
      image: { src: imgPyro, alt: "Pirotecnia indoor" },
      viewId: "indoor",
    },
    {
      id: "7",
      title: "Pirotecnia Diurna",
      desc: "Efeitos coloridos e fumos para eventos de dia.",
      image: { src: imgPyro, alt: "Pirotecnia diurna" },
      viewId: "pirotecnia_diurna",
    },
  ],
  2: [
    {
      id: "8",
      title: "Chamas",
      desc: "Colunas de fogo para impacto visual no palco.",
      image: { src: imgSfx, alt: "Chamas em palco" },
      viewId: "chamas",
    },
    {
      id: "9",
      title: "CO2",
      desc: "Jatos de CO₂ de alta pressão para momentos épicos.",
      image: { src: imgSfx, alt: "Efeitos de CO₂" },
      viewId: "co2",
    },
    {
      id: "10",
      title: "Confettis/Streamers",
      desc: "Explosões de papel e serpentinas para celebrações.",
      image: { src: imgSfx, alt: "Confettis no ar" },
      viewId: "confettis_streamers",
    },
    {
      id: "11",
      title: "Lasers",
      desc: "Show de lasers dinâmicos e multicoloridos.",
      image: { src: imgSfx, alt: "Show de lasers" },
      viewId: "lasers",
    },
    {
      id: "12",
      title: "Low Fog",
      desc: "Efeito de nevoeiro baixo a cobrir o palco.",
      image: { src: imgSfx, alt: "Low fog" },
      viewId: "low_fog",
    },
    {
      id: "13",
      title: "Power Drop",
      desc: "Queda de cortinas ou bandeiras para revelar o palco.",
      image: { src: imgSfx, alt: "Power drop" },
      viewId: "power_drop",
    },
    {
      id: "14",
      title: "Bolhas",
      desc: "Máquinas de bolhas para ambientes festivos.",
      image: { src: imgSfx, alt: "Bolhas no ar" },
      viewId: "bolhas",
    },
    {
      id: "15",
      title: "Neve",
      desc: "Efeito de neve artificial para cenários mágicos.",
      image: { src: imgSfx, alt: "Neve artificial" },
      viewId: "neve",
    },
    {
      id: "16",
      title: "Espuma",
      desc: "Canhões de espuma para festas e eventos outdoor.",
      image: { src: imgSfx, alt: "Espuma em festa" },
      viewId: "espuma",
    },
    {
      id: "17",
      title: "Sparks",
      desc: "Efeitos de faíscas frias que criam momentos impactantes e seguros em palcos, festas e eventos especiais.",
      image: { src: imgSfx, alt: "Efeito de faíscas luminosas no palco" },
      viewId: "sparks",
    },
  ],
  3: [
    {
      id: "design-custom",
      title: "Design & Custom",
      desc: "Criação de conceitos visuais personalizados.",
      image: { src: imgPyro, alt: "Design e personalização" },
      viewId: "design_custom",
    },
    {
      id: "modelacao-3d",
      title: "Modelação 3D",
      desc: "Previsuais e blocking técnico em 3D.",
      image: { src: imgPyro, alt: "Modelos 3D" },
      viewId: "modelacao_3d",
    },
  ],
};
