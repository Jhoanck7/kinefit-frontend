import { COLOR_ROL } from "@/lib/color-rol";
import { definicionEstado } from "@/lib/estados";
import { formatearRangoHorario } from "@/lib/formato";
import { CitaEnAgendaResponse, CodigoEstadoCita } from "@/models/responses";

export function AppointmentCard({
  cita,
  horaInicio,
  horaTermino,
  onClick,
}: {
  cita: CitaEnAgendaResponse;
  horaInicio: string;
  horaTermino: string;
  onClick: () => void;
}) {
  const definicion = definicionEstado(cita.estado as CodigoEstadoCita);
  const color = COLOR_ROL[definicion.colorRol] ?? COLOR_ROL["azul-seleccion"];
  const origen = cita.origen;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col gap-1 rounded-overlay border border-slate-200 bg-white px-3.5 py-3 text-left text-slate-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-blue-900 font-sans"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11.5px] font-semibold text-muted-foreground">
          {formatearRangoHorario(horaInicio, horaTermino)}
        </span>
        <span
          className="rounded-overlay px-1.5 py-0.5 font-sans text-[10.5px] font-bold text-white"
          style={{ backgroundColor: color.fondoSolido }}
        >
          {definicion.etiqueta}
        </span>
      </div>

      <span className="truncate font-sans text-[13.5px] font-bold leading-tight">
        {cita.paciente
          ? `${cita.paciente.nombre} ${cita.paciente.apellido}`
          : "—"}
      </span>

      <span className="truncate font-sans text-xs font-medium text-muted-foreground">
        {cita.servicio}, {origen}
      </span>
    </button>
  );
}
