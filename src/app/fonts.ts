import { Geist, Geist_Mono, Sofia_Sans_Extra_Condensed } from "next/font/google";

export const sans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Tall condensed caps for headlines and big numbers, like a title card. */
export const display = Sofia_Sans_Extra_Condensed({
  variable: "--font-sofia",
  subsets: ["latin"],
});
