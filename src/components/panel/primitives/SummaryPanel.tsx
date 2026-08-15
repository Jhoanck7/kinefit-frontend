import { ReactNode } from "react";

import { Card } from "./Card";

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
  titulo = "RESUMEN",
}: {
  filas: FilaResumen[];
  titulo?: string;
}) {
  return (
    <Card className="sticky top-6 h-fit rounded-none border-slate-200 shadow-none font-sans p-5 bg-white">
      <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-1 mb-3">
        {titulo}
      </p>
      <dl className="divide-y divide-slate-200">
        {filas.map(fila => (
          <div
            key={fila.etiqueta}
            className="flex flex-col gap-0.5 py-2.5 first:pt-0 last:pb-0"
          >
            <dt className="font-sans text-[11px] font-medium uppercase tracking-wider text-slate-400">
              {fila.etiqueta}
            </dt>
            <dd className="flex items-center gap-2 font-sans font-medium text-sm text-slate-900">
              {fila.icono}
              {fila.valor ?? (
                <span className="italic text-slate-400 font-normal text-xs">
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
