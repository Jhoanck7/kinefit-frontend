import { formatearRangoHorario } from "@/lib/panel/domain/formato";

export type EstadoBloque = "libre" | "ocupado" | "bloqueado";

export interface BloqueConId {
  id: number;
  inicio: string;
  termino: string;
  estado: EstadoBloque;
  motivo?: string;
}

interface BloquesSelectorProps {
  bloques: BloqueConId[];
  todosBloques: BloqueConId[];
  bloquesRequeridos: number;
  horaSeleccionada: string | null;
  onSeleccionar: (bloque: BloqueConId) => void;
}

export function BloquesSelector({
  bloques,
  todosBloques,
  bloquesRequeridos,
  horaSeleccionada,
  onSeleccionar,
}: BloquesSelectorProps) {
  if (bloques.length === 0) {
    return (
      <p className="font-sans text-xs text-slate-400">
        Sin bloques en este tramo.
      </p>
    );
  }

  function tieneBloquesConsecutivosDisponibles(idxInicio: number): boolean {
    if (idxInicio + bloquesRequeridos > todosBloques.length) return false;
    for (let offset = 0; offset < bloquesRequeridos; offset++) {
      if (todosBloques[idxInicio + offset].estado !== "libre") {
        return false;
      }
    }
    return true;
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {bloques.map(bloque => {
        const idxEnTodos = todosBloques.findIndex(b => b.id === bloque.id);
        const tieneSuficienteTiempo =
          idxEnTodos !== -1
            ? tieneBloquesConsecutivosDisponibles(idxEnTodos)
            : true;
        const seleccionado = bloque.inicio === horaSeleccionada;
        const noDisponible =
          bloque.estado !== "libre" || !tieneSuficienteTiempo;

        return (
          <button
            key={bloque.id}
            type="button"
            disabled={noDisponible}
            onClick={() => onSeleccionar(bloque)}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-none border px-2 py-2 text-xs font-sans transition-colors ${
              seleccionado
                ? "border-primary bg-primary text-primary-foreground font-bold"
                : noDisponible
                  ? "border-slate-200 text-slate-300 bg-slate-50 line-through cursor-not-allowed"
                  : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-1">
              <span>
                {formatearRangoHorario(bloque.inicio, bloque.termino)}
              </span>
              {seleccionado && <span className="text-[10px] font-bold">✓</span>}
            </div>
            {bloquesRequeridos > 1 && !noDisponible && (
              <span className="text-[10px] opacity-75 font-normal">
                ({bloquesRequeridos} bloques)
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
