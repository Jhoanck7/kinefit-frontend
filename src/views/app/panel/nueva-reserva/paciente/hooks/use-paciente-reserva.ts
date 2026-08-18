"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useGetPacientePerfil, useGetPacientes } from "@/hooks/api";
import { PacienteResponse } from "@/models/responses";
import { useNuevaReservaStore } from "@/stores";

export const PASOS_NUEVA_RESERVA = [
  { etiqueta: "Servicio" },
  { etiqueta: "Horario" },
  { etiqueta: "Especialista" },
  { etiqueta: "Paciente" },
  { etiqueta: "Notas y resumen" },
];

export const usePacienteReserva = () => {
  const router = useRouter();
  const {
    fecha,
    hora,
    pacienteId,
    pacienteNombre,
    especialistaNombre,
    servicioNombre,
    setPaciente,
  } = useNuevaReservaStore();

  const [busqueda, setBusqueda] = useState("");
  const busquedaTrim = busqueda.trim();
  const { data: resultados = [] } = useGetPacientes(
    busquedaTrim || undefined,
    undefined,
    Boolean(busquedaTrim)
  );
  const buscado = Boolean(busquedaTrim);

  const [pacienteConfirmado, setPacienteConfirmado] =
    useState<PacienteResponse | null>(null);

  const pacienteIdNum =
    pacienteId && !pacienteId.startsWith("temp-")
      ? Number(pacienteId)
      : undefined;
  const { data: perfilCargado } = useGetPacientePerfil(
    pacienteIdNum ?? 0,
    Boolean(pacienteIdNum)
  );

  useEffect(() => {
    if (perfilCargado) setPacienteConfirmado(perfilCargado);
  }, [perfilCargado]);

  // Actions
  const handleBusquedaChange = (val: string) => {
    setBusqueda(val);
  };

  const handleSeleccionar = (paciente: PacienteResponse) => {
    setPaciente(String(paciente.id), `${paciente.nombre} ${paciente.apellido}`);
    setPacienteConfirmado(paciente);
    setBusqueda("");
  };

  const handleCambiarPaciente = () => {
    setPaciente("", "");
    setPacienteConfirmado(null);
  };

  const handleRegistrarNuevo = () =>
    router.push("/panel/pacientes/nuevo?retorno=/panel/nueva-reserva/paciente");
  const handleVolver = () => router.push("/panel/nueva-reserva/especialista");
  const handleCancelar = () => router.push("/panel/agenda");
  const handleContinuar = () => router.push("/panel/nueva-reserva/resumen");

  return {
    // Data
    fecha,
    hora,
    pacienteId,
    pacienteNombre,
    especialistaNombre,
    nombreServicio: servicioNombre,
    busqueda,
    resultados,
    buscado,
    pacienteConfirmado,

    // Actions
    actions: {
      handleBusquedaChange,
      handleSeleccionar,
      handleCambiarPaciente,
      handleRegistrarNuevo,
      handleVolver,
      handleCancelar,
      handleContinuar,
    },
  };
};
