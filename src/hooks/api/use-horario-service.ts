import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CreateHorarioCentroRequest,
  CreatePlantillaHorarioRequest,
} from "@/models/requests";
import { horarioCentroService, plantillaHorarioService } from "@/services";

/** Obtiene la plantilla horaria de un especialista */
export const useGetPlantillaHorario = (
  especialistaId: number,
  enabled = true
) => {
  return useQuery({
    queryKey: ["plantilla-horario", especialistaId],
    queryFn: async () => {
      const res =
        await plantillaHorarioService.getByEspecialista(especialistaId);
      return res.data.data;
    },
    enabled: Boolean(especialistaId) && enabled,
  });
};

/** Crea o reemplaza la plantilla horaria de un especialista */
export const useCreatePlantillaHorarioMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlantillaHorarioRequest) =>
      plantillaHorarioService.create(data).then(res => res.data.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["plantilla-horario", variables.especialistaId],
      });
    },
  });
};

/** Elimina un bloque de la plantilla horaria */
export const useDeletePlantillaHorarioMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      plantillaHorarioService.delete(id).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plantilla-horario"] });
    },
  });
};

/** Obtiene el horario de atención del centro */
export const useGetHorarioCentro = (enabled = true) => {
  return useQuery({
    queryKey: ["horario-centro"],
    queryFn: async () => {
      const res = await horarioCentroService.getAll();
      return res.data.data;
    },
    enabled,
  });
};

/** Crea un bloque de horario del centro */
export const useCreateHorarioCentroMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHorarioCentroRequest) =>
      horarioCentroService.create(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["horario-centro"] });
    },
  });
};

/** Elimina un bloque de horario del centro */
export const useDeleteHorarioCentroMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      horarioCentroService.delete(id).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["horario-centro"] });
    },
  });
};
