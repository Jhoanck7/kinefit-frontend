"use client";

import Image from "next/image";
import React, { useRef } from "react";

import { useAutoScroll } from "@/hooks/common";
import { LandingConfigResponse } from "@/models/responses";

export interface GoogleReviewItem {
  author: string;
  role?: string;
  quote: string;
  rating: number;
  date?: string;
  avatarUrl?: string;
  isVerifiedGoogle?: boolean;
}

const DEFAULT_REVIEWS: GoogleReviewItem[] = [
  {
    author: "María Paz Sepúlveda",
    role: "Paciente Verificado en Google Maps",
    quote:
      "Excelente atención kinesiológica. Llegué con una lesión lumbar severa y en pocas sesiones logré volver a entrenar sin dolor. La dedicación del equipo es increíble.",
    rating: 5,
    date: "Hace 2 semanas",
  },
  {
    author: "Rodrigo Morales V.",
    role: "Paciente Verificado en Google Maps",
    quote:
      "La infraestructura y los profesionales son de primer nivel. El seguimiento personalizado en cada ejercicio marca la diferencia.",
    rating: 5,
    date: "Hace 1 mes",
  },
  {
    author: "Camila Fuentes T.",
    role: "Paciente Verificado en Google Maps",
    quote:
      "Atención puntual, instalaciones impecables y profesionales altamente capacitados. Totalmente recomendado para deportistas y rehabilitación postoperatoria.",
    rating: 5,
    date: "Hace 3 meses",
  },
];

export default function TestimonialsSection({
  config,
}: {
  config: LandingConfigResponse;
}) {
  let reviews = DEFAULT_REVIEWS;
  if (config.reviewsJson) {
    try {
      const parsed = JSON.parse(config.reviewsJson);
      if (Array.isArray(parsed) && parsed.length > 0) reviews = parsed;
    } catch {}
  }

  const googleUrl =
    config.googleReviewsUrl ||
    "https://maps.google.com/?q=Kinefit+Chile+Antofagasta";

  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScroll = useAutoScroll(scrollRef);
  const arrastreRef = useRef({ activo: false, inicioX: 0, scrollInicial: 0 });

  const iniciarArrastre = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    arrastreRef.current = {
      activo: true,
      inicioX: e.pageX,
      scrollInicial: scrollRef.current.scrollLeft,
    };
  };

  const moverArrastre = (e: React.MouseEvent) => {
    if (!arrastreRef.current.activo || !scrollRef.current) return;
    e.preventDefault();
    const delta = e.pageX - arrastreRef.current.inicioX;
    scrollRef.current.scrollLeft = arrastreRef.current.scrollInicial - delta;
  };

  const terminarArrastre = () => {
    arrastreRef.current.activo = false;
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length > 1 && parts[0][0] && parts[1][0]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const avatarColors = [
    "bg-blue-500/10 text-blue-600 border-blue-200",
    "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    "bg-amber-500/10 text-amber-600 border-amber-200",
    "bg-purple-500/10 text-purple-600 border-purple-200",
    "bg-rose-500/10 text-rose-600 border-rose-200",
  ];

  return (
    <section
      id="testimonials"
      className="scroll-mt-24 py-20 sm:py-28 bg-blue-950 border-b border-blue-900 text-white overflow-hidden w-full"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {config.testimonialsTitle ||
              "Opiniones Reales de Nuestros Pacientes"}
          </h2>
          <p className="text-blue-100 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            {config.testimonialsSubtitle ||
              "Testimonios verificados en Google Maps de personas que han recuperado su salud y rendimiento."}
          </p>

          <div className="pt-2">
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-global shadow-md transition-all"
            >
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span>Ver y Escribir Reseñas en Google Maps</span>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </a>
          </div>
        </div>

        <div className="relative w-full overflow-hidden">
          {/* Sombras difuminadas en los extremos */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-blue-950 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-blue-950 to-transparent z-10" />

          <div
            ref={scrollRef}
            onMouseEnter={autoScroll.onMouseEnter}
            onMouseLeave={e => {
              autoScroll.onMouseLeave();
              terminarArrastre();
              e.currentTarget.style.removeProperty("cursor");
            }}
            onMouseDown={e => {
              iniciarArrastre(e);
              e.currentTarget.style.cursor = "grabbing";
            }}
            onMouseMove={moverArrastre}
            onMouseUp={e => {
              terminarArrastre();
              e.currentTarget.style.removeProperty("cursor");
            }}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-6 pt-2 font-satoshi cursor-grab [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {reviews.map((rev, idx) => (
              <div
                key={`${rev.author}-${idx}`}
                className="w-[300px] sm:w-[380px] shrink-0 bg-white border border-slate-200 rounded-global p-7 transition-all duration-300 flex flex-col justify-between text-slate-900 shadow-md select-none"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex gap-1 text-amber-400">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-4.5 h-4.5 fill-current"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.209l8.2-1.191L12 .587z" />
                        </svg>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed font-medium mb-6 line-clamp-4">
                    &ldquo;{rev.quote}&rdquo;
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                  <div className="flex items-center gap-3">
                    {rev.avatarUrl ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200">
                        <Image
                          src={rev.avatarUrl}
                          alt={rev.author}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center border ${avatarColors[idx % avatarColors.length]}`}
                      >
                        {getInitials(rev.author)}
                      </div>
                    )}

                    <div className="text-left">
                      <h3 className="text-xs font-bold text-slate-900 leading-tight">
                        {rev.author}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        {rev.role || "Paciente Verificado"}
                      </span>
                    </div>
                  </div>

                  {rev.date && (
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {rev.date}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
