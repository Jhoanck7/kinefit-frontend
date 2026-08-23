"use client";

import Image from "next/image";
import React, { useEffect, useRef } from "react";

import {
  EspecialistaResponse,
  LandingConfigResponse,
} from "@/models/responses";

function imagenPorDefecto(nombre: string): string {
  const lowerName = nombre.toLowerCase();
  if (lowerName.includes("franchesca")) return "/Franchesca.jpg";
  if (lowerName.includes("valeria")) return "/Valeria.jpg";
  if (lowerName.includes("constanza")) return "/Constanza.jpg";
  if (lowerName.includes("diego")) return "/Diego.jpg";
  return "/Kinefit foto perfil.png";
}

export default function TeamSection({
  config,
  initialTeam,
}: {
  config: LandingConfigResponse;
  initialTeam?: EspecialistaResponse[] | null;
}) {
  const teamMembers = (initialTeam ?? []).map(s => ({
    name: s.nombre || "Especialista",
    role: s.cargo || "Kinesiólogo",
    specialty:
      s.descripcion ||
      (s.servicios?.length
        ? `Especialista en ${s.servicios.map(sv => sv.nombre).join(", ")}`
        : "Kinesiólogo(a) Clínico(a)"),
    email: s.email,
    mostrarContacto: s.mostrarContacto,
    image: s.fotoUrl || imagenPorDefecto(s.nombre || ""),
  }));

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.clientWidth;
      const scrollAmount = direction === "left" ? -cardWidth : cardWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleAutoScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 24) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: "smooth" });
        }
      }
    };

    const timer = setInterval(handleAutoScroll, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="team"
      className="scroll-mt-24 py-24 bg-slate-50 border-b border-slate-200/60 text-slate-900 overflow-hidden w-full"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-3">
            Nuestro Equipo
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {config.teamTitle || "Nuestros Especialistas"}
          </p>
          <p className="text-slate-500 mt-4 text-base sm:text-lg">
            {config.teamSubtitle ||
              "Profesionales certificados comprometidos con tu rehabilitación y rendimiento."}
          </p>
        </div>

        {/* Carousel Container Wrapper */}
        <div className="relative max-w-lg md:max-w-none mx-auto group">
          {/* Flex Scroll Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 px-4 scrollbar-none scroll-pl-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {teamMembers.map(member => (
              <div
                key={member.name}
                className="w-[88%] sm:w-[70%] md:w-[55%] lg:w-[45%] shrink-0 snap-start snap-always"
              >
                {/* Card Container */}
                <div className="group/card flex flex-col bg-white border border-slate-200/60 rounded-global overflow-hidden hover:border-slate-300 hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300 w-full h-full">
                  {/* Bloque superior: foto a ancho completo */}
                  <div className="relative w-full h-[320px] sm:h-[380px] shrink-0 overflow-hidden bg-slate-100">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      priority
                      unoptimized
                      className="object-cover object-top scale-125 origin-top group-hover/card:scale-[1.35] transition-transform duration-500"
                    />
                  </div>

                  {/* Bloque inferior: datos */}
                  <div className="flex flex-col p-6 sm:p-8 text-left">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      {member.name}
                    </h3>
                    <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider mb-3 block">
                      {member.role}
                    </span>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">
                      {member.specialty}
                    </p>

                    {member.mostrarContacto && member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="text-xs font-semibold text-brand-muted hover:text-brand-primary transition-colors"
                      >
                        {member.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Left Arrow Button */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-[-16px] xl:left-[-24px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:text-brand-primary hover:border-brand-primary/30 transition-all duration-300 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 active:scale-95"
            aria-label="Anterior"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-[-16px] xl:right-[-24px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:text-brand-primary hover:border-brand-primary/30 transition-all duration-300 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 active:scale-95"
            aria-label="Siguiente"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
