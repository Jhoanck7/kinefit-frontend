"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

import { CAROUSEL_SLIDES } from "@/lib/constants";
import {
  GallerySlideItem,
  LandingConfigData,
  landingConfigService,
} from "@/lib/services/landingConfig.service";

interface SanityGalleryItem {
  title: string;
  description: string;
  imageUrl: string;
  features?: string[];
}

interface GallerySectionProps {
  initialSlides?: SanityGalleryItem[] | null;
}

export default function GallerySection({
  config,
}: {
  config: LandingConfigData;
}) {
  let slides = CAROUSEL_SLIDES;
  if (config.galleryJson) {
    try {
      const parsed = JSON.parse(config.galleryJson);
      if (Array.isArray(parsed) && parsed.length > 0) slides = parsed;
    } catch {}
  }

  const [current, setCurrent] = useState(0);

  const nextSlide = React.useCallback(() => {
    setCurrent(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = () => {
    setCurrent(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 4500);
    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

  return (
    <section
      id="instalaciones"
      className="py-0 bg-slate-50 text-slate-900 overflow-hidden w-full"
    >
      {/* Full-bleed Edge-to-Edge Carousel Container */}
      <div className="relative w-full group/carousel">
        <style>{`
          .gallery-track {
            --slide-width: 100vw;
          }
          @media (min-width: 1024px) {
            .gallery-track {
              --slide-width: 85vw;
            }
          }
        `}</style>

        {/* Carousel Track Container */}
        <div className="relative overflow-hidden w-full py-0">
          <div
            className="flex transition-transform duration-700 ease-out gallery-track"
            style={{
              transform: `translateX(calc(50vw - ${current} * var(--slide-width) - var(--slide-width) / 2))`,
            }}
          >
            {slides.map((slide, index) => {
              const isActive = index === current;
              const isPrev =
                index === (current - 1 + slides.length) % slides.length;
              const isNext = index === (current + 1) % slides.length;

              return (
                <div
                  key={`${slide.title}-${index}`}
                  onClick={() => {
                    if (isPrev) prevSlide();
                    if (isNext) nextSlide();
                  }}
                  className={`w-full lg:w-[85vw] shrink-0 px-0 lg:px-2 transition-all duration-700 ease-out select-none ${
                    isActive
                      ? "opacity-100 scale-100 z-20 cursor-default"
                      : "opacity-40 scale-[0.97] blur-[0.5px] z-10 cursor-pointer hover:opacity-60"
                  }`}
                >
                  {/* Card Container - Pure Full Bleed Image (rounded-none, 70vh/750px tall) */}
                  <div className="relative rounded-none overflow-hidden bg-slate-950 h-[520px] sm:h-[650px] lg:h-[750px] w-full border-y border-slate-800 lg:border-x">
                    {/* Full Size Image */}
                    <div className="relative w-full h-full">
                      <Image
                        src={
                          slide.image ||
                          "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1600&q=80"
                        }
                        alt={slide.title}
                        fill
                        priority={index === 0}
                        unoptimized
                        className="object-cover object-center filter brightness-95 transition-transform duration-700"
                        sizes="100vw"
                      />
                      {/* Subdued Gradient overlays for subtle text contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-transparent hidden md:block" />
                    </div>

                    {/* Minimal Overlay Content at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 md:p-16 z-20 text-white text-left transition-opacity duration-500">
                      <div
                        className={`transition-all duration-700 ${isActive ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
                      >
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 tracking-tight text-white uppercase">
                          {slide.title}
                        </h3>
                        <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed mb-6 max-w-3xl">
                          {slide.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        {slides.length > 1 && (
          <>
            {/* Bottom Indicators */}
            <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`h-1.5 transition-all duration-300 rounded-none ${
                    index === current
                      ? "bg-brand-primary w-12"
                      : "bg-white/40 w-4 hover:bg-white/70"
                  }`}
                  aria-label={`Ir a diapositiva ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
