/** Un ítem dentro de una venta */
export interface VentaItemResponse {
  id: number;
  tipo: string;
  servicioId?: number;
  servicioNombre?: string;
  descripcion?: string;
  monto: number;
  descuentoConvenio?: number;
}

/** Desglose del cobro de una venta: impuestos, comisiones y reparto */
export interface DesgloseCobroResponse {
  montoTotal: number;
  impuesto?: number;
  tasaIvaAplicada?: number;
  comisionTerminal: number;
  porcentajeComisionAplicado?: number;
  cargoFijoAplicado?: number;
  montoProfesional?: number;
  montoCentro?: number;
  porcentajeProfesionalAplicado?: number;
  motivoNoCalculable?: string;
  impuestoComisionTerminal?: number;
  descuentoConvenio?: number;
}

/** Una venta registrada */
export interface VentaResponse {
  id: number;
  citaId?: number;
  pacienteId?: number;
  pacienteNombre?: string;
  metodoPago: string;
  terminalPagoId?: number;
  terminalNombre?: string;
  montoTotal: number;
  creadoPorUsuarioId: number;
  creadoPorNombre?: string;
  createdAt: string;
  items: VentaItemResponse[];
  desglose: DesgloseCobroResponse;
}

/** Página de ventas listadas */
export interface VentasPaginadasResponse {
  total: number;
  page: number;
  pageSize: number;
  montoTotalPeriodo: number;
  items: VentaResponse[];
}

/** Una versión de comisión de un terminal de pago, vigente en un rango de fechas */
export interface ComisionTerminalResponse {
  metodoPago: string;
  porcentaje: number;
  tipoModelo: string;
  cargoFijo?: number;
  vigenteDesde: string;
  vigenteHasta?: string;
  impuestoIncluidoEnTasa: boolean;
}

/** Un terminal de pago (POS) con sus versiones de comisión */
export interface TerminalPagoResponse {
  id: number;
  nombre: string;
  plazoAbonoDias: number;
  activo: boolean;
  notas?: string;
  comisiones: ComisionTerminalResponse[];
}

/** Una versión del reparto de ingresos entre profesional y centro, vigente en un rango de fechas */
export interface RepartoProfesionalResponse {
  id: number;
  especialistaId: number;
  especialistaNombre?: string;
  porcentajeProfesional: number;
  porcentajeCentro: number;
  vigenteDesde: string;
  vigenteHasta?: string;
}

/** Una versión de la tasa de impuesto, vigente en un rango de fechas */
export interface TasaImpuestoResponse {
  id: number;
  porcentaje: number;
  vigenteDesde: string;
  vigenteHasta?: string;
}
