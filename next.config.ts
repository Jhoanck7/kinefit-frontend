import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/panel/fichas/formatos/nuevo",
        destination: "/panel/documentos/plantillas/nuevo",
        permanent: true,
      },
      {
        source: "/panel/fichas/formatos",
        destination: "/panel/documentos/plantillas",
        permanent: true,
      },
      {
        source: "/panel/fichas",
        destination: "/panel/documentos",
        permanent: true,
      },
      {
        source: "/panel/agenda/bloqueos",
        destination: "/panel/agenda",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
