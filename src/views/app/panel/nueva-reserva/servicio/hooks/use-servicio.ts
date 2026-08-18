"use client";

import { useRouter } from "next/navigation";

import { useGetServicios } from "@/hooks/api";
import { ServicioResponse } from "@/models/responses";
import { useNuevaReservaStore } from "@/stores";

export const PASOS_NUEVA_RESERVA = [
  { etiqueta: "Servicio" },
  { etiqueta: "Horario" },
  { etiqueta: "Especialista" },
  { etiqueta: "Paciente" },
  { etiqueta: "Notas y resumen" },
];

export const useServicio = () => {
  const router = useRouter();
  const {
    fecha,
    hora,
    pacienteNombre,
    especialistaNombre,
    servicioId,
    servicioNombre,
    setServicio,
  } = useNuevaReservaStore();

  const { data: servicios = [], isLoading } = useGetServicios();

  const handleSeleccionar = (servicio: ServicioResponse) =>
    setServicio(servicio.id, servicio.nombre, servicio.duracionMinutos);
  const handleCancelar = () => router.push("/panel/agenda");
  const handleContinuar = () => router.push("/panel/nueva-reserva/horario");

  return {
    // Data
    fecha,
    hora,
    pacienteNombre,
    especialistaNombre,
    servicioId,
    servicioNombre,
    servicios,
    isLoading,

    // Actions
    actions: {
      handleSeleccionar,
      handleCancelar,
      handleContinuar,
    },
  };
};
