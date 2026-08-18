import { useQuery } from "@tanstack/react-query";

import { disponibilidadService } from "@/services";

export const useGetFechasDisponibles = (
  servicioId: number,
  duracionMinutos: number,
  habilitado = true
) => {
  return useQuery({
    queryKey: ["disponibilidad", "fechas", servicioId, duracionMinutos],
    queryFn: () =>
      disponibilidadService
        .getFechas(servicioId, duracionMinutos)
        .then(res => res.data.data),
    enabled: habilitado && Boolean(servicioId),
  });
};

export const useGetHorasDisponibles = (
  servicioId: number,
  fecha: string,
  duracionMinutos: number,
  habilitado = true
) => {
  return useQuery({
    queryKey: ["disponibilidad", "horas", servicioId, fecha, duracionMinutos],
    queryFn: () =>
      disponibilidadService
        .getHoras(servicioId, fecha, duracionMinutos)
        .then(res => res.data.data),
    enabled: habilitado && Boolean(servicioId) && Boolean(fecha),
  });
};

export const useGetEspecialistasDisponibles = (
  servicioId: number,
  fecha: string,
  horaInicio: string,
  duracionMinutos: number,
  habilitado = true
) => {
  return useQuery({
    queryKey: [
      "disponibilidad",
      "especialistas",
      servicioId,
      fecha,
      horaInicio,
      duracionMinutos,
    ],
    queryFn: () =>
      disponibilidadService
        .getEspecialistas(servicioId, fecha, horaInicio, duracionMinutos)
        .then(res => res.data.data),
    enabled:
      habilitado &&
      Boolean(servicioId) &&
      Boolean(fecha) &&
      Boolean(horaInicio) &&
      duracionMinutos > 0,
  });
};
