'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { NAV_LINKS } from '@/lib/constants';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  const navLinks = NAV_LINKS;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-white/95 backdrop-blur-md border-b border-brand-border shadow-sm py-2'
        : 'bg-transparent py-4'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24 md:h-28">
          
          {/* Logo container (Optimized for responsive sizing without scaling overflow) */}
          <div className="flex items-center">
            <a href="#" className="relative w-56 sm:w-72 md:w-80 h-16 sm:h-20 md:h-24 block">
              <Image
                src="/Kinefit Negro ver.png"
                alt="Kinefit Logo"
                fill
                priority
                sizes="(max-width: 640px) 224px, (max-width: 768px) 288px, 320px"
                className="object-contain object-left scale-[1.45] sm:scale-[1.35] origin-left -translate-y-1.5 sm:-translate-y-2" 
              />
            </a>
          </div>

          {/* Links (Desktop - Aligned to the right for balance) */}
          <div className="hidden md:flex items-center gap-x-8 ml-auto">
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

          {/* Mobile Toggle Button */}
          <div className="md:hidden flex items-center">
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

      {/* Mobile Drawer */}
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
          </div>
        </div>
      )}
    </nav>
  );
}