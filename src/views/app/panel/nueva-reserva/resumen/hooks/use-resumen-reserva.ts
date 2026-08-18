"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { formatearFechaExtensa } from "@/lib/formato";
import { citaService } from "@/services";
import { useNuevaReservaStore } from "@/stores";

export const PASOS_NUEVA_RESERVA = [
  { etiqueta: "Servicio" },
  { etiqueta: "Horario" },
  { etiqueta: "Especialista" },
  { etiqueta: "Paciente" },
  { etiqueta: "Notas y resumen" },
];

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
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      !servicioId ||
      !bloqueHorarioIds ||
      bloqueHorarioIds.length === 0
    ) {
      setErrorMsg("Faltan datos obligatorios para registrar la reserva.");
      return;
    }

    setGuardando(true);
    setErrorMsg(null);

    try {
      const numPacienteId = parseInt(pacienteId.replace(/\D/g, ""), 10) || 1;
      const numEspecialistaId = especialistaId
        ? parseInt(especialistaId.replace(/\D/g, ""), 10) || 1
        : 1;

      await citaService.createManual({
        pacienteId: numPacienteId,
        especialistaId: numEspecialistaId,
        servicioId,
        bloqueHorarioIds,
        notaPaciente: notaPaciente || undefined,
        notaInterna: notaInterna || undefined,
      });

      router.push("/panel/nueva-reserva/listo");
    } catch (err: unknown) {
      console.error("Error al registrar la cita en Backend:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Ocurrió un error al guardar la cita.";
      setErrorMsg(msg);
    } finally {
      setGuardando(false);
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
    guardando,
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
