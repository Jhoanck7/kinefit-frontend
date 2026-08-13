import { CATALOGO_ESTADOS, ORDEN_ESTADOS } from "@/lib/panel/domain/estados";

const DOT_COLOR: Record<string, string> = {
  "azul-seleccion": "bg-blue-600",
  ambar: "bg-amber-500",
  verde: "bg-emerald-500",
  "azul-profundo": "bg-indigo-700",
  rojo: "bg-red-500",
  gris: "bg-slate-400",
};

/**
 * Leyenda de estados estilo Flat High-Contrast (Estilo Notion):
 * - Cero sombras (shadow-none)
 */
export function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border border-slate-200 bg-white px-5 py-2.5 text-xs text-slate-600 rounded-md shadow-none font-sans">
      {ORDEN_ESTADOS.map((codigo) => {
        const definicion = CATALOGO_ESTADOS[codigo];
        const dotBg = DOT_COLOR[definicion.colorRol] ?? "bg-slate-400";
        return (
          <span key={codigo} className="inline-flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${dotBg}`} aria-hidden />
            <span className="font-sans text-xs uppercase tracking-wider text-slate-700 font-semibold">
              {definicion.etiqueta}
            </span>
          </span>
        );
      })}
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-600" aria-hidden />
        <span className="font-sans text-xs uppercase tracking-wider text-slate-700 font-semibold">
          Bloqueado
        </span>
      </span>
    </div>
  );
}
