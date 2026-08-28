"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(parte => parte[0])
    .join("")
    .toUpperCase();
}

const TITULOS_POR_RUTA: { prefijo: string; titulo: string }[] = [
  { prefijo: "/panel/nueva-reserva", titulo: "Nueva Reserva Manual" },
  { prefijo: "/panel/pacientes/nuevo", titulo: "Registrar Paciente" },
  { prefijo: "/panel/pacientes", titulo: "Pacientes" },
  { prefijo: "/panel/fichas", titulo: "Fichas clínicas" },
  {
    prefijo: "/panel/ventas",
    titulo: "Planilla de Ventas y Registro de Cobros",
  },
  { prefijo: "/panel/reportes", titulo: "Reportes y Métricas" },
  { prefijo: "/panel/configuracion", titulo: "Configuración" },
  { prefijo: "/panel/agenda/bloqueos", titulo: "Bloqueos de agenda" },
  { prefijo: "/panel/agenda", titulo: "Agenda" },
];

function tituloDeLaRuta(pathname: string): string {
  return (
    TITULOS_POR_RUTA.find(t => pathname.startsWith(t.prefijo))?.titulo ??
    "Panel Administrativo"
  );
}

/**
 * Barra Superior Canónica (Header) con estilo Frameless Satoshi:
 * - Tipografía Satoshi (font-sans) para el título y nombre de usuario
 * - Iniciales en font-mono
 * - Enlace directo al sitio web público / landing
 * - Botón de cerrar sesión sobrio y limpio
 */
export function Header() {
  const { data: session } = useSession();
  const nombre = session?.user.nombre || "Personal KineFit";
  const pathname = usePathname();
  const titulo = tituloDeLaRuta(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 font-sans shadow-none">
      <h1 className="text-xs font-bold uppercase tracking-widest text-slate-900 font-sans">
        {titulo}
      </h1>
      <div className="flex items-center gap-4 font-sans">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95 shadow-sm"
          title="Ver Sitio Web / Landing Page"
        >
          <svg
            className="w-3.5 h-3.5 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          <span>Ir a la Web</span>
        </Link>

        <div className="h-4 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            {nombre}
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-none bg-slate-100 text-xs font-sans font-bold text-slate-800 border border-slate-200">
            {iniciales(nombre)}
          </span>
        </div>
      </div>
    </header>
  );
}
