"use client";

import { createContext, ReactNode, useState } from "react";

export const RelojPanelContext = createContext<Date | null>(null);

/**
 * Resuelve el "hoy" del prototipo una sola vez, del lado del cliente
 * (§5.4.2 del plan de implementación): el servidor nunca calcula la fecha
 * actual al renderizar, así que no hay desajuste de hidratación posible
 * entre el huso horario del VPS y el del navegador de la especialista.
 */
export function RelojPanelProvider({ children }: { children: ReactNode }) {
  const [hoy] = useState<Date | null>(() =>
    typeof window !== "undefined" ? new Date() : null
  );

  return (
    <RelojPanelContext.Provider value={hoy}>
      {children}
    </RelojPanelContext.Provider>
  );
}
