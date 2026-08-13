export interface PasoIndicador {
  etiqueta: string;
}

/**
 * Indicador de progreso con estilo Frameless Satoshi
 */
export function StepIndicator({ pasos, pasoActivo }: { pasos: PasoIndicador[]; pasoActivo: number }) {
  return (
    <ol className="flex items-start w-full font-sans">
      {pasos.map((paso, indice) => {
        const numero = indice + 1;
        const completado = numero < pasoActivo;
        const activo = numero === pasoActivo;
        return (
          <li key={paso.etiqueta} className="flex-1 flex flex-col items-center relative">
            {indice > 0 && (
              <span
                className={`absolute top-3.5 right-1/2 w-full h-[1px] -z-10 ${
                  completado || activo ? "bg-[#003366]" : "bg-slate-200"
                }`}
                aria-hidden
              />
            )}
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold font-sans ${
                completado
                  ? "bg-[#003366] text-white"
                  : activo
                    ? "bg-[#003366] text-white"
                    : "border border-slate-200 text-slate-400 bg-white"
              }`}
            >
              {completado ? "✓" : numero}
            </span>
            <span
              className={`mt-1.5 text-[11px] font-bold uppercase tracking-wider text-center ${
                activo ? "text-[#003366]" : "text-slate-400"
              }`}
            >
              {paso.etiqueta}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
