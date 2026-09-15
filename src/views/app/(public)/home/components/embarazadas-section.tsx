"use client";

import { ArrowRight, Clock, Gift, Info } from "lucide-react";
import Image from "next/image";
import React, { useRef } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAutoScroll } from "@/hooks/common";
import { EmbarazadaItem, LandingConfigResponse } from "@/models/responses";

export default function EmbarazadasSection({
  config,
}: {
  config: LandingConfigResponse;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScroll = useAutoScroll(scrollRef);

  let items: EmbarazadaItem[] = [];
  if (config.embarazadasJson) {
    try {
      const parsed = JSON.parse(config.embarazadasJson);
      if (Array.isArray(parsed)) items = parsed;
    } catch {}
  }

  if (items.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      const amount = direction === "left" ? -width : width;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <section
      id="embarazadas"
      className="scroll-mt-24 py-24 bg-gradient-to-b from-slate-50 via-blue-50/40 to-slate-50/80 border-b border-slate-200/80 text-slate-900"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Móvil: título antes del carrusel */}
          <div className="lg:hidden text-left order-1 scroll-reveal">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-3">
              Masoterapia para embarazadas
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {config.embarazadasTitle || "Referentes en masajes para embarazadas"}
            </p>
          </div>

          {/* Columna Izquierda en Desktop: Título y Contenido */}
          <div className="lg:col-span-5 text-left order-3 lg:order-1 scroll-reveal delay-200">
            <h2 className="hidden lg:block text-sm font-semibold uppercase tracking-wider text-brand-primary mb-3">
              Masoterapia para embarazadas
            </h2>
            <p className="hidden lg:block text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              {config.embarazadasTitle || "Referentes en masajes para embarazadas"}
            </p>

            {config.embarazadasSubtitle && (
              <p className="text-slate-500 text-base sm:text-lg whitespace-pre-line text-justify">
                {config.embarazadasSubtitle}
              </p>
            )}

            {/* Botones de acción: Ver más detalles y Nota importante */}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {/* Modal "Ver más detalles" */}
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline transition-colors cursor-pointer"
                  >
                    <span>Ver más detalles</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
                  <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-left">
                        <DialogTitle className="text-xl sm:text-2xl font-extrabold text-slate-900">
                          Masoterapia para Embarazadas
                        </DialogTitle>
                      </div>
                    </div>
                    <DialogDescription className="sr-only">
                      Detalles completos de los masajes y drenaje linfático para embarazadas en KineFit Chile.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-5 mt-4 text-left">
                    {/* Servicio 1: Masaje para Embarazadas */}
                    <div className="rounded-xl bg-slate-50 p-5 border border-slate-200/80 space-y-3">
                      <p className="text-slate-600 text-sm leading-relaxed text-justify">
                        En KineFit Chile somos referentes en masajes para embarazadas, contamos con implementación especializada, nueva, segura y de alta calidad, diseñada para entregar comodidad durante la gestación y permitirte volver a disfrutar, por un momento, de la sensación de descansar boca abajo.
                      </p>
                      <div className="pt-2.5 border-t border-slate-200/60 flex items-start gap-2.5 text-slate-600 text-xs sm:text-sm text-justify">
                        <Gift className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                        <p>
                          Nuestras profesionales están capacitadas para acompañarte en esta etapa, además, es una experiencia ideal para regalar a tu pareja, amiga o futura mamá, permitiéndole desconectarse, relajarse y vivir la experiencia KineFit Chile.
                        </p>
                      </div>
                    </div>

                    {/* Servicio 2: Drenaje Linfático */}
                    <div className="rounded-xl bg-slate-50 p-5 border border-slate-200/80 space-y-3">
                      <p className="text-slate-600 text-sm leading-relaxed text-justify">
                        También contamos con drenaje linfático especializado para piernas cansadas durante el embarazo, un tratamiento suave y seguro pensado para aliviar la sensación de pesadez, hinchazón y fatiga.
                      </p>
                      <div className="pt-2.5 border-t border-slate-200/60 flex items-start gap-2.5 text-slate-600 text-xs sm:text-sm text-justify">
                        <Clock className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                        <p>
                          Mediante delicadas maniobras de drenaje linfático manual, favorecemos el retorno linfático y ayudamos a disminuir la sensación de retención de líquidos, proporcionando descanso, alivio y bienestar. Una experiencia de 30 minutos dedicada a cuidar de ti y acompañarte en esta hermosa etapa.
                        </p>
                      </div>
                    </div>

                    {/* Nota clínica de resguardo */}
                    
                  </div>
                </DialogContent>
              </Dialog>

              <span className="text-slate-300">•</span>

              {/* Botón "Nota importante" estilo Voucher con Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-brand-primary transition-colors cursor-pointer"
                  >
                    <Info className="w-4 h-4" />
                    Nota importante
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="sr-only">
                      Nota importante
                    </DialogTitle>
                    <DialogDescription className="whitespace-pre-line text-sm text-slate-600 leading-relaxed pt-2 text-justify">
                      Importante: para realizar el drenaje linfático o los masajes durante el embarazo se requiere alta médica de su matrona o ginecólogo tratante.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Columna Derecha en Desktop: Imagen Grande / Carrusel */}
          <div className="lg:col-span-7 relative group order-2 lg:order-2 scroll-reveal-scale">
            <div
              ref={scrollRef}
              onMouseEnter={autoScroll.onMouseEnter}
              onMouseLeave={autoScroll.onMouseLeave}
              className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {items.map((item, idx) => (
                <div
                  key={`${item.imagenUrl}-${idx}`}
                  className="w-full shrink-0 snap-start snap-always relative flex justify-center"
                >
                  <div className="rounded-global overflow-hidden">
                    <Image
                      src={item.imagenUrl}
                      alt={item.alt}
                      width={item.ancho}
                      height={item.alto}
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="w-auto h-auto max-w-full max-h-[85vh] object-contain mx-auto"
                    />
                  </div>

                  {item.imagenSecundaria && (
                    <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 w-24 sm:w-32 md:w-40 rotate-3 rounded-global overflow-hidden border-4 border-white shadow-lg">
                      <Image
                        src={item.imagenSecundaria}
                        alt={item.alt}
                        width={item.anchoSecundaria ?? 200}
                        height={item.altoSecundaria ?? 200}
                        sizes="160px"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {items.length > 1 && (
              <>
                <button
                  onClick={() => scroll("left")}
                  className="absolute left-[-16px] xl:left-[-24px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:text-brand-primary hover:border-brand-primary/30 transition-all duration-300 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 active:scale-95"
                  aria-label="Anterior"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => scroll("right")}
                  className="absolute right-[-16px] xl:right-[-24px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:text-brand-primary hover:border-brand-primary/30 transition-all duration-300 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100 active:scale-95"
                  aria-label="Siguiente"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
