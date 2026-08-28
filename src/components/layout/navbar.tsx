"use client";

import Image from "next/image";
import React, { useState } from "react";

import { AdminPanelButton } from "@/components/shared";
import { NAV_LINKS } from "@/lib/utils";
import { LandingConfigResponse } from "@/models/responses";

function tieneVouchers(config?: LandingConfigResponse | null) {
  if (!config?.vouchersJson) return false;
  try {
    const parsed = JSON.parse(config.vouchersJson);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

export default function Navbar({
  config,
}: {
  config?: LandingConfigResponse | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = tieneVouchers(config)
    ? NAV_LINKS
    : NAV_LINKS.filter(link => link.href !== "#vouchers");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 py-2">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo container */}
          <div className="flex items-center">
            <a
              href="#"
              className="relative w-40 sm:w-48 md:w-52 h-14 sm:h-16 block"
            >
              <Image
                src="/Kinefit Negro ver.png"
                alt="Kinefit Logo"
                fill
                priority
                sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 208px"
                className="object-contain object-left scale-[1.3] sm:scale-[1.25] origin-left"
              />
            </a>
          </div>

          {/* Links (Desktop) */}
          <div className="hidden md:flex items-center gap-x-8 ml-auto">
            {navLinks.map(link => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-bold text-slate-700 hover:text-brand-primary py-2 border-b-2 border-transparent hover:border-brand-primary transition-colors uppercase tracking-wider"
              >
                {link.name}
              </a>
            ))}
            <AdminPanelButton />
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
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-b border-slate-300 py-4 px-6">
          <div className="flex flex-col gap-3">
            {navLinks.map(link => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-bold text-slate-800 hover:text-brand-primary py-2 border-b border-slate-100 transition-colors uppercase tracking-wider"
              >
                {link.name}
              </a>
            ))}
            <AdminPanelButton variant="drawer" />
          </div>
        </div>
      )}
    </nav>
  );
}
