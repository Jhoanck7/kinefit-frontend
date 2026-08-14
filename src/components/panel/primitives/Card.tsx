import { HTMLAttributes } from "react";

/**
 * Card primitivo con estilo Frameless Satoshi:
 * - Esquinas de 90° (rounded-none)
 * - Bordes finos de 1px (border-slate-200)
 * - Sin sombras (shadow-none)
 */
export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white rounded-none border border-slate-200 p-6 shadow-none font-sans ${className}`}
      {...props}
    />
  );
}
