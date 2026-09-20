import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CreateFichaRequest,
  EnviarRecomendacionRequest,
  FirmarDocumentoRequest,
  FirmarProfesionalRequest,
  UpdateFichaRequest,
} from "@/models/requests";
import {
  documentoPublicoService,
  documentoService,
  FiltrosDocumentos,
} from "@/services";

// Listado y detalle unificados
export const useGetDocumentos = (filtros?: FiltrosDocumentos) => {
  return useQuery({
    queryKey: ["documentos", "listado", filtros],
    queryFn: () => documentoService.getAll(filtros).then(res => res.data.data),
  });
};

export const useGetDocumentoDetalle = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ["documentos", "detalle", id],
    queryFn: () => documentoService.getById(id).then(res => res.data.data),
    enabled: enabled && Boolean(id),
  });
};

export const useAbrirArchivoDocumentoMutation = () => {
  return useMutation({
    mutationFn: (id: number) =>
      documentoService.abrirArchivo(id).then(res => res.data),
  });
};

export const useDescargarArchivoDocumentoMutation = () => {
  return useMutation({
    mutationFn: (id: number) =>
      documentoService.descargarArchivo(id).then(res => res.data),
  });
};

export const useGetAuditoriaDocumento = (
  id: number,
  page = 1,
  pageSize = 20,
  enabled = true
) => {
  return useQuery({
    queryKey: ["documentos", "auditoria", id, page, pageSize],
    queryFn: () =>
      documentoService
        .getAuditoria(id, page, pageSize)
        .then(res => res.data.data),
    enabled: enabled && Boolean(id),
  });
};

// Fichas (EC3)
export const useCreateFichaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFichaRequest) =>
      documentoService.crearFicha(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos"] });
    },
  });
};

export const useAdjuntarFichaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      citaId,
      archivo,
      nombre,
    }: {
      citaId: number;
      archivo: File;
      nombre?: string;
    }) =>
      documentoService
        .adjuntarFicha(citaId, archivo, nombre)
        .then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos"] });
    },
  });
};

export const useActualizarFichaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFichaRequest }) =>
      documentoService.actualizarFicha(id, data).then(res => res.data.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["documentos", "detalle", variables.id],
      });
    },
  });
};

export const useCerrarFichaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      documentoService.cerrarFicha(id).then(res => res.data.data),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: ["documentos", "detalle", id],
      });
      queryClient.invalidateQueries({ queryKey: ["documentos", "listado"] });
    },
  });
};

export const useGetHistorialPorPaciente = (
  pacienteId: number,
  enabled = true,
  tipo?: string
) => {
  return useQuery({
    queryKey: ["documentos", "historial-paciente", pacienteId, tipo],
    queryFn: () =>
      documentoService
        .getHistorialPorPaciente(pacienteId, tipo)
        .then(res => res.data.data),
    enabled: enabled && Boolean(pacienteId),
  });
};

// Adjuntos
export const useSubirAdjuntoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      documentoId,
      archivo,
    }: {
      documentoId: number;
      archivo: File;
    }) =>
      documentoService
        .subirAdjunto(documentoId, archivo)
        .then(res => res.data.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["documentos", "detalle", variables.documentoId],
      });
    },
  });
};

export const useEliminarAdjuntoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adjuntoId: number) =>
      documentoService.eliminarAdjunto(adjuntoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos"] });
    },
  });
};

export const useDescargarAdjuntoMutation = () => {
  return useMutation({
    mutationFn: (adjuntoId: number) =>
      documentoService.descargarAdjunto(adjuntoId).then(res => res.data),
  });
};

// Recomendaciones (EC4)
export const useEnviarRecomendacionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      citaId,
      data,
    }: {
      citaId: number;
      data: EnviarRecomendacionRequest;
    }) =>
      documentoService.enviarRecomendacion(citaId, data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos"] });
    },
  });
};

export const useAdjuntarRecomendacionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      citaId,
      archivo,
      nombre,
    }: {
      citaId: number;
      archivo: File;
      nombre?: string;
    }) =>
      documentoService
        .adjuntarRecomendacion(citaId, archivo, nombre)
        .then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos"] });
    },
  });
};

// Pestaña de documentos del detalle de la cita (AC2 / AC3 / EC2)
export const useGetDocumentosPorCita = (citaId: number | null) => {
  return useQuery({
    queryKey: ["documentos", "cita", citaId],
    queryFn: () =>
      documentoService.getPorCita(citaId!).then(res => res.data.data),
    enabled: citaId !== null && citaId > 0,
  });
};

export const useFirmarProfesionalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: FirmarProfesionalRequest;
    }) =>
      documentoService.firmarProfesional(id, data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos"] });
    },
  });
};

export const useSubirEscaneoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, archivo }: { id: number; archivo: File }) =>
      documentoService.subirEscaneo(id, archivo).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos"] });
    },
  });
};

export const useReenviarTokenMutation = () => {
  return useMutation({
    mutationFn: (id: number) =>
      documentoService.reenviarToken(id).then(res => res.data.data),
  });
};

export const useReenviarPorCorreoMutation = () => {
  return useMutation({
    mutationFn: (id: number) =>
      documentoService.reenviarPorCorreo(id).then(res => res.data.data),
  });
};

// Vista pública de firma
export const useGetDocumentoPublico = (token: string | null) => {
  return useQuery({
    queryKey: ["documentos", "publico", token],
    queryFn: () =>
      documentoPublicoService.getPublico(token!).then(res => res.data.data),
    enabled: !!token,
    retry: false,
  });
};

export const useFirmarDocumentoPublicoMutation = () => {
  return useMutation({
    mutationFn: ({
      token,
      data,
    }: {
      token: string;
      data: FirmarDocumentoRequest;
    }) =>
      documentoPublicoService
        .firmarPublico(token, data)
        .then(res => res.data.data),
  });
};
