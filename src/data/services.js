import imgPyro from "../assets/services_2.png";
import imgSfx from "../assets/services_3.png";

export const services = [
  {
    id: "pyro",
    title: "Pirotecnia",
    desc: "Fogo de artifício sincronizado para todo o tipo de evento.",
    image: { src: imgPyro, alt: "Fogo de artifício sobre multidão" },

    // 👉 Clicar no serviço vai diretamente para este ficheiro:
    //    src/subviews/pyro-overview.jsx
  },
  {
    id: "sfx",
    title: "Efeitos Especiais",
    desc: "Chamas e CO₂ para impacto imediato.",
    image: { src: imgSfx, alt: "Jatos de CO₂ e chamas no palco" },

  },
  {
    id: "design",
    title: "Design & Custom",
    desc: "Conceito e modelação para cenários e efeitos.",
    image: { src: imgPyro, alt: "Planeamento e design customizado" },

  },
];

export const extras = {
  pyro: [
    {
      id: "fogo",
      title: "Fogo de Artifício",
      desc: "Shows e aprovações",
      image: { src: imgPyro, alt: "Fogo de artifício" },

      // 👉 src/subviews/fogo.jsx
      viewId: "pyro",
    },
    {
      id: "indoor",
      title: "Indoor",
      desc: "Fontes/cascatas interiores",
      image: { src: imgPyro, alt: "Pirotecnia indoor" },

      // 👉 src/subviews/indoor.jsx
      viewId: "indoor",
    },
  ],
  sfx: [
    {
      id: "chamas",
      title: "Chamas",
      desc: "Heads e DMX",
      image: { src: imgSfx, alt: "Chamas em palco" },

      // 👉 src/subviews/chamas.jsx
      viewId: "chamas",
    },
    {
      id: "co2",
      title: "CO₂",
      desc: "Pistolas e jatos fixos",
      image: { src: imgSfx, alt: "Colunas de CO₂" },

      // 👉 src/subviews/co2.jsx
      viewId: "co2",
    },
  ],
  design: [
    {
      id: "design-custom",
      title: "Design & Custom",
      desc: "Concept e renders",
      image: { src: imgPyro, alt: "Design e personalização" },

      // 👉 src/subviews/design-custom.jsx
      viewId: "design-custom",
    },
    {
      id: "modelacao-3d",
      title: "Modelação 3D",
      desc: "Previsuais e blocking",
      image: { src: imgPyro, alt: "Modelos 3D" },

      // 👉 src/subviews/modelacao-3d.jsx
      viewId: "modelacao-3d",
    },
  ],
};

