/** Un paciente */
export interface PacienteResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rut?: string;
  tieneCuentaGoogle: boolean;
  activo: boolean;
  origenRegistro: string;
  convenio?: string;
  empresaId?: number;
  createdAt: string;
  updatedAt: string;
}

/** Conteo de citas de un paciente por resultado */
export interface ContadoresPacienteResponse {
  citasAtendidas: number;
  citasCanceladas: number;
  citasNoAsistidas: number;
}

/** Una cita del historial de un paciente */
export interface HistorialCitaResponse {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
  origen: string;
  especialista: string;
  servicio: string;
}

/** Perfil completo de un paciente, con sus contadores e historial de citas */
export interface PacientePerfilResponse extends PacienteResponse {
  contadores: ContadoresPacienteResponse;
  historialTotal: number;
  historialPage: number;
  historialPageSize: number;
  historial: HistorialCitaResponse[];
}

/** Página de pacientes listados */
export interface PacientesPaginadasResponse {
  total: number;
  page: number;
  pageSize: number;
  items: PacienteResponse[];
}

/** Resultado de verificar si un RUT ya tiene una ficha de paciente */
export interface VerificarRutResponse {
  existe: boolean;
  paciente?: PacienteResponse;
}

/** Resultado de activar o desactivar un paciente */
export interface PacienteEstadoResponse {
  id: number;
  activo: boolean;
}
