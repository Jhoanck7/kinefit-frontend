import React from 'react';

export default function ContactSection() {
  return (
    <section id="contact" className="py-24 sm:py-32 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-base/7 font-semibold text-blue-400">Contacto</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            ¿Listo para empezar?
          </p>
          <p className="mt-6 text-lg/8 text-slate-300">
            Agenda tu primera sesión o consulta nuestras dudas. Estamos ubicados en una zona central con estacionamiento y accesibilidad.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-sm">Teléfono</span>
              <span className="text-lg font-semibold text-white">+56 9 1234 5678</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-slate-400 text-sm">Email</span>
              <span className="text-lg font-semibold text-white">contacto@kinefit.cl</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
