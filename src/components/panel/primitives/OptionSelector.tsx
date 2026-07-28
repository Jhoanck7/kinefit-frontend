import { ReactNode } from "react";

export interface OpcionSelector {
  id: string;
  titulo: string;
  icono?: ReactNode;
}

/**
 * Patrón de selección único en todo el panel (G-10, P2-1, NF2-8): fondo
 * azul tenue, borde azul profundo de 2 px, indicador de selección.
 */
export function OptionSelector({
  opciones,
  seleccionId,
  onSeleccionar,
  orientacion = "horizontal",
}: {
  opciones: OpcionSelector[];
  seleccionId: string | null;
  onSeleccionar: (id: string) => void;
  orientacion?: "horizontal" | "vertical";
}) {
  return (
    <div className={`grid gap-3 ${orientacion === "horizontal" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
      {opciones.map((opcion) => {
        const seleccionado = opcion.id === seleccionId;
        return (
          <button
            key={opcion.id}
            type="button"
            role="radio"
            aria-checked={seleccionado}
            onClick={() => onSeleccionar(opcion.id)}
            className={`flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-panel-sidebar ${
              seleccionado
                ? "border-panel-sidebar bg-panel-seleccion"
                : "border-brand-border bg-white hover:border-panel-sidebar/40"
            }`}
          >
            <span className="flex items-center gap-3">
              {opcion.icono}
              <span className="text-base font-medium text-panel-sidebar">{opcion.titulo}</span>
            </span>
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                seleccionado ? "border-panel-sidebar bg-panel-sidebar" : "border-brand-border"
              }`}
              aria-hidden
            >
              {seleccionado && (
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
