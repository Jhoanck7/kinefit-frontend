import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

/**
 * Marco canónico de dos zonas
 */
export function PanelShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-panel-fondo">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 min-h-screen bg-panel-fondo">
        <Header />
        <main className="flex-1 bg-panel-fondo p-8 min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
