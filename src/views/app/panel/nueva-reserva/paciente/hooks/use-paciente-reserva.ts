"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useGetPacientePerfil, useGetPacientes } from "@/hooks/api";
import { useDebounce } from "@/hooks/common";
import { PacienteResponse } from "@/models/responses";
import { useNuevaReservaStore } from "@/stores";

const MIN_CARACTERES_BUSQUEDA = 2;

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
  const busquedaDebounced = useDebounce(busqueda.trim(), 300);
  const busquedaValida = busquedaDebounced.length >= MIN_CARACTERES_BUSQUEDA;
  const { data: resultados = [], isFetching: buscando } = useGetPacientes(
    busquedaValida ? busquedaDebounced : undefined,
    undefined,
    busquedaValida
  );
  const buscado = busquedaValida;

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
    buscando,
    mostrarHintMinimo:
      busqueda.trim().length > 0 &&
      busqueda.trim().length < MIN_CARACTERES_BUSQUEDA,
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
