import { ReactNode } from "react";

export interface OpcionSelector {
  id: string;
  titulo: string;
  icono?: ReactNode;
}

/**
 * Patrón de selección de opciones con estilo Frameless Satoshi
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
    <div
      className={`grid gap-2.5 font-sans ${orientacion === "horizontal" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}
    >
      {opciones.map(opcion => {
        const seleccionado = opcion.id === seleccionId;
        return (
          <button
            key={opcion.id}
            type="button"
            role="radio"
            aria-checked={seleccionado}
            onClick={() => onSeleccionar(opcion.id)}
            className={`flex items-center justify-between gap-3 rounded-none border p-3 text-left transition-colors font-sans shadow-none focus-visible:outline-none ${
              seleccionado
                ? "border-[#003366] bg-blue-50/80 text-blue-950"
                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-900"
            }`}
          >
            <span className="flex items-center gap-2.5">
              {opcion.icono}
              <span className="text-xs font-semibold uppercase tracking-wider">
                {opcion.titulo}
              </span>
            </span>
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-none border ${
                seleccionado
                  ? "border-[#003366] bg-[#003366] text-white"
                  : "border-slate-300 bg-white"
              }`}
              aria-hidden
            >
              {seleccionado && <span className="text-[10px] font-bold">✓</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
