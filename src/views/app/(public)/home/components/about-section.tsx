"use client";

import React from "react";
import { LandingConfigResponse } from "@/models/responses";
import { InstagramVideoCard } from "@/components/shared";

export default function AboutSection({
  config,
}: {
  config: LandingConfigResponse;
}) {
  const videoUrl =
    config.aboutVideoUrl || "https://www.instagram.com/kinefit.chile";

  return (
    <section
      id="about"
      className="scroll-mt-24 py-20 sm:py-28 bg-white text-slate-900 border-b border-slate-200/60 overflow-hidden w-full"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-x-16 lg:gap-y-6 items-center">
          {/* 1. Título: Primero en móvil y primera fila izquierda en escritorio */}
          <div className="order-1 lg:col-span-7">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight text-left">
              {config.aboutTitle ||
                "Un Enfoque Integral para tu Cuerpo y Salud"}
            </h2>
          </div>

          {/* 2. Video: Segundo en móvil (entre título y descripción), columna derecha completa en escritorio */}
          <div className="order-2 lg:col-span-5 lg:row-span-3 flex justify-center w-full my-2 lg:my-0">
            <InstagramVideoCard videoUrl={videoUrl} />
          </div>

          {/* 3. Descripción: Tercero en móvil, segunda fila izquierda en escritorio */}
          <div className="order-3 lg:col-span-7">
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed whitespace-pre-line text-left">
              {config.aboutDescription ||
                "En Kinefit Chile combinamos kinesiología clínica ortopédica, entrenamiento de readaptación funcional y masoterapia de alta gama. Nuestro equipo trabaja de forma personalizada para diagnosticar, tratar y prevenir lesiones, acompañándote paso a paso en tu proceso de recuperación."}
            </p>
          </div>

          {/* 4. Botón CTA y Redes Sociales: Cuarto en móvil, tercera fila izquierda en escritorio */}
          <div className="order-4 lg:col-span-7 flex flex-wrap items-center gap-50 pt-2">
            {config.reservasHabilitadas !== false ? (
              <a
                href="#agendamiento"
                className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-global px-8 py-4 shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 tracking-wider text-sm cursor-pointer uppercase text-center"
              >
                {config.aboutCtaText || "Agendar Atención Kinésica"}
              </a>
            ) : (
              <a
                href={config.reservasUrlAlterna || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-global px-8 py-4 shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 tracking-wider text-sm cursor-pointer uppercase text-center"
              >
                {config.aboutCtaText || "Agendar Atención Kinésica"}
              </a>
            )}

            {/* Redes Sociales: Instagram, TikTok, Facebook */}
            <div className="flex gap-3">
              {config.socialInstagram && (
                <a
                  href={config.socialInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-global bg-slate-100 hover:bg-brand-primary hover:text-white text-slate-600 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
              )}

              {config.socialTikTok && (
                <a
                  href={config.socialTikTok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-global bg-slate-100 hover:bg-brand-primary hover:text-white text-slate-600 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
                  aria-label="TikTok"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.2-.42-.43-.61-.67-.02 2.44-.01 4.88-.01 7.32-.03 2.12-.51 4.3-1.89 5.96-1.57 1.95-4.14 3.01-6.64 2.87-2.62-.05-5.26-1.36-6.47-3.69-1.54-2.88-.95-6.73 1.43-9.01 1.73-1.68 4.28-2.31 6.57-1.85V11.2c-1.24-.31-2.61-.1-3.63.66-1.21.89-1.71 2.61-1.21 4.07.45 1.39 1.93 2.37 3.4 2.31 1.4-.01 2.68-1.01 2.97-2.39.11-.53.11-1.07.11-1.61V.02z" />
                  </svg>
                </a>
              )}

              {config.socialFacebook && (
                <a
                  href={config.socialFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-global bg-slate-100 hover:bg-brand-primary hover:text-white text-slate-600 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
                  aria-label="Facebook"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
