import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { FirmarDocumentoRequest } from "@/models/requests";
import { documentoPublicoService, documentoService } from "@/services";

export const useGetDocumentosPendientes = (citaId: number | null) => {
  return useQuery({
    queryKey: ["documentos", "pendientes", citaId],
    queryFn: () =>
      documentoService.getMisPendientes(citaId!).then(res => res.data.data),
    enabled: citaId !== null && citaId > 0,
  });
};

export const useGetDocumentoPropio = (id: number | null) => {
  return useQuery({
    queryKey: ["documentos", "propio", id],
    queryFn: () => documentoService.getPropio(id!).then(res => res.data.data),
    enabled: id !== null && id > 0,
  });
};

export const useFirmarDocumentoPropioMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FirmarDocumentoRequest }) =>
      documentoService.firmarPropio(id, data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos"] });
    },
  });
};

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
    mutationFn: (id: number) =>
      documentoService.firmarProfesional(id).then(res => res.data.data),
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

export const useReemitirTokenMutation = () => {
  return useMutation({
    mutationFn: (id: number) =>
      documentoService.reemitirToken(id).then(res => res.data.data),
  });
};

export const useGetTotalDocumentosPendientes = () => {
  return useQuery({
    queryKey: ["documentos", "pendientes-total"],
    queryFn: () => documentoService.getPendientes().then(res => res.data.data),
  });
};
