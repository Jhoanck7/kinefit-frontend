import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CreatePlantillaConsentimientoRequest,
  CreatePlantillaFichaRequest,
  CreatePlantillaRecomendacionRequest,
  UpdatePlantillaRequest,
} from "@/models/requests";
import { plantillaService } from "@/services";

/** Obtiene el listado de plantillas de documentos */
export const useGetPlantillas = (soloActivos = true) => {
  return useQuery({
    queryKey: ["plantillas", soloActivos],
    queryFn: () =>
      plantillaService.getAll(soloActivos).then(res => res.data.data),
  });
};

/** Obtiene el detalle de una plantilla */
export const useGetPlantillaById = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ["plantillas", "detalle", id],
    queryFn: () => plantillaService.getById(id).then(res => res.data.data),
    enabled: enabled && id > 0,
  });
};

/** Crea una plantilla de ficha clínica */
export const useCrearPlantillaFichaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlantillaFichaRequest) =>
      plantillaService.crearFicha(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plantillas"] });
    },
  });
};

/** Crea una plantilla de consentimiento */
export const useCrearPlantillaConsentimientoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlantillaConsentimientoRequest) =>
      plantillaService.crearConsentimiento(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plantillas"] });
    },
  });
};

/** Importa un PDF externo como plantilla de consentimiento */
export const useImportarPlantillaConsentimientoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      archivo,
      nombre,
      requiereFirmaPaciente,
      requiereFirmaProfesional,
    }: {
      archivo: File;
      nombre: string;
      requiereFirmaPaciente: boolean;
      requiereFirmaProfesional: boolean;
    }) =>
      plantillaService
        .importarConsentimiento(
          archivo,
          nombre,
          requiereFirmaPaciente,
          requiereFirmaProfesional
        )
        .then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plantillas"] });
    },
  });
};

/** Crea una plantilla de recomendación */
export const useCrearPlantillaRecomendacionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlantillaRecomendacionRequest) =>
      plantillaService.crearRecomendacion(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plantillas"] });
    },
  });
};

/** Importa un PDF externo como plantilla de recomendación */
export const useImportarPlantillaRecomendacionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ archivo, nombre }: { archivo: File; nombre: string }) =>
      plantillaService
        .importarRecomendacion(archivo, nombre)
        .then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plantillas"] });
    },
  });
};

/** Actualiza una plantilla existente */
export const useUpdatePlantillaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      confirmar,
    }: {
      id: number;
      data: UpdatePlantillaRequest;
      confirmar?: boolean;
    }) =>
      plantillaService.update(id, data, confirmar).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plantillas"] });
    },
  });
};

/** Elimina una plantilla sin documentos generados */
export const useEliminarPlantillaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => plantillaService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plantillas"] });
    },
  });
};

/** Activa o desactiva una plantilla */
export const useUpdatePlantillaEstadoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      plantillaService.updateEstado(id, activo).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plantillas"] });
    },
  });
};

/** Obtiene el archivo de una plantilla para abrirlo */
export const useAbrirArchivoPlantillaMutation = () => {
  return useMutation({
    mutationFn: (id: number) =>
      plantillaService.abrirArchivo(id).then(res => res.data),
  });
};
