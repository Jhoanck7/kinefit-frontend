import { Origen } from "@/lib/panel/domain/tipos";

/**
 * El distintivo de origen indica el origen, no el estado (G-6): un solo
 * tratamiento fijo para `WEB` y otro para `MANUAL`, sin importar el color
 * de la cita que lo rodea.
 */
const CLASES_ORIGEN: Record<Origen, string> = {
  web: "bg-slate-800 text-white",
  manual: "bg-white text-slate-700 border border-slate-300",
};

const ETIQUETA_ORIGEN: Record<Origen, string> = {
  web: "WEB",
  manual: "MANUAL",
};

export function OriginBadge({ origen, className = "" }: { origen: Origen; className?: string }) {
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${CLASES_ORIGEN[origen]} ${className}`}
    >
      {ETIQUETA_ORIGEN[origen]}
    </span>
  );
}
