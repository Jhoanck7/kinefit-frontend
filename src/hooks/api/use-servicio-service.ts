import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CreateServicioRequest,
  ServicioDocumentoInput,
  UpdateServicioRequest,
} from "@/models/requests";
import { servicioService } from "@/services";

/** Obtiene el listado de servicios */
export const useGetServicios = (soloActivos = true) => {
  return useQuery({
    queryKey: ["servicios", soloActivos],
    queryFn: () =>
      servicioService.getAll(soloActivos).then(res => res.data.data),
  });
};

/** Crea un servicio nuevo */
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

/** Actualiza los datos de un servicio */
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

/** Activa o desactiva un servicio */
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

/** Actualiza el consentimiento y la recomendación estándar exigidos por un servicio */
export const useActualizarDocumentosServicioMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      documentos,
    }: {
      id: number;
      documentos: ServicioDocumentoInput[];
    }) =>
      servicioService
        .actualizarDocumentos(id, documentos)
        .then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
    },
  });
};
