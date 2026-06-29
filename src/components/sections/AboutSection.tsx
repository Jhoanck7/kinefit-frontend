import React from 'react';

export default function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32 bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-blue-600">Quiénes Somos</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-slate-900 sm:text-5xl">
            Un enfoque integral para tu cuerpo
          </p>
          <p className="mt-6 text-lg/8 text-slate-600">
            Nuestro equipo de kinesiólogos y entrenadores certificados trabaja de manera personalizada para diagnosticar, tratar y prevenir lesiones, guiándote paso a paso en tu proceso de recuperación y fortalecimiento físico.
          </p>
        </div>
      </div>
    </section>
  );
}
