"use client";

import { useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";

import { usePanelSessionStore } from "@/lib/store/usePanelSessionStore";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function PanelShell({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const usuario = usePanelSessionStore(s => s.usuario);
  const entrar = usePanelSessionStore(s => s.entrar);

  useEffect(() => {
    if (status !== "authenticated" || usuario || !session?.user) return;

    entrar({
      nombre: session.user.nombre || "Personal KineFit",
      rol:
        session.user.rol === "Administrador" ? "Administrador" : "Especialista",
      cargo:
        session.user.rol === "Administrador"
          ? "Administrador General"
          : "Especialista",
      especialistaId: session.user.especialistaId,
    });
  }, [status, session, usuario, entrar]);

  // La protección real ya la hace middleware.ts en el servidor; este estado
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
