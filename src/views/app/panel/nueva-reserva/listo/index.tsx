"use client";

import { Button } from "@/components/ui";
import {
  formatearFechaExtensa,
  formatearRangoHorario,
} from "@/lib/panel/domain/formato";

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
    actions,
  } = useReservaLista();

  if (!listo || !fecha || !hora || !horaTermino) return <div aria-hidden />;

  return (
    <div className="flex min-h-[65vh] items-center justify-center font-sans shadow-none">
      <div className="max-w-md w-full border border-slate-200 bg-white p-8 text-center space-y-5 rounded-none">
        <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
          Cita Registrada Correctamente
        </h2>

        <div className="border border-slate-200 bg-slate-50/70 p-4 text-xs space-y-1.5 rounded-none">
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

        <div className="flex items-center justify-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-600" aria-hidden />
          <span className="font-sans text-xs font-bold uppercase tracking-wider text-blue-700">
            {etiquetaEstado}
          </span>
        </div>

        <p className="font-sans text-xs text-slate-500">
          La cita quedó en estado <strong>Por confirmar</strong> para su
          posterior ratificación desde la agenda.
        </p>

        <div className="pt-3 flex justify-center gap-3 border-t border-slate-200">
          <Button variant="outline" onClick={actions.handleRegistrarOtra}>
            Registrar otra cita
          </Button>
          <Button onClick={actions.handleIrALaAgenda}>Ir a la agenda</Button>
        </div>
      </div>
    </div>
  );
}
