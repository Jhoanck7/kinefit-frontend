"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";

import { Header } from "./header";
import { Sidebar } from "./sidebar";

/** Envuelve las páginas del panel con el sidebar y el header, mostrando una espera breve mientras la sesión hidrata */
export function PanelShell({ children }: { children: ReactNode }) {
  const { status } = useSession();

  // La protección real la hace proxy.ts en el servidor; esto solo evita pintar el panel mientras hidrata la sesión del cliente
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-panel-fondo">
        <p className="text-sm font-semibold text-muted-foreground">
          Verificando sesión...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-panel-fondo">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 min-h-screen bg-panel-fondo">
        <Header />
        <main className="flex-1 bg-panel-fondo p-8 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
