"use client";

import React from 'react';
import { BOOKING_SERVICES, CLINIC_SERVICES_FEATURES } from '@/lib/constants';
import { generarEnlaceWhatsApp } from '@/lib/utils/whatsapp';
import { useBookingStore } from '@/lib/store/useBookingStore';

interface SanityService {
  id: number;
  nombre: string;
  description?: string;
  price: string;
  duration: string;
  features?: string[];
}

interface ServicesSectionProps {
  initialServices?: SanityService[] | null;
}

export default function ServicesSection({ initialServices }: ServicesSectionProps) {
  const { setSelectedService } = useBookingStore();
// Si hay servicios de Sanity, los usamos. Si no, usamos las constantes locales.
  const displayServices = initialServices && initialServices.length > 0 
    ? initialServices : BOOKING_SERVICES.map((s, idx) => ({
        id: idx + 1,
        nombre: s.name,
        description: idx === 0 
          ? "Rehabilitación integral de patologías musculoesqueléticas, contracturas y dolores crónicos empleando terapia física." 
          : idx === 1 
          ? "Entrenamiento adaptado a tus condiciones físicas e historial clínico, ideal para ganar fuerza y resistencia de forma segura." 
          : "Servicio enfocado en deportistas de alto nivel y recreativos para el tratamiento ágil de esguinces, desgarros y tendinopatías.",
        price: s.price,
        duration: s.duration,
        features: CLINIC_SERVICES_FEATURES[idx] || []
      }));

  // MANEJADOR CORREGIDO: Guarda el servicio actual y abre WhatsApp
  const handleSelectService = (e: React.MouseEvent, service: SanityService) => {
    e.preventDefault(); // Evita el salto de página del enlace '#'

    // 1. Guardamos el servicio seleccionado en el store global de Zustand
  
    setSelectedService(service.id, service.nombre);
  

    // 2. Generamos el enlace dinámico pasando el nombre del servicio en limpio
    // Como es directo de la tarjeta, le pasamos una fecha genérica o un mensaje de solicitud
    const urlWhatsApp = generarEnlaceWhatsApp(service.nombre, "a convenir");

    // 3. Abrimos WhatsApp de inmediato en una nueva pestaña (seguro para celulares)
    window.open(urlWhatsApp, '_blank', 'noopener,noreferrer');
  };

  
  // SVG Icons for each service
  const serviceIcons = [
    // Icon 1: Clinical (Spine/Body care)
    <svg key="c" className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>,
    // Icon 2: Functional Training (Weight / Dumbbell / Action)
    <svg key="f" className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>,
    // Icon 3: Sports rehab (Runner / Trophy / Pulse)
    <svg key="s" className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>,
    // Icon 4: Masoterapia (Hand/Care)
    <svg key="m" className="w-8 h-8 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11v-1.5M12 11c0-3.517 1.009-6.799 2.753-9.571m-3.44 2.04l-.054-.09A13.916 13.916 0 0015 11v1.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ];



  return (
    <section id="services" className="py-24 bg-white border-b border-slate-200/60 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-3">
            Especialidades
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Nuestros Servicios Profesionales
          </p>
          <p className="text-slate-500 mt-4 text-base sm:text-lg">
            Combinamos evidencia clínica, terapeutas certificados y equipamiento moderno para ofrecerte una recuperación efectiva.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-10 lg:max-w-none lg:grid-cols-3">
          {displayServices.map((service, index) => (
            <div 
              key={service.nombre} 
              className="group flex flex-col justify-between rounded-3xl bg-slate-50 border border-slate-200/60 p-8 hover:bg-white hover:border-slate-300 hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              <div>
                {/* Icon Box */}
                <div className="w-14 h-14 rounded-2xl bg-brand-primary-glow flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {serviceIcons[index % serviceIcons.length]}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold leading-8 text-slate-900 mb-4">{service.nombre}</h3>
                
                {/* Description */}
                {service.description && (
                  <p className="text-sm leading-relaxed text-brand-muted mb-6">
                    {service.description}
                  </p>
                )}

                {/* Features List */}
                {service.features && service.features.length > 0 && (
                  <ul className="space-y-3 mb-8 border-t border-slate-200/60 pt-6">
                    {service.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-xs font-medium text-brand-muted">
                        <svg className="w-4 h-4 text-brand-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Price & Booking Link */}
              <div className="mt-4 border-t border-slate-200/60 pt-6 flex flex-col gap-4">
                <div className="flex items-baseline justify-between">
                  {/* <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Arancel por Sesión</span> */}
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold tracking-tight text-brand-secondary">{service.price}</span>
                    {/* <span className="text-[10px] text-slate-400 mt-0.5">Duración: {service.duration}</span> */}
                  </div>
                </div>
                
                <a
  
                  href="#"
                  onClick={(e) => handleSelectService(e, service)}
                  className="w-full text-center py-3 bg-slate-200/50 hover:bg-brand-primary hover:text-white text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 mt-2"
                >
                  Agendar Evaluación
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
