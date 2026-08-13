"use client";

import { usePathname, useRouter } from "next/navigation";
import { usePanelSessionStore, USUARIO_SESION_PANEL } from "@/lib/store/usePanelSessionStore";
import { authService } from "@/lib/services/auth.service";

function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

const TITULOS_POR_RUTA: { prefijo: string; titulo: string }[] = [
  { prefijo: "/panel/nueva-reserva", titulo: "Nueva Reserva Manual" },
  { prefijo: "/panel/pacientes/nuevo", titulo: "Registrar Paciente" },
  { prefijo: "/panel/pacientes", titulo: "Pacientes" },
  { prefijo: "/panel/fichas", titulo: "Fichas clínicas" },
  { prefijo: "/panel/ventas", titulo: "Planilla de Ventas y Registro de Cobros" },
  { prefijo: "/panel/reportes", titulo: "Reportes y Métricas" },
  { prefijo: "/panel/agenda/bloqueos", titulo: "Bloqueos de agenda" },
  { prefijo: "/panel/agenda", titulo: "Agenda" },
  { prefijo: "/panel/horarios", titulo: "Horarios de atención" },
];

function tituloDeLaRuta(pathname: string): string {
  return TITULOS_POR_RUTA.find((t) => pathname.startsWith(t.prefijo))?.titulo ?? "Panel Administrativo";
}

export function Header() {
  const router = useRouter();
  const usuario = usePanelSessionStore((s) => s.usuario) ?? USUARIO_SESION_PANEL;
  const salir = usePanelSessionStore((s) => s.salir);
  const pathname = usePathname();
  const titulo = tituloDeLaRuta(pathname);

  function handleCerrarSesion() {
    authService.logout();
    salir();
    router.replace("/panel/acceso");
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-brand-border bg-white px-8">
      <h1 className="text-lg font-bold text-panel-sidebar">{titulo}</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-panel-sidebar">{usuario.nombre}</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-panel-seleccion text-sm font-semibold text-panel-sidebar">
            {iniciales(usuario.nombre)}
          </span>
        </div>
        <button
          onClick={handleCerrarSesion}
          className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors border border-red-200 rounded-lg px-2.5 py-1.5 bg-red-50 hover:bg-red-100"
          title="Cerrar sesión de personal"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
