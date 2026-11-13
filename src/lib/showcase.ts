import type { Localized } from "./stats";
import type { SectionId } from "./sections";

/** A short muted preview shown in a section filmstrip. Files live in /public/media/clips. */
export type Clip = {
  file: string;
  /** width / height of the encoded preview */
  ratio: number;
  title: Localized;
  tag: Localized;
  /** Id of the matching row in stats.json. Adds the real figures and a link to TikTok. */
  videoId?: string;
};

const V = 9 / 16;

export const showcase: Partial<Record<SectionId, Clip[]>> = {
  impact: [
    {
      file: "viral-regalos",
      ratio: V,
      videoId: "7462027392165416198",
      title: { en: "How much TikTok gifts really cost", es: "Cuánto cuestan los regalos de TikTok" },
      tag: { en: "Explainer", es: "Explicativo" },
    },
    {
      file: "viral-regalos-2",
      ratio: V,
      videoId: "7464318811919879429",
      title: { en: "The real value of TikTok gifts", es: "El valor real de los regalos de TikTok" },
      tag: { en: "Explainer", es: "Explicativo" },
    },
    {
      file: "viral-niveles",
      ratio: V,
      videoId: "7494451162616188166",
      title: { en: "Gifter levels, explained", es: "Los niveles de los donadores, explicados" },
      tag: { en: "Explainer", es: "Explicativo" },
    },
    {
      file: "viral-semana",
      ratio: V,
      videoId: "7488412328149404933",
      title: { en: "We went LIVE seven days straight", es: "Hicimos LIVE siete días seguidos" },
      tag: { en: "Experiment", es: "Experimento" },
    },
  ],
  filmmaking: [
    {
      file: "doc-momoy",
      ratio: V,
      title: { en: "The páramo goblins", es: "Los duendes del páramo" },
      tag: { en: "Mini documentary", es: "Mini documental" },
    },
    {
      file: "doc-runescape",
      ratio: V,
      title: { en: "RuneScape in Venezuela", es: "RuneScape en Venezuela" },
      tag: { en: "Mini documentary", es: "Mini documental" },
    },
    {
      file: "ugc-miniso",
      ratio: V,
      title: { en: "Building blocks unboxing", es: "Unboxing de armables" },
      tag: { en: "UGC · Miniso", es: "UGC · Miniso" },
    },
    {
      file: "ugc-remington",
      ratio: V,
      title: { en: "Product review", es: "Reseña de producto" },
      tag: { en: "UGC · Remington", es: "UGC · Remington" },
    },
    {
      file: "vlog-summit",
      ratio: V,
      title: { en: "A day at the park", es: "Un día en el parque" },
      tag: { en: "Vlog · Summit Adventure Park", es: "Vlog · Summit Adventure Park" },
    },
  ],
  motion: [
    {
      file: "3d-candelaria",
      ratio: 16 / 9,
      title: { en: "La Candelaria, Bogotá", es: "La Candelaria, Bogotá" },
      tag: { en: "3D replica · Blender", es: "Réplica 3D · Blender" },
    },
    {
      file: "3d-personaje",
      ratio: V,
      title: { en: "Character animation", es: "Animación de personaje" },
      tag: { en: "Blender", es: "Blender" },
    },
    {
      file: "3d-red",
      ratio: V,
      title: { en: "Neural network", es: "Red neuronal" },
      tag: { en: "Blender", es: "Blender" },
    },
    {
      file: "code-colombia",
      ratio: V,
      title: { en: "Animated map", es: "Mapa animado" },
      tag: { en: "Code · Remotion", es: "Código · Remotion" },
    },
  ],
  dummies: [
    {
      file: "ia-claude-modelos-v3",
      ratio: V,
      title: { en: "Which model for which task", es: "Un modelo para cada tarea" },
      tag: { en: "Episode", es: "Episodio" },
    },
    {
      file: "ia-tokens",
      ratio: V,
      title: { en: "Why the AI forgets", es: "Por qué a la IA se le olvida" },
      tag: { en: "Episode", es: "Episodio" },
    },
    {
      file: "ia-subagentes",
      ratio: V,
      title: { en: "Context and subagents", es: "Contexto y subagentes" },
      tag: { en: "Episode", es: "Episodio" },
    },
    {
      file: "ia-chatbot-vs-agente",
      ratio: V,
      title: { en: "Chatbot vs agent", es: "Chatbot vs agente" },
      tag: { en: "Episode", es: "Episodio" },
    },
  ],
};
