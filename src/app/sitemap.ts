import type { MetadataRoute } from "next";

/** Genera el mapa del sitio con las URLs públicas para los buscadores */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://kinefitchile.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
