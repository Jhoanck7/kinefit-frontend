"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useGetAgenda, useGetEspecialistas } from "@/hooks/api";
import { useHoyPanel } from "@/hooks/common";
import { fechaISO } from "@/lib/formato";
import { generarRejillaDia } from "@/lib/horario";
import { BloqueAgendaResponse } from "@/models/responses";

export const useAgenda = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hoy = useHoyPanel();

  const fechaParam = searchParams.get("fecha");
  const citaId = searchParams.get("cita");
  const cancelando = searchParams.get("cancelar") === "1";

  const [dia, setDia] = useState<Date>(() => {
    if (fechaParam) {
      const [y, m, d] = fechaParam.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    return hoy ?? new Date();
  });

  const [horaActual, setHoraActual] = useState<string | null>(null);
  const { data: especialistas = [] } = useGetEspecialistas(undefined, true);
  const [especialistaSeleccionado, setEspecialistaSeleccionado] =
    useState<string>("todas");
  const [modalBloqueos, setModalBloqueos] = useState(false);

  const especialistaIds = especialistas.map(esp => esp.id);
  const fechaIsoDia = fechaISO(dia);
  const { data: bloquesAgenda = [], refetch: refetchAgenda } = useGetAgenda(
    especialistaIds,
    fechaIsoDia,
    fechaIsoDia,
    especialistaIds.length > 0
  );

  const agendaData: Record<number, BloqueAgendaResponse[]> = {};
  bloquesAgenda.forEach(bloque => {
    (agendaData[bloque.especialistaId] ??= []).push(bloque);
  });

  const cargarAgenda = () => {
    refetchAgenda();
  };

  useEffect(() => {
    if (!hoy) return;
    const ahora = new Date();
    const esMismoDia =
      ahora.getFullYear() === dia.getFullYear() &&
      ahora.getMonth() === dia.getMonth() &&
      ahora.getDate() === dia.getDate();

    if (esMismoDia) {
      const h = ahora.getHours().toString().padStart(2, "0");
      const m = ahora.getMinutes().toString().padStart(2, "0");
      setHoraActual(`${h}:${m}`);
    } else {
      setHoraActual(null);
    }
  }, [dia, hoy]);

  const rejilla = generarRejillaDia(dia.getDay());

  const especialistasAMostrar =
    especialistaSeleccionado === "todas"
      ? especialistas
      : especialistas.filter(e => String(e.id) === especialistaSeleccionado);

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

  const handleIrADia = (delta: number) => {
    const nueva = new Date(dia);
    nueva.setDate(nueva.getDate() + delta);
    setDia(nueva);
    abrirParametros({ fecha: fechaISO(nueva) });
  };

  const handleIrAHoy = () => {
    if (!hoy) return;
    setDia(hoy);
    abrirParametros({ fecha: fechaISO(hoy) });
  };

  const handleCambiarFecha = (valor: string) => {
    if (!valor) return;
    const [y, m, d] = valor.split("-").map(Number);
    setDia(new Date(y, m - 1, d));
  };

  const handleAbrirBloqueos = () => setModalBloqueos(true);
  const handleCerrarBloqueos = () => setModalBloqueos(false);
  const handleNuevaReserva = () => router.push("/panel/nueva-reserva/servicio");
  const handleSeleccionarCita = (id: string) => abrirParametros({ cita: id });
  const handleCerrarDetalleCita = () => abrirParametros({ cita: undefined });
  const handleSolicitarCancelacion = () =>
    abrirParametros({ cita: citaId ?? undefined, cancelar: "1" });
  const handleVolverDeCancelar = () =>
    abrirParametros({ cita: citaId ?? undefined, cancelar: undefined });
  const handleCancelacionConfirmada = () => {
    abrirParametros({ cita: undefined, cancelar: undefined });
    cargarAgenda();
  };

  return {
    // Data
    hoy,
    dia,
    horaActual,
    especialistas,
    especialistaSeleccionado,
    especialistasAMostrar,
    agendaData,
    rejilla,
    modalBloqueos,
    citaId,
    cancelando,

    // Actions
    actions: {
      setEspecialistaSeleccionado,
      handleIrADia,
      handleIrAHoy,
      handleCambiarFecha,
      handleAbrirBloqueos,
      handleCerrarBloqueos,
      handleNuevaReserva,
      handleSeleccionarCita,
      handleCerrarDetalleCita,
      handleSolicitarCancelacion,
      handleVolverDeCancelar,
      handleCancelacionConfirmada,
      cargarAgenda,
    },
  };
};
