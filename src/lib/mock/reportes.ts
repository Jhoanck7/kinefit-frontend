export interface MetricaKpi {
  reservasTotales: number;
  porcentajeOcupacion: number; // Ej: 78.5
  tasaInasistencias: number; // Ej: 4.2
  variacionReservasTotales?: number; // Ej: +12.4
  variacionPorcentajeOcupacion?: number; // Ej: +3.1
  variacionTasaInasistencias?: number; // Ej: -1.5
}

export interface PuntoEvolucionTemporal {
  periodo: string; // Ej: "01/08", "Sem 32", "Agosto"
  reservas: number;
  ingresos: number;
}

export interface FrecuenciaHora {
  hora: string; // Ej: "09:00", "10:00"
  cantidad: number;
}

export interface FrecuenciaDiaSemana {
  dia: string; // "Lunes", "Martes", etc.
  cantidad: number;
}

export interface DistribucionEstado {
  estado: string; // "Confirmada", "Finalizada", "Cancelada", "No Asistió"
  cantidad: number;
  porcentaje: number;
}

export interface DistribucionOrigen {
  origen: "Web" | "Manual";
  cantidad: number;
  porcentaje: number;
}

export interface ItemRanking {
  id: string;
  nombre: string;
  cantidad: number;
  montoTotal?: number;
}

export interface RetencionClientes {
  nuevos: number;
  recurrentes: number;
  porcentajeNuevos: number;
  porcentajeRecurrentes: number;
}

export interface ReporteReservasMetricasMock {
  kpi: MetricaKpi;
  evolucionTemporal: PuntoEvolucionTemporal[];
  distribucionPorHora: FrecuenciaHora[];
  distribucionPorDiaSemana: FrecuenciaDiaSemana[];
  distribucionPorEstado: DistribucionEstado[];
  origen: DistribucionOrigen[];
  rankingServicios: ItemRanking[];
  rankingProfesionales: ItemRanking[];
  rankingClientes: ItemRanking[];
  retencion: RetencionClientes;
}

export interface MovimientoVentaReporte {
  id: string;
  codigo: string;
  fecha: string;
  monto: number;
  pacienteId: string;
  pacienteNombre: string;
  metodoPago: string;
}

export interface ReporteVentasMock {
  totalVentas: number;
  montoTotalPeriodo: number;
  movimientos: MovimientoVentaReporte[];
}

export interface DesgloseProfesionalComision {
  especialistaId: string;
  especialistaNombre: string;
  totalVentas: number;
  montoTotalCobrado: number;
  impuesto: number;
  comisionTerminal: number;
  porcentajeProfesionalVigente?: number;
  montoProfesional?: number;
  montoCentro?: number;
  ventasSinRepartoVigente: number;
  motivoNoCalculable?: string;
}

export interface ReporteComisionesRepartoMock {
  generadoEl: string;
  profesionales: DesgloseProfesionalComision[];
}

export const REPORTE_RESERVAS_MOCK: ReporteReservasMetricasMock = {
  kpi: {
    reservasTotales: 142,
    porcentajeOcupacion: 82.4,
    tasaInasistencias: 3.8,
    variacionReservasTotales: 14.5,
    variacionPorcentajeOcupacion: 5.2,
    variacionTasaInasistencias: -1.2,
  },
  evolucionTemporal: [
    { periodo: "01/08", reservas: 18, ingresos: 720000 },
    { periodo: "02/08", reservas: 22, ingresos: 890000 },
    { periodo: "03/08", reservas: 25, ingresos: 1050000 },
    { periodo: "04/08", reservas: 19, ingresos: 780000 },
    { periodo: "05/08", reservas: 24, ingresos: 980000 },
    { periodo: "06/08", reservas: 20, ingresos: 820000 },
    { periodo: "07/08", reservas: 14, ingresos: 580000 },
  ],
  distribucionPorHora: [
    { hora: "08:00", cantidad: 8 },
    { hora: "09:00", cantidad: 16 },
    { hora: "10:00", cantidad: 24 },
    { hora: "11:00", cantidad: 22 },
    { hora: "12:00", cantidad: 14 },
    { hora: "15:00", cantidad: 20 },
    { hora: "16:00", cantidad: 22 },
    { hora: "17:00", cantidad: 16 },
  ],
  distribucionPorDiaSemana: [
    { dia: "Lunes", cantidad: 28 },
    { dia: "Martes", cantidad: 32 },
    { dia: "Miércoles", cantidad: 30 },
    { dia: "Jueves", cantidad: 26 },
    { dia: "Viernes", cantidad: 22 },
    { dia: "Sábado", cantidad: 4 },
  ],
  distribucionPorEstado: [
    { estado: "Finalizada", cantidad: 118, porcentaje: 83.1 },
    { estado: "Confirmada", cantidad: 18, porcentaje: 12.7 },
    { estado: "Cancelada", cantidad: 4, porcentaje: 2.8 },
    { estado: "No Asistió", cantidad: 2, porcentaje: 1.4 },
  ],
  origen: [
    { origen: "Web", cantidad: 98, porcentaje: 69.0 },
    { origen: "Manual", cantidad: 44, porcentaje: 31.0 },
  ],
  rankingServicios: [
    {
      id: "s-1",
      nombre: "Evaluación Kinesiológica",
      cantidad: 45,
      montoTotal: 2025000,
    },
    {
      id: "s-2",
      nombre: "Masoterapia Reductiva (1hr)",
      cantidad: 38,
      montoTotal: 3800000,
    },
    {
      id: "s-3",
      nombre: "Masaje Descontracturante",
      cantidad: 32,
      montoTotal: 1120000,
    },
    {
      id: "s-4",
      nombre: "Rehabilitación Traumatológica",
      cantidad: 27,
      montoTotal: 1620000,
    },
  ],
  rankingProfesionales: [
    {
      id: "esp-1",
      nombre: "Francesca Astudillo",
      cantidad: 56,
      montoTotal: 4200000,
    },
    {
      id: "esp-2",
      nombre: "Valeria Sepúlveda",
      cantidad: 48,
      montoTotal: 3100000,
    },
    {
      id: "esp-3",
      nombre: "Constanza Morales",
      cantidad: 38,
      montoTotal: 2265000,
    },
  ],
  rankingClientes: [
    {
      id: "pac-101",
      nombre: "Benjamín Muñoz",
      cantidad: 6,
      montoTotal: 450000,
    },
    {
      id: "pac-102",
      nombre: "Camila Arriagada",
      cantidad: 5,
      montoTotal: 225000,
    },
    {
      id: "pac-104",
      nombre: "María José Fernández",
      cantidad: 4,
      montoTotal: 180000,
    },
  ],
  retencion: {
    nuevos: 42,
    recurrentes: 100,
    porcentajeNuevos: 29.6,
    porcentajeRecurrentes: 70.4,
  },
};

