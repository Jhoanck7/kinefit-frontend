"use client";

import { useEffect, useRef, ReactNode } from "react";

const SELECTOR_FOCUSABLES =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal genérico con foco atrapado y devuelto al cerrar (G-14): se usa
 * tanto para el detalle de cita como para el de cancelación (DD-9).
 */
export function Modal({
  abierto,
  onCerrar,
  children,
  ancho = "max-w-3xl",
}: {
  abierto: boolean;
  onCerrar: () => void;
  children: ReactNode;
  ancho?: string;
}) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const disparadorRef = useRef<HTMLElement | null>(null);
  const onCerrarRef = useRef(onCerrar);

  useEffect(() => {
    onCerrarRef.current = onCerrar;
  }, [onCerrar]);

  useEffect(() => {
    if (!abierto) return;
    disparadorRef.current = document.activeElement as HTMLElement;
    
    // Esperar un frame para que los hijos se rendericen
    requestAnimationFrame(() => {
      const contenedor = contenedorRef.current;
      const focusables = contenedor?.querySelectorAll<HTMLElement>(SELECTOR_FOCUSABLES);
      focusables?.[0]?.focus();
    });

    function onKeyDown(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        onCerrarRef.current();
        return;
      }
      const contenedor = contenedorRef.current;
      const focusables = contenedor?.querySelectorAll<HTMLElement>(SELECTOR_FOCUSABLES);
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
  }, [abierto]);

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
        className={`relative bg-white rounded-2xl shadow-xl w-full ${ancho} max-h-[90vh] overflow-y-auto`}
      >
        {children}
      </div>
    </div>
  );
}
