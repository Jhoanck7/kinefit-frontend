"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/panel/primitives/Card";
import { HorarioEspecialista, listHorarios } from "@/lib/panel/data/horarios";
import { formatearRangoHorario } from "@/lib/panel/domain/formato";

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
    <div className="mx-auto max-w-4xl space-y-4 font-sans shadow-none">
      <div>
        <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900 mb-0.5">
          Horarios de atención por especialista
        </h2>
        <p className="font-sans text-xs text-slate-500">
          Plantilla semanal configurada para cada profesional de la clínica.
        </p>
      </div>

      {horarios.map(({ especialista, plantilla }) => (
        <Card
          key={especialista.id}
          className="rounded-none border-slate-200 shadow-none p-5"
        >
          <p className="mb-3 font-sans font-medium text-sm text-slate-900 border-b border-slate-200 pb-2">
            {especialista.nombre}{" "}
            <span className="font-normal text-slate-500">
              · {especialista.cargo}
            </span>
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-7 sm:gap-2">
            {DIAS.map(dia => {
              const rangos = plantilla.dias[dia.id];
              return (
                <div
                  key={dia.id}
                  className="border border-slate-200 bg-slate-50/50 p-2.5 text-center rounded-none"
                >
                  <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {dia.etiqueta}
                  </p>
                  {!rangos || rangos.length === 0 ? (
                    <p className="mt-1 font-sans text-xs text-slate-400 italic">
                      No atiende
                    </p>
                  ) : (
                    rangos.map((rango, i) => (
                      <p
                        key={i}
                        className="mt-1 font-sans font-medium text-xs text-slate-800"
                      >
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
