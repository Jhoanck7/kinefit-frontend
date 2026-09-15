import { COLOR_ROL } from "@/lib/color-rol";
import { CATALOGO_ESTADOS, ORDEN_ESTADOS } from "@/lib/estados";

/**
 * Leyenda de estados estilo Flat High-Contrast (Estilo Notion):
 * - Cero sombras (shadow-none)
 */
export function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border border-slate-200 bg-white px-5 py-2.5 text-xs text-slate-600 rounded-md shadow-none font-sans">
      {ORDEN_ESTADOS.map(codigo => {
        const definicion = CATALOGO_ESTADOS[codigo];
        const dotBg = COLOR_ROL[definicion.colorRol]?.dot ?? COLOR_ROL.gris.dot;
        return (
          <span key={codigo} className="inline-flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${dotBg}`} aria-hidden />
            <span className="font-sans text-xs text-muted-foreground font-semibold">
              {definicion.etiqueta}
            </span>
          </span>
        );
      })}
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-600" aria-hidden />
        <span className="font-sans text-xs text-muted-foreground font-semibold">
          Bloqueado
        </span>
      </span>
    </div>
  );
}
