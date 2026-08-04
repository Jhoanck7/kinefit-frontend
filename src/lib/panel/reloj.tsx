"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const RelojPanelContext = createContext<Date | null>(null);

/**
 * Resuelve el "hoy" del prototipo una sola vez, del lado del cliente
 * (§5.4.2 del plan de implementación): el servidor nunca calcula la fecha
 * actual al renderizar, así que no hay desajuste de hidratación posible
 * entre el huso horario del VPS y el del navegador de la especialista.
 */
export function RelojPanelProvider({ children }: { children: ReactNode }) {
  const [hoy, setHoy] = useState<Date | null>(null);

  useEffect(() => {
    setHoy(new Date());
  }, []);

  return <RelojPanelContext.Provider value={hoy}>{children}</RelojPanelContext.Provider>;
}

/** `null` hasta que se resuelve en el cliente (un instante, tras el montaje). */
export function useHoyPanel(): Date | null {
  return useContext(RelojPanelContext);
}
