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
      className="scroll-mt-24 py-24 bg-slate-50/70 text-slate-900 border-b border-slate-200/60 overflow-hidden w-full"
    >
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <clipPath id="nutricion-silueta" clipPathUnits="objectBoundingBox">
            <path d="M0.18,0.02 C0.45,-0.01 0.84,0 0.96,0.11 C1.02,0.19 0.98,0.44 0.91,0.61 C0.84,0.79 0.81,0.94 0.63,0.99 C0.43,1.02 0.1,1 0.03,0.92 C-0.01,0.86 0,0.31 0.02,0.15 C0.03,0.06 0.08,0.03 0.18,0.02 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:hidden text-left scroll-reveal">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-3">
              Nutrición Integral
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {titulo}
            </p>
          </div>

          <div className="lg:col-span-7 scroll-reveal-scale">
            {imagen ? (
              <div className="relative mx-auto w-full max-w-md lg:max-w-none py-10 sm:py-14">
                <div
                  className="absolute inset-y-0 left-0 w-[78%]"
                  style={{ clipPath: "url(#nutricion-silueta)" }}
                >
                  <Image
                    src={imagen.imagenUrl}
                    alt={imagen.alt || "Nutrición KineFit Chile"}
                    fill
                    sizes="(max-width: 1024px) 80vw, 45vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative ml-[22%] w-[70%] sm:ml-[26%] sm:w-[46%]">
                  <InstagramVideoCard videoUrl={videoUrl} />
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <InstagramVideoCard videoUrl={videoUrl} />
              </div>
            )}
          </div>

          <div className="lg:col-span-5 text-left scroll-reveal delay-200">
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
