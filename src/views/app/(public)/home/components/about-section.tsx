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
          <div className="order-4 lg:col-span-7 flex flex-wrap items-center gap-25 pt-2">
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
                  aria-label="Instagram"
                  className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-global bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-md transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:rotate-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}

              {config.socialTikTok && (
                <a
                  href={config.socialTikTok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-global bg-black text-white border border-slate-800 shadow-md transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300 group-hover:-rotate-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
              )}

              {config.socialFacebook && (
                <a
                  href={config.socialFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-global bg-[#1877F2] text-white shadow-md transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <svg
                    className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:rotate-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.82 0-1.611.211-1.942.593-.332.381-.41 1.077-.41 2.062v1.325h4.156l-.597 3.667h-3.559v7.98H9.101z" />
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
