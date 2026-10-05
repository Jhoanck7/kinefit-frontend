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

/** Obtiene el listado de documentos según filtros */
export const useGetDocumentos = (filtros?: FiltrosDocumentos) => {
  return useQuery({
    queryKey: ["documentos", "listado", filtros],
    queryFn: () => documentoService.getAll(filtros).then(res => res.data.data),
  });
};

/** Obtiene el detalle de un documento */
export const useGetDocumentoDetalle = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ["documentos", "detalle", id],
    queryFn: () => documentoService.getById(id).then(res => res.data.data),
    enabled: enabled && Boolean(id),
  });
};

/** Obtiene el archivo de un documento para abrirlo */
export const useAbrirArchivoDocumentoMutation = () => {
  return useMutation({
    mutationFn: (id: number) =>
      documentoService.abrirArchivo(id).then(res => res.data),
  });
};

/** Descarga el archivo de un documento */
export const useDescargarArchivoDocumentoMutation = () => {
  return useMutation({
    mutationFn: (id: number) =>
      documentoService.descargarArchivo(id).then(res => res.data),
  });
};

/** Obtiene el historial de auditoría de un documento, paginado */
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

/** Crea una ficha clínica */
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

/** Adjunta un archivo como ficha clínica de una cita */
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

/** Actualiza el contenido de una ficha clínica */
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

/** Cierra una ficha clínica */
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

/** Obtiene el historial de documentos de un paciente */
export const useGetHistorialPorPaciente = (
  pacienteId: number,
  enabled = true
) => {
  return useQuery({
    queryKey: ["documentos", "historial-paciente", pacienteId],
    queryFn: () =>
      documentoService
        .getHistorialPorPaciente(pacienteId)
        .then(res => res.data.data),
    enabled: enabled && Boolean(pacienteId),
  });
};

/** Obtiene las fichas clínicas de un paciente */
export const useGetFichasPorPaciente = (pacienteId: number, enabled = true) => {
  return useQuery({
    queryKey: ["documentos", "fichas-paciente", pacienteId],
    queryFn: () =>
      documentoService
        .getFichasPorPaciente(pacienteId)
        .then(res => res.data.data),
    enabled: enabled && Boolean(pacienteId),
  });
};

/** Sube un adjunto a un documento */
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

/** Elimina un adjunto de un documento */
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

/** Descarga un adjunto de un documento */
export const useDescargarAdjuntoMutation = () => {
  return useMutation({
    mutationFn: (adjuntoId: number) =>
      documentoService.descargarAdjunto(adjuntoId).then(res => res.data),
  });
};

/** Envía la recomendación de una cita al paciente */
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

/** Adjunta un archivo como recomendación de una cita */
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

/** Obtiene los documentos asociados a una cita */
export const useGetDocumentosPorCita = (citaId: number | null) => {
  return useQuery({
    queryKey: ["documentos", "cita", citaId],
    queryFn: () =>
      documentoService.getPorCita(citaId!).then(res => res.data.data),
    enabled: citaId !== null && citaId > 0,
  });
};

/** Registra la firma de la profesional en un documento */
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

/** Sube el escaneo de un documento firmado en papel */
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

/** Reenvía el enlace de firma de un documento */
export const useReenviarTokenMutation = () => {
  return useMutation({
    mutationFn: (id: number) =>
      documentoService.reenviarToken(id).then(res => res.data.data),
  });
};

/** Reenvía un documento por correo */
export const useReenviarPorCorreoMutation = () => {
  return useMutation({
    mutationFn: (id: number) =>
      documentoService.reenviarPorCorreo(id).then(res => res.data.data),
  });
};

/** Obtiene un documento público mediante su token de firma */
export const useGetDocumentoPublico = (token: string | null) => {
  return useQuery({
    queryKey: ["documentos", "publico", token],
    queryFn: () =>
      documentoPublicoService.getPublico(token!).then(res => res.data.data),
    enabled: !!token,
    retry: false,
  });
};

/** Registra la firma del paciente en la vista pública de un documento */
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
