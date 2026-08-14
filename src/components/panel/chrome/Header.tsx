"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { usePanelSessionStore, USUARIO_SESION_PANEL } from "@/lib/store/usePanelSessionStore";

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

/**
 * Barra Superior Canónica (Header) con estilo Frameless Satoshi:
 * - Tipografía Satoshi (font-sans) para el título y nombre de usuario
 * - Iniciales en font-mono
 * - Botón de cerrar sesión sobrio y limpio
 */
export function Header() {
  const usuario = usePanelSessionStore((s) => s.usuario) ?? USUARIO_SESION_PANEL;
  const salir = usePanelSessionStore((s) => s.salir);
  const pathname = usePathname();
  const titulo = tituloDeLaRuta(pathname);

  function handleCerrarSesion() {
    salir();
    signOut({ callbackUrl: "/panel/acceso" });
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 font-sans shadow-none">
      <h1 className="text-xs font-bold uppercase tracking-widest text-slate-900 font-sans">{titulo}</h1>
      <div className="flex items-center gap-4 font-sans">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">{usuario.nombre}</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-none bg-slate-100 text-xs font-sans font-bold text-slate-800 border border-slate-200">
            {iniciales(usuario.nombre)}
          </span>
        </div>
        <button
          onClick={handleCerrarSesion}
          className="text-xs font-bold uppercase tracking-wider text-slate-600 border border-slate-200 bg-white px-3 py-1.5 rounded-none shadow-none font-sans"
          title="Cerrar sesión de personal"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
