export interface MovimientoVentaReporteResponse {
  id: number;
  fecha: string;
  monto: number;
  pacienteId?: number;
  pacienteNombre?: string;
  metodoPago: string;
}

export interface ReporteVentasResponse {
  fechaDesde: string;
  fechaHasta: string;
  totalVentas: number;
  montoTotalPeriodo: number;
  page: number;
  pageSize: number;
  movimientos: MovimientoVentaReporteResponse[];
}

export interface ConteoResponse {
  etiqueta: string;
  cantidad: number;
}

export interface RankingItemResponse {
  id: number;
  nombre: string;
  cantidad: number;
}

export interface EvolucionTemporalPuntoResponse {
  periodo: string;
  reservas: number;
  ingresos: number;
}

export interface ReporteReservasIndicadoresResponse {
  reservasTotales: number;
  porcentajeOcupacion: number;
  tasaInasistencias: number;
}

export interface ReporteReservasComparacionResponse {
  periodoAnteriorDesde: string;
  periodoAnteriorHasta: string;
  variacionReservasTotales?: number;
  variacionPorcentajeOcupacion?: number;
  variacionTasaInasistencias?: number;
}

export interface ReporteOrigenReservasResponse {
  web: number;
  manual: number;
}

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

export interface ReporteComisionesResponse {
  fechaDesde: string;
  fechaHasta: string;
  generadoEl: string;
  profesionales: ReporteComisionProfesionalResponse[];
}
