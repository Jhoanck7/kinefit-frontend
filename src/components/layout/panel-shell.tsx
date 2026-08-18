"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";

import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function PanelShell({ children }: { children: ReactNode }) {
  const { status } = useSession();

  // La protección real ya la hace proxy.ts en el servidor; este estado
  // es solo para no pintar el panel mientras la sesión de cliente hidrata.
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-panel-fondo">
        <p className="text-sm font-semibold text-brand-muted">
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
