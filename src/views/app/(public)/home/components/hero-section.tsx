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
      {/* BACKGROUND 3-IMAGE CAROUSEL SLIDER, móvil: recorta a lo ancho */}
      <div className="absolute inset-x-0 top-0 h-[280px] z-0 overflow-hidden lg:hidden">
        {bgImages.map((imgUrl, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentBg ? "opacity-100 z-10" : "opacity-0 z-0"
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

      {/* Escritorio: foto completa sin recortar, pegada a la derecha */}
      <div className="hidden lg:block absolute inset-0 z-0 overflow-hidden">
        {bgImages.map((imgUrl, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentBg ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
          >
            <Image
              src={imgUrl}
              alt={`Kinefit Hero Fondo ${idx + 1}`}
              fill
              priority={idx === 0}
              unoptimized
              className="object-cover object-right"
              style={{ objectFit: "cover", objectPosition: "right" }}
            />
          </div>
        ))}
        <div className="absolute inset-0 z-20 bg-gradient-to-r from-slate-50 via-slate-50/80 via-50% to-transparent w-[75%]" />
      </div>

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

            {/* Redes de contacto rápido */}
            <div className="flex items-center gap-3 mt-5">
              {config.socialWhatsApp && (
                <a
                  href={config.socialWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full bg-slate-100 hover:bg-brand-primary hover:text-white text-slate-600 transition-all duration-300"
                  aria-label="WhatsApp"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.504-5.714-1.466L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.811 1.452 5.518 0 10.006-4.486 10.01-10.007.002-2.675-1.034-5.191-2.917-7.078-1.884-1.886-4.397-2.923-7.08-2.924-5.524 0-10.014 4.489-10.018 10.01-.001 1.702.443 3.361 1.291 4.836l-.99 3.613 3.703-.972zm11.233-6.273c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.668.149-.198.297-.766.967-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
                  </svg>
                </a>
              )}
              {config.socialTikTok && (
                <a
                  href={config.socialTikTok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full bg-slate-100 hover:bg-brand-primary hover:text-white text-slate-600 transition-all duration-300"
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
