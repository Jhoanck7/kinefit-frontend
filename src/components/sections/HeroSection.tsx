"use client";

import React from 'react';
import BookingCard from '../ui/BookingCard';
import { useBookingStore } from '@/lib/store/useBookingStore';
import { HERO_COPY } from '@/lib/constants';

export default function HeroSection() {
  const currentStep = useBookingStore((state) => state.currentStep);

  return (
    <section className="relative min-h-screen flex items-center justify-center text-slate-900 pt-28 pb-16 bg-slate-50 border-b border-slate-200">
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Lado Izquierdo */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Tagline / Título Plano */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase">
              {HERO_COPY.tagline}{' '}
              <span className="text-brand-primary font-black">
                {HERO_COPY.brandName}
              </span>
            </h1>
            
            {/* Párrafo descriptivo */}
            <p className="text-slate-600 text-base md:text-lg max-w-2xl mt-4 mb-8 leading-relaxed font-medium">
              {HERO_COPY.description}
            </p>
            
            {/* Botón CTA Plano */}
            <a
              href="#agendamiento"
              className="inline-block bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl px-8 py-4 border-2 border-brand-primary text-center uppercase tracking-wider text-sm cursor-pointer transition-colors"
            >
              {HERO_COPY.ctaText}
            </a>
            
            {/* Viñetas en Grid Plana */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-12 w-full max-w-lg border-t-2 border-slate-200 pt-8">
              {HERO_COPY.bullets.map((bullet) => (
                <div key={bullet} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{bullet}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Lado Derecho - Módulo de Agendamiento Plano */}
          <div id="agendamiento" className="lg:col-span-6 relative w-full">
            <div className="rounded-2xl border-2 border-slate-300 bg-white p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 items-stretch">
              
              {/* Stepper lateral plano */}
              <div className="flex sm:flex-col justify-between sm:justify-center gap-2 sm:gap-6 border-b sm:border-b-0 sm:border-r border-slate-200 pb-4 sm:pb-0 sm:pr-6 shrink-0">
                {[
                  { step: 1, label: 'Servicio' },
                  { step: 2, label: 'Especialista' },
                  { step: 3, label: 'Horario' },
                  { step: 4, label: 'Reserva' },
                ].map((s) => {
                  const isActive = currentStep === s.step;
                  const isCompleted = currentStep > s.step;

                  return (
                    <div key={s.step} className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isCompleted
                            ? 'bg-emerald-600 text-white border-2 border-emerald-600'
                            : isActive
                            ? 'bg-brand-primary text-white border-2 border-brand-primary'
                            : 'bg-slate-100 text-slate-500 border border-slate-300'
                        }`}
                      >
                        {isCompleted ? '✓' : s.step}
                      </div>
                      <span className={`text-xs font-bold hidden sm:inline uppercase tracking-wider ${
                        isActive ? 'text-slate-900' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                      }`}>
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
