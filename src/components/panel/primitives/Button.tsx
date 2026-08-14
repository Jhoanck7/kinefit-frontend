"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

export type VarianteBoton = "primario" | "secundario" | "terciario" | "peligro";

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton;
  /** Explica por qué la acción está deshabilitada (RF-AGD-036, M-9). */
  explicacionDeshabilitado?: string;
}

const CLASES_BASE =
  "inline-flex items-center justify-center gap-2 rounded-none px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-900 disabled:cursor-not-allowed disabled:opacity-50 shadow-none font-sans";

const CLASES_VARIANTE: Record<VarianteBoton, string> = {
  primario: "bg-[#003366] text-white hover:bg-[#002244]",
  secundario:
    "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50",
  terciario: "bg-transparent text-slate-700 hover:text-slate-900 px-1 py-1",
  peligro: "bg-red-50 border border-red-300 text-red-700 hover:bg-red-100",
};

export const Button = forwardRef<HTMLButtonElement, BotonProps>(function Button(
  {
    variante = "primario",
    explicacionDeshabilitado,
    className = "",
    disabled,
    ...props
  },
  ref
) {
  const boton = (
    <button
      ref={ref}
      disabled={disabled}
      className={`${CLASES_BASE} ${CLASES_VARIANTE[variante]} ${className}`}
      title={disabled ? explicacionDeshabilitado : undefined}
      aria-disabled={disabled}
      {...props}
    />
  );

  if (disabled && explicacionDeshabilitado) {
    return (
      <span className="inline-flex flex-col gap-1">
        {boton}
        <span className="text-xs text-slate-500 max-w-xs">
          {explicacionDeshabilitado}
        </span>
      </span>
    );
  }

  return boton;
});
