import { CitaResuelta } from "@/lib/panel/data/citas";
import { definicionEstado } from "@/lib/panel/domain/estados";
import { formatearRangoHorario } from "@/lib/panel/domain/formato";

const ESTILO_ESTADO: Record<
  string,
  { bg: string; texto: string; bordeLeft: string; dotBg: string }
> = {
  "azul-seleccion": {
    bg: "bg-blue-50/90 hover:bg-blue-100/90",
    texto: "text-blue-950",
    bordeLeft: "border-l-4 border-blue-900",
    dotBg: "bg-blue-900",
  },
  ambar: {
    bg: "bg-amber-50/90 hover:bg-amber-100/90",
    texto: "text-amber-950",
    bordeLeft: "border-l-4 border-amber-600",
    dotBg: "bg-amber-600",
  },
  verde: {
    bg: "bg-emerald-50/90 hover:bg-emerald-100/90",
    texto: "text-emerald-950",
    bordeLeft: "border-l-4 border-emerald-700",
    dotBg: "bg-emerald-700",
  },
  "azul-profundo": {
    bg: "bg-indigo-50/90 hover:bg-indigo-100/90",
    texto: "text-indigo-950",
    bordeLeft: "border-l-4 border-indigo-900",
    dotBg: "bg-indigo-900",
  },
  rojo: {
    bg: "bg-rose-50/90 hover:bg-rose-100/90",
    texto: "text-rose-950",
    bordeLeft: "border-l-4 border-rose-700",
    dotBg: "bg-rose-700",
  },
  gris: {
    bg: "bg-slate-100/90 hover:bg-slate-200/90",
    texto: "text-slate-900",
    bordeLeft: "border-l-4 border-slate-500",
    dotBg: "bg-slate-500",
  },
};

/**
 * Tarjeta de cita Frameless Satoshi:
 * - Fondo tenue azul claro (bg-blue-50), texto azul oscuro (text-blue-950)
 * - Satoshi 100% (font-sans) para nombres, horarios y estados
 */
export function AppointmentCard({
  cita,
  onClick,
}: {
  cita: CitaResuelta;
  onClick: () => void;
}) {
  const definicion = definicionEstado(cita.estado);
  const config = ESTILO_ESTADO[definicion.colorRol] ?? ESTILO_ESTADO["azul-seleccion"];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-full w-full flex-col justify-between ${config.bg} ${config.texto} p-2 text-left transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-900 rounded-none shadow-none font-sans`}
    >
      {/* Badge de Origen discreto */}
      <span className="absolute right-1.5 top-1.5">
        <span className="inline-block text-[9px] font-sans font-bold uppercase tracking-wider opacity-60">
          {cita.origen === "web" ? "WEB" : "MANUAL"}
        </span>
      </span>

      {/* Nombre Paciente */}
      <div className="pr-10">
        <p className="font-sans text-xs font-bold leading-tight truncate">
          {cita.paciente.nombre} {cita.paciente.apellido}
        </p>
      </div>

      {/* Horario en font-sans + Estado con Status Dot */}
      <div className="mt-1 flex flex-col gap-0.5">
        <p className="font-sans text-[11px] font-medium opacity-85 tracking-tight">
          {formatearRangoHorario(cita.horaInicio, cita.horaTermino)}
        </p>

        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${config.dotBg}`} aria-hidden />
          <span className="font-sans text-[10px] font-bold uppercase tracking-wider opacity-90">
            {definicion.etiqueta}
          </span>
        </div>
      </div>
    </button>
  );
}
