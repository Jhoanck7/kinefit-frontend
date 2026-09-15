import { ReactNode } from "react";

import { Card } from "@/components/ui";

export interface FilaResumen {
  etiqueta: string;
  valor?: ReactNode;
  icono?: ReactNode;
}

/**
 * Panel de resumen persistente con estilo Frameless Satoshi:
 * - Etiquetas micro-técnicas unificadas
 * - Valores en Satoshi regular
 */
export function SummaryPanel({
  filas,
  titulo = "Resumen",
}: {
  filas: FilaResumen[];
  titulo?: string;
}) {
  return (
    <Card className="sticky top-6 h-fit rounded-none border-border shadow-none font-sans p-5 bg-white">
      <p className="font-sans text-micro-header font-medium text-muted-foreground border-b border-border pb-1 mb-3">
        {titulo}
      </p>
      <dl className="divide-y divide-border">
        {filas.map(fila => (
          <div
            key={fila.etiqueta}
            className="flex flex-col gap-0.5 py-2.5 first:pt-0 last:pb-0"
          >
            <dt className="font-sans text-label font-medium text-muted-foreground">
              {fila.etiqueta}
            </dt>
            <dd className="flex items-center gap-2 font-sans font-medium text-value text-foreground">
              {fila.icono}
              {fila.valor ?? (
                <span className="italic text-muted-foreground font-normal text-xs">
                  Por definir
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
