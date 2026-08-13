"use client";

import { useEffect, useRef, ReactNode } from "react";

const SELECTOR_FOCUSABLES =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal genérico con estilo Soft SaaS (Stripe Style):
 * - Esquinas suavizadas de 6px (rounded-md)
 * - Sombra difusa suave (shadow-sm) y bordes definidos de 1px (border-slate-200)
 */
export function Modal({
  abierto,
  onCerrar,
  children,
  ancho = "max-w-3xl",
  className = "",
}: {
  abierto: boolean;
  onCerrar: () => void;
  children: ReactNode;
  ancho?: string;
  className?: string;
}) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const disparadorRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!abierto) return;
    disparadorRef.current = document.activeElement as HTMLElement;
    const contenedor = contenedorRef.current;
    const focusables = contenedor?.querySelectorAll<HTMLElement>(SELECTOR_FOCUSABLES);
    focusables?.[0]?.focus();

    function onKeyDown(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        onCerrar();
        return;
      }
      if (evento.key !== "Tab" || !focusables || focusables.length === 0) return;
      const primero = focusables[0];
      const ultimo = focusables[focusables.length - 1];
      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      disparadorRef.current?.focus();
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onCerrar}
        aria-hidden
      />
      <div
        ref={contenedorRef}
        role="dialog"
        aria-modal="true"
        className={`relative bg-white border border-slate-200 rounded-md shadow-sm w-full ${ancho} max-h-[90vh] overflow-y-auto ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
