# Askitar Portfolio

Personal portfolio of **Oscar Bohórquez (Askitar)**: social media manager, video editor and AI content creator.

**Live site:** https://askitar.netlify.app

![Portfolio hero](public/media/hero-poster.jpg)

## What it is

A fast, bilingual (English / Spanish) one-page site that shows short-form video work the way clients actually consume it: muted autoplay previews, real performance numbers and a clear way to get in touch.

- **Hero with a live 3D scene** built with three.js, with a toggle to turn motion off for people who prefer reduced motion.
- **Showcase of video work**: AI explainers, 3D animation, documentary-style reels, UGC for brands and viral content, each with its tools listed.
- **Impact and stats section**: follower, like and view figures loaded from a JSON snapshot, with the source and date of every number.
- **Sortable stats table** of individual videos (views, likes, comments, shares, saves, engagement).
- **Static export**: Next.js builds plain HTML/CSS/JS into `out/`, and Netlify serves it. No server, no database.

## Tech

Next.js (App Router, static export) · React · TypeScript · Tailwind CSS · three.js with React Three Fiber and drei · GSAP · Motion · Lenis smooth scroll · Netlify

## Run it locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # writes the static site to out/
```

## Project layout

| Path | What lives there |
|---|---|
| `src/components/` | Page sections (Hero, Showcase, Impact, StatsDatabase, Contact) and the 3D scene |
| `src/data/stats.json` | Snapshot of the numbers shown on the site, with sources |
| `src/i18n/` | English and Spanish copy |
| `src/lib/profile.ts` | Name, contact and brands |
| `public/media/` | Video previews and posters |

## License

Code is released under the [MIT License](LICENSE). Videos and images in `public/media/` are not covered by the code license; all rights stay with their respective owners.
