import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CreateCitaManualRequest,
  UpdateCitaEstadoRequest,
} from "@/models/requests";
import { citaService } from "@/services";

export const useGetCita = (id: number, habilitado = true) => {
  return useQuery({
    queryKey: ["citas", id],
    queryFn: () => citaService.getById(id).then(res => res.data.data),
    enabled: habilitado && Boolean(id),
  });
};

export const useGetImpactoCancelacion = (id: number, habilitado = true) => {
  return useQuery({
    queryKey: ["citas", id, "impacto-cancelacion"],
    queryFn: () =>
      citaService.getImpactoCancelacion(id).then(res => res.data.data),
    enabled: habilitado && Boolean(id),
  });
};

export const useCreateCitaManualMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCitaManualRequest) =>
      citaService.createManual(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agenda"] });
      queryClient.invalidateQueries({ queryKey: ["citas"] });
    },
  });
};

export const useUpdateCitaEstadoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCitaEstadoRequest }) =>
      citaService.updateEstado(id, data).then(res => res.data.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agenda"] });
      queryClient.invalidateQueries({ queryKey: ["citas", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["pacientes"] });
    },
  });
};
