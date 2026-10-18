import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CreateRepartoProfesionalRequest,
  CreateTasaImpuestoRequest,
  CreateTerminalPagoRequest,
  CreateVentaRequest,
} from "@/models/requests";
import { FiltrosVentas, ventaService } from "@/services";

/** Obtiene el listado de ventas según filtros */
export const useGetVentas = (filtros?: FiltrosVentas) => {
  return useQuery({
    queryKey: ["ventas", filtros],
    queryFn: () => ventaService.getAll(filtros).then(res => res.data.data),
  });
};

/** Obtiene el detalle de una venta */
export const useGetVentaById = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ["ventas", "detalle", id],
    queryFn: () => ventaService.getById(id).then(res => res.data.data),
    enabled: enabled && Boolean(id),
  });
};

/** Registra una venta */
export const useCreateVentaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVentaRequest) =>
      ventaService.create(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ventas"] });
      queryClient.invalidateQueries({ queryKey: ["citas"] });
    },
  });
};

/** Obtiene el listado de terminales de pago (POS) */
export const useGetTerminales = (soloActivos = false) => {
  return useQuery({
    queryKey: ["terminales-pago", soloActivos],
    queryFn: () =>
      ventaService.getTerminales(soloActivos).then(res => res.data.data),
  });
};

/** Crea un terminal de pago */
export const useCreateTerminalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTerminalPagoRequest) =>
      ventaService.createTerminal(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terminales-pago"] });
    },
  });
};

/** Actualiza el nombre, notas o plazo de abono de un terminal de pago */
export const useUpdateTerminalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { nombre: string; plazoAbonoDias: number; notas?: string };
    }) => ventaService.updateTerminal(id, data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terminales-pago"] });
    },
  });
};

/** Activa o desactiva un terminal de pago */
export const useUpdateTerminalEstadoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      ventaService.updateTerminalEstado(id, activo).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terminales-pago"] });
    },
  });
};

/** Obtiene los acuerdos de reparto por profesional vigentes */
export const useGetRepartos = () => {
  return useQuery({
    queryKey: ["repartos-profesionales"],
    queryFn: () => ventaService.getRepartos().then(res => res.data.data),
  });
};

/** Crea una nueva versión del acuerdo de reparto de un profesional */
export const useCreateRepartoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRepartoProfesionalRequest) =>
      ventaService.createReparto(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repartos-profesionales"] });
    },
  });
};

/** Obtiene las tasas de impuesto vigentes */
export const useGetTasasImpuesto = () => {
  return useQuery({
    queryKey: ["tasas-impuesto"],
    queryFn: () => ventaService.getTasasImpuesto().then(res => res.data.data),
  });
};

/** Crea una nueva versión de la tasa de impuesto */
export const useCreateTasaImpuestoMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTasaImpuestoRequest) =>
      ventaService.createTasaImpuesto(data).then(res => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasas-impuesto"] });
    },
  });
};
