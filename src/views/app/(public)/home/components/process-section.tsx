"use client";

import React from "react";

import { LandingConfigResponse } from "@/models/responses";

export interface ProcessStepItem {
  num: string;
  title: string;
  description: string;
}

const DEFAULT_PROCESS_STEPS: ProcessStepItem[] = [
  {
    num: "01",
    title: "Evaluación Kinesiología Inicial",
    description:
      "Diagnóstico funcional completo y anamnesis para determinar el origen de tus molestias y objetivos de tratamiento.",
  },
  {
    num: "02",
    title: "Plan de Tratamiento Personalizado",
    description:
      "Diseño de una pauta de trabajo adaptada con terapia manual, agentes físicos y ejercicio terapéutico guiado.",
  },
  {
    num: "03",
    title: "Rehabilitación y Reacondicionamiento",
    description:
      "Sesiones individuales enfocadas en la recuperación activa, fortalecimiento y optimización de tu movilidad.",
  },
  {
    num: "04",
    title: "Alta y Prevención de Lesiones",
    description:
      "Reevaluación de logros, entrega de pauta de ejercicios para el hogar y recomendaciones para evitar recaídas.",
  },
];

export default function ProcessSection({
  config,
}: {
  config: LandingConfigResponse;
}) {
  let steps = DEFAULT_PROCESS_STEPS;
  if (config.processStepsJson) {
    try {
      const parsed = JSON.parse(config.processStepsJson);
      if (Array.isArray(parsed) && parsed.length > 0) steps = parsed;
    } catch {}
  }

  return (
    <section
      id="process"
      className="scroll-mt-24 py-24 bg-gradient-to-b from-slate-50 via-blue-50/10 to-slate-50 border-b border-slate-200/60 text-slate-900 relative overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/5 rounded-full filter blur-[150px] pointer-events-none -z-20" />

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
        <div className="text-center max-w-3xl mx-auto mb-20 scroll-reveal">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-3">
            Paso a Paso
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {config.processTitle ||
              "¿Cómo Funciona Tu Atención en KineFit Chile?"}
          </p>
          <p className="text-slate-500 mt-4 text-base sm:text-lg whitespace-pre-line">
            {config.processSubtitle ||
              "Un método estructurado paso a paso diseñado para garantizar tu pronta recuperación y bienestar duradero."}
          </p>
        </div>

        <div className="relative">
          <div className="absolute top-0 left-16 right-16 h-36 pointer-events-none hidden lg:block z-0">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 1000 150"
              fill="none"
              preserveAspectRatio="none"
              className="overflow-visible"
            >
              <path
                d="M 10,75 C 250,-20 250,170 500,75 C 750,-20 750,170 990,75"
                stroke="#0C5DC5"
                strokeWidth="28"
                strokeLinecap="round"
                className="opacity-15 filter blur-[12px]"
              />
              <path
                d="M 10,75 C 250,-20 250,170 500,75 C 750,-20 750,170 990,75"
                stroke="#0C5DC5"
                strokeWidth="14"
                strokeLinecap="round"
                className="opacity-90"
              />
              <path
                d="M 10,75 C 250,-20 250,170 500,75 C 750,-20 750,170 990,75"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                className="animate-path-flow opacity-60"
              />
            </svg>
          </div>

          <div className="absolute left-[35px] top-6 bottom-6 w-3 bg-brand-primary rounded-full hidden md:block lg:hidden -z-10 opacity-30" />

          {/* Camino vertical solo en móvil real (mismo estilo que el de escritorio) */}
          <div className="absolute left-[20px] top-6 bottom-6 w-[70px] pointer-events-none block md:hidden z-0">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 150 1000"
              fill="none"
              preserveAspectRatio="none"
              className="overflow-visible"
            >
              <path
                d="M 75,10 C -20,250 170,250 75,500 C -20,750 170,750 75,990"
                stroke="#0C5DC5"
                strokeWidth="28"
                strokeLinecap="round"
                className="opacity-15 filter blur-[12px]"
              />
              <path
                d="M 75,10 C -20,250 170,250 75,500 C -20,750 170,750 75,990"
                stroke="#0C5DC5"
                strokeWidth="14"
                strokeLinecap="round"
                className="opacity-90"
              />
              <path
                d="M 75,10 C -20,250 170,250 75,500 C -20,750 170,750 75,990"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                className="animate-path-flow opacity-60"
              />
            </svg>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`group bg-white rounded-global border border-slate-200/60 p-8 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-100/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between scroll-reveal-scale ${
                  idx === 1 ? "delay-100" : idx === 2 ? "delay-200" : idx === 3 ? "delay-300" : ""
                }`}
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-brand-primary-glow flex items-center justify-center mb-6 font-black text-2xl text-brand-primary group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300 shadow-sm">
                    {step.num}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-brand-primary transition-colors">
                    {step.title}
                  </h3>

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
