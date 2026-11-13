import type { Metadata, Viewport } from "next";
import "../globals.css";
import { RootDocument } from "@/components/RootDocument";
import { dictionaries } from "@/i18n/dictionaries";

const t = dictionaries.es.meta;

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: { canonical: "/es/", languages: { en: "/", es: "/es/" } },
  openGraph: { title: t.title, description: t.description, type: "website", locale: "es_CO" },
};

export const viewport: Viewport = { themeColor: "#04050a" };

export default function SpanishLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="es">{children}</RootDocument>;
}
