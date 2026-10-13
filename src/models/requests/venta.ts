/** Un ítem dentro de una venta */
export interface CreateVentaItemRequest {
  tipo: "Servicio" | "Producto" | "Propina";
  servicioId?: number;
  descripcion?: string;
  monto: number;
}

/** Datos para registrar una venta */
export interface CreateVentaRequest {
  citaId?: number;
  pacienteId?: number;
  metodoPago: "Efectivo" | "Transferencia" | "Debito" | "Credito";
  terminalPagoId?: number;
  items: CreateVentaItemRequest[];
}

/** Datos para crear una versión de comisión de un terminal de pago */
export interface CreateComisionTerminalRequest {
  metodoPago: "Debito" | "Credito";
  porcentaje: number;
  tipoModelo?: "Porcentual" | "Mixto";
  cargoFijo?: number;
  impuestoIncluidoEnTasa?: boolean;
}

/** Datos para crear un terminal de pago (POS) */
export interface CreateTerminalPagoRequest {
  nombre: string;
  plazoAbonoDias: number;
  notas?: string;
  comisiones: CreateComisionTerminalRequest[];
}

/** Datos para crear una versión del reparto por profesional */
export interface CreateRepartoProfesionalRequest {
  especialistaId: number;
  porcentajeProfesional: number;
  vigenteDesde: string;
}

/** Datos para crear una versión de la tasa de impuesto */
export interface CreateTasaImpuestoRequest {
  porcentaje: number;
  vigenteDesde: string;
}
