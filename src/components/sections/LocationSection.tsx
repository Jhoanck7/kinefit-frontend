"use client";

import React from 'react';
import { CLINIC_INFO } from '@/lib/constants';

export default function LocationSection() {
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    CLINIC_INFO.address
  )}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="location" className="py-24 bg-white border-b border-slate-200/60 text-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[200px] bg-blue-500/5 rounded-full filter blur-[100px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Info & Directions */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-3">
              Ubicación
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-6">
              ¿Cómo Llegar?
            </p>
            <p className="text-brand-muted text-base mb-8 leading-relaxed">
              Estamos ubicados en el sector centro de Antofagasta.
            </p>

            {/* Location Cards */}
            <div className="space-y-6 w-full">
              {/* Address Card */}
              <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/50">
                <div className="w-10 h-10 rounded-xl bg-brand-primary-glow flex items-center justify-center text-brand-primary shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Dirección</h4>
                  <p className="text-xs text-brand-muted leading-relaxed">{CLINIC_INFO.address}</p>
                </div>
              </div>

              {/* Contact Card */}
              <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/50">
                <div className="w-10 h-10 rounded-xl bg-brand-primary-glow flex items-center justify-center text-brand-primary shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">Contacto Directo</h4>
                  <p className="text-xs text-brand-muted leading-relaxed mb-1">Teléfono: {CLINIC_INFO.phone}</p>
                  <p className="text-xs text-brand-muted leading-relaxed">Email: {CLINIC_INFO.email}</p>
                </div>
              </div>
            </div>

            {/* External buttons */}
            <div className="flex flex-wrap gap-4 mt-8 w-full">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(CLINIC_INFO.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[160px] text-center py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-brand-primary/20 transition-all duration-300"
              >
                Abrir en Google Maps
              </a>
              {/* <a
                href={`https://waze.com/ul?q=${encodeURIComponent(CLINIC_INFO.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[160px] text-center py-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider border border-slate-200 transition-all duration-300"
              >
                Abrir en Waze
              </a> */}
            </div>
          </div>

          {/* Right Column: Google Maps Iframe Container */}
          <div className="lg:col-span-7 w-full h-[350px] sm:h-[450px] rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-100/50 bg-slate-50 relative group">
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps Kinefit"
              className="w-full h-full grayscale-[10%] contrast-[110%] group-hover:grayscale-0 transition-all duration-500"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
