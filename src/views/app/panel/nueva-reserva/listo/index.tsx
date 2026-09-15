"use client";

import { Badge, Button } from "@/components/ui";
import { COLOR_ROL } from "@/lib/color-rol";
import { formatearFechaExtensa, formatearRangoHorario } from "@/lib/formato";

import { useReservaLista } from "./hooks";

export default function ListoView() {
  const {
    listo,
    fecha,
    hora,
    horaTermino,
    pacienteNombre,
    nombreServicio,
    etiquetaEstado,
    colorRolEstado,
    actions,
  } = useReservaLista();

  if (!listo || !fecha || !hora || !horaTermino) return <div aria-hidden />;

  const color = COLOR_ROL[colorRolEstado] ?? COLOR_ROL["azul-seleccion"];

  return (
    <div className="flex min-h-[65vh] items-center justify-center font-sans shadow-none">
      <div className="max-w-md w-full rounded-overlay border border-slate-200 bg-white p-8 text-center space-y-5">
        <h2 className="font-sans text-section-title font-bold text-foreground">
          Cita Registrada Correctamente
        </h2>

        <div className="rounded-overlay border border-slate-200 bg-slate-50/70 p-4 text-xs space-y-1.5">
          <p className="font-sans font-medium text-sm text-slate-900">
            {pacienteNombre}
          </p>
          <p className="font-sans text-slate-600">{nombreServicio}</p>
          <p className="font-sans text-slate-600">
            {formatearFechaExtensa(fecha)}
          </p>
          <p className="font-sans font-medium text-slate-900">
            {formatearRangoHorario(hora, horaTermino)}
          </p>
        </div>

        <div className="flex justify-center">
          <Badge
            className="rounded-overlay border-0 text-[11px] font-medium text-white"
            style={{ backgroundColor: color.fondoSolido }}
          >
            {etiquetaEstado}
          </Badge>
        </div>

        <p className="font-sans text-xs text-slate-500">
          La cita quedó en estado <strong>Por confirmar</strong> para su
          posterior ratificación desde la agenda.
        </p>

        <div className="pt-3 flex justify-center gap-3 border-t border-slate-200">
          <Button
            variant="outline"
            className="rounded-overlay"
            onClick={actions.handleRegistrarOtra}
          >
            Registrar Otra Cita
          </Button>
          <Button
            className="rounded-overlay"
            onClick={actions.handleIrALaAgenda}
          >
            Ir a la Agenda
          </Button>
        </div>
      </div>
    </div>
  );
}
