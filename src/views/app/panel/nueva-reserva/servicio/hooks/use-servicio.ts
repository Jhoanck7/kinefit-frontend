"use client";

import { useRouter } from "next/navigation";

import { useGetServicios } from "@/hooks/api";
import { ServicioResponse } from "@/models/responses";
import { useNuevaReservaStore } from "@/stores";

import { PASOS_NUEVA_RESERVA } from "../../pasos";

export { PASOS_NUEVA_RESERVA };

/** Carga los servicios disponibles y gestiona la selección del paso Servicio de la nueva reserva */
export const useServicio = () => {
  const router = useRouter();
  const {
    fecha,
    hora,
    horaTermino,
    duracionMinutos,
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
    fecha,
    hora,
    horaTermino,
    duracionMinutos,
    pacienteNombre,
    especialistaNombre,
    servicioId,
    servicioNombre,
    servicios,
    isLoading,

    actions: {
      handleSeleccionar,
      handleCancelar,
      handleContinuar,
    },
  };
};
