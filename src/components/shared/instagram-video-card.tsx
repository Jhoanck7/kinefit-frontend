"use client";

import Image from "next/image";
import React, { useEffect } from "react";
import Script from "next/script";

export interface InstagramVideoCardProps {
  videoUrl?: string;
  className?: string;
}

export function InstagramVideoCard({
  videoUrl = "https://www.instagram.com/kinefit.chile",
  className = "",
}: InstagramVideoCardProps) {
  // Helper para detectar formato de la URL de Instagram / Reel / MP4
  const getEmbedUrl = (
    rawUrl: string
  ): { isDirectVideo: boolean; embedSrc: string } => {
    if (!rawUrl) return { isDirectVideo: false, embedSrc: "" };

    // MP4 o archivo de video directo
    if (
      rawUrl.match(/\.(mp4|webm|mov)(\?.*)?$/i) ||
      (rawUrl.includes("cloudinary.com") && rawUrl.includes("/video/"))
    ) {
      return { isDirectVideo: true, embedSrc: rawUrl };
    }

    // Instagram Post o Reel link
    const match = rawUrl.match(/(?:p|reel|tv)\/([^/?#&]+)/i);
    if (match && match[1]) {
      const shortcode = match[1];
      return {
        isDirectVideo: false,
        embedSrc: `https://www.instagram.com/reel/${shortcode}/embed/`,
      };
    }

    return { isDirectVideo: false, embedSrc: rawUrl };
  };

  const { isDirectVideo, embedSrc } = getEmbedUrl(videoUrl);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).instgrm) {
      (window as any).instgrm.Embeds.process();
    }
  }, [embedSrc]);

  return (
    <div className={`flex justify-center w-full ${className}`}>
      {/* Script oficial de Instagram */}
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (typeof window !== "undefined" && (window as any).instgrm) {
            (window as any).instgrm.Embeds.process();
          }
        }}
      />

      <div className="relative w-full max-w-[420px] rounded-2xl lg:rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xl shadow-slate-200/50 group transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/80">
        {/* 1. Cabecera Clara Estilo Kinefit */}
        <div className="bg-slate-50/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200 text-slate-900 z-20 relative">
          {/* Perfil & Avatar */}
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 group/author cursor-pointer"
          >
            {/* Aro con logo de marca Kinefit */}
            <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-brand-primary via-sky-500 to-teal-400 shrink-0 shadow-xs overflow-hidden">
              <div className="relative w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <Image
                  src="/Kinefit Negro ver.png"
                  alt="Kinefit Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain scale-[1.35]"
                />
              </div>
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 group-hover/author:text-brand-primary transition-colors">
                  kinefit.chile
                </span>
                {/* Badge azul verificado */}
                <svg
                  className="w-3.5 h-3.5 text-brand-primary fill-current shrink-0"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                Reel oficial
              </span>
            </div>
          </a>

          {/* Botón píldora interactivo 'Abrir' en azul corporativo */}
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-full bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white text-xs font-bold transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer border border-brand-primary/20"
          >
            <span>Abrir</span>
            <svg
              className="w-3 h-3 current-color"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>

        {/* 2. Contenedor de Video con Reencuadre y Protección Táctil */}
        <div className="relative w-full min-h-[460px] sm:min-h-[520px] bg-slate-100 flex items-center justify-center overflow-hidden">
          {isDirectVideo ? (
            <video
              src={embedSrc}
              controls
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : embedSrc.includes("/embed") ? (
            <>
              {/* Iframe con reencuadre: desplazamiento y escalado para centrar el video y botón play */}
              <iframe
                src={embedSrc}
                className="absolute inset-0 -top-20 w-full h-[calc(100%+140px)] scale-110 sm:scale-125 origin-top border-none bg-transparent"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
              {/* Capa transparente en el 30% inferior para scroll móvil natural sin bloqueo táctil */}
              <div
                className="h-[30%] pointer-events-none absolute bottom-0 left-0 right-0 z-10"
                aria-hidden="true"
              />
            </>
          ) : (
            /* Fallback Interactivo si es un enlace general a Instagram */
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50 text-slate-800">
              <div className="w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-2xl mb-4 border border-brand-primary/20 shadow-xs group-hover:scale-110 transition-transform duration-300">
                🎬
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mb-2">
                Ver Video en Instagram
              </h4>
              <p className="text-xs text-slate-500 max-w-[260px] mb-6 leading-relaxed">
                Conoce nuestras instalaciones y testimonios reales de
                rehabilitación directamente en nuestro perfil oficial.
              </p>
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full shadow-md shadow-brand-primary/20 hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                Reproducir Reel ↗
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