export const REPORTE_VENTAS_MOCK: ReporteVentasMock = {
  totalVentas: 4,
  montoTotalPeriodo: 240000,
  movimientos: [
    {
      id: "v-1454",
      codigo: "#1454",
      fecha: "11/08/2026 10:23 AM",
      monto: 100000,
      pacienteId: "pac-101",
      pacienteNombre: "Benjamín Muñoz",
      metodoPago: "Débito (Tuu POS)",
    },
    {
      id: "v-1455",
      codigo: "#1455",
      fecha: "11/08/2026 11:45 AM",
      monto: 45000,
      pacienteId: "pac-102",
      pacienteNombre: "Camila Arriagada",
      metodoPago: "Transferencia",
    },
    {
      id: "v-1456",
      codigo: "#1456",
      fecha: "11/08/2026 02:15 PM",
      monto: 60000,
      pacienteId: "pac-103",
      pacienteNombre: "Diego Retamal",
      metodoPago: "Crédito (AgendaPro)",
    },
    {
      id: "v-1457",
      codigo: "#1457",
      fecha: "10/08/2026 04:00 PM",
      monto: 35000,
      pacienteId: "pac-104",
      pacienteNombre: "María José Fernández",
      metodoPago: "Efectivo",
    },
  ],
};

export const REPORTE_COMISIONES_MOCK: ReporteComisionesRepartoMock = {
  generadoEl: "11/08/2026 14:30 PM",
  profesionales: [
    {
      especialistaId: "esp-1",
      especialistaNombre: "Francesca Astudillo",
      totalVentas: 1,
      montoTotalCobrado: 100000,
      impuesto: 15966,
      comisionTerminal: 1500,
      porcentajeProfesionalVigente: 50,
      montoProfesional: 41267,
      montoCentro: 41267,
      ventasSinRepartoVigente: 0,
    },
    {
      especialistaId: "esp-2",
      especialistaNombre: "Valeria Sepúlveda",
      totalVentas: 1,
      montoTotalCobrado: 45000,
      impuesto: 0,
      comisionTerminal: 0,
      porcentajeProfesionalVigente: 60,
      montoProfesional: 27000,
      montoCentro: 18000,
      ventasSinRepartoVigente: 0,
    },
    {
      especialistaId: "esp-3",
      especialistaNombre: "Constanza Morales",
      totalVentas: 1,
      montoTotalCobrado: 35000,
      impuesto: 5588,
      comisionTerminal: 0,
      porcentajeProfesionalVigente: 55,
      montoProfesional: 16177,
      montoCentro: 13235,
      ventasSinRepartoVigente: 0,
    },
    {
      especialistaId: "esp-4",
      especialistaNombre: "Ignacio Soto (Invitado)",
      totalVentas: 1,
      montoTotalCobrado: 60000,
      impuesto: 9579,
      comisionTerminal: 1310,
      porcentajeProfesionalVigente: undefined,
      montoProfesional: undefined,
      montoCentro: undefined,
      ventasSinRepartoVigente: 1,
      motivoNoCalculable:
        "Sin acuerdo de reparto vigente registrado en la fecha del cobro",
    },
  ],
};
