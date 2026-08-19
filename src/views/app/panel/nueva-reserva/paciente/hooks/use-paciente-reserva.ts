"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useGetPacientePerfil, useGetPacientes } from "@/hooks/api";
import { useDebounce } from "@/hooks/common";
import { PacienteResponse } from "@/models/responses";
import { useNuevaReservaStore } from "@/stores";

import { PASOS_NUEVA_RESERVA } from "../../pasos";

export { PASOS_NUEVA_RESERVA };

const MIN_CARACTERES_BUSQUEDA = 2;

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

  const { data: perfilCargado } = useGetPacientePerfil(
    pacienteId ?? 0,
    Boolean(pacienteId)
  );

  useEffect(() => {
    if (perfilCargado) setPacienteConfirmado(perfilCargado);
  }, [perfilCargado]);

  // Actions
  const handleBusquedaChange = (val: string) => {
    setBusqueda(val);
  };

  const handleSeleccionar = (paciente: PacienteResponse) => {
    setPaciente(paciente.id, `${paciente.nombre} ${paciente.apellido}`);
    setPacienteConfirmado(paciente);
    setBusqueda("");
  };

  const handleCambiarPaciente = () => {
    setPaciente(null, "");
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
