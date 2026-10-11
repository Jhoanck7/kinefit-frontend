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

  const imagen = imagenes[0];

  return (
    <section
      id="nutricion"
      className={`relative scroll-mt-24 pb-24 text-slate-900 border-b border-slate-200/60 overflow-hidden w-full bg-white lg:bg-slate-50 lg:pt-24 ${
        imagen ? "pt-[300px]" : "pt-24"
      }`}
    >
      {imagen && (
        <>
          <svg
            className="absolute w-0 h-0 pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              <clipPath id="siluetaNutricion" clipPathUnits="objectBoundingBox">
                <path d="M0,0 L0.62,0 C0.86,0 1,0.12 0.98,0.3 C0.96,0.48 0.86,0.6 0.88,0.76 C0.9,0.92 0.78,1 0.6,1 L0,1 Z" />
              </clipPath>
            </defs>
          </svg>

          <div className="absolute inset-x-0 top-0 h-[280px] z-0 overflow-hidden lg:hidden">
            <Image
              src={imagen.imagenUrl}
              alt={imagen.alt || "Nutrición KineFit Chile"}
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
          </div>

          <div
            className="hidden lg:block absolute top-10 bottom-10 left-0 w-[42%] z-0 pointer-events-none"
            style={{ clipPath: "url(#siluetaNutricion)" }}
          >
            <Image
              src={imagen.imagenUrl}
              alt={imagen.alt || "Nutrición KineFit Chile"}
              fill
              sizes="42vw"
              className="object-cover object-center"
            />
          </div>
        </>
      )}

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:hidden text-left scroll-reveal">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-3">
              Nutrición Integral
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {titulo}
            </p>
          </div>

          <div className="lg:col-span-6 flex justify-center scroll-reveal-scale">
            <div className="w-[80%] sm:w-[60%] lg:w-[72%]">
              <InstagramVideoCard
                videoUrl={videoUrl}
                sombra="shadow-lg shadow-black/10"
              />
            </div>
          </div>

          <div className="lg:col-span-6 text-left scroll-reveal delay-200">
            <h2 className="hidden lg:block text-sm font-semibold uppercase tracking-wider text-brand-primary mb-3">
              Nutrición Integral
            </h2>
            <p className="hidden lg:block text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              {titulo}
            </p>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed whitespace-pre-line text-left">
              {descripcion}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
