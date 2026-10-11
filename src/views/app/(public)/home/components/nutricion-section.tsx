"use client";

import Image from "next/image";
import React, { useMemo } from "react";

import { InstagramVideoCard } from "@/components/shared";
import { LandingConfigResponse, NutricionItem } from "@/models/responses";

interface NutricionSectionProps {
  config: LandingConfigResponse;
}

/** Sección de Nutrición Integral con texto explicativo, imágenes y reel de Instagram */
export default function NutricionSection({ config }: NutricionSectionProps) {
  const videoUrl =
    config.nutricionReelUrl ||
    config.nutricionReel ||
    "https://www.instagram.com/kinefit.chile";

  const imagenes = useMemo<NutricionItem[]>(() => {
    if (!config.nutricionJson) return [];
    try {
      const parsed = JSON.parse(config.nutricionJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [config.nutricionJson]);

  const titulo =
    config.nutricionTitle || "Nutrición Integral para tu Rendimiento y Salud";

  const descripcion =
    config.nutricionDescription ||
    "En Kinefit Chile complementamos tu proceso con un enfoque nutricional personalizado y basado en evidencia científica. Adaptamos cada plan a tus objetivos deportivos, de salud o recuperación para lograr resultados sostenibles.";

  return (
    <section
      id="nutricion"
      className="scroll-mt-24 py-24 bg-slate-50/70 text-slate-900 border-b border-slate-200/60 overflow-hidden w-full"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* 1. Título y Tagline: Primer elemento en móvil y columna izquierda arriba */}
          <div className="order-1 lg:col-span-7 scroll-reveal">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-3">
              Nutrición Integral
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {titulo}
            </p>
          </div>

          {/* 2. Video Reel: Segundo en móvil, columna derecha abarcando filas en desktop */}
          <div className="order-2 lg:col-span-5 lg:row-span-3 flex justify-center w-full my-2 lg:my-0 scroll-reveal-scale delay-150">
            <InstagramVideoCard videoUrl={videoUrl} />
          </div>

          {/* 3. Descripción: Tercero en móvil, columna izquierda */}
          <div className="order-3 lg:col-span-7 scroll-reveal delay-200">
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed whitespace-pre-line text-left">
              {descripcion}
            </p>
          </div>

          {/* 4. Galería de imagenes / Foto de Nutricionista: Cuarto en móvil, columna izquierda abajo */}
          {imagenes.length > 0 && (
            <div className="order-4 lg:col-span-7 scroll-reveal delay-300">
              {imagenes.length === 1 ? (
                <div className="relative inline-block mt-2 pt-4 sm:pt-6">
                  {/* Máscara / Figura orgánica en la parte izquierda superior trasladada al extremo izquierdo */}
                  <div className="absolute top-0 left-0 -translate-x-1/3 sm:-translate-x-1/2 -translate-y-4 sm:-translate-y-6 w-72 sm:w-84 md:w-96 lg:w-[440px] pointer-events-none select-none z-0">
                    <svg
                      viewBox="0 0 380 500"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-auto drop-shadow-md"
                    >
                      <defs>
                        <linearGradient
                          id="nutricion-mask-blob-bg"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#0c5dc5" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#052651" stopOpacity="0.6" />
                        </linearGradient>
                        <linearGradient
                          id="nutricion-mask-blob"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#0c5dc5" stopOpacity="0.85" />
                          <stop offset="100%" stopColor="#003366" stopOpacity="0.98" />
                        </linearGradient>
                      </defs>

                      {/* Capa de fondo orgánica sutil para volumen */}
                      <path
                        d="M 360 70 C 260 0 120 10 40 80 C -25 140 -15 260 10 360 C 30 450 80 500 150 510 C 230 520 270 420 290 330 C 310 240 330 170 370 100 C 390 65 385 75 360 70 Z"
                        fill="url(#nutricion-mask-blob-bg)"
                      />

                      {/* Silueta orgánica principal que abraza la esquina superior izquierda */}
                      <path
                        d="M 330 40 C 230 -10 110 5 40 65 C -20 125 -10 235 15 330 C 35 415 80 465 145 475 C 215 485 255 395 275 310 C 295 225 305 155 345 85 C 365 50 355 45 330 40 Z"
                        fill="url(#nutricion-mask-blob)"
                      />
                    </svg>
                  </div>

                  {/* Foto vertical con curvatura orgánica en la esquina superior izquierda */}
                  <div className="relative -translate-x-50 z-10 w-60 sm:w-72 md:w-80 aspect-[3/4] rounded-tl-[48px] sm:rounded-tl-[64px] rounded-tr-2xl rounded-bl-2xl rounded-br-[32px] overflow-hidden border border-slate-200/80 shadow-md bg-white group hover:shadow-xl transition-all duration-300">
                    <Image
                      src={imagenes[0].imagenUrl}
                      alt={imagenes[0].alt || "Nutricionista KineFit Chile"}
                      fill
                      sizes="(max-width: 640px) 240px, (max-width: 768px) 288px, 320px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                  </div>
                </div>
              ) : (
                <div
                  className={`grid gap-4 ${
                    imagenes.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-2 sm:grid-cols-3"
                  }`}
                >
                  {imagenes.map((item, index) => (
                    <div
                      key={index}
                      className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm bg-white group hover:shadow-md transition-shadow duration-300"
                    >
                      <Image
                        src={item.imagenUrl}
                        alt={item.alt || `Nutrición KineFit Chile ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

