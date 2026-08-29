import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CreateFormatoFichaRequest,
  UpdateFormatoFichaRequest,
} from "@/models/requests";
import { formatoService } from "@/services";

export const useGetFormatos = (soloActivos = true) => {
  return useQuery({
    queryKey: ["formatos", soloActivos],
    queryFn: () =>
      formatoService.getAll(soloActivos).then(res => res.data.data),
  });
};

export const useGetFormatoById = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ["formatos", "detalle", id],
    queryFn: () => formatoService.getById(id).then(res => res.data.data),
    enabled: enabled && id > 0,
  });
};

export const useCreateFormatoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFormatoFichaRequest) =>
      formatoService.create(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formatos"] });
    },
  });
};

export const useUpdateFormatoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      confirmar,
    }: {
      id: number;
      data: UpdateFormatoFichaRequest;
      confirmar?: boolean;
    }) => formatoService.update(id, data, confirmar).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formatos"] });
    },
  });
};

export const useUpdateFormatoEstadoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      formatoService.updateEstado(id, activo).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formatos"] });
    },
  });
};

export const useImportarFormatoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      archivo,
      nombre,
      tipo,
    }: {
      archivo: File;
      nombre: string;
      tipo: string;
    }) =>
      formatoService.importar(archivo, nombre, tipo).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formatos"] });
    },
  });
};
