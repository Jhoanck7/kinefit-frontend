import { CollapsibleSection } from "@/components/shared";
import { definicionEstado } from "@/lib/estados";
import { formatearFechaHora } from "@/lib/formato";
import { AuditoriaCitaResponse, CodigoEstadoCita } from "@/models/responses";

const ETIQUETA_ACTOR: Record<string, string> = {
  Sistema: "Sistema",
  Paciente: "Paciente",
  Personal: "Personal",
};

/** Traza de auditoría plegable al pie del detalle de cita */
export function AuditTrail({
  historial,
}: {
  historial: AuditoriaCitaResponse[];
}) {
  return (
    <CollapsibleSection titulo="Historial de la cita" abiertaPorDefecto={false}>
      <ol className="space-y-3">
        {historial.map(cambio => (
          <li
            key={cambio.id}
            className="flex items-start justify-between gap-3 text-sm"
          >
            <div>
              <p className="font-medium text-panel-sidebar">
                {
                  definicionEstado(cambio.estadoNuevo as CodigoEstadoCita)
                    .etiqueta
                }
              </p>
              <p className="text-xs text-brand-muted">
                {ETIQUETA_ACTOR[cambio.tipoActor] ?? cambio.tipoActor}
              </p>
              {cambio.motivo && (
                <p className="text-xs text-brand-muted italic">
                  {cambio.motivo}
                </p>
              )}
            </div>
            <span className="shrink-0 text-xs text-brand-muted">
              {formatearFechaHora(new Date(cambio.createdAt))}
            </span>
          </li>
        ))}
      </ol>
    </CollapsibleSection>
  );
}
