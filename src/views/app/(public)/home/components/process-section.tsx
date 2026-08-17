"use client";

import React, { useEffect, useState } from "react";

import { CLINIC_PROCESS_STEPS } from "@/lib/utils";
import {
  defaultLandingConfig,
  defaultProcessSteps,
  LandingConfigData,
  ProcessStepItem,
} from "@/lib/panel/data/landing-config";

export default function ProcessSection({
  config,
}: {
  config: LandingConfigData;
}) {
  let steps = defaultProcessSteps;
  if (config.processStepsJson) {
    try {
      const parsed = JSON.parse(config.processStepsJson);
      if (Array.isArray(parsed) && parsed.length > 0) steps = parsed;
    } catch {}
  }

  return (
    <section
      id="process"
      className="py-24 bg-white border-b border-slate-200/60 text-slate-900 relative overflow-hidden"
    >
      {/* Background soft glow decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/5 rounded-full filter blur-[150px] pointer-events-none -z-20" />

      {/* CSS Animation for the overlay dashed line */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes pathFlow {
          to {
            stroke-dashoffset: -30;
          }
        }
        .animate-path-flow {
          stroke-dasharray: 10 12;
          animation: pathFlow 2s linear infinite;
        }
      `,
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-3">
            El Proceso
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {config.processTitle ||
              "¿Cómo Funciona Tu Atención en KineFit Chile?"}
          </p>
          <p className="text-slate-500 mt-4 text-base sm:text-lg">
            {config.processSubtitle ||
              "Un método estructurado paso a paso diseñado para garantizar tu pronta recuperación y bienestar duradero."}
          </p>
        </div>

        {/* Steps Process Grid */}
        <div className="relative">
          {/* 1. Very Thick Wavy Solid Blue Path (Desktop: lg) */}
          <div className="absolute top-0 left-16 right-16 h-36 pointer-events-none hidden lg:block -z-10">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 1000 150"
              fill="none"
              preserveAspectRatio="none"
              className="overflow-visible"
            >
              {/* Thick Blur Glow (Solid Blue) */}
              <path
                d="M 10,75 C 250,-20 250,170 500,75 C 750,-20 750,170 990,75"
                stroke="#0C5DC5"
                strokeWidth="28"
                strokeLinecap="round"
                className="opacity-15 filter blur-[12px]"
              />

              {/* Very Thick Solid Core Line (Solid Blue) */}
              <path
                d="M 10,75 C 250,-20 250,170 500,75 C 750,-20 750,170 990,75"
                stroke="#0C5DC5"
                strokeWidth="14"
                strokeLinecap="round"
                className="opacity-90"
              />

              {/* Animated overlay dash line (Solid White for flow effect) */}
              <path
                d="M 10,75 C 250,-20 250,170 500,75 C 750,-20 750,170 990,75"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                className="animate-path-flow opacity-60"
              />
            </svg>
          </div>

          {/* 2. Vertical Solid Blue Path (Mobile/Tablet: md) */}
          <div className="absolute left-[35px] top-6 bottom-6 w-3 bg-brand-primary rounded-full hidden md:block lg:hidden -z-10 opacity-30" />

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm hover:border-slate-300 hover:shadow-xl hover:shadow-slate-100/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Step number badge */}
                  <div className="w-14 h-14 rounded-2xl bg-brand-primary-glow flex items-center justify-center mb-6 font-black text-2xl text-brand-primary group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300 shadow-sm">
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
