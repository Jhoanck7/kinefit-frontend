export type MetodoPago = "Efectivo" | "Transferencia" | "Debito" | "Credito";

export interface ComisionMetodo {
  metodoPago: "Debito" | "Credito";
  porcentaje: number;
  cargoFijo: number;
}

export interface TerminalPOS {
  id: string;
  nombre: string;
  plazoAbonoDias: number;
  activo: boolean;
  comisiones: ComisionMetodo[];
  comisionPorcentaje: number;
  cargoFijo: number;
}

export interface AcuerdoReparto {
  id: string;
  especialistaId: string;
  especialistaNombre: string;
  porcentajeProfesional: number; // Ej: 50
  porcentajeCentro: number; // 100 - porcentajeProfesional
  vigenteDesde: string;
}

export interface TasaImpuesto {
  id: string;
  porcentaje: number; // 19
  vigenteDesde: string;
}

export interface VentaItemMock {
  id: string;
  servicioId?: string;
  servicioNombre: string;
  tipo: "Servicio" | "Producto";
  afectoIva: boolean; // True: 19%, False: Exento (0%)
  monto: number;
}

export interface VentaMock {
  id: string;
  codigoDisplay: string; // Ej: "#1454"
  fechaIso: string; // Ej: "2026-08-11T10:23:00"
  fechaFormateada: string; // Ej: "11/08/2026 10:23 AM"
  pacienteId: string;
  pacienteNombre: string;
  especialistaId: string;
  especialistaNombre: string;
  metodoPago: MetodoPago;
  terminalPosId?: string;
  terminalNombre?: string;
  montoBruto: number;
  items: VentaItemMock[];
  
  // Campos calculados
  comisionPosMonto: number; // Ej: 1500
  ivaMonto: number; // Ej: 15966
  montoNeto: number; // Ej: 84034
  baseReparticion: number; // Ej: 82534
  
  repartoConfigurado: boolean;
  porcentajeProfesionalAplicado?: number; // Ej: 50
  pagoProfesional?: number; // Ej: 41267
  margenClinica?: number; // Ej: 41267
  motivoNoCalculable?: string;
}

export const TERMINALES_MOCK: TerminalPOS[] = [
  {
    id: "term-1",
    nombre: "Tuu POS Transbank",
    plazoAbonoDias: 1,
    activo: true,
    comisionPorcentaje: 1.23,
    cargoFijo: 0,
    comisiones: [
      { metodoPago: "Debito", porcentaje: 1.23, cargoFijo: 0 },
      { metodoPago: "Credito", porcentaje: 1.89, cargoFijo: 0 },
    ],
  },
  {
    id: "term-2",
    nombre: "AgendaPro POS",
    plazoAbonoDias: 2,
    activo: true,
    comisionPorcentaje: 1.95,
    cargoFijo: 0,
    comisiones: [
      { metodoPago: "Debito", porcentaje: 1.95, cargoFijo: 0 },
      { metodoPago: "Credito", porcentaje: 2.45, cargoFijo: 50 },
    ],
  },
  {
    id: "term-3",
    nombre: "Mercado Pago",
    plazoAbonoDias: 1,
    activo: true,
    comisionPorcentaje: 2.79,
    cargoFijo: 0,
    comisiones: [
      { metodoPago: "Debito", porcentaje: 2.79, cargoFijo: 0 },
      { metodoPago: "Credito", porcentaje: 3.49, cargoFijo: 0 },
    ],
  },
];

export const ACUERDOS_REPARTO_MOCK: AcuerdoReparto[] = [
  { id: "ac-1", especialistaId: "esp-1", especialistaNombre: "Francesca Astudillo", porcentajeProfesional: 50, porcentajeCentro: 50, vigenteDesde: "2026-01-01" },
  { id: "ac-2", especialistaId: "esp-2", especialistaNombre: "Valeria Sepúlveda", porcentajeProfesional: 60, porcentajeCentro: 40, vigenteDesde: "2026-01-01" },
  { id: "ac-3", especialistaId: "esp-3", especialistaNombre: "Constanza Morales", porcentajeProfesional: 55, porcentajeCentro: 45, vigenteDesde: "2026-01-01" },
];

