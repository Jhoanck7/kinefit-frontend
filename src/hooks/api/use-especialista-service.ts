import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CreateEspecialistaRequest,
  UpdateEspecialistaRequest,
} from "@/models/requests";
import { especialistaService } from "@/services";

const especialistasKey = (servicioId?: number, soloActivos = false) =>
  ["especialistas", { servicioId, soloActivos }] as const;

export const useGetEspecialistas = (
  servicioId?: number,
  soloActivos = false
) => {
  return useQuery({
    queryKey: especialistasKey(servicioId, soloActivos),
    queryFn: async () => {
      const response = await especialistaService.getEspecialistas(
        servicioId,
        soloActivos
      );
      return response.data.data;
    },
  });
};

export const useCreateEspecialistaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEspecialistaRequest) =>
      especialistaService.createEspecialista(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["especialistas"] });
    },
  });
};

export const useUpdateEspecialistaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateEspecialistaRequest;
    }) =>
      especialistaService
        .updateEspecialista(id, data)
        .then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["especialistas"] });
    },
  });
};

export const useUpdateEspecialistaEstadoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      especialistaService.updateEstado(id, activo).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["especialistas"] });
    },
  });
};

export const useDeleteEspecialistaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => especialistaService.deleteEspecialista(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["especialistas"] });
    },
  });
};
