"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useGetFichas, useGetFormatos } from "@/hooks/api";
import { useHoyPanel } from "@/hooks/common";

export const TAMANO_PAGINA = 8;

export const useFichas = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hoy = useHoyPanel();

  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [pagina, setPagina] = useState(1);

  const fichaModalId = searchParams.get("ficha");

  const { data: formatos = [] } = useGetFormatos();

  useEffect(() => {
    setPagina(1);
  }, [busqueda, tipo, desde, hasta]);

  const { data } = useGetFichas({
    busqueda: busqueda || undefined,
    tipoFicha: tipo || undefined,
    fechaDesde: desde || undefined,
    fechaHasta: hasta || undefined,
    page: pagina,
    pageSize: TAMANO_PAGINA,
  });

  const total = data?.total ?? 0;
  const inicio = (pagina - 1) * TAMANO_PAGINA;
  const visibles = data?.items ?? [];

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

  const handleIrAFormatos = () => router.push("/panel/fichas/formatos");
  const handleNuevaFicha = () => router.push("/panel/fichas/nueva/reserva");
  const handleAbrirFicha = (id: number) =>
    abrirParametros({ ficha: String(id) });
  const handleCerrarModal = () => abrirParametros({ ficha: undefined });
  const handlePaginaAnterior = () => setPagina(p => Math.max(1, p - 1));
  const handlePaginaSiguiente = () =>
    setPagina(p => (inicio + TAMANO_PAGINA < total ? p + 1 : p));

  return {
    // Data
    hoy,
    busqueda,
    tipo,
    desde,
    hasta,
    formatos,
    pagina,
    total,
    inicio,
    visibles,
    fichaModalId,

    // Actions
    actions: {
      setBusqueda,
      setTipo,
      setDesde,
      setHasta,
      handleIrAFormatos,
      handleNuevaFicha,
      handleAbrirFicha,
      handleCerrarModal,
      handlePaginaAnterior,
      handlePaginaSiguiente,
    },
  };
};
