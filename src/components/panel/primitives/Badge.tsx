import { ReactNode } from "react";

/** Badge informativo con estilo Frameless Satoshi */
export function InfoBadge({
  icono,
  children,
}: {
  icono?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-none border border-blue-200 bg-blue-50 px-2 py-0.5 font-sans text-[11px] font-medium text-blue-950">
      {icono}
      {children}
    </span>
  );
}

/** Badge de contraste invertido */
export function InvertedBadge({
  icono,
  children,
}: {
  icono?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-none bg-slate-900 px-2 py-0.5 font-sans text-[11px] font-medium text-white">
      {icono}
      {children}
    </span>
  );
}

/** Badge neutro genérico (convenio, tipo de ficha, tipo de formato…) */
export function NeutralBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-none border border-slate-200 bg-slate-50 px-2 py-0.5 font-sans text-[11px] font-medium text-slate-700">
      {children}
    </span>
  );
}

/** Badge de conteo de uso */
export function UsageBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-none border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-sans text-[11px] font-bold uppercase tracking-wider text-emerald-800">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden />
      {children}
    </span>
  );
}
