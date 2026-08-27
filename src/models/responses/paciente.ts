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

export interface ContadoresPacienteResponse {
  citasAtendidas: number;
  citasCanceladas: number;
  citasNoAsistidas: number;
}

export interface HistorialCitaResponse {
  id: number;
  fecha: string;
  horaInicio: string;
  estado: string;
  origen: string;
  especialista: string;
  servicio: string;
}

export interface PacientePerfilResponse extends PacienteResponse {
  contadores: ContadoresPacienteResponse;
  historialTotal: number;
  historialPage: number;
  historialPageSize: number;
  historial: HistorialCitaResponse[];
}

export interface VerificarRutResponse {
  existe: boolean;
  paciente?: PacienteResponse;
}

export interface PacienteEstadoResponse {
  id: number;
  activo: boolean;
}
