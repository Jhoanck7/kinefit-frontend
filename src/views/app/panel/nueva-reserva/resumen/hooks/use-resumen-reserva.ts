"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCreateCitaManualMutation } from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import { formatearFechaExtensa } from "@/lib/formato";
import { useNuevaReservaStore } from "@/stores";

import { PASOS_NUEVA_RESERVA } from "../../pasos";

export { PASOS_NUEVA_RESERVA };

export const useResumenReserva = () => {
  const router = useRouter();
  const {
    fecha,
    hora,
    bloqueHorarioIds,
    pacienteId,
    pacienteNombre,
    especialistaId,
    especialistaNombre,
    servicioId,
    servicioNombre,
    notaPaciente,
    notaInterna,
    setNotaPaciente,
    setNotaInterna,
    reiniciar,
  } = useNuevaReservaStore();

  const [confirmarDescarte, setConfirmarDescarte] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const crearCitaMutation = useCreateCitaManualMutation();

  const filasResumen = [
    {
      etiqueta: "Servicio",
      valor: servicioNombre ?? undefined,
      editar: "/panel/nueva-reserva/servicio",
    },
    {
      etiqueta: "Fecha",
      valor: fecha ? formatearFechaExtensa(fecha) : undefined,
      editar: "/panel/nueva-reserva/horario",
    },
    {
      etiqueta: "Horario",
      valor: hora || undefined,
      editar: "/panel/nueva-reserva/horario",
    },
    {
      etiqueta: "Especialista",
      valor: especialistaNombre || undefined,
      editar: "/panel/nueva-reserva/especialista",
    },
    {
      etiqueta: "Paciente",
      valor: pacienteNombre || undefined,
      editar: "/panel/nueva-reserva/paciente",
    },
  ];

  // Actions
  const handleConfirmarReserva = async () => {
    if (
      !fecha ||
      !hora ||
      !pacienteId ||
      !especialistaId ||
      !servicioId ||
      !bloqueHorarioIds ||
      bloqueHorarioIds.length === 0
    ) {
      setErrorMsg("Faltan datos obligatorios para registrar la reserva.");
      return;
    }

    setErrorMsg(null);

    try {
      await crearCitaMutation.mutateAsync({
        pacienteId,
        especialistaId,
        servicioId,
        bloqueHorarioIds,
        notaPaciente: notaPaciente || undefined,
        notaInterna: notaInterna || undefined,
      });

      router.push("/panel/nueva-reserva/listo");
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  };

  const handleAbrirConfirmarDescarte = () => setConfirmarDescarte(true);
  const handleCerrarConfirmarDescarte = () => setConfirmarDescarte(false);
  const handleVolver = () => router.push("/panel/nueva-reserva/paciente");
  const handleDescartar = () => {
    reiniciar();
    router.push("/panel/agenda");
  };

  return {
    // Data
    notaPaciente,
    notaInterna,
    filasResumen,
    confirmarDescarte,
    guardando: crearCitaMutation.isPending,
    errorMsg,

    // Actions
    actions: {
      setNotaPaciente,
      setNotaInterna,
      handleConfirmarReserva,
      handleAbrirConfirmarDescarte,
      handleCerrarConfirmarDescarte,
      handleVolver,
      handleDescartar,
    },
  };
};
