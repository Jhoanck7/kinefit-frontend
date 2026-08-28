"use client";

import { useState } from "react";

import { fechaISO } from "@/lib/formato";

import { TabReporte } from "../components";

function rangoAFechas(
  rango: string,
  customDesde?: string,
  customHasta?: string
): { fechaDesde?: string; fechaHasta?: string } {
  if (rango === "personalizado") {
    return { fechaDesde: customDesde, fechaHasta: customHasta };
  }

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
  const [vista, setVista] = useState<"dia" | "semana" | "mes">("dia");

  const hoyStr = fechaISO(new Date());
  const [customDesde, setCustomDesde] = useState(hoyStr);
  const [customHasta, setCustomHasta] = useState(hoyStr);

  const { fechaDesde, fechaHasta } = rangoAFechas(
    rangoFecha,
    customDesde,
    customHasta
  );

  return {
    tabActivo,
    rangoFecha,
    compararConAnterior,
    vista,
    customDesde,
    customHasta,
    fechaDesde,
    fechaHasta,
    actions: {
      setTabActivo,
      setRangoFecha,
      setCompararConAnterior,
      setVista,
      setCustomDesde,
      setCustomHasta,
    },
  };
};
