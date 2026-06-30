"use client";

import { CLINIC_PROCESS_STEPS } from '@/lib/constants';

const STEPS = CLINIC_PROCESS_STEPS;

export default function ProcessSection() {
  return (
    <section id="process" className="py-24 bg-slate-50 border-b border-slate-200/60 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-3">
            El Proceso
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            ¿Cómo Trabajamos Contigo?
          </p>
          <p className="text-slate-500 mt-4 text-base sm:text-lg">
            Te acompañamos paso a paso con un plan ordenado y supervisado para garantizar resultados duraderos y seguros.
          </p>
        </div>

        {/* Steps Process Grid */}
        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 -translate-y-1/2 hidden lg:block -z-10" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((step) => (
              <div 
                key={step.num}
                className="group bg-white rounded-3xl border border-slate-200/60 p-8 shadow-xs hover:border-slate-300 hover:shadow-xl hover:shadow-slate-100/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Step number badge */}
                  <div className="w-14 h-14 rounded-2xl bg-brand-primary-glow flex items-center justify-center mb-6 font-black text-2xl text-brand-primary group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                    {step.num}
                  </div>

                  {/* Step Title */}
                  <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-brand-primary transition-colors">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-sm leading-relaxed text-brand-muted">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
