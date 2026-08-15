import { CambioEstadoResuelto } from "@/lib/panel/data/citas";
import { definicionEstado } from "@/lib/panel/domain/estados";
import { formatearFechaHora } from "@/lib/panel/domain/formato";

import { CollapsibleSection } from "../primitives/CollapsibleSection";

/** Traza de auditoría plegable al pie del detalle de cita */
export function AuditTrail({
  historial,
}: {
  historial: CambioEstadoResuelto[];
}) {
  return (
    <CollapsibleSection titulo="Historial de la cita" abiertaPorDefecto={false}>
      <ol className="space-y-3">
        {historial.map((cambio, indice) => (
          <li
            key={indice}
            className="flex items-start justify-between gap-3 text-sm"
          >
            <div>
              <p className="font-medium text-panel-sidebar">
                {definicionEstado(cambio.estado).etiqueta}
              </p>
              <p className="text-xs text-brand-muted">{cambio.responsable}</p>
              {cambio.motivo && (
                <p className="text-xs text-brand-muted italic">
                  {cambio.motivo}
                </p>
              )}
            </div>
            <span className="shrink-0 text-xs text-brand-muted">
              {formatearFechaHora(cambio.fecha)}
            </span>
          </li>
        ))}
      </ol>
    </CollapsibleSection>
  );
}
