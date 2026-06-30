import React from 'react';

export default function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32 bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl lg:text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-3">Quiénes Somos</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Un enfoque integral para tu cuerpo
          </p>
          <p className="text-slate-500 mt-4 text-base sm:text-lg">
            Nuestro equipo de kinesiólogos y entrenadores certificados trabaja de manera personalizada para diagnosticar, tratar y prevenir lesiones, guiándote paso a paso en tu proceso de recuperación y fortalecimiento físico.
          </p>
        </div>
      </div>
    </section>
  );
}
