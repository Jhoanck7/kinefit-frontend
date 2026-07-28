"use client";

import { useEffect, useState } from "react";
import { listHorarios, HorarioEspecialista } from "@/lib/panel/data/horarios";
import { formatearRangoHorario } from "@/lib/panel/domain/formato";
import { Card } from "@/components/panel/primitives/Card";

const DIAS: { id: 0 | 1 | 2 | 3 | 4 | 5 | 6; etiqueta: string }[] = [
  { id: 1, etiqueta: "Lunes" },
  { id: 2, etiqueta: "Martes" },
  { id: 3, etiqueta: "Miércoles" },
  { id: 4, etiqueta: "Jueves" },
  { id: 5, etiqueta: "Viernes" },
  { id: 6, etiqueta: "Sábado" },
  { id: 0, etiqueta: "Domingo" },
];

export default function HorariosPage() {
  const [horarios, setHorarios] = useState<HorarioEspecialista[] | null>(null);

  useEffect(() => {
    listHorarios().then(setHorarios);
  }, []);

  if (horarios === null) return <div aria-hidden />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="mb-1 text-lg font-bold text-panel-sidebar">Horarios de atención por especialista</h2>
        <p className="text-sm text-brand-muted">
          Plantilla semanal de cada especialista, dentro del horario de atención del centro.
        </p>
      </div>

      {horarios.map(({ especialista, plantilla }) => (
        <Card key={especialista.id}>
          <p className="mb-4 font-bold text-panel-sidebar">
            {especialista.nombre} <span className="font-normal text-brand-muted">· {especialista.cargo}</span>
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-7 sm:gap-3">
            {DIAS.map((dia) => {
              const rangos = plantilla.dias[dia.id];
              return (
                <div key={dia.id} className="rounded-lg border border-brand-border p-3 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">{dia.etiqueta}</p>
                  {!rangos || rangos.length === 0 ? (
                    <p className="mt-1 text-xs text-brand-muted">No atiende</p>
                  ) : (
                    rangos.map((rango, i) => (
                      <p key={i} className="mt-1 text-xs text-panel-sidebar">
                        {formatearRangoHorario(rango.inicio, rango.termino)}
                      </p>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
