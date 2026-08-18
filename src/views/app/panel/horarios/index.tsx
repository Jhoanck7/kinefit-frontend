"use client";

import { Card } from "@/components/ui";
import { useGetPlantillaHorario } from "@/hooks/api";
import { formatearRangoHorario } from "@/lib/formato";
import { EspecialistaResponse } from "@/models/responses";

import { useHorarios } from "./hooks";

const DIAS: { id: number; etiqueta: string }[] = [
  { id: 1, etiqueta: "Lunes" },
  { id: 2, etiqueta: "Martes" },
  { id: 3, etiqueta: "Miércoles" },
  { id: 4, etiqueta: "Jueves" },
  { id: 5, etiqueta: "Viernes" },
  { id: 6, etiqueta: "Sábado" },
  { id: 0, etiqueta: "Domingo" },
];

function EspecialistaPlantillaCard({
  especialista,
}: {
  especialista: EspecialistaResponse;
}) {
  const { data: plantilla = [], isLoading } = useGetPlantillaHorario(
    especialista.id
  );

  return (
    <Card className="rounded-none border-slate-200 shadow-none p-5">
      <p className="mb-3 font-sans font-medium text-sm text-slate-900 border-b border-slate-200 pb-2">
        {especialista.nombre}{" "}
        <span className="font-normal text-slate-500">
          · {especialista.cargo}
        </span>
      </p>
      {isLoading ? (
        <p className="font-sans text-xs text-slate-400">
          Cargando plantilla horaria...
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-7 sm:gap-2">
          {DIAS.map(dia => {
            const bloquesDia = plantilla.filter(b => b.diaSemana === dia.id);

            return (
              <div
                key={dia.id}
                className="border border-slate-200 bg-slate-50/50 p-2.5 text-center rounded-none"
              >
                <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {dia.etiqueta}
                </p>
                {bloquesDia.length === 0 ? (
                  <p className="mt-1 font-sans text-xs text-slate-400 italic">
                    No atiende
                  </p>
                ) : (
                  bloquesDia.map((rango, i) => (
                    <p
                      key={i}
                      className="mt-1 font-sans font-medium text-xs text-slate-800"
                    >
                      {formatearRangoHorario(
                        rango.horaInicio.substring(0, 5),
                        rango.horaFin.substring(0, 5)
                      )}
                    </p>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default function HorariosView() {
  const { especialistas, isLoading } = useHorarios();

  if (isLoading) {
    return (
      <div className="p-4 text-xs font-sans text-slate-500">
        Cargando plantilla de horarios...
      </div>
    );
  }

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

      {especialistas.length === 0 ? (
        <p className="font-sans text-xs text-slate-400">
          No hay especialistas registrados.
        </p>
      ) : (
        especialistas.map(especialista => (
          <EspecialistaPlantillaCard
            key={especialista.id}
            especialista={especialista}
          />
        ))
      )}
    </div>
  );
}
