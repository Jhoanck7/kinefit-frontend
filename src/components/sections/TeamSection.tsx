"use client";

import Image from 'next/image';
import { CLINIC_TEAM } from '@/lib/constants';

interface SanityTeamMember {
  nombre: string;
  cargo: string;
  email: string;
  imageUrl: string;
  specialty?: string;
}

interface TeamSectionProps {
  initialTeam?: SanityTeamMember[] | null;
}

export default function TeamSection({ initialTeam }: TeamSectionProps) {
  const displayTeam = initialTeam && initialTeam.length > 0
    ? initialTeam.map(t => ({
        name: t.nombre,
        role: t.cargo,
        specialty: t.specialty || "Kinesiólogo(a) Clínico(a)",
        email: t.email,
        image: t.imageUrl
      }))
    : CLINIC_TEAM;

  return (
    <section id="team" className="py-24 bg-white border-b border-slate-200/60 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-3">
            Nuestro Equipo
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Equipo de la Sucursal Matriz
          </p>
          <p className="text-slate-500 mt-4 text-base sm:text-lg">
            Contamos con profesionales altamente capacitados y en constante perfeccionamiento para brindarte el mejor cuidado clínico.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-lg md:max-w-none mx-auto">
          {displayTeam.map((member) => (
            <div 
              key={member.name}
              className="group flex flex-col items-center text-center bg-slate-50 border border-slate-200/60 rounded-3xl p-8 hover:bg-white hover:border-slate-300 hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Photo Frame */}
              <div className="relative w-44 h-44 rounded-full overflow-hidden mb-6 border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-300">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover object-center filter grayscale contrast-110 group-hover:grayscale-0 transition-all duration-500"
                  sizes="176px"
                />
              </div>

              {/* Text Info */}
              <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-brand-primary transition-colors">
                {member.name}
              </h3>
              <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider mb-3 block">
                {member.role}
              </span>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mb-6 px-2 min-h-[32px]">
                {member.specialty}
              </p>

              {/* Contact Email Link */}
              <a 
                href={`mailto:${member.email}`}
                className="inline-flex items-center gap-2 text-xs font-semibold text-brand-muted hover:text-brand-primary transition-colors border border-slate-200 hover:border-brand-primary/30 rounded-full px-4 py-2 bg-white shadow-xs"
              >
                <svg className="w-4 h-4 text-slate-400 group-hover:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 00-2 2z" />
                </svg>
                <span>{member.email}</span>
              </a>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
