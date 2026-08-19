import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CreateServicioRequest,
  UpdateServicioRequest,
} from "@/models/requests";
import { servicioService } from "@/services";

export const useGetServicios = (soloActivos = true) => {
  return useQuery({
    queryKey: ["servicios", soloActivos],
    queryFn: () =>
      servicioService.getAll(soloActivos).then(res => res.data.data),
  });
};

export const useCreateServicioMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateServicioRequest) =>
      servicioService.create(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
    },
  });
};

export const useUpdateServicioMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateServicioRequest }) =>
      servicioService.update(id, data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
    },
  });
};

export const useUpdateServicioEstadoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      servicioService.updateEstado(id, activo).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
    },
  });
};
