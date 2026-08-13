"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePanelSessionStore } from "@/lib/store/usePanelSessionStore";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function PanelShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const usuario = usePanelSessionStore((s) => s.usuario);
  const entrar = usePanelSessionStore((s) => s.entrar);
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("kinefit_token");
    const rawUser = localStorage.getItem("kinefit_user");

    if (!token) {
      router.replace("/panel/acceso");
      return;
    }

    // Si hay token en localStorage pero el store de Zustand aún no ha hidratado
    if (!usuario && rawUser) {
      try {
        const u = JSON.parse(rawUser);
        entrar({
          nombre: u.nombre || "Personal KineFit",
          rol: u.rol === "Administrador" ? "Administrador" : "Especialista",
          cargo: u.rol === "Administrador" ? "Administrador General" : "Especialista",
          especialistaId: u.especialistaId ? String(u.especialistaId) : undefined,
        });
      } catch {
        // Ignorar error de parseo
      }
    }

    setVerificado(true);
  }, [usuario, entrar, router]);

  if (!verificado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-panel-fondo">
        <p className="text-sm font-semibold text-brand-muted">Verificando sesión...</p>
      </div>
    );
  }

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
