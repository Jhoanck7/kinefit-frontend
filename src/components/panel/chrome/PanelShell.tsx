import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

/**
 * Marco canónico de dos zonas (Parte A.1): barra lateral fija a la
 * izquierda, encabezado fijo arriba a la derecha, contenido con scroll
 * propio. Se construye una sola vez aquí y ninguna vista lo redefine
 * (G-2) — el título del encabezado se deriva de la ruta, no se pasa vista
 * por vista, para que nunca pueda quedar desincronizado (NF2-5).
 */
export function PanelShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto bg-panel-fondo p-8">{children}</main>
      </div>
    </div>
  );
}
