"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

export type VarianteBoton = "primario" | "secundario" | "terciario" | "peligro";

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton;
  /** Explica por qué la acción está deshabilitada (RF-AGD-036, M-9). */
  explicacionDeshabilitado?: string;
}

const CLASES_BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-panel-sidebar disabled:cursor-not-allowed disabled:opacity-50";

const CLASES_VARIANTE: Record<VarianteBoton, string> = {
  primario: "bg-panel-sidebar text-white hover:bg-panel-sidebar-activo",
  secundario:
    "bg-white border-2 border-panel-sidebar text-panel-sidebar hover:bg-panel-seleccion",
  terciario: "bg-transparent text-panel-sidebar underline underline-offset-2 px-1 py-1",
  peligro: "bg-white border-2 border-red-600 text-red-600 hover:bg-red-50",
};

export const Button = forwardRef<HTMLButtonElement, BotonProps>(function Button(
  { variante = "primario", explicacionDeshabilitado, className = "", disabled, ...props },
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
        <span className="text-xs text-brand-muted max-w-xs">{explicacionDeshabilitado}</span>
      </span>
    );
  }

  return boton;
});
