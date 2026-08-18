export interface CreatePacienteManualRequest {
  nombre: string;
  apellido: string;
  email: string;
  rut: string;
  telefono?: string;
  empresaId?: number | null;
}

export interface UpdatePacienteRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  empresaId?: number | null;
}
