"use client";

import { useRouter } from "next/navigation";

import { useGetServicios } from "@/hooks/api";
import { ServicioResponse } from "@/models/responses";
import { useNuevaReservaStore } from "@/stores";

import { PASOS_NUEVA_RESERVA } from "../../pasos";

export { PASOS_NUEVA_RESERVA };

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
    setServicio(servicio.id, servicio.nombre);
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
