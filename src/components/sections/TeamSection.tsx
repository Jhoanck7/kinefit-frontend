"use client";

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { specialistService } from '@/lib/services/specialist.service';
import { landingConfigService, LandingConfigData, defaultLandingConfig } from '@/lib/services/landingConfig.service';
import { BackendSpecialist, SanityTeamMemberItem } from '@/types';

interface TeamSectionProps {
  initialTeam?: SanityTeamMemberItem[] | null;
}

export default function TeamSection({ config, initialTeam }: { config: LandingConfigData, initialTeam?: any[] | null }) {
  const [teamMembers, setTeamMembers] = useState<Array<{
    name: string;
    role: string;
    specialty: string;
    email: string;
    image: string;
  }>>(() => {
    if (initialTeam && initialTeam.length > 0) {
      return initialTeam.map((s: any) => {
        let defaultImg = "/Kinefit foto perfil.png";
        if (s.nombre) {
          const lowerName = s.nombre.toLowerCase();
          if (lowerName.includes("franchesca")) defaultImg = "/Franchesca.jpg";
          else if (lowerName.includes("valeria")) defaultImg = "/Valeria.jpg";
          else if (lowerName.includes("constanza")) defaultImg = "/Constanza.jpg";
          else if (lowerName.includes("diego")) defaultImg = "/Diego.jpg";
        }
        
        return {
          name: s.nombre || "Especialista",
          role: s.cargo || "Kinesiólogo",
          specialty: s.descripcion || (s.servicio?.nombre ? `Especialista en ${s.servicio.nombre}` : "Kinesiólogo(a) Clínico(a)"),
          email: s.email || "contacto@kinefitchile.com",
          image: s.fotoUrl || s.imageUrl || defaultImg,
        };
      });
    }
    return [];
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.clientWidth;
      const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleAutoScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 24) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    };

    const timer = setInterval(handleAutoScroll, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="team" className="py-24 bg-slate-50 border-b border-slate-200/60 text-slate-900 overflow-hidden w-full">
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
            {config.teamSubtitle || "Profesionales certificados comprometidos con tu rehabilitación y rendimiento."}
          </p>
        </div>

        {/* Carousel Container Wrapper */}
        <div className="relative max-w-lg md:max-w-none mx-auto group">
          
          {/* Flex Scroll Container */}
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 px-4 scrollbar-none scroll-pl-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {teamMembers.map((member) => (
              <div 
                key={member.name}
                className="w-[85%] sm:w-[48%] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 snap-start snap-always"
              >
                {/* Card Container */}
                <div className="group/card flex flex-col items-center justify-between text-center bg-slate-50 border border-slate-200/60 rounded-3xl p-6 sm:p-8 hover:bg-white hover:border-slate-300 hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300 w-full min-h-[440px] h-full">
                  
                  {/* Bloque superior */}
                  <div className="block w-full">
                
                    {/* Photo Frame */}
                    <div className="relative w-[168px] h-[168px] min-w-[168px] max-w-[168px] min-h-[168px] max-h-[168px] shrink-0 mx-auto rounded-full overflow-hidden mb-6 border-4 border-white shadow-md group-hover/card:scale-105 transition-transform duration-300">
                      <Image   
                        src={member.image}
                        alt={member.name}
                        width={168} 
                        height={168}
                        priority
                        unoptimized
                        className="w-full h-full object-cover object-center group-hover/card:grayscale-0 transition-all duration-500 rounded-full"
                      />
                    </div>

                    {/* Text Info */}
                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover/card:text-brand-primary transition-colors">
                      {member.name}
                    </h3>
                    <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider mb-3 block">
                      {member.role}
                    </span>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xs mb-6 px-2 min-h-[32px]">
                      {member.specialty}
                    </p>
                  </div>

                  {/* Contact Email Link */}
                  <div className="w-full flex justify-center mt-auto">
                    <a 
                      href={`mailto:${member.email}`}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-brand-muted hover:text-brand-primary transition-colors border border-slate-200 hover:border-brand-primary/30 rounded-full px-4 py-2 bg-white shadow-xs"
                    >
                      <svg className="w-4 h-4 text-slate-400 group-hover/card:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 00-2 2z" />
                      </svg>
                      <span>{member.email}</span>
                    </a>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Left Arrow Button */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-[-16px] xl:left-[-24px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:text-brand-primary hover:border-brand-primary/30 transition-all duration-300 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 active:scale-95"
            aria-label="Anterior"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Right Arrow Button */}
          <button 
            onClick={() => scroll('right')}
            className="absolute right-[-16px] xl:right-[-24px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:text-brand-primary hover:border-brand-primary/30 transition-all duration-300 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 active:scale-95"
            aria-label="Siguiente"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
}