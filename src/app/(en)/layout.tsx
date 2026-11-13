import type { Metadata, Viewport } from "next";
import "../globals.css";
import { RootDocument } from "@/components/RootDocument";
import { dictionaries } from "@/i18n/dictionaries";

const t = dictionaries.en.meta;

export const metadata: Metadata = {
  title: t.title,
  description: t.description,
  alternates: { canonical: "/", languages: { en: "/", es: "/es/" } },
  openGraph: { title: t.title, description: t.description, type: "website", locale: "en_US" },
};

export const viewport: Viewport = { themeColor: "#04050a" };

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
