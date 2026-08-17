"use client";

import { useEffect, useState } from "react";

import { useGetTerminales, useGetVentas } from "@/hooks/api";
import { fechaISO } from "@/lib/formato";

export const TAMANO_PAGINA = 8;

function rangoAFechas(rango: string): {
  fechaDesde?: string;
  fechaHasta?: string;
} {
  const hoy = new Date();
  const hastaStr = fechaISO(hoy);
  if (rango === "hoy") return { fechaDesde: hastaStr, fechaHasta: hastaStr };
  if (rango === "ayer") {
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    const ayerStr = fechaISO(ayer);
    return { fechaDesde: ayerStr, fechaHasta: ayerStr };
  }
  if (rango === "7dias") {
    const desde = new Date(hoy);
    desde.setDate(desde.getDate() - 7);
    return { fechaDesde: fechaISO(desde), fechaHasta: hastaStr };
  }
  if (rango === "30dias") {
    const desde = new Date(hoy);
    desde.setDate(desde.getDate() - 30);
    return { fechaDesde: fechaISO(desde), fechaHasta: hastaStr };
  }
  return {};
}

export const useVentas = () => {
  const [ventaSeleccionadaId, setVentaSeleccionadaId] = useState<number | null>(
    null
  );
  const [pagina, setPagina] = useState(1);

  // Modales
  const [modalNuevaVenta, setModalNuevaVenta] = useState(false);
  const [modalConfig, setModalConfig] = useState(false);

  // Filtros
  const [rangoFecha, setRangoFecha] = useState("30dias");
  const [metodoPago, setMetodoPago] = useState("todos");
  const [busquedaPaciente, setBusquedaPaciente] = useState("");

  useEffect(() => {
    setPagina(1);
  }, [rangoFecha, metodoPago]);

  const { fechaDesde, fechaHasta } = rangoAFechas(rangoFecha);
  const { data, isLoading, refetch } = useGetVentas({
    fechaDesde,
    fechaHasta,
    metodoPago: metodoPago !== "todos" ? metodoPago : undefined,
    page: pagina,
    pageSize: TAMANO_PAGINA,
  });
  const { data: terminales = [], refetch: refetchTerminales } =
    useGetTerminales();

  const ventas = data?.items ?? [];
  const total = data?.total ?? 0;

  const ventasFiltradas = ventas.filter(v => {
    if (busquedaPaciente.trim() === "") return true;
    return (v.pacienteNombre ?? "")
      .toLowerCase()
      .includes(busquedaPaciente.toLowerCase());
  });

  const ventaSeleccionada =
    ventas.find(v => v.id === ventaSeleccionadaId) ?? null;

  const inicio = (pagina - 1) * TAMANO_PAGINA;

  // Actions
  function handleExportar() {
    alert("Exportando Planilla de Ventas a formato Excel / CSV...");
  }

  function handleCambiarRango(v: string) {
    setRangoFecha(v);
  }

  function handleCambiarMetodoPago(v: string) {
    setMetodoPago(v);
  }

  function handlePaginaAnterior() {
    setPagina(p => Math.max(1, p - 1));
  }

  function handlePaginaSiguiente() {
    setPagina(p => (inicio + TAMANO_PAGINA < total ? p + 1 : p));
  }

  function handleCerrarConfig() {
    setModalConfig(false);
    refetchTerminales();
  }

  return {
    // Data
    ventasFiltradas,
    total,
    terminales,
    cargando: isLoading,
    ventaSeleccionada,
    pagina,
    inicio,
    modalNuevaVenta,
    modalConfig,
    rangoFecha,
    metodoPago,
    busquedaPaciente,

    // Actions
    actions: {
      setVentaSeleccionada: (id: number | null) => setVentaSeleccionadaId(id),
      setModalNuevaVenta,
      setModalConfig,
      setBusquedaPaciente,
      handleExportar,
      handleCambiarRango,
      handleCambiarMetodoPago,
      handlePaginaAnterior,
      handlePaginaSiguiente,
      handleCerrarConfig,
      cargarVentas: refetch,
    },
  };
};
