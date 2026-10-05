/** Un movimiento de venta dentro del reporte de ventas */
export interface MovimientoVentaReporteResponse {
  id: number;
  fecha: string;
  monto: number;
  pacienteId?: number;
  pacienteNombre?: string;
  metodoPago: string;
}

/** Reporte de ventas de un período */
export interface ReporteVentasResponse {
  fechaDesde: string;
  fechaHasta: string;
  totalVentas: number;
  montoTotalPeriodo: number;
  page: number;
  pageSize: number;
  movimientos: MovimientoVentaReporteResponse[];
}

/** Un conteo con su etiqueta, usado en distribuciones de reportes */
export interface ConteoResponse {
  etiqueta: string;
  cantidad: number;
}

/** Un elemento dentro de un ranking de reportes */
export interface RankingItemResponse {
  id: number;
  nombre: string;
  cantidad: number;
}

/** Un punto de la evolución temporal de reservas e ingresos */
export interface EvolucionTemporalPuntoResponse {
  periodo: string;
  reservas: number;
  ingresos: number;
}

/** Indicadores agregados del reporte de reservas */
export interface ReporteReservasIndicadoresResponse {
  reservasTotales: number;
  porcentajeOcupacion: number;
  tasaInasistencias: number;
}

/** Comparación de los indicadores del reporte contra el período anterior */
export interface ReporteReservasComparacionResponse {
  periodoAnteriorDesde: string;
  periodoAnteriorHasta: string;
  variacionReservasTotales?: number;
  variacionPorcentajeOcupacion?: number;
  variacionTasaInasistencias?: number;
}

/** Distribución de reservas por origen web o manual */
export interface ReporteOrigenReservasResponse {
  web: number;
  manual: number;
}

/** Reporte de reservas de un período, con indicadores, distribuciones y rankings */
export interface ReporteReservasResponse {
  fechaDesde: string;
  fechaHasta: string;
  vista: string;
  indicadores: ReporteReservasIndicadoresResponse;
  comparacion?: ReporteReservasComparacionResponse;
  distribucionPorHora: ConteoResponse[];
  distribucionPorDiaSemana: ConteoResponse[];
  distribucionPorEstado: ConteoResponse[];
  origen: ReporteOrigenReservasResponse;
  evolucionTemporal: EvolucionTemporalPuntoResponse[];
  rankingServicios: RankingItemResponse[];
  rankingProfesionales: RankingItemResponse[];
  rankingClientes: RankingItemResponse[];
  clientesNuevos: number;
  clientesRecurrentes: number;
}

/** Comisión calculada para un profesional dentro del reporte de comisiones */
export interface ReporteComisionProfesionalResponse {
  especialistaId: number;
  especialistaNombre: string;
  totalVentas: number;
  montoTotalCobrado: number;
  impuesto?: number;
  comisionTerminal: number;
  ventasSinTasaVigente: number;
  ventasSinRepartoVigente: number;
  porcentajeProfesionalVigente?: number;
  montoProfesional?: number;
  montoCentro?: number;
  motivoNoCalculable?: string;
}

/** Reporte de comisiones de todos los profesionales para un período */
export interface ReporteComisionesResponse {
  fechaDesde: string;
  fechaHasta: string;
  generadoEl: string;
  profesionales: ReporteComisionProfesionalResponse[];
}
