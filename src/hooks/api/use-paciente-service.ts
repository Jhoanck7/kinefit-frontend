import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  CreatePacienteManualRequest,
  UpdatePacienteRequest,
} from "@/models/requests";
import { pacienteService } from "@/services";

export const useGetPacientes = (
  busqueda?: string,
  soloActivos?: boolean,
  enabled = true
) => {
  return useQuery({
    queryKey: ["pacientes", { busqueda, soloActivos }],
    queryFn: () =>
      pacienteService.getAll(busqueda, soloActivos).then(res => res.data.data),
    enabled,
    placeholderData: keepPreviousData,
  });
};

export const useGetPacientePerfil = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ["pacientes", "perfil", id],
    queryFn: () => pacienteService.getById(id).then(res => res.data.data),
    enabled: enabled && !!id,
  });
};

export const useCreatePacienteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePacienteManualRequest) =>
      pacienteService.create(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pacientes"] });
    },
  });
};

export const useUpdatePacienteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePacienteRequest }) =>
      pacienteService.update(id, data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pacientes"] });
    },
  });
};

export const useUpdatePacienteEstadoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      pacienteService.updateEstado(id, activo).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pacientes"] });
    },
  });
};
