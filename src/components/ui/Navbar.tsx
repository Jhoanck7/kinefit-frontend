'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { NAV_LINKS } from '@/lib/constants';
import { useBookingStore } from '@/lib/store/useBookingStore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { backendConnected, checkBackendConnection } = useBookingStore();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Verificar conexión al cargar y cada 10 segundos
  useEffect(() => {
    checkBackendConnection();
    const interval = setInterval(checkBackendConnection, 10000);
    return () => clearInterval(interval);
  }, [checkBackendConnection]);

  const navLinks = NAV_LINKS;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-white/90 backdrop-blur-md border-b border-brand-border shadow-sm py-3'
        : 'bg-transparent py-5'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-1">
          
          {/* Logo container */}
          <div className="flex items-center">
            <a href="#" className="relative w-52 sm:w-64 h-16 md:h-20 block group">
              <Image
                src="/Kinefit Negro ver.png"
                alt="Kinefit Logo"
                fill
                priority
                sizes="(max-width: 640px) 208px, 256px"
                className="object-contain object-left scale-200 sm:scale-180 origin-left" 
              />
            </a>
          </div>

          {/* Center Links (Desktop) */}
          <div className="hidden md:flex items-center gap-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-brand-primary relative py-2 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-primary after:transition-all hover:after:w-full transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-200/50 rounded-full px-3 py-1.5 shadow-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${
                backendConnected === true 
                  ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
                  : backendConnected === false 
                  ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse' 
                  : 'bg-slate-300'
              }`} />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                {backendConnected === true 
                  ? 'API Online' 
                  : backendConnected === false 
                  ? 'API Offline' 
                  : 'Comprobando...'}
              </span>
            </div> */}

            {/* <a
              href="#booking"
              className="rounded-full bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2.5 text-sm font-semibold shadow-md shadow-brand-primary/20 hover:shadow-brand-primary/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Iniciar sesión 
            </a> */}
          </div>

          {/* Mobile Menu & Connectivity Status */}
          <div className="md:hidden flex items-center gap-3">
            {/* Mobile Status Dot */}
            <div className={`w-3 h-3 rounded-full ${
              backendConnected === true 
                ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
                : backendConnected === false 
                ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse' 
                : 'bg-slate-300'
            }`} title={backendConnected === true ? "API Online" : backendConnected === false ? "API Offline" : "Comprobando..."} />

            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menú principal</span>
              {isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (if open) */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-brand-border py-4 px-6 animate-fade-in shadow-lg">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-semibold text-slate-700 hover:text-brand-primary transition-colors py-1"
              >
                {link.name}
              </a>
            ))}
            <hr className="border-slate-100" />
            <a
              href="#booking"
              onClick={() => setIsOpen(false)}
              className="text-center rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white py-3 text-sm font-bold shadow-md shadow-brand-primary/10 transition-colors block"
            >
              Iniciar sesión
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}