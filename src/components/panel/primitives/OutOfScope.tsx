"use client";

import { ReactNode, useState } from "react";

/**
 * Componente de fuera de alcance (DD-7): donde una funcionalidad esté
 * deliberadamente excluida del prototipo, la vista lo dice en vez de
 * fallar en silencio o quedar inerte (G-11).
 */
export function OutOfScopeIconButton({ etiqueta, icono }: { etiqueta: string; icono: ReactNode }) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <span className="relative">
      <button
        type="button"
        onClick={() => setMostrar((v) => !v)}
        aria-label={`${etiqueta} — fuera de alcance en este prototipo`}
        className="flex h-9 w-9 items-center justify-center rounded-full text-brand-muted hover:bg-panel-fondo transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
      >
        {icono}
      </button>
      {mostrar && (
        <span
          role="status"
          className="absolute right-0 top-full z-20 mt-2 w-56 rounded-lg border border-brand-border bg-white p-3 text-xs text-brand-muted shadow-lg"
        >
          <strong className="text-panel-sidebar">{etiqueta}</strong> está fuera del alcance de este
          prototipo.
        </span>
      )}
    </span>
  );
}

export function OutOfScopeInlineLink({ etiqueta }: { etiqueta: string }) {
  const [mostrar, setMostrar] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setMostrar((v) => !v)}
        className="text-panel-sidebar underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar rounded"
      >
        {etiqueta}
      </button>
      {mostrar && (
        <span
          role="status"
          className="absolute left-0 top-full z-20 mt-2 w-64 rounded-lg border border-brand-border bg-white p-3 text-xs text-brand-muted shadow-lg"
        >
          Esta funcionalidad está fuera del alcance de este prototipo.
        </span>
      )}
    </span>
  );
}

export function OutOfScopeBlock({ titulo, descripcion }: { titulo: string; descripcion: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-brand-border p-8 text-center">
      <p className="text-sm font-semibold text-panel-sidebar">{titulo}</p>
      <p className="mt-1 text-sm text-brand-muted">{descripcion}</p>
      <p className="mt-3 text-xs text-brand-muted italic">Fuera del alcance de este prototipo.</p>
    </div>
  );
}
