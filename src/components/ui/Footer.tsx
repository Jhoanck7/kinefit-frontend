"use client";

import React from 'react';
import Image from 'next/image';
import { CLINIC_INFO, NAV_LINKS } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200/80 pt-16 pb-12 w-full text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12 border-b border-slate-200/60">
          
          {/* Column 1: Brand & Description */}
          <div className="md:col-span-4 flex flex-col items-start gap-4">
            <div className="relative w-48 h-14 block">
              <Image
                src="/Kinefit Negro ver.png"
                alt="Kinefit Logo"
                fill
                priority
                className="object-contain object-left scale-110 origin-left"
                sizes="192px"
              />
            </div>
            <p className="text-sm leading-relaxed text-slate-500 mt-2">
              Centro especializado en kinesiología clínica avanzada, rehabilitación física y entrenamiento funcional a tu medida. Recupera tu bienestar y optimiza tu rendimiento de la mano de expertos.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="md:col-span-3 flex flex-col items-start gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">Enlaces rápidos</h4>
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm hover:text-brand-primary hover:translate-x-1 transition-all duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Column 3: Contact Details */}
          <div className="md:col-span-3 flex flex-col items-start gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">Contacto</h4>
            <span className="text-sm">{CLINIC_INFO.address}</span>
            <a href={`tel:${CLINIC_INFO.phoneRaw}`} className="text-sm hover:text-brand-primary transition-colors">
              {CLINIC_INFO.phone}
            </a>
            <a href={`mailto:${CLINIC_INFO.email}`} className="text-sm hover:text-brand-primary transition-colors">
              {CLINIC_INFO.email}
            </a>
          </div>

          {/* Column 4: Hours & Social */}
          <div className="md:col-span-2 flex flex-col items-start gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">Horarios</h4>
            <span className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">
              {CLINIC_INFO.hours.weekdaySummary}
              {"\n\n"}
              {CLINIC_INFO.hours.saturdaySummary}
            </span>
            
            {/* Social Icons */}
            <div className="flex gap-4 mt-3">
              {/* Instagram */}
              <a
                href={CLINIC_INFO.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-slate-200/50 hover:bg-brand-primary hover:text-white text-slate-600 transition-all duration-300"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href={CLINIC_INFO.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-slate-200/50 hover:bg-brand-primary hover:text-white text-slate-600 transition-all duration-300"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href={CLINIC_INFO.socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-slate-200/50 hover:bg-brand-primary hover:text-white text-slate-600 transition-all duration-300"
                aria-label="WhatsApp"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.504-5.714-1.466L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.811 1.452 5.518 0 10.006-4.486 10.01-10.007.002-2.675-1.034-5.191-2.917-7.078-1.884-1.886-4.397-2.923-7.08-2.924-5.524 0-10.014 4.489-10.018 10.01-.001 1.702.443 3.361 1.291 4.836l-.99 3.613 3.703-.972zm11.233-6.273c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.668.149-.198.297-.766.967-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
                </svg>
              </a>
            </div>

          </div>

        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <span>© {new Date().getFullYear()} {CLINIC_INFO.name}. Todos los derechos reservados.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-brand-primary transition-colors">Términos y condiciones</a>
            <a href="#" className="hover:text-brand-primary transition-colors">Política de privacidad</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
