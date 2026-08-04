"use client";

import { ReactNode, useState } from "react";

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
    <div className="rounded-2xl border border-brand-border overflow-hidden">
      <div className="flex items-center justify-between bg-panel-seleccion px-4 py-3">
        <button
          type="button"
          onClick={() => setAbierta((v) => !v)}
          aria-expanded={abierta}
          aria-controls={contenidoId}
          className="flex flex-1 items-center gap-2 text-left font-semibold text-panel-sidebar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar rounded"
        >
          <svg
            className={`h-4 w-4 shrink-0 transition-transform ${abierta ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <span>{titulo}</span>
          {contador && <span className="text-xs font-normal text-brand-muted">{contador}</span>}
        </button>
        {accion}
      </div>
      {abierta && (
        <div id={contenidoId} className="bg-white p-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}
