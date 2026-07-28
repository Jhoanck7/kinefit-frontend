import { CitaResuelta } from "@/lib/panel/data/citas";
import { definicionEstado } from "@/lib/panel/domain/estados";
import { formatearRangoHorario } from "@/lib/panel/domain/formato";
import { CLASES_ROL_ESTADO } from "../primitives/StatusPill";
import { OriginBadge } from "../primitives/OriginBadge";

const BORDE_ACENTO: Record<string, string> = {
  "azul-seleccion": "border-l-blue-500",
  ambar: "border-l-amber-500",
  verde: "border-l-emerald-500",
  "azul-profundo": "border-l-indigo-700",
  rojo: "border-l-red-500",
  gris: "border-l-slate-500",
};

/** Tarjeta de cita de la rejilla (A.1, Parte A.5): ocupa una fila completa. */
export function AppointmentCard({ cita, onClick }: { cita: CitaResuelta; onClick: () => void }) {
  const definicion = definicionEstado(cita.estado);
  const clasesTexto = CLASES_ROL_ESTADO[definicion.colorRol].texto;
  const clasesFondo = CLASES_ROL_ESTADO[definicion.colorRol].fondo;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-full w-full flex-col justify-center gap-0.5 border-l-4 px-3 py-1 text-left transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-panel-sidebar ${BORDE_ACENTO[definicion.colorRol]} ${clasesFondo}`}
    >
      <span className="absolute right-2 top-1.5">
        <OriginBadge origen={cita.origen} />
      </span>
      <span className={`text-sm font-bold ${clasesTexto}`}>
        {cita.paciente.nombre} {cita.paciente.apellido}
      </span>
      <span className="text-xs text-brand-muted">
        {formatearRangoHorario(cita.horaInicio, cita.horaTermino)}
      </span>
      <span className={`text-[11px] font-bold uppercase tracking-wide ${clasesTexto}`}>
        {definicion.etiqueta}
      </span>
    </button>
  );
}
