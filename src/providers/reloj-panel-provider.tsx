"use client";

import { createContext, ReactNode, useEffect, useState } from "react";

import { fechaISO } from "@/lib/formato";

export const RelojPanelContext = createContext<Date | null>(null);

const INTERVALO_REVISION_MS = 60_000;

export function RelojPanelProvider({ children }: { children: ReactNode }) {
  const [hoy, setHoy] = useState<Date | null>(() =>
    typeof window !== "undefined" ? new Date() : null
  );

  useEffect(() => {
    const revisarCambioDeDia = () => {
      setHoy(anterior => {
        const ahora = new Date();
        if (anterior && fechaISO(anterior) === fechaISO(ahora)) return anterior;
        return ahora;
      });
    };

    const intervalo = window.setInterval(
      revisarCambioDeDia,
      INTERVALO_REVISION_MS
    );
    document.addEventListener("visibilitychange", revisarCambioDeDia);
    window.addEventListener("focus", revisarCambioDeDia);

    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", revisarCambioDeDia);
      window.removeEventListener("focus", revisarCambioDeDia);
    };
  }, []);

  return (
    <RelojPanelContext.Provider value={hoy}>
      {children}
    </RelojPanelContext.Provider>
  );
}
