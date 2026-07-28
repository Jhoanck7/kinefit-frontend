"use client";

import { useRef } from "react";

/**
 * Zona de arrastre de archivos, visual únicamente (DD-10): sin carga real,
 * sin almacenamiento. Seleccionar un archivo solo añade su chip a la lista.
 */
export function FileDropzone({
  archivos,
  onAgregar,
  onQuitar,
}: {
  archivos: string[];
  onAgregar: (nombre: string) => void;
  onQuitar: (nombre: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-border py-8 text-center transition-colors hover:border-panel-sidebar/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
      >
        <svg className="h-8 w-8 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
        </svg>
        <span className="text-sm text-brand-muted">Arrastra archivos o haz clic para adjuntar</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const archivo = e.target.files?.[0];
          if (archivo) onAgregar(archivo.name);
          e.target.value = "";
        }}
      />
      {archivos.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {archivos.map((nombre) => (
            <li
              key={nombre}
              className="inline-flex items-center gap-2 rounded-lg border border-brand-border bg-white px-3 py-1.5 text-sm text-panel-sidebar"
            >
              <svg className="h-4 w-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6" />
              </svg>
              {nombre}
              <button
                type="button"
                onClick={() => onQuitar(nombre)}
                aria-label={`Quitar ${nombre}`}
                className="text-brand-muted hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar rounded"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
