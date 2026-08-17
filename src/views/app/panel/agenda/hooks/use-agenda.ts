"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useGetEspecialistas } from "@/hooks/api";
import { useHoyPanel } from "@/hooks/common";
import {
  BloqueoResuelto,
  CitaResuelta,
  getAgendaDia,
} from "@/lib/panel/data/citas";
import { fechaISO } from "@/lib/formato";
import { generarRejillaDia } from "@/lib/horario";

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
  const [agendaData, setAgendaData] = useState<
    Record<string, { citas: CitaResuelta[]; bloqueos: BloqueoResuelto[] }>
  >({});
  const [modalBloqueos, setModalBloqueos] = useState(false);

  const fetchAgendaData = useCallback(async () => {
    if (!hoy || especialistas.length === 0) return null;

    const resultados = await Promise.all(
      especialistas.map(async esp => {
        const res = await getAgendaDia(esp.id, dia, hoy);
        return { espId: esp.id, data: res };
      })
    );

    const mapa: Record<
      string,
      { citas: CitaResuelta[]; bloqueos: BloqueoResuelto[] }
    > = {};
    resultados.forEach(r => {
      mapa[r.espId] = r.data;
    });
    return mapa;
  }, [dia, hoy, especialistas]);

  const cargarAgenda = useCallback(() => {
    fetchAgendaData()
      .then(mapa => {
        if (mapa) setAgendaData(mapa);
      })
      .catch(err => console.error("Error al cargar la agenda:", err));
  }, [fetchAgendaData]);

  useEffect(() => {
    fetchAgendaData()
      .then(mapa => {
        if (mapa) setAgendaData(mapa);
      })
      .catch(err => console.error("Error al cargar la agenda:", err));
  }, [fetchAgendaData]);

  useEffect(() => {
    if (!hoy) return;
    Promise.resolve().then(() => {
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
    });
  }, [dia, hoy]);

  const rejilla = generarRejillaDia(dia.getDay() as DiaSemanaId);

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
