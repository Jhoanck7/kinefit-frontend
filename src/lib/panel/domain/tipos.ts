export type Origen = "web" | "manual";

export type Servicio = "masoterapia" | "kinesiologia";

export type CodigoEstadoCita =
  | "pendiente_pago"
  | "por_confirmar"
  | "confirmada"
  | "atendida"
  | "no_asistida"
  | "cancelada"
  | "expirada";

export interface Especialista {
  id: string;
  nombre: string;
  cargo: string;
  servicios: Servicio[];
}

export interface Convenio {
  id: string;
  nombre: string;
}

export interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  rut: string;
  correo: string;
  telefono: string;
  convenioId?: string;
  origenRegistro: Origen;
  creadoHaceDias: number;
}

export interface NotaCita {
  paciente?: string;
  interna?: string;
}

export interface CambioEstadoCita {
  estado: CodigoEstadoCita;
  haceDias: number;
  hora: string;
  responsable: string;
  motivo?: string;
}

export interface Cita {
  id: string;
  pacienteId: string;
  especialistaId: string;
  servicio: Servicio;
  offsetDias: number;
  horaInicio: string;
  horaTermino: string;
  estado: CodigoEstadoCita;
  origen: Origen;
  creadaOffsetDias: number;
  creadaHora: string;
  notas?: NotaCita;
  historial: CambioEstadoCita[];
  webpayTransaccionId?: string;
  montoAnticipo?: number;
}

export type TipoCampoFormato =
  | "texto_corto"
  | "texto_largo"
  | "numerico"
  | "fecha"
  | "seleccion";

export interface CampoFormato {
  id: string;
  nombre: string;
  tipo: TipoCampoFormato;
  obligatorio: boolean;
  placeholder?: string;
  ayuda?: string;
  opciones?: string[];
}

export interface SeccionFormato {
  id: string;
  nombre: string;
  campos: CampoFormato[];
}

export interface Formato {
  id: string;
  nombre: string;
  secciones: SeccionFormato[];
  modificadoHaceDias: number;
}

export interface Ficha {
  id: string;
  pacienteId: string;
  citaId: string;
  formatoId: string;
  tipo: string;
  registradaPor: string;
  creadaOffsetDias: number;
  contenido: Record<string, string>;
  adjuntos: string[];
}

export interface Bloqueo {
  id: string;
  especialistaId: string;
  offsetDias: number;
  horaInicio: string;
  horaTermino: string;
  motivo: string;
}

export type DiaSemanaId = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface RangoHorario {
  inicio: string;
  termino: string;
}

export interface PlantillaHorarioEspecialista {
  especialistaId: string;
  dias: Partial<Record<DiaSemanaId, RangoHorario[]>>;
}
