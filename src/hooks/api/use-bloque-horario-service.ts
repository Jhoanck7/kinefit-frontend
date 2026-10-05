import { useQuery } from "@tanstack/react-query";

import { bloqueHorarioService } from "@/services";

/** Obtiene los bloques horarios disponibles de un especialista en una fecha */
export const useGetBloquesDisponibles = (
  especialistaId: number,
  fecha: string,
  habilitado = true
) => {
  return useQuery({
    queryKey: ["bloques", especialistaId, fecha],
    queryFn: () =>
      bloqueHorarioService
        .getDisponibles(especialistaId, fecha)
        .then(res => res.data.data),
    enabled: habilitado && Boolean(especialistaId) && Boolean(fecha),
  });
};
