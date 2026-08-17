"use client";

import { ReactNode, useState } from "react";

/**
 * Sección plegable con estilo Frameless Satoshi. El Accordion de shadcn no
 * soporta limpiamente una acción extra en el header (prop `accion`) fuera
 * del trigger, así que se mantiene como componente propio.
 */
export function CollapsibleSection({
  titulo,
  contador,
  children,
  abiertaPorDefecto = true,
  accion,
}: {
  titulo: string;
  contador?: string;
  children: ReactNode;
  abiertaPorDefecto?: boolean;
  accion?: ReactNode;
}) {
  const [abierta, setAbierta] = useState(abiertaPorDefecto);
  const contenidoId = `seccion-${titulo.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="rounded-none border border-slate-200 overflow-hidden font-sans shadow-none">
      <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setAbierta(v => !v)}
          aria-expanded={abierta}
          aria-controls={contenidoId}
          className="flex flex-1 items-center gap-2 text-left font-sans text-xs font-bold uppercase tracking-wider text-slate-800 focus-visible:outline-none"
        >
          <svg
            className={`h-3.5 w-3.5 shrink-0 transition-transform ${abierta ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
          <span>{titulo}</span>
          {contador && (
            <span className="font-sans text-[11px] font-normal text-slate-500">
              ({contador})
            </span>
          )}
        </button>
        {accion}
      </div>
      {abierta && (
        <div id={contenidoId} className="bg-white p-4 space-y-4 font-sans">
          {children}
        </div>
      )}
    </div>
  );
}
