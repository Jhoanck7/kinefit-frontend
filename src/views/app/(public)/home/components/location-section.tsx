"use client";

import React, { useEffect, useState } from "react";

import {
  defaultLandingConfig,
  LandingConfigData,
} from "@/lib/panel/data/landing-config";

export default function LocationSection({
  config,
}: {
  config: LandingConfigData;
}) {
  const address =
    config.clinicAddress || "Pje. Maximiliano Poblete 596, Antofagasta";
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    address
  )}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <section
      id="location"
      className="py-24 bg-white border-b border-slate-200/60 text-slate-900 relative overflow-hidden"
    >
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
              {config.locationTitle || "Visítanos en Antofagasta"}
            </p>
            <p className="text-slate-600 text-base mb-8 leading-relaxed">
              {config.locationSubtitle ||
                "Estamos ubicados en un sector accesible de Antofagasta para brindarte la mejor atención kinésica."}
            </p>

            {/* Location Cards */}
            <div className="space-y-6 w-full">
              {/* Address Card */}
              <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/50 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">
                    Dirección
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {address}
                  </p>
                </div>
              </div>

              {/* Hours Card */}
              <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/50 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">
                    Horarios de Atención
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {config.hoursWeekday ||
                      "Lunes a Viernes: 09:00 - 21:00 hrs."}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                    {config.hoursSaturday || "Sábados: 10:00 - 20:00 hrs."}
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Google Maps Navigation Button */}
            <div className="mt-8 w-full">
              <a
                href={
                  config.googleReviewsUrl ||
                  `https://maps.google.com/?q=${encodeURIComponent(address)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs uppercase tracking-wider px-6 py-4 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <span>Abrir Dirección en Google Maps ↗</span>
              </a>
            </div>
          </div>

          {/* Right Column: Google Maps Embed Frame */}
          <div className="lg:col-span-7">
            <div className="w-full h-[400px] lg:h-[480px] rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100 relative">
              <iframe
                title="KineFit Chile Ubicación en Google Maps"
                src={mapUrl}
                width="100%"
                height="100%"
                className="border-0 filter contrast-105"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