export const TASAS_IVA_MOCK: TasaImpuesto[] = [
  { id: "tasa-1", porcentaje: 19, vigenteDesde: "2020-01-01" },
];

export const VENTAS_MOCK: VentaMock[] = [
  {
    id: "v-1454",
    codigoDisplay: "#1454",
    fechaIso: "2026-08-11T10:23:00",
    fechaFormateada: "11/08/2026 10:23 AM",
    pacienteId: "pac-101",
    pacienteNombre: "Benjamín Muñoz",
    especialistaId: "esp-1",
    especialistaNombre: "Francesca Astudillo",
    metodoPago: "Debito",
    terminalPosId: "term-1",
    terminalNombre: "Tuu POS",
    montoBruto: 100000,
    items: [
      { id: "item-1", servicioNombre: "Masoterapia Reductiva (1 hora)", tipo: "Servicio", afectoIva: true, monto: 100000 },
    ],
    comisionPosMonto: 1500,
    ivaMonto: 15966,
    montoNeto: 84034,
    baseReparticion: 82534,
    repartoConfigurado: true,
    porcentajeProfesionalAplicado: 50,
    pagoProfesional: 41267,
    margenClinica: 41267,
  },
  {
    id: "v-1455",
    codigoDisplay: "#1455",
    fechaIso: "2026-08-11T11:45:00",
    fechaFormateada: "11/08/2026 11:45 AM",
    pacienteId: "pac-102",
    pacienteNombre: "Camila Arriagada",
    especialistaId: "esp-2",
    especialistaNombre: "Valeria Sepúlveda",
    metodoPago: "Transferencia",
    terminalPosId: undefined,
    terminalNombre: "Sin POS",
    montoBruto: 45000,
    items: [
      { id: "item-2", servicioNombre: "Evaluación Kinesiológica", tipo: "Servicio", afectoIva: false, monto: 45000 },
    ],
    comisionPosMonto: 0,
    ivaMonto: 0,
    montoNeto: 45000,
    baseReparticion: 45000,
    repartoConfigurado: true,
    porcentajeProfesionalAplicado: 60,
    pagoProfesional: 27000,
    margenClinica: 18000,
  },
  {
    id: "v-1456",
    codigoDisplay: "#1456",
    fechaIso: "2026-08-11T14:15:00",
    fechaFormateada: "11/08/2026 02:15 PM",
    pacienteId: "pac-103",
    pacienteNombre: "Diego Retamal",
    especialistaId: "esp-4",
    especialistaNombre: "Ignacio Soto (Invitado)",
    metodoPago: "Credito",
    terminalPosId: "term-2",
    terminalNombre: "AgendaPro POS",
    montoBruto: 60000,
    items: [
      { id: "item-3", servicioNombre: "Sesión Kinesiología Traumatológica", tipo: "Servicio", afectoIva: true, monto: 60000 },
    ],
    comisionPosMonto: 1310,
    ivaMonto: 9579,
    montoNeto: 50421,
    baseReparticion: 49111,
    repartoConfigurado: false,
    motivoNoCalculable: "Sin acuerdo de reparto vigente para el especialista",
  },
  {
    id: "v-1457",
    codigoDisplay: "#1457",
    fechaIso: "2026-08-10T16:00:00",
    fechaFormateada: "10/08/2026 04:00 PM",
    pacienteId: "pac-104",
    pacienteNombre: "María José Fernández",
    especialistaId: "esp-3",
    especialistaNombre: "Constanza Morales",
    metodoPago: "Efectivo",
    terminalPosId: undefined,
    terminalNombre: "Sin POS",
    montoBruto: 35000,
    items: [
      { id: "item-4", servicioNombre: "Masaje Descontracturante 45 min", tipo: "Servicio", afectoIva: true, monto: 35000 },
    ],
    comisionPosMonto: 0,
    ivaMonto: 5588,
    montoNeto: 29412,
    baseReparticion: 29412,
    repartoConfigurado: true,
    porcentajeProfesionalAplicado: 55,
    pagoProfesional: 16177,
    margenClinica: 13235,
  },
];
