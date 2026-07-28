import { ReactNode } from "react";

/** Badge informativo: fondo azul tenue (B.7). */
export function InfoBadge({ icono, children }: { icono?: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-panel-seleccion px-2.5 py-1 text-xs font-medium text-panel-sidebar">
      {icono}
      {children}
    </span>
  );
}

/** Badge de contraste invertido: fondo azul profundo, texto blanco (B.7). */
export function InvertedBadge({ icono, children }: { icono?: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-panel-sidebar px-2.5 py-1 text-xs font-medium text-white">
      {icono}
      {children}
    </span>
  );
}

/** Badge neutro genérico (convenio, tipo de ficha, tipo de formato…). */
export function NeutralBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-panel-seleccion px-2.5 py-1 text-xs font-medium text-panel-sidebar">
      {children}
    </span>
  );
}

/** Badge de conteo de uso (FM-8, "En uso"). */
export function UsageBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">
      {children}
    </span>
  );
}
