"use client";

import React, { useEffect, useState } from 'react';
import { landingConfigService, GoogleReviewItem, defaultGoogleReviews, LandingConfigData, defaultLandingConfig } from '@/lib/services/landingConfig.service';

interface SanityTestimonial {
  nombre: string;
  cargo: string;
  content: string;
  rating?: number;
}

interface TestimonialsSectionProps {
  initialTestimonials?: SanityTestimonial[] | null;
}

export default function TestimonialsSection({ config }: { config: LandingConfigData }) {
  let reviews = defaultGoogleReviews;
  if (config.reviewsJson) {
    try {
      const parsed = JSON.parse(config.reviewsJson);
      if (Array.isArray(parsed) && parsed.length > 0) reviews = parsed;
    } catch {}
  }
  
  const googleUrl = config.googleReviewsUrl || "https://maps.google.com/?q=Kinefit+Chile+Antofagasta";

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length > 1 && parts[0][0] && parts[1][0]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const avatarColors = [
    'bg-blue-500/10 text-blue-600 border-blue-200',
    'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    'bg-amber-500/10 text-amber-600 border-amber-200',
    'bg-purple-500/10 text-purple-600 border-purple-200',
    'bg-rose-500/10 text-rose-600 border-rose-200'
  ];

  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-blue-950 border-b border-blue-900 text-white overflow-hidden w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header con Google Badge Oficial */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {config.testimonialsTitle || "Opiniones Reales de Nuestros Pacientes"}
          </h2>
          <p className="text-blue-100 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            {config.testimonialsSubtitle || "Testimonios verificados en Google Maps de personas que han recuperado su salud y rendimiento."}
          </p>

          <div className="pt-2">
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full shadow-md transition-all"
            >
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>Ver y Escribir Reseñas en Google Maps</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Reseñas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-lg md:max-w-none mx-auto">
          {reviews.map((rev, idx) => (
            <div 
              key={`${rev.author}-${idx}`}
              className="bg-white border border-slate-200 rounded-3xl p-7 hover:border-brand-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Header de la Tarjeta con Insignia de Google */}
                <div className="flex items-center justify-between mb-5">
                  {/* Calificación de Estrellas */}
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <svg key={i} className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.209l8.2-1.191L12 .587z" />
                      </svg>
                    ))}
                  </div>
                </div>

                {/* Texto de la Reseña */}
                <p className="text-sm text-slate-700 leading-relaxed font-medium mb-6">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              {/* Pie de Autor y Fecha */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center border ${avatarColors[idx % avatarColors.length]}`}>
                    {getInitials(rev.author)}
                  </div>

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
    </section>
  );
}
