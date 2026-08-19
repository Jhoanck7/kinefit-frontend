import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { CreateEmpresaRequest, UpdateEmpresaRequest } from "@/models/requests";
import { empresaService } from "@/services";

export const useGetEmpresas = (soloActivos = true) => {
  return useQuery({
    queryKey: ["empresas", soloActivos],
    queryFn: () =>
      empresaService.getAll(soloActivos).then(res => res.data.data),
  });
};

export const useCreateEmpresaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmpresaRequest) =>
      empresaService.create(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
    },
  });
};

export const useUpdateEmpresaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmpresaRequest }) =>
      empresaService.update(id, data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
    },
  });
};

export const useUpdateEmpresaEstadoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      empresaService.updateEstado(id, activo).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
    },
  });
};
