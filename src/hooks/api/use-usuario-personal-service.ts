import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CreateUsuarioPersonalRequest,
  UpdateUsuarioPersonalRequest,
} from "@/models/requests";
import { usuarioPersonalService } from "@/services";

/** Obtiene el listado de usuarios del personal */
export const useGetUsuariosPersonal = (soloActivos?: boolean) => {
  return useQuery({
    queryKey: ["usuarios-personal", soloActivos],
    queryFn: () =>
      usuarioPersonalService
        .getAll(soloActivos)
        .then(res => res.data.data.items),
  });
};

/** Crea un usuario del personal */
export const useCreateUsuarioPersonalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUsuarioPersonalRequest) =>
      usuarioPersonalService.create(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios-personal"] });
    },
  });
};

/** Actualiza los datos de un usuario del personal */
export const useUpdateUsuarioPersonalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateUsuarioPersonalRequest;
    }) => usuarioPersonalService.update(id, data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios-personal"] });
    },
  });
};

/** Activa o desactiva un usuario del personal */
export const useUpdateUsuarioPersonalEstadoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      usuarioPersonalService
        .updateEstado(id, activo)
        .then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios-personal"] });
    },
  });
};
