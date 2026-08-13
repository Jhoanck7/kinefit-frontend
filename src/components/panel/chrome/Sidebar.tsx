"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { usePanelSessionStore } from "@/lib/store/usePanelSessionStore";
import {
  IconoAgenda,
  IconoNuevaReserva,
  IconoPacientes,
  IconoFichas,
  IconoEspecialistas,
  IconoLanding,
  IconoCerrarSesion,
} from "./iconos";

const ITEMS_NAVEGACION = [
  { href: "/panel/agenda", etiqueta: "Agenda", prefijos: ["/panel/agenda", "/panel/horarios"], Icono: IconoAgenda },
  { href: "/panel/nueva-reserva/horario", etiqueta: "Nueva reserva", prefijos: ["/panel/nueva-reserva"], Icono: IconoNuevaReserva },
  { href: "/panel/pacientes", etiqueta: "Pacientes", prefijos: ["/panel/pacientes"], Icono: IconoPacientes },
  { href: "/panel/fichas", etiqueta: "Fichas clínicas", prefijos: ["/panel/fichas"], Icono: IconoFichas },
  { href: "/panel/especialistas", etiqueta: "Especialistas", prefijos: ["/panel/especialistas"], Icono: IconoEspecialistas },
  { href: "/panel/landing", etiqueta: "Configuración Landing", prefijos: ["/panel/landing"], Icono: IconoLanding },
];

/**
 * Barra lateral canónica (A.2). Ítem activo derivado siempre de la ruta:
 * es imposible que señale una sección distinta de la que está en pantalla
 * (NF2-3 cerrada por construcción).
 */
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const salir = usePanelSessionStore((s) => s.salir);

  function cerrarSesion() {
    salir();
    router.push("/panel/acceso");
  }

  return (
    <nav
      aria-label="Navegación del panel"
      className="flex w-[20%] min-w-[240px] max-w-[300px] flex-col bg-panel-sidebar text-white"
    >
      <div className="flex items-center justify-center px-3 pt-6 pb-4 w-full">
        <Image
          src="/Kinefit Negro ver.png"
          alt="Kinefit Logo"
          width={280}
          height={100}
          className="h-20 w-full object-contain brightness-0 invert"
          priority
        />
      </div>

      <ul className="flex-1 px-3 space-y-1">
        {ITEMS_NAVEGACION.map(({ href, etiqueta, prefijos, Icono }) => {
          const activo = prefijos.some((p) => pathname === p || pathname.startsWith(`${p}/`) || pathname.startsWith(`${p}?`));
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={activo ? "page" : undefined}
                className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  activo
                    ? "bg-panel-sidebar-activo font-semibold text-white"
                    : "text-blue-100 hover:bg-white/10"
                }`}
              >
                <Icono />
                {etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-white/10 px-3 py-4">
        <button
          type="button"
          onClick={cerrarSesion}
          className="flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm text-blue-100 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <IconoCerrarSesion />
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}
