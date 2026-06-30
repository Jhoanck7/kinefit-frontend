"use client";

import React from 'react';
import { CLINIC_TESTIMONIALS } from '@/lib/constants';

interface SanityTestimonial {
  nombre: string;
  cargo: string;
  content: string;
  rating?: number;
}

interface TestimonialsSectionProps {
  initialTestimonials?: SanityTestimonial[] | null;
}

export default function TestimonialsSection({ initialTestimonials }: TestimonialsSectionProps) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length > 1 && parts[0][0] && parts[1][0]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const avatarColors = [
    'bg-blue-500/10 text-blue-600',
    'bg-indigo-500/10 text-indigo-600',
    'bg-emerald-500/10 text-emerald-600',
    'bg-amber-500/10 text-amber-600',
    'bg-purple-500/10 text-purple-600'
  ];

  const displayTestimonials = initialTestimonials && initialTestimonials.length > 0
    ? initialTestimonials.map((t, idx) => ({
        author: t.nombre,
        role: t.cargo,
        quote: t.content,
        rating: t.rating || 5,
        initials: getInitials(t.nombre),
        color: avatarColors[idx % avatarColors.length]
      }))
    : CLINIC_TESTIMONIALS.map((t) => ({
        ...t,
        rating: 5
      }));

  return (
    <section id="testimonials" className="py-24 bg-slate-50 border-b border-slate-200/60 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-3">
            Testimonios
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            ¿Qué Opinan Nuestros Pacientes?
          </p>
          <p className="text-slate-500 mt-4 text-base sm:text-lg">
            Conoce las historias reales de personas que han recuperado su bienestar y rendimiento en nuestra clínica.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-lg md:max-w-none mx-auto">
          {displayTestimonials.map((testi) => (
            <div 
              key={testi.author}
              className="bg-white border border-slate-200/60 rounded-3xl p-8 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-100/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Stars Rating */}
                <div className="flex gap-1 text-amber-400 mb-6">
                  {[...Array(testi.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.209l8.2-1.191L12 .587z" />
                    </svg>
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-sm italic leading-relaxed text-brand-muted mb-8 relative">
                  &ldquo;{testi.quote}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                {/* Initials Avatar */}
                <div className={`w-12 h-12 rounded-full font-bold text-sm flex items-center justify-center ${testi.color}`}>
                  {testi.initials}
                </div>

                {/* Meta details */}
                <div className="text-left">
                  <h4 className="text-sm font-bold text-slate-900">
                    {testi.author}
                  </h4>
                  <span className="text-xs text-slate-400 mt-0.5 block">
                    {testi.role}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
