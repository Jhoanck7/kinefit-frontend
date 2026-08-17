"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useHoyPanel } from "@/hooks/common";
import { FichaResuelta, listFichas } from "@/lib/panel/data/fichas";
import { FormatoResuelto, listFormatos } from "@/lib/panel/data/formatos";

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
  const [fichas, setFichas] = useState<FichaResuelta[] | null>(null);
  const [formatos, setFormatos] = useState<FormatoResuelto[]>([]);
  const [pagina, setPagina] = useState(1);

  const fichaModalId = searchParams.get("ficha");

  useEffect(() => {
    if (!hoy) return;
    listFormatos(hoy).then(setFormatos);
  }, [hoy]);

  useEffect(() => {
    if (!hoy) return;
    listFichas(hoy, {
      termino: busqueda,
      tipo: tipo || undefined,
      desde: desde ? new Date(`${desde}T00:00:00`) : undefined,
      hasta: hasta ? new Date(`${hasta}T23:59:59`) : undefined,
    }).then(resultado => {
      setFichas(resultado);
      setPagina(1);
    });
  }, [hoy, busqueda, tipo, desde, hasta]);

  const total = fichas?.length ?? 0;
  const inicio = (pagina - 1) * TAMANO_PAGINA;
  const visibles = fichas?.slice(inicio, inicio + TAMANO_PAGINA) ?? [];

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
  const handleAbrirFicha = (id: string) => abrirParametros({ ficha: id });
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
