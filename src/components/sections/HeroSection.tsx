import React from 'react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-slate-900 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-950 -z-10" />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-blue-400/10 px-3 py-1 text-sm font-medium text-blue-400 ring-1 ring-inset ring-blue-400/20 mb-6">
            Kinesiología & Entrenamiento
          </span>
          <h1 className="text-5xl font-semibold tracking-tight text-balance text-white sm:text-7xl font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Recupera tu movimiento. Potencia tu salud.
          </h1>
          <p className="mt-8 text-lg font-medium text-pretty text-slate-300 sm:text-xl/8">
            En Kinefit combinamos la rehabilitación kinésica especializada con el entrenamiento funcional para ayudarte a alcanzar tu máximo rendimiento y bienestar integral.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="#booking"
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
            >
              Reservar Hora
            </a>
            <a href="#services" className="text-sm font-semibold leading-6 text-white hover:text-slate-300 transition-colors">
              Conocer Más <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
