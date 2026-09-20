"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useGetDocumentos, useGetEspecialistas } from "@/hooks/api";
import { useDebounce, useHoyPanel } from "@/hooks/common";

export const TAMANO_PAGINA = 10;

export const useDocumentos = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hoy = useHoyPanel();

  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("");
  const [especialistaId, setEspecialistaId] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [pagina, setPagina] = useState(1);

  const documentoModalId = searchParams.get("documento");

  const cambiarFiltro =
    (aplicar: (valor: string) => void) => (valor: string) => {
      aplicar(valor);
      setPagina(1);
    };

  const { data: especialistas = [] } = useGetEspecialistas();

  const busquedaDebounced = useDebounce(busqueda.trim(), 300);

  const { data } = useGetDocumentos({
    busqueda: busquedaDebounced || undefined,
    tipo: tipo || undefined,
    estado: estado || undefined,
    especialistaId: especialistaId ? Number(especialistaId) : undefined,
    fechaDesde: desde || undefined,
    fechaHasta: hasta || undefined,
    page: pagina,
    pageSize: TAMANO_PAGINA,
  });

  const total = data?.total ?? 0;
  const inicio = (pagina - 1) * TAMANO_PAGINA;
  const visibles = data?.items ?? [];

  const abrirParametros = (params: Record<string, string | undefined>) => {
    const actuales = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([clave, valor]) => {
      if (valor === undefined) actuales.delete(clave);
      else actuales.set(clave, valor);
    });
    const query = actuales.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleIrAPlantillas = () => router.push("/panel/documentos/plantillas");
  const handleRegistrarFicha = () =>
    router.push("/panel/documentos/nueva/reserva");
  const handleAbrirDocumento = (id: number) =>
    abrirParametros({ documento: String(id) });
  const handleCerrarModal = () => abrirParametros({ documento: undefined });
  const handlePaginaAnterior = () => setPagina(p => Math.max(1, p - 1));
  const handlePaginaSiguiente = () =>
    setPagina(p => (inicio + TAMANO_PAGINA < total ? p + 1 : p));

  return {
    hoy,
    busqueda,
    tipo,
    estado,
    especialistaId,
    especialistas,
    desde,
    hasta,
    pagina,
    total,
    inicio,
    visibles,
    documentoModalId,

    actions: {
      setBusqueda: cambiarFiltro(setBusqueda),
      setTipo: cambiarFiltro(setTipo),
      setEstado: cambiarFiltro(setEstado),
      setEspecialistaId: cambiarFiltro(setEspecialistaId),
      setDesde: cambiarFiltro(setDesde),
      setHasta: cambiarFiltro(setHasta),
      handleIrAPlantillas,
      handleRegistrarFicha,
      handleAbrirDocumento,
      handleCerrarModal,
      handlePaginaAnterior,
      handlePaginaSiguiente,
    },
  };
};
