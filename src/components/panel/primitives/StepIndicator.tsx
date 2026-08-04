export interface PasoIndicador {
  etiqueta: string;
}

/**
 * Indicador de progreso único (G-9): círculo, número dentro del nodo
 * (P1-7, NF1-2), etiquetas en Capitalización (P1-6).
 */
export function StepIndicator({ pasos, pasoActivo }: { pasos: PasoIndicador[]; pasoActivo: number }) {
  return (
    <ol className="flex items-start w-full">
      {pasos.map((paso, indice) => {
        const numero = indice + 1;
        const completado = numero < pasoActivo;
        const activo = numero === pasoActivo;
        return (
          <li key={paso.etiqueta} className="flex-1 flex flex-col items-center relative">
            {indice > 0 && (
              <span
                className={`absolute top-4 right-1/2 w-full h-0.5 -z-10 ${
                  completado || activo ? "bg-panel-sidebar" : "bg-brand-border"
                }`}
                aria-hidden
              />
            )}
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                completado
                  ? "bg-panel-sidebar text-white"
                  : activo
                    ? "bg-panel-sidebar text-white"
                    : "border-2 border-brand-border text-brand-muted bg-panel-fondo"
              }`}
            >
              {completado ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                numero
              )}
            </span>
            <span
              className={`mt-2 text-xs text-center ${
                activo ? "font-semibold text-panel-sidebar" : "text-brand-muted"
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
