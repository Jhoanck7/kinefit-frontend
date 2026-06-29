import React from 'react';

export default function ServicesSection() {
  const services = [
    {
      name: 'Kinesiología Clínica',
      description: 'Rehabilitación física de lesiones traumatológicas, deportivas y neurológicas con terapia manual y ejercicios terapéuticos.',
      price: '$35.000',
    },

  ];

  return (
    <section id="services" className="py-24 sm:py-32 bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl lg:text-center mb-16">
          <h2 className="text-base/7 font-semibold text-blue-600">Servicios</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-slate-900 sm:text-5xl">
            Nuestras Especialidades
          </p>
        </div>
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.name} className="flex flex-col justify-between rounded-3xl bg-slate-50 p-8 ring-1 ring-slate-200/50 xl:p-10 hover:shadow-lg transition-shadow">
              <div>
                <h3 className="text-lg font-semibold leading-8 text-slate-900">{service.name}</h3>
                <p className="mt-4 text-sm leading-6 text-slate-600">{service.description}</p>
              </div>
              <div className="mt-8 flex items-baseline justify-between border-t border-slate-200 pt-6">
                <span className="text-sm font-semibold text-slate-500">Valor Fonasa / Isapre</span>
                <span className="text-3xl font-bold tracking-tight text-slate-900">{service.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
