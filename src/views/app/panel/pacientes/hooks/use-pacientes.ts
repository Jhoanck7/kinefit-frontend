"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useGetPacientes } from "@/hooks/api";
import { useDebounce, useHoyPanel } from "@/hooks/common";

export const TAMANO_PAGINA = 10;

/** Gestiona la búsqueda, paginación y el modal de detalle del listado de pacientes */
export const usePacientes = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hoy = useHoyPanel();
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const busquedaDebounced = useDebounce(busqueda.trim(), 300);
  const { data: pacientes, isFetching: buscando } = useGetPacientes(
    busquedaDebounced || undefined,
    undefined,
    pagina,
    TAMANO_PAGINA
  );
  const pacienteModalId = searchParams.get("paciente");
  const total = pacientes?.total ?? 0;
  const inicio = (pagina - 1) * TAMANO_PAGINA;
  const visibles = pacientes?.items ?? [];

  const abrirParametros = (params: Record<string, string | undefined>) => {
    const actuales = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([clave, valor]) => {
      if (valor === undefined) actuales.delete(clave);
      else actuales.set(clave, valor);
    });
    const query = actuales.toString();
    window.history.pushState(
      null,
      "",
      query ? `${pathname}?${query}` : pathname
    );
  };

  const handleNuevoPaciente = () => router.push("/panel/pacientes/nuevo");
  const handleAbrirPaciente = (id: number) =>
    abrirParametros({ paciente: String(id) });
  const handleCerrarModal = () => abrirParametros({ paciente: undefined });
  const handlePaginaAnterior = () => setPagina(p => Math.max(1, p - 1));
  const handlePaginaSiguiente = () =>
    setPagina(p => (inicio + TAMANO_PAGINA < total ? p + 1 : p));
  const handleBuscar = (valor: string) => {
    setBusqueda(valor);
    setPagina(1);
  };

  return {
    hoy,
    busqueda,
    buscando,
    pagina,
    total,
    inicio,
    visibles,
    pacienteModalId,

    actions: {
      setBusqueda: handleBuscar,
      handleNuevoPaciente,
      handleAbrirPaciente,
      handleCerrarModal,
      handlePaginaAnterior,
      handlePaginaSiguiente,
    },
  };
};
