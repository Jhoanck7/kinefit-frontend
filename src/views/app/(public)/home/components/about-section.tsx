"use client";

import React, { useEffect, useState } from "react";

import { LandingConfigResponse } from "@/models/responses";

export default function AboutSection({
  config,
}: {
  config: LandingConfigResponse;
}) {
  const videoUrl =
    config.aboutVideoUrl || "https://www.instagram.com/kinefit.chile";

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
    const match = rawUrl.match(/instagram\.com\/(p|reel|tv)\/([^/?#&]+)/i);
    if (match) {
      const type = match[1];
      const shortcode = match[2];
      return {
        isDirectVideo: false,
        embedSrc: `https://www.instagram.com/${type}/${shortcode}/embed`,
      };
    }

    return { isDirectVideo: false, embedSrc: rawUrl };
  };

  const { isDirectVideo, embedSrc } = getEmbedUrl(videoUrl);

  return (
    <section
      id="about"
      className="py-20 sm:py-28 bg-white text-slate-900 border-b border-slate-200/60 overflow-hidden w-full"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Contenedor de 2 Columnas (Texto e Instagram Video) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Columna Izquierda: Texto de Quiénes Somos */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {config.aboutTitle ||
                  "Un Enfoque Integral para tu Cuerpo y Salud"}
              </h2>
            </div>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              {config.aboutDescription ||
                "En Kinefit Chile combinamos kinesiología clínica ortopédica, entrenamiento de readaptación funcional y masoterapia de alta gama. Nuestro equipo trabaja de forma personalizada para diagnosticar, tratar y prevenir lesiones, acompañándote paso a paso en tu proceso de recuperación."}
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href="#agendamiento"
                className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl px-8 py-4 border-2 border-brand-primary tracking-wider text-sm cursor-pointer transition-all shadow-md hover:shadow-lg uppercase"
              >
                {config.aboutCtaText || "Agendar Atención Kinésica"}
              </a>
            </div>
          </div>

          {/* Columna Derecha: Reproductor de Video / Reel de Instagram */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="relative w-full max-w-[420px] rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-slate-950 group">
              {/* Marco Superior Estilo Smartphone / Reel Player */}
              <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800 text-white text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold uppercase tracking-wider text-[11px] text-slate-300">
                    Video @kinefit.chile
                  </span>
                </div>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline transition-colors"
                >
                  Ver en Instagram ↗
                </a>
              </div>

              {/* Contenedor del Video / Embed */}
              <div className="relative w-full min-h-[460px] sm:min-h-[520px] bg-slate-950 flex items-center justify-center overflow-hidden">
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
                  <iframe
                    src={embedSrc}
                    className="w-full h-full min-h-[500px] border-none bg-transparent"
                    allow="encrypted-media"
                  />
                ) : (
                  /* Fallback Interactivo si es un enlace directo a Instagram */
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-1 mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-3xl">
                        🎬
                      </div>
                    </div>
                    <h4 className="text-lg font-extrabold text-white mb-2">
                      Ver Video en Instagram
                    </h4>
                    <p className="text-xs text-slate-400 max-w-[260px] mb-6">
                      Conoce nuestras instalaciones y testimonios reales de
                      rehabilitación directamente en nuestro perfil oficial.
                    </p>
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-bold text-xs uppercase px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                      Reproducir Reel ↗
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
