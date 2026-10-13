/** Datos para crear un paciente desde el panel administrativo */
export interface CreatePacienteManualRequest {
  nombre: string;
  apellido: string;
  email: string;
  rut: string;
  telefono?: string;
  empresaId?: number | null;
}

/** Datos para actualizar un paciente */
export interface UpdatePacienteRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  empresaId?: number | null;
}
