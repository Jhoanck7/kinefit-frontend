"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CAROUSEL_SLIDES } from '@/lib/constants';

interface SanityGalleryItem {
  title: string;
  description: string;
  imageUrl: string;
  features?: string[];
}

interface GallerySectionProps {
  initialSlides?: SanityGalleryItem[] | null;
}

export default function GallerySection({ initialSlides }: GallerySectionProps) {
  const [current, setCurrent] = useState(0);

  const displaySlides = initialSlides && initialSlides.length > 0
    ? initialSlides.map(s => ({
        title: s.title,
        description: s.description,
        image: s.imageUrl,
        features: s.features || []
      }))
    : CAROUSEL_SLIDES;

  const nextSlide = React.useCallback(() => {
    setCurrent((prev) => (prev === displaySlides.length - 1 ? 0 : prev + 1));
  }, [displaySlides.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? displaySlides.length - 1 : prev - 1));
  };

  // Auto-slide de 4.5 segundos constante para dar más tiempo de lectura
  useEffect(() => {
    const timer = setInterval(nextSlide, 4500);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section 
      id="instalaciones" 
      className="py-24 bg-slate-50 border-b border-slate-200/60 text-slate-900 overflow-hidden w-full"
    >
      {/* Header (Centrado) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-3">
            Nuestros Espacios
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Instalaciones y Servicios de Primer Nivel
          </p>
          <p className="text-slate-500 mt-4 text-base sm:text-lg">
            Explora nuestra clínica diseñada con altos estándares para asegurar una rehabilitación integral y un entrenamiento óptimo, con equipamiento nuevo, duradero y confortable.
          </p>
        </div>
      </div>

      {/* Full-width Carousel Container */}
      <div className="relative w-full group/carousel">
        <style>{`
          .gallery-track {
            --slide-width: 80vw;
          }
          @media (min-width: 1024px) {
            .gallery-track {
              --slide-width: 62vw;
            }
          }
        `}</style>
        
        {/* Carousel Track Container */}
        <div className="relative overflow-hidden w-full py-4">
          <div 
            className="flex transition-transform duration-700 ease-out gallery-track"
            style={{ 
              transform: `translateX(calc(50vw - ${current} * var(--slide-width) - var(--slide-width) / 2))` 
            }}
          >
            {displaySlides.map((slide, index) => {
              const isActive = index === current;
              const isPrev = index === (current - 1 + displaySlides.length) % displaySlides.length;
              const isNext = index === (current + 1) % displaySlides.length;

              return (
                <div
                  key={slide.title}
                  onClick={() => {
                    if (isPrev) prevSlide();
                    if (isNext) nextSlide();
                  }}
                  className={`w-[80vw] lg:w-[62vw] shrink-0 px-4 transition-all duration-700 ease-out select-none ${
                    isActive 
                      ? "opacity-100 scale-100 z-20 cursor-default" 
                      : "opacity-40 scale-[0.92] blur-[0.5px] z-10 cursor-pointer hover:opacity-60"
                  }`}
                >
                  {/* Card Container */}
                  <div className="relative rounded-3xl overflow-hidden shadow-xl bg-slate-900 aspect-[16/10] md:aspect-[21/9] w-full">
                    {/* Image */}
                    <div className="relative w-full h-full">
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        priority={index === 0}
                        className="object-cover object-center filter brightness-90 transition-transform duration-700"
                        sizes="(max-width: 1024px) 80vw, 62vw"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10 z-20 text-white text-left transition-opacity duration-500">
                      <div className={`transition-all duration-700 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 tracking-tight">
                          {slide.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed mb-4 max-w-2xl">
                          {slide.description}
                        </p>
                        
                        {/* Features Tags */}
                        <div className="flex flex-wrap gap-2">
                          {slide.features.map((feature) => (
                            <span
                              key={feature}
                              className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 lg:left-12 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/80 border border-slate-200 hover:bg-brand-primary text-slate-700 hover:text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-300"
          aria-label="Diapositiva anterior"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/80 border border-slate-200 hover:bg-brand-primary text-slate-700 hover:text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-300"
          aria-label="Siguiente diapositiva"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        {/* Bottom Dot Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {displaySlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === current
                  ? "bg-brand-primary w-6"
                  : "bg-slate-300 hover:bg-slate-400"
              }`}
              aria-label={`Ir a diapositiva ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
