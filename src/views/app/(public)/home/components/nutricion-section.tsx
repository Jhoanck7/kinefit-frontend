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

  const fotos = useMemo<NutricionItem[]>(() => {
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

          {/* 4. Galería de Fotos: Cuarto en móvil, columna izquierda abajo */}
          {fotos.length > 0 && (
            <div className="order-4 lg:col-span-7 scroll-reveal delay-300">
              <div
                className={`grid gap-4 ${
                  fotos.length === 1
                    ? "grid-cols-1 max-w-md"
                    : fotos.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-2 sm:grid-cols-3"
                }`}
              >
                {fotos.map((item, index) => (
                  <div
                    key={index}
                    className="relative aspect-4/3 rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm bg-white group hover:shadow-md transition-shadow duration-300"
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
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

