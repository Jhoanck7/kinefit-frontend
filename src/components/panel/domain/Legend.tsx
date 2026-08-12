import { CATALOGO_ESTADOS, ORDEN_ESTADOS } from "@/lib/panel/domain/estados";
import { PuntoEstado } from "../primitives/StatusPill";

/**
 * Leyenda generada recorriendo el catálogo
 */
export function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-brand-border bg-white px-6 py-3 text-xs text-brand-muted">
      {ORDEN_ESTADOS.map((codigo) => {
        const definicion = CATALOGO_ESTADOS[codigo];
        return (
          <span key={codigo} className="inline-flex items-center gap-1.5">
            <PuntoEstado colorRol={definicion.colorRol} />
            {definicion.etiqueta}
          </span>
        );
      })}
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-700" aria-hidden />
        Bloqueado
      </span>
    </div>
  );
}
