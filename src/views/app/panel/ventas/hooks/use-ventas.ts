"use client";

import { useEffect, useState } from "react";

import {
  listTerminales,
  listVentas,
  TerminalResuelto,
  VentaResuelta,
} from "@/lib/panel/data/ventas";
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
  const [ventas, setVentas] = useState<VentaResuelta[]>([]);
  const [total, setTotal] = useState(0);
  const [terminales, setTerminales] = useState<TerminalResuelto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [ventaSeleccionada, setVentaSeleccionada] =
    useState<VentaResuelta | null>(null);
  const [pagina, setPagina] = useState(1);

  // Modales
  const [modalNuevaVenta, setModalNuevaVenta] = useState(false);
  const [modalConfig, setModalConfig] = useState(false);

  // Filtros
  const [rangoFecha, setRangoFecha] = useState("30dias");
  const [metodoPago, setMetodoPago] = useState("todos");
  const [busquedaPaciente, setBusquedaPaciente] = useState("");

  function fetchVentas() {
    const { fechaDesde, fechaHasta } = rangoAFechas(rangoFecha);
    return listVentas({
      fechaDesde,
      fechaHasta,
      metodoPago: metodoPago !== "todos" ? metodoPago : undefined,
      page: pagina,
      pageSize: TAMANO_PAGINA,
    });
  }

  function cargarVentas() {
    fetchVentas().then(res => {
      setVentas(res.ventas);
      setTotal(res.total);
      setCargando(false);
    });
  }

  useEffect(() => {
    fetchVentas().then(res => {
      setVentas(res.ventas);
      setTotal(res.total);
      setCargando(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangoFecha, metodoPago, pagina]);

  useEffect(() => {
    listTerminales().then(setTerminales);
  }, []);

  const ventasFiltradas = ventas.filter(v => {
    if (busquedaPaciente.trim() === "") return true;
    return v.pacienteNombre
      .toLowerCase()
      .includes(busquedaPaciente.toLowerCase());
  });

  const inicio = (pagina - 1) * TAMANO_PAGINA;

  // Actions
  function handleExportar() {
    alert("Exportando Planilla de Ventas a formato Excel / CSV...");
  }

  function handleCambiarRango(v: string) {
    setCargando(true);
    setRangoFecha(v);
    setPagina(1);
  }

  function handleCambiarMetodoPago(v: string) {
    setCargando(true);
    setMetodoPago(v);
    setPagina(1);
  }

  function handlePaginaAnterior() {
    setCargando(true);
    setPagina(p => Math.max(1, p - 1));
  }

  function handlePaginaSiguiente() {
    setCargando(true);
    setPagina(p => (inicio + TAMANO_PAGINA < total ? p + 1 : p));
  }

  function handleCerrarConfig() {
    setModalConfig(false);
    listTerminales().then(setTerminales);
  }

  return {
    // Data
    ventasFiltradas,
    total,
    terminales,
    cargando,
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
      setVentaSeleccionada,
      setModalNuevaVenta,
      setModalConfig,
      setBusquedaPaciente,
      handleExportar,
      handleCambiarRango,
      handleCambiarMetodoPago,
      handlePaginaAnterior,
      handlePaginaSiguiente,
      handleCerrarConfig,
      cargarVentas,
    },
  };
};
