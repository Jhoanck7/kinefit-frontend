import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CreateHorarioCentroRequest,
  CreatePlantillaHorarioRequest,
} from "@/models/requests";
import { horarioCentroService, plantillaHorarioService } from "@/services";

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
