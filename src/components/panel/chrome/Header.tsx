"use client";

import { usePathname } from "next/navigation";
import { usePanelSessionStore, USUARIO_SESION_PANEL } from "@/lib/store/usePanelSessionStore";
import { IconoCampana, IconoEngranaje } from "./iconos";
import { OutOfScopeIconButton } from "../primitives/OutOfScope";

function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

/**
 * Títulos del encabezado por ruta, del más específico al más general: el
 * primero cuyo prefijo coincida gana. Vivir en un solo lugar es lo que
 * hace imposible que el título se desincronice de la sección (NF2-5).
 */
const TITULOS_POR_RUTA: { prefijo: string; titulo: string }[] = [
  { prefijo: "/panel/nueva-reserva", titulo: "Nueva Reserva Manual" },
  { prefijo: "/panel/pacientes/nuevo", titulo: "Registrar Paciente" },
  { prefijo: "/panel/pacientes", titulo: "Pacientes" },
  { prefijo: "/panel/fichas", titulo: "Fichas clínicas" },
  { prefijo: "/panel/agenda/bloqueos", titulo: "Bloqueos de agenda" },
  { prefijo: "/panel/agenda", titulo: "Agenda" },
  { prefijo: "/panel/horarios", titulo: "Horarios de atención" },
];

function tituloDeLaRuta(pathname: string): string {
  return TITULOS_POR_RUTA.find((t) => pathname.startsWith(t.prefijo))?.titulo ?? "Panel Administrativo";
}

/** Encabezado canónico (A.3): título de la sección a la izquierda, usuario a la derecha. */
export function Header() {
  const usuario = usePanelSessionStore((s) => s.usuario) ?? USUARIO_SESION_PANEL;
  const pathname = usePathname();
  const titulo = tituloDeLaRuta(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-brand-border bg-white px-8">
      <h1 className="text-lg font-bold text-panel-sidebar">{titulo}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-panel-sidebar">{usuario.nombre}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-panel-seleccion text-sm font-semibold text-panel-sidebar">
          {iniciales(usuario.nombre)}
        </span>
        <OutOfScopeIconButton etiqueta="Notificaciones" icono={<IconoCampana />} />
        <OutOfScopeIconButton etiqueta="Ajustes" icono={<IconoEngranaje />} />
      </div>
    </header>
  );
}
