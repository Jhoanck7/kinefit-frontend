"use client";

import { Info } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";

import { Alerta } from "@/components/shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmbarazadaItem, LandingConfigResponse } from "@/models/responses";

/** Sección con carrusel de imágenes y detalles del servicio de masoterapia para embarazadas */
export default function EmbarazadasSection({
  config,
}: {
  config: LandingConfigResponse;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activo, setActivo] = useState(0);

  let items: EmbarazadaItem[] = [];
  if (config.embarazadasJson) {
    try {
      const parsed = JSON.parse(config.embarazadasJson);
      if (Array.isArray(parsed)) items = parsed;
    } catch {}
  }

  const estaApilado = () => {
    const el = scrollRef.current;
    return Boolean(el && el.scrollWidth <= el.clientWidth);
  };

  const cambiarActivo = (paso: number) => {
    setActivo(i => (i + paso + items.length) % items.length);
  };

  if (items.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (estaApilado()) {
      cambiarActivo(direction === "left" ? -1 : 1);
      return;
    }
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
          
          <div className="lg:hidden text-left order-1 scroll-reveal">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-3">
              Masoterapia para embarazadas
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {config.embarazadasTitle || "Referentes en masajes para embarazadas"}
            </p>
          </div>

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

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="text-brand-primary hover:text-brand-primary-hover font-bold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Leer más
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-10">
                  <DialogHeader className="text-left">
                    <DialogTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                      Masoterapia para Embarazadas
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                      Detalles completos de los masajes y drenaje linfático para
                      embarazadas en KineFit Chile.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="mt-2 divide-y divide-slate-200 text-left">
                    <section className="pb-7">
                      <h3 className="text-base font-bold text-slate-900 mb-3">
                        Masaje para embarazadas
                      </h3>
                      <p className="text-slate-600 text-sm sm:text-base leading-relaxed text-justify hyphens-auto">
                        En KineFit Chile somos referentes en masajes para
                        embarazadas, contamos con implementación especializada,
                        nueva, segura y de alta calidad, diseñada para entregar
                        comodidad durante la gestación y permitirte volver a
                        disfrutar, por un momento, de la sensación de descansar
                        boca abajo.
                      </p>
                    </section>

                    <section className="py-7">
                      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-3">
                        <h3 className="text-base font-bold text-slate-900">
                          Drenaje linfático para piernas cansadas
                        </h3>
                        <span className="text-xs font-semibold text-slate-500">
                          30 minutos
                        </span>
                      </div>
                      <div className="space-y-3 text-slate-600 text-sm sm:text-base leading-relaxed text-justify hyphens-auto">
                        <p>
                          También contamos con drenaje linfático especializado
                          para piernas cansadas durante el embarazo, un
                          tratamiento suave y seguro pensado para aliviar la
                          sensación de pesadez, hinchazón y fatiga.
                        </p>
                        <p>
                          Mediante delicadas maniobras de drenaje linfático
                          manual, favorecemos el retorno linfático y ayudamos a
                          disminuir la sensación de retención de líquidos,
                          proporcionando descanso, alivio y bienestar. Una
                          experiencia de 30 minutos dedicada a cuidar de ti y
                          acompañarte en esta hermosa etapa.
                        </p>
                      </div>
                    </section>

                    <div className="pt-7">
                      <Alerta tono="info" className="text-justify hyphens-auto">
                        Nuestras profesionales están capacitadas para
                        acompañarte en esta etapa, además, es una experiencia
                        ideal para regalar a tu pareja, amiga o futura mamá,
                        permitiéndole desconectarse, relajarse y vivir la
                        experiencia KineFit Chile.
                      </Alerta>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

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

          <div className="lg:col-span-7 relative group order-2 lg:order-2 scroll-reveal-scale">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none lg:grid lg:overflow-hidden lg:snap-none"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {items.map((item, idx) => (
                <div
                  key={`${item.imagenUrl}-${idx}`}
                  className={`w-full shrink-0 snap-start snap-always relative flex justify-center lg:col-start-1 lg:row-start-1 lg:transition-opacity lg:duration-1000 lg:ease-in-out ${
                    idx === activo
                      ? "lg:opacity-100 lg:z-10"
                      : "lg:opacity-0 lg:z-0 lg:pointer-events-none"
                  }`}
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
