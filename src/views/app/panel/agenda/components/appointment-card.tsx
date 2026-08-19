import { definicionEstado } from "@/lib/estados";
import { formatearRangoHorario } from "@/lib/formato";
import { CitaEnAgendaResponse, CodigoEstadoCita } from "@/models/responses";

const FONDO_ESTADO: Record<string, string> = {
  "azul-seleccion": "bg-blue-50/90 hover:bg-blue-100/90",
  ambar: "bg-amber-50/90 hover:bg-amber-100/90",
  verde: "bg-emerald-50/90 hover:bg-emerald-100/90",
  "azul-profundo": "bg-indigo-50/90 hover:bg-indigo-100/90",
  rojo: "bg-rose-50/90 hover:bg-rose-100/90",
  gris: "bg-slate-100/90 hover:bg-slate-200/90",
};

const DOT_ESTADO: Record<string, string> = {
  "azul-seleccion": "bg-blue-900",
  ambar: "bg-amber-600",
  verde: "bg-emerald-700",
  "azul-profundo": "bg-indigo-900",
  rojo: "bg-rose-700",
  gris: "bg-slate-500",
};

export function AppointmentCard({
  cita,
  horaInicio,
  horaTermino,
  bloques = 1,
  onClick,
}: {
  cita: CitaEnAgendaResponse;
  horaInicio: string;
  horaTermino: string;
  bloques?: number;
  onClick: () => void;
}) {
  const definicion = definicionEstado(cita.estado as CodigoEstadoCita);
  const fondo =
    FONDO_ESTADO[definicion.colorRol] ?? FONDO_ESTADO["azul-seleccion"];
  const dot = DOT_ESTADO[definicion.colorRol] ?? "bg-slate-400";
  const compacto = bloques <= 1;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-full w-full flex-col items-center justify-center gap-0.5 ${fondo} p-1 text-center text-slate-900 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-900 rounded-none shadow-none font-sans`}
    >
      <span className="absolute right-1 top-1 font-sans text-[9px] font-bold uppercase tracking-wider text-slate-900 opacity-60">
        {cita.origen === "web" ? "WEB" : "MANUAL"}
      </span>

      <p className="w-full truncate px-3 font-sans text-xs font-bold leading-tight">
        {cita.paciente
          ? `${cita.paciente.nombre} ${cita.paciente.apellido}`
          : "—"}
      </p>

      <div className="flex items-center justify-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`}
          aria-hidden
        />
        <span className="font-sans text-[10px] font-medium tracking-tight">
          {compacto
            ? horaInicio
            : formatearRangoHorario(horaInicio, horaTermino)}
          {" | "}
          {definicion.etiqueta}
        </span>
      </div>
    </button>
  );
}
