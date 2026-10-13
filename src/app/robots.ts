import type { MetadataRoute } from "next";

/** Define las reglas de indexación para buscadores, bloqueando el panel y los documentos */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/panel", "/documentos"],
    },
    sitemap: "https://kinefitchile.com/sitemap.xml",
  };
}
