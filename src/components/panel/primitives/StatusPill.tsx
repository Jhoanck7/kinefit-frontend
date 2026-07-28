import { ColorRolEstado } from "@/lib/panel/domain/estados";

/**
 * Clases estáticas (literales, para que Tailwind las detecte) por rol de
 * color. Todo el panel pasa por aquí para pintar un estado — es lo que hace
 * imposible que el mismo estado se vea de dos colores en dos pantallas
 * (DD-5, A.6).
 */
const CLASES_ROL: Record<ColorRolEstado, { fondo: string; texto: string; punto: string }> = {
  "azul-seleccion": { fondo: "bg-blue-100", texto: "text-blue-800", punto: "bg-blue-500" },
  ambar: { fondo: "bg-amber-100", texto: "text-amber-800", punto: "bg-amber-500" },
  verde: { fondo: "bg-emerald-100", texto: "text-emerald-800", punto: "bg-emerald-500" },
  "azul-profundo": { fondo: "bg-indigo-100", texto: "text-indigo-900", punto: "bg-indigo-700" },
  rojo: { fondo: "bg-red-100", texto: "text-red-800", punto: "bg-red-500" },
  gris: { fondo: "bg-slate-200", texto: "text-slate-700", punto: "bg-slate-500" },
};

interface StatusPillProps {
  etiqueta: string;
  colorRol: ColorRolEstado;
  conTrama?: boolean;
  className?: string;
}

export function StatusPill({ etiqueta, colorRol, conTrama, className = "" }: StatusPillProps) {
  const clases = CLASES_ROL[colorRol];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${clases.fondo} ${clases.texto} ${conTrama ? "bg-[repeating-linear-gradient(135deg,transparent,transparent_4px,rgba(0,0,0,0.06)_4px,rgba(0,0,0,0.06)_8px)]" : ""} ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${clases.punto}`} aria-hidden />
      {etiqueta}
    </span>
  );
}

export function PuntoEstado({ colorRol }: { colorRol: ColorRolEstado }) {
  return <span className={`h-2.5 w-2.5 rounded-full ${CLASES_ROL[colorRol].punto}`} aria-hidden />;
}

export { CLASES_ROL as CLASES_ROL_ESTADO };
