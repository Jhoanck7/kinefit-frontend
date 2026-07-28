import { ReactNode } from "react";
import { Card } from "./Card";

export interface FilaResumen {
  etiqueta: string;
  valor?: ReactNode;
  icono?: ReactNode;
}

/**
 * Panel de resumen persistente de los asistentes. Título único `RESUMEN`
 * en todo el panel (G-8, NF1-1, NF2-11) — nadie más decide su propio título.
 */
export function SummaryPanel({ filas, titulo = "RESUMEN" }: { filas: FilaResumen[]; titulo?: string }) {
  return (
    <Card className="sticky top-6 h-fit">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted mb-4">
        {titulo}
      </p>
      <dl className="divide-y divide-brand-border">
        {filas.map((fila) => (
          <div key={fila.etiqueta} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <dt className="text-sm text-brand-muted">{fila.etiqueta}</dt>
            <dd className="flex items-center gap-2 text-sm font-medium text-right text-panel-sidebar">
              {fila.icono}
              {fila.valor ?? <span className="italic text-brand-muted font-normal">Por definir</span>}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
