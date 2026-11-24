import type { Localized } from "./stats";

/** Motion graphics pieces, 9:16 with sound. Files live in /public/media/mograph. */
export type Piece = { file: string; color: string; title: Localized; note: Localized };

export const pieces: Piece[] = [
  {
    file: "business",
    color: "#e4002b",
    title: { en: "Motion for your business", es: "Motion para tu negocio" },
    note: { en: "Brand promo", es: "Promo de marca" },
  },
  {
    file: "workflows",
    color: "#3d55ff",
    title: { en: "AI workflows", es: "Flujos con IA" },
    note: { en: "Explainer", es: "Explicativo" },
  },
  {
    file: "views",
    color: "#e8b923",
    title: { en: "The 16 million views video", es: "El video de 16 millones de vistas" },
    note: { en: "Case study", es: "Caso de estudio" },
  },
  {
    file: "seconds",
    color: "#ff6a1f",
    title: { en: "The first 3 seconds", es: "Los primeros 3 segundos" },
    note: { en: "Kinetic type", es: "Tipografía cinética" },
  },
  {
    file: "comments",
    color: "#22c55e",
    title: { en: "Comments to customers", es: "De comentarios a clientes" },
    note: { en: "Automation", es: "Automatización" },
  },
];
