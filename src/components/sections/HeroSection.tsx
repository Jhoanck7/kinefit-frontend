"use client";

import React from 'react';
import BookingCard from '../ui/BookingCard';
import { useBookingStore } from '@/lib/store/useBookingStore';
import { HERO_COPY } from '@/lib/constants';

export default function HeroSection() {
  const currentStep = useBookingStore((state) => state.currentStep);
  return (
    <section className="relative min-h-screen flex items-center justify-center text-slate-900 pt-24 pb-16 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-brand-bg to-brand-bg -z-10" />
      
      {/* Split background image covering only the right half on desktop */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 bg-cover bg-center bg-no-repeat -z-10 opacity-[0.08] lg:opacity-[0.14] border-l border-brand-border/30"
        style={{ backgroundImage: "url('/hero.jpg')" }}
      >
        {/* Soft gradient to fade the image towards the left edge on desktop */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-brand-bg to-transparent hidden lg:block" />
      </div>
      
      {/* Tech Grid Pattern */}
      <div className="absolute right-0 top-1/4 w-full md:w-1/2 h-2/3 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50 -z-10" />
      <div className="absolute right-10 top-1/3 w-72 h-72 bg-brand-primary/5 rounded-full blur-[100px] -z-10" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Lado Izquierdo */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Tagline / Título */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase">
              {HERO_COPY.tagline}{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary-hover via-brand-primary to-indigo-600">
                {HERO_COPY.brandName}
              </span>
            </h1>
            
            {/* Párrafo descriptivo */}
            <p className="text-brand-muted text-base md:text-lg max-w-2xl mt-4 mb-8 leading-relaxed">
              {HERO_COPY.description}
            </p>
            
            {/* Botón CTA */}
            <a
              href={HERO_COPY.ctaLink}
              className="inline-block bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl px-8 py-4 shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-center uppercase tracking-wider text-sm"
            >
              {HERO_COPY.ctaText}
            </a>
            
            {/* Viñetas en Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-12 w-full max-w-lg border-t border-brand-border pt-8">
              {HERO_COPY.bullets.map((bullet) => (
                <div key={bullet} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 text-xs font-bold">
                    ✓
                  </div>
                  <span className="text-sm font-medium text-brand-muted">{bullet}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Lado Derecho */}
          <div className="lg:col-span-6 relative w-full">
            {/* Floating abstract dashboard element */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-brand-primary/5 rounded-full blur-xl" />
            
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-brand-border p-8 sm:p-10 md:p-12 shadow-xl shadow-slate-100/80 relative overflow-hidden flex flex-col sm:flex-row gap-10 items-stretch">
              {/* Abstract medical scan glow overlay */}
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
              
              {/* Interactive Booking Card (Left half of card) */}
              <div className="flex-[1.3] border-b sm:border-b-0 sm:border-r border-brand-border/60 pb-8 sm:pb-0 sm:pr-8">
                <BookingCard />
              </div>
              
              {/* Reactive Stepper (Right half of card) */}
              <div className="flex-1 flex flex-col justify-between py-2 min-h-[380px]">
                {[
                  { step: 1, title: 'Elige Servicio', desc: 'Especialidades' },
                  { step: 2, title: 'Especialista', desc: 'Terapeutas clínicos' },
                  { step: 3, title: 'Fecha y Hora', desc: 'Horarios disponibles' },
                  { step: 4, title: 'Confirma Cita', desc: 'Datos personales' }
                ].map((item, index, arr) => {
                  const isComplete = currentStep > item.step;
                  const isActive = currentStep === item.step;

                  return (
                    <div key={item.step} className="flex gap-3 relative items-start group">
                      {/* Connector line */}
                      {index < arr.length - 1 && (
                        <div
                          className={`absolute left-3.5 top-7 bottom-0 w-0.5 -ml-[1px] bg-brand-border ${
                            isComplete ? 'bg-brand-primary' : ''
                          }`}
                          style={{ height: 'calc(100% + 12px)' }}
                        />
                      )}
                      
                      {/* Circle icon */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold border z-10 transition-all ${
                          isComplete
                            ? 'bg-brand-primary border-brand-primary-hover text-white shadow-md shadow-brand-primary/20'
                            : isActive
                            ? 'bg-white border-brand-primary text-brand-primary shadow-md shadow-brand-primary/10 animate-pulse'
                            : 'bg-slate-50 border-brand-border text-brand-muted'
                        }`}
                      >
                        {isComplete ? '✓' : item.step}
                      </div>
                      
                      {/* Text labels */}
                      <div>
                        <h4
                          className={`text-xs font-semibold transition-colors ${
                            isComplete || isActive
                              ? 'text-slate-900'
                              : 'text-brand-muted'
                          }`}
                        >
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
