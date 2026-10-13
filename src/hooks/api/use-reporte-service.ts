import { useQuery } from "@tanstack/react-query";

import {
  FiltrosReporteComisiones,
  FiltrosReporteReservas,
  FiltrosReporteVentas,
  reporteService,
} from "@/services";

/** Obtiene el reporte de ventas según filtros */
export const useGetReporteVentas = (filtros?: FiltrosReporteVentas) => {
  return useQuery({
    queryKey: ["reporte-ventas", filtros],
    queryFn: () =>
      reporteService.getReporteVentas(filtros).then(res => res.data.data),
  });
};

/** Obtiene el reporte de reservas según filtros */
export const useGetReporteReservas = (filtros?: FiltrosReporteReservas) => {
  return useQuery({
    queryKey: ["reporte-reservas", filtros],
    queryFn: () =>
      reporteService.getReporteReservas(filtros).then(res => res.data.data),
  });
};

/** Obtiene el reporte de comisiones según filtros */
export const useGetReporteComisiones = (filtros?: FiltrosReporteComisiones) => {
  return useQuery({
    queryKey: ["reporte-comisiones", filtros],
    queryFn: () =>
      reporteService.getReporteComisiones(filtros).then(res => res.data.data),
  });
};
