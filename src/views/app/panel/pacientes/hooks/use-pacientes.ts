"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useGetPacientes } from "@/hooks/api";
import { useHoyPanel } from "@/hooks/common";

export const TAMANO_PAGINA = 8;

export const usePacientes = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hoy = useHoyPanel();
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const { data: pacientes } = useGetPacientes(busqueda);
  const pacienteModalId = searchParams.get("paciente");
  const total = pacientes?.length ?? 0;
  const inicio = (pagina - 1) * TAMANO_PAGINA;
  const visibles = pacientes?.slice(inicio, inicio + TAMANO_PAGINA) ?? [];

  // Actions
  const abrirParametros = (params: Record<string, string | undefined>) => {
    const actuales = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([clave, valor]) => {
      if (valor === undefined) actuales.delete(clave);
      else actuales.set(clave, valor);
    });
    const query = actuales.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
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
    // Data
    hoy,
    busqueda,
    pagina,
    total,
    inicio,
    visibles,
    pacienteModalId,

    // Actions
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
