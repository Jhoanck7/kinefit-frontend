import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { CreateFichaRequest } from "@/models/requests";
import { fichaService, FiltrosFichas } from "@/services";

export const useGetFichas = (filtros?: FiltrosFichas) => {
  return useQuery({
    queryKey: ["fichas", filtros],
    queryFn: () => fichaService.getAll(filtros).then(res => res.data.data),
  });
};

export const useGetFichaById = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ["fichas", "detalle", id],
    queryFn: () => fichaService.getById(id).then(res => res.data.data),
    enabled: enabled && Boolean(id),
  });
};

export const useGetHistorialPorPaciente = (
  pacienteId: number,
  enabled = true
) => {
  return useQuery({
    queryKey: ["fichas", "historial-paciente", pacienteId],
    queryFn: () =>
      fichaService
        .getHistorialPorPaciente(pacienteId)
        .then(res => res.data.data),
    enabled: enabled && Boolean(pacienteId),
  });
};

export const useCreateFichaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFichaRequest) =>
      fichaService.create(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fichas"] });
    },
  });
};

export const useSubirAdjuntoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fichaId, archivo }: { fichaId: number; archivo: File }) =>
      fichaService.subirAdjunto(fichaId, archivo).then(res => res.data.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["fichas", "detalle", variables.fichaId],
      });
    },
  });
};

export const useEliminarAdjuntoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adjuntoId: number) => fichaService.eliminarAdjunto(adjuntoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fichas"] });
    },
  });
};
