"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import { useGetTotalDocumentosPendientes } from "@/hooks/api";

import {
  IconoAgenda,
  IconoCerrarSesion,
  IconoEspecialistas,
  IconoFichas,
  IconoLanding,
  IconoNuevaReserva,
  IconoPacientes,
  IconoReportes,
  IconoVentas,
} from "./iconos";

const ITEMS_NAVEGACION = [
  {
    href: "/panel/agenda",
    etiqueta: "Agenda",
    prefijos: ["/panel/agenda"],
    Icono: IconoAgenda,
  },
  {
    href: "/panel/nueva-reserva/servicio",
    etiqueta: "Nueva reserva",
    prefijos: ["/panel/nueva-reserva"],
    Icono: IconoNuevaReserva,
  },
  {
    href: "/panel/pacientes",
    etiqueta: "Pacientes",
    prefijos: ["/panel/pacientes"],
    Icono: IconoPacientes,
  },
  {
    href: "/panel/fichas",
    etiqueta: "Fichas clínicas",
    prefijos: ["/panel/fichas"],
    Icono: IconoFichas,
    badge: "documentosPendientes" as const,
  },
  {
    href: "/panel/ventas",
    etiqueta: "Ventas",
    prefijos: ["/panel/ventas"],
    Icono: IconoVentas,
  },
  {
    href: "/panel/reportes",
    etiqueta: "Reportes",
    prefijos: ["/panel/reportes"],
    Icono: IconoReportes,
  },
  {
    href: "/panel/configuracion",
    etiqueta: "Configuración",
    prefijos: [
      "/panel/configuracion",
      "/panel/especialistas",
      "/panel/landing",
      "/panel/horarios",
    ],
    Icono: IconoLanding,
  },
  {
    href: "/panel/perfil",
    etiqueta: "Mi perfil",
    prefijos: ["/panel/perfil"],
    Icono: IconoEspecialistas,
  },
];

/**
 * Menú lateral con estilo Flat High-Contrast (Estilo Notion):
 * - Fondo gris oscuro pizarra (bg-slate-900) para un contraste sobrio y elegante
 */
export function Sidebar() {
  const pathname = usePathname();
  const { data: pendientes } = useGetTotalDocumentosPendientes();

  function cerrarSesion() {
    signOut({ callbackUrl: "/panel/acceso" });
  }

  return (
    <nav
      aria-label="Navegación del panel"
      className="sticky top-0 h-screen flex w-[20%] min-w-[240px] max-w-[300px] flex-col bg-slate-900 text-slate-100 shrink-0 font-sans shadow-none border-r border-slate-800"
    >
      <div className="flex items-center justify-center px-4 pt-6 pb-5 w-full">
        <Image
          src="/Kinefit Negro ver.png"
          alt="Kinefit Logo"
          width={280}
          height={100}
          className="h-16 w-full object-contain brightness-0 invert"
          priority
        />
      </div>

      <ul className="flex-1 px-3 space-y-1">
        {ITEMS_NAVEGACION.map(({ href, etiqueta, prefijos, Icono, badge }) => {
          const activo = prefijos.some(
            p =>
              pathname === p ||
              pathname.startsWith(`${p}/`) ||
              pathname.startsWith(`${p}?`)
          );
          const badgeCount =
            badge === "documentosPendientes" ? (pendientes?.total ?? 0) : 0;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={activo ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 ${
                  activo
                    ? "bg-slate-800 text-white font-bold"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <Icono />
                {etiqueta}
                {badgeCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                    {badgeCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-slate-800 px-3 py-4">
        <button
          type="button"
          onClick={cerrarSesion}
          className="flex w-full items-center gap-3 rounded-md px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
        >
          <IconoCerrarSesion />
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}
