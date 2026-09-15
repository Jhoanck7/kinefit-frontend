"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const ITEMS_NAVEGACION = [
  {
    href: "/panel/agenda",
    etiqueta: "Agenda",
    prefijos: ["/panel/agenda"],
  },
  {
    href: "/panel/nueva-reserva/servicio",
    etiqueta: "Nueva Reserva",
    prefijos: ["/panel/nueva-reserva"],
  },
  {
    href: "/panel/pacientes",
    etiqueta: "Pacientes",
    prefijos: ["/panel/pacientes"],
  },
  {
    href: "/panel/documentos",
    etiqueta: "Documentos",
    prefijos: ["/panel/documentos"],
  },
  {
    href: "/panel/ventas",
    etiqueta: "Ventas",
    prefijos: ["/panel/ventas"],
  },
  {
    href: "/panel/reportes",
    etiqueta: "Reportes",
    prefijos: ["/panel/reportes"],
    soloAdministrador: true,
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
  },
  {
    href: "/panel/perfil",
    etiqueta: "Mi Perfil",
    prefijos: ["/panel/perfil"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const esAdministrador = session?.user?.rol === "Administrador";
  const items = ITEMS_NAVEGACION.filter(
    item => !item.soloAdministrador || esAdministrador
  );

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
        {items.map(({ href, etiqueta, prefijos }) => {
          const activo = prefijos.some(
            p =>
              pathname === p ||
              pathname.startsWith(`${p}/`) ||
              pathname.startsWith(`${p}?`)
          );
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={activo ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-3.5 py-2 text-page-title font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 ${
                  activo
                    ? "bg-slate-800 text-white font-bold"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                {etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-slate-800 px-3 py-4">
        <button
          type="button"
          onClick={cerrarSesion}
          className="flex w-full items-center gap-3 rounded-md px-3.5 py-2 text-page-title font-semibold text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}
