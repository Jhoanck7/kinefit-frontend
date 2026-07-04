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

  // Auto-slide de 3.5 segundos constante
  useEffect(() => {
    const timer = setInterval(nextSlide, 3500);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section 
      id="instalaciones" 
      className="py-20 bg-slate-50 border-y border-slate-200/60"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-3">
            Nuestros Espacios
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Instalaciones y Servicios de Primer Nivel
          </p>
          <p className="text-slate-500 mt-4 text-base sm:text-lg">
            Explora nuestra clínica diseñada con altos estándares para asegurar una rehabilitación integral y un entrenamiento óptimo, con equipamiento nuevo, duradero y confortable, ideal para personas en rehabilitación o deportistas de alto nivel.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 aspect-[16/10] md:aspect-[21/9] w-full group/carousel">
          
          {/* Slides */}
          {displaySlides.map((slide, index) => (
            <div
              key={slide.title}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === current ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {/* Image */}
              <div className="relative w-full h-full">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="object-cover object-center filter brightness-90 group-hover/carousel:scale-105 transition-transform duration-10000 ease-linear"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              </div>

              {/* Slide Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 md:p-12 z-20 text-white flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div className="max-w-2xl text-left">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 tracking-tight">
                    {slide.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed mb-4">
                    {slide.description}
                  </p>
                  
                  {/* Features Tag Grid */}
                  <div className="flex flex-wrap gap-2">
                    {slide.features.map((feature) => (
                      <span
                        key={feature}
                        className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 text-xs font-semibold"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                
              </div>
            </div>
          ))}

          {/* Left Arrow Button */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/40 border border-white/10 hover:bg-brand-primary text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 hover:scale-110 active:scale-95 transition-all duration-300"
            aria-label="Diapositiva anterior"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/40 border border-white/10 hover:bg-brand-primary text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 hover:scale-110 active:scale-95 transition-all duration-300"
            aria-label="Siguiente diapositiva"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Bottom Dot Navigation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2.5 bg-black/30 px-4 py-2 rounded-full backdrop-blur-xs">
            {displaySlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === current
                    ? "bg-brand-primary w-6"
                    : "bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Ir a diapositiva ${index + 1}`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
