"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

import { LandingConfigResponse } from "@/models/responses";
import { useBookingStore } from "@/stores";
 
import BookingCard from "./booking-card";

export default function HeroSection({
  config,
}: {
  config: LandingConfigResponse;
}) {
  const currentStep = useBookingStore(state => state.currentStep);
  const [currentBg, setCurrentBg] = useState(0);
  const [destacarReserva, setDestacarReserva] = useState(false);
  const [descripcionExpandida, setDescripcionExpandida] = useState(false);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const reservasHabilitadas = config.reservasHabilitadas !== false;

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const handleCtaClick = () => {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    setDestacarReserva(true);
    highlightTimeoutRef.current = setTimeout(() => {
      setDestacarReserva(false);
    }, 2500);
  };

  // Lista de imágenes de fondo configuradas (se omiten los slots sin cargar)
  const bgImages = [
    config.heroImageUrl1,
    config.heroImageUrl2,
    config.heroImageUrl3,
  ].filter((url): url is string => Boolean(url));

  // Transición automática cada 5 segundos
  useEffect(() => {
    if (bgImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bgImages.length]);

  return (
    <section className="relative min-h-0 lg:min-h-screen flex items-start lg:items-center justify-center text-slate-900 pt-[300px] lg:pt-28 pb-16 bg-white lg:bg-slate-100 overflow-hidden w-full border-b border-slate-200">
      {/* SVG DEFS: MÁSCARA ORGÁNICA QUIEBRE DE NUBE */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="quiebreNube" clipPathUnits="objectBoundingBox">
            <path d="M0,0 L0.4,0 C0.411,0.029 0.459,0.112 0.467,0.171 C0.474,0.23 0.439,0.298 0.446,0.355 C0.453,0.412 0.5,0.456 0.507,0.712 C0.507,0.712 0.48,0.88 0.7,1 L0,1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* BACKGROUND MÓVIL: Banner superior con gradiente de desvanecimiento hacia el contenido */}
      <div className="absolute inset-x-0 top-0 h-[280px] z-0 overflow-hidden lg:hidden">
        {bgImages.map((imgUrl, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentBg ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={imgUrl}
              alt={`Kinefit Hero Fondo ${idx + 1}`}
              fill
              priority={idx === 0}
              unoptimized
              className="object-cover object-center scale-105 transition-transform duration-10000 filter brightness-100 contrast-105"
            />
          </div>
        ))}
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-transparent via-transparent to-white" />
      </div>

      {/* BACKGROUND ESCRITORIO: SPLIT-SCREEN CON QUIEBRE DE NUBE */}
      <div className="hidden lg:block absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Split-Right: Ocupa el 70% derecho de la pantalla (left: 30%, right: 0) */}
        <div className="absolute inset-y-0 left-[30%] right-0 w-auto h-full z-[1] overflow-hidden">
          {bgImages.map((imgUrl, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentBg ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <Image
                src={imgUrl}
                alt={`Kinefit Hero Fondo ${idx + 1}`}
                fill
                priority={idx === 0}
                unoptimized
                className="object-cover object-center"
              />
            </div>
          ))}
        </div>

        {/* Split-Left: Capa izquierda con clipPath (#quiebreNube) sobrepuesta */}
        <div
          className="absolute inset-0 w-full h-full z-[2] bg-slate-100"
          style={{ clipPath: "url(#quiebreNube)" }}
        />

        {/* CUADRÍCULA TÉCNICA / DOT GRID PATTERN (ESCRITORIO) */}
        <div
          className="absolute inset-0 w-full h-full z-[3] pointer-events-none opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(rgb(15 23 42) 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px",
            maskImage:
              "radial-gradient(ellipse 70% 70% at 30% 50%, black 50%, transparent 90%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 70% at 30% 50%, black 50%, transparent 90%)",
          }}
        />
      </div>

      {/* CUADRÍCULA TÉCNICA EN MÓVIL */}
      <div
        className="lg:hidden absolute inset-0 w-full h-full z-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(rgb(15 23 42) 1.5px, transparent 1.5px)",
          backgroundSize: "20px 20px",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 30%, black 40%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 30%, black 40%, transparent 90%)",
        }}
      />

      {/* CONTENIDO DEL HERO */}
      <div className="relative z-30 mx-auto max-w-7xl px-4 sm:px-6 lg:pl-4 lg:pr-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Lado Izquierdo: Textos e Información con Tarjeta de Cristal en Móvil */}
          <div
            className={`${reservasHabilitadas ? "lg:col-span-6" : "lg:col-span-12"} flex flex-col items-start text-left`}
          >
            {/* Tagline / Titular Principal */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-4xl lg:max-w-lg font-extrabold text-slate-900 tracking-tight leading-tight uppercase">
              {config.heroTagline}{" "}
              <span className="text-brand-primary block sm:inline font-black">
                {config.heroBrandName}
              </span>
            </h1>

            {/* Párrafo descriptivo claro y nítido */}
            <p
              className={`text-slate-700 text-base md:text-lg max-w-2xl mt-4 leading-relaxed font-semibold whitespace-pre-line ${descripcionExpandida ? "" : "line-clamp-3"
                }`}
            >
              {config.heroDescription}
            </p>
            <button
              type="button"
              onClick={() => setDescripcionExpandida(prev => !prev)}
              className="text-brand-primary hover:text-brand-primary-hover font-bold text-xs uppercase tracking-wider mt-2 mb-6 sm:mb-8 cursor-pointer"
            >
              {descripcionExpandida ? "Leer menos" : "Leer más"}
            </button>

            {/* Botón CTA */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              {reservasHabilitadas ? (
                <a
                  href="#agendamiento"
                  onClick={handleCtaClick}
                  className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-global px-8 py-4 shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-center uppercase tracking-wider text-sm cursor-pointer"
                >
                  {config.heroCtaText}
                </a>
              ) : (
                <a
                  href={config.reservasUrlAlterna || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-global px-8 py-4 shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-center uppercase tracking-wider text-sm cursor-pointer"
                >
                  {config.heroCtaText}
                </a>
              )}
            </div>
          </div>

          {/* Lado Derecho - Módulo de Agendamiento Flotando Sobre la Imagen Cristalina */}
          {reservasHabilitadas && (
            <div
              id="agendamiento"
              className="lg:col-span-6 relative w-full z-30"
            >
              <div
                className={`rounded-global border bg-white/90 backdrop-blur-md p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 items-stretch shadow-2xl shadow-slate-200/50 text-slate-900 transition-all duration-500 motion-reduce:transition-none ${destacarReserva
                    ? "border-brand-primary ring-4 ring-brand-primary/30 motion-reduce:ring-2"
                    : "border-slate-200/80 ring-0"
                  }`}
              >
                {/* Stepper lateral plano */}
                <div className="flex sm:flex-col justify-between sm:justify-center gap-2 sm:gap-6 border-b sm:border-b-0 sm:border-r border-slate-200 pb-4 sm:pb-0 sm:pr-6 shrink-0">
                  {[
                    { step: 1, label: "Servicio" },
                    { step: 2, label: "Horario" },
                    { step: 3, label: "Especialista" },
                    { step: 4, label: "Reserva" },
                  ].map(s => {
                    const isActive = currentStep === s.step;
                    const isCompleted = currentStep > s.step;

                    return (
                      <div key={s.step} className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${isCompleted
                              ? "bg-emerald-500 text-white shadow-xs"
                              : isActive
                                ? "bg-brand-primary text-white ring-4 ring-brand-primary/20 shadow-md"
                                : "bg-slate-100 text-slate-400 border border-slate-200"
                            }`}
                        >
                          {isCompleted ? "✓" : s.step}
                        </div>
                        <span
                          className={`text-xs font-semibold hidden sm:inline transition-colors ${isActive
                              ? "text-slate-900"
                              : isCompleted
                                ? "text-emerald-600"
                                : "text-slate-400"
                            }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Módulo de Formulario de Agendamiento */}
                <BookingCard />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
