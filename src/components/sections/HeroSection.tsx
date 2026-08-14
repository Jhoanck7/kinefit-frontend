"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

import { HERO_COPY } from "@/lib/constants";
import {
  defaultLandingConfig,
  LandingConfigData,
  landingConfigService,
} from "@/lib/services/landingConfig.service";
import { useBookingStore } from "@/lib/store/useBookingStore";

import BookingCard from "../ui/BookingCard";

export default function HeroSection({ config }: { config: LandingConfigData }) {
  const currentStep = useBookingStore(state => state.currentStep);
  const [currentBg, setCurrentBg] = useState(0);

  // Lista de 3 imágenes de fondo
  const bgImages = [
    config.heroImageUrl1 || "/",
    config.heroImageUrl2 || "",
    config.heroImageUrl3 || "",
  ];

  // Transición automática cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg(prev => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bgImages.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center text-slate-900 pt-24 lg:pt-28 pb-16 bg-slate-100 overflow-hidden w-full border-b border-slate-200">
      {/* BACKGROUND 3-IMAGE CAROUSEL SLIDER */}
      <div className="absolute inset-0 z-0 overflow-hidden">
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

        {/* OVERLAY RESPONSIVO OPTIMIZADO */}
        {/* Móvil: Degradado ligero con baja opacidad para resaltar la foto. Escritorio: Degradado horizontal nítido a la izquierda y 100% transparente a la derecha */}
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-white/70 via-white/40 to-white/80 lg:bg-gradient-to-r lg:from-slate-50 lg:via-slate-50/90 lg:to-transparent lg:w-[62%]" />

        {/* Sombra sutil superior para integrar con la barra de navegación */}
        <div className="absolute top-0 left-0 right-0 h-24 z-20 bg-gradient-to-b from-slate-50/80 to-transparent" />
      </div>

      {/* CONTENIDO DEL HERO */}
      <div className="relative z-30 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Lado Izquierdo: Textos e Información con Tarjeta de Cristal en Móvil */}
          <div className="lg:col-span-6 flex flex-col items-start text-left bg-white/85 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-6 sm:p-8 lg:p-0 rounded-3xl lg:rounded-none border border-white/90 lg:border-none shadow-xl lg:shadow-none">
            {/* Tagline / Titular Principal */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase">
              {config.heroTagline}{" "}
              <span className="text-brand-primary block sm:inline font-black">
                {config.heroBrandName}
              </span>
            </h1>

            {/* Párrafo descriptivo claro y nítido */}
            <p className="text-slate-700 text-base md:text-lg max-w-2xl mt-4 mb-6 sm:mb-8 leading-relaxed font-semibold">
              {config.heroDescription}
            </p>

            {/* Botón CTA */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <a
                href="#agendamiento"
                className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl px-8 py-4 border-2 border-brand-primary text-center uppercase tracking-wider text-sm cursor-pointer transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                {config.heroCtaText}
              </a>
            </div>
          </div>

          {/* Lado Derecho - Módulo de Agendamiento Flotando Sobre la Imagen Cristalina */}
          <div id="agendamiento" className="lg:col-span-6 relative w-full z-30">
            <div className="rounded-2xl border-2 border-white/80 bg-white/75 backdrop-blur-md p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 items-stretch shadow-2xl text-slate-900">
              {/* Stepper lateral plano */}
              <div className="flex sm:flex-col justify-between sm:justify-center gap-2 sm:gap-6 border-b sm:border-b-0 sm:border-r border-slate-200 pb-4 sm:pb-0 sm:pr-6 shrink-0">
                {[
                  { step: 1, label: "Servicio" },
                  { step: 2, label: "Especialista" },
                  { step: 3, label: "Horario" },
                  { step: 4, label: "Reserva" },
                ].map(s => {
                  const isActive = currentStep === s.step;
                  const isCompleted = currentStep > s.step;

                  return (
                    <div key={s.step} className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isCompleted
                            ? "bg-emerald-600 text-white border-2 border-emerald-600"
                            : isActive
                              ? "bg-brand-primary text-white border-2 border-brand-primary"
                              : "bg-slate-100 text-slate-500 border border-slate-300"
                        }`}
                      >
                        {isCompleted ? "✓" : s.step}
                      </div>
                      <span
                        className={`text-xs font-bold hidden sm:inline uppercase tracking-wider ${
                          isActive
                            ? "text-slate-900"
                            : isCompleted
                              ? "text-emerald-700"
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
        </div>
      </div>
    </section>
  );
}
