import bgPyro from "../assets/services_1.png";
import bgPiromusical from "../assets/services_2.png";
import bgSfx from "../assets/services_3.png";

/**
 * Agora os serviços e as tags são SEMPRE IDs canónicos:
 *  - Serviços principais: "pyro" | "piromusical" | "sfx"
 *  - Sub-serviços SFX:    "flames" | "co2" | "lasers" | "bubbles" | "confetti"
 *  - Tags (badges):       "fireworks" | "co2" | "flames" | "lasers" | "bubbles" | "confetti"
 */
export const portfolioItems = [
  {
    id: 1,
    title: "Passagem de ano Porto",
    services: ["pyro", "piromusical"],
    tag: "fireworks",
    cover: bgPyro,
    media: [
      { type: "image", src: bgPiromusical, alt: "Fogo de artifício na Ribeira" },
      { type: "image", src: bgPiromusical, alt: "Piromusical" },
    ],
  },
  {
    id: 2,
    title: "SFX CO2",
    services: ["sfx", "co2"],
    tag: "co2",
    cover: bgSfx,
    media: [
      { type: "image", src: bgSfx, alt: "Efeito CO2 frontal" },
      { type: "video", src: bgSfx },
    ],
  },
  {
    id: 3,
    title: "SFX Chamas",
    services: ["sfx", "flames"],
    tag: "flames",
    cover: bgSfx,
    media: [
      { type: "image", src: bgSfx, alt: "Chamas front stage" },
      { type: "image", src: bgSfx, alt: "Chamas sincronizadas" },
    ],
  },
  {
    id: 4,
    title: "SFX Lasers",
    services: ["sfx", "lasers"],
    tag: "lasers",
    cover: bgSfx,
    media: [{ type: "image", src: bgSfx, alt: "Matriz de lasers" }],
  },
  {
    id: 5,
    title: "SFX Bubble machines",
    services: ["sfx", "bubbles"],
    tag: "bubbles",
    cover: bgSfx,
    media: [{ type: "image", src: bgSfx, alt: "Máquinas de bolhas" }],
  },
  {
    id: 6,
    title: "SFX Confettis/Streamers",
    services: ["sfx", "confetti"],
    tag: "confetti",
    cover: bgSfx,
    media: [{ type: "image", src: bgSfx, alt: "Confetti blasters" }],
  },
  {
    id: 7,
    title: "Natal Porto",
    services: ["pyro"],
    tag: "fireworks",
    cover: bgPiromusical,
    media: [
      { type: "image", src: bgPiromusical, alt: "Fogo de artifício na Ribeira" },
      { type: "image", src: bgPiromusical, alt: "Piromusical" },
    ],
  },
];
