/** The page is a timeline: every section is a clip with an editor-style label color. */
export const sections = [
  { id: "intro", color: "#c9d2e6" },
  { id: "mograph", color: "#e4405f" },
  { id: "impact", color: "#3d62ff" },
  { id: "filmmaking", color: "#ff8a3d" },
  { id: "motion", color: "#9b6dff" },
  { id: "dummies", color: "#19c3b1" },
  { id: "lora", color: "#ec5aa8" },
  { id: "contact", color: "#6f7dff" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export const sectionColor = (id: SectionId) => sections.find((s) => s.id === id)!.color;
