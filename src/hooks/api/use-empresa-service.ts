import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { CreateEmpresaRequest, UpdateEmpresaRequest } from "@/models/requests";
import { empresaService } from "@/services";

/** Obtiene el listado de empresas con convenio */
export const useGetEmpresas = (soloActivos = true) => {
  return useQuery({
    queryKey: ["empresas", soloActivos],
    queryFn: () =>
      empresaService.getAll(soloActivos).then(res => res.data.data),
  });
};

/** Obtiene las empresas con convenio visibles en el sitio público */
export const useGetEmpresasPublico = (token: string | null) => {
  return useQuery({
    queryKey: ["empresas-publico", token],
    queryFn: () =>
      empresaService.getPublico(token as string).then(res => res.data.data),
    enabled: Boolean(token),
  });
};

/** Crea una empresa con convenio */
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

/** Actualiza los datos de una empresa */
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

/** Activa o desactiva una empresa */
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
