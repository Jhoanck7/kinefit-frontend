"use client";

import { useState } from "react";

import { TabReporte } from "@/components/panel/reportes/ReportesTabSwitcher";
import { fechaISO } from "@/lib/panel/domain/formato";

function rangoAFechas(rango: string): {
  fechaDesde?: string;
  fechaHasta?: string;
} {
  const hoy = new Date();
  const hoyStr = fechaISO(hoy);

  if (rango === "hoy") return { fechaDesde: hoyStr, fechaHasta: hoyStr };

  if (rango === "ayer") {
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    const ayerStr = fechaISO(ayer);
    return { fechaDesde: ayerStr, fechaHasta: ayerStr };
  }

  if (rango === "7dias") {
    const desde = new Date(hoy);
    desde.setDate(desde.getDate() - 7);
    return { fechaDesde: fechaISO(desde), fechaHasta: hoyStr };
  }

  if (rango === "30dias") {
    const desde = new Date(hoy);
    desde.setDate(desde.getDate() - 30);
    return { fechaDesde: fechaISO(desde), fechaHasta: hoyStr };
  }

  if (rango === "mesActual") {
    const desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    return { fechaDesde: fechaISO(desde), fechaHasta: hoyStr };
  }

  if (rango === "mesAnterior") {
    const desde = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const hasta = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    return { fechaDesde: fechaISO(desde), fechaHasta: fechaISO(hasta) };
  }

  return {};
}

export const useReportes = () => {
  const [tabActivo, setTabActivo] = useState<TabReporte>("reservas");
  const [rangoFecha, setRangoFecha] = useState("30dias");
  const [compararConAnterior, setCompararConAnterior] = useState(true);

  const { fechaDesde, fechaHasta } = rangoAFechas(rangoFecha);

  return {
    // Data
    tabActivo,
    rangoFecha,
    compararConAnterior,
    fechaDesde,
    fechaHasta,

    // Actions
    actions: {
      setTabActivo,
      setRangoFecha,
      setCompararConAnterior,
    },
  };
};
