"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui";

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
  { prefijo: "/panel/documentos", titulo: "Documentos" },
  {
    prefijo: "/panel/ventas",
    titulo: "Planilla de Ventas y Registro de Cobros",
  },
  { prefijo: "/panel/reportes", titulo: "Reportes y Métricas" },
  {
    prefijo: "/panel/configuracion/especialistas",
    titulo: "Gestión del Equipo y Gerencia",
  },
  {
    prefijo: "/panel/configuracion/landing",
    titulo: "Configuración de la Página Web Principal",
  },
  { prefijo: "/panel/configuracion", titulo: "Configuración" },
  { prefijo: "/panel/agenda", titulo: "Agenda" },
  { prefijo: "/panel/perfil", titulo: "Mi Perfil" },
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
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-border bg-white px-8 font-sans shadow-none">
      <h1 className="text-page-title font-bold text-foreground font-sans">
        {titulo}
      </h1>
      <div className="flex items-center gap-4 font-sans">
        <Button asChild variant="outline" className="rounded-overlay">
          <Link href="/" title="Ver Sitio Web / Landing Page">
            Ir a la Web
          </Link>
        </Button>

        <div className="h-4 w-px bg-border" />

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            {nombre}
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-none bg-muted text-xs font-sans font-bold text-foreground border border-border">
            {iniciales(nombre)}
          </span>
        </div>
      </div>
    </header>
  );
}
