import type { NextConfig } from "next";

// The site is a fully static export: plain HTML/CSS/JS in `out/`.
// That keeps it portable across Netlify, Vercel, Cloudflare Pages or any static host.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
