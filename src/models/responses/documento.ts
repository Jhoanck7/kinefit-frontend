import { CuerpoFormato, TipoDocumentoClinico } from "./plantilla";

/** Lo mínimo para que el paciente lea y firme, sin ningún id interno */
export interface DocumentoPublicoResponse {
  nombre: string;
  tipo: TipoDocumentoClinico;
  origen: string;
  cuerpo?: CuerpoFormato;
  tieneArchivo: boolean;
  servicio: string;
  fecha: string;
  hora: string;
  estado: string;
  huellaMostrada: string;
}

/** Consentimientos de una cita puntual — pestaña de documentos del detalle de cita */
export interface ConsentimientoCitaResponse {
  id: number;
  nombrePlantilla: string;
  tipo: TipoDocumentoClinico;
  origen: string;
  estado: string;
  firmaPacienteLista: boolean;
  firmadoPacienteEn?: string;
  firmaProfesionalLista: boolean;
  firmadoProfesionalEn?: string;
  requiereFirmaProfesional: boolean;
  cargadoEnPapelEn?: string;
  tieneArchivo: boolean;
  reutilizado: boolean;
  vigenteDesde?: string;
  vigenteHasta?: string;
  createdAt: string;
}

export interface AdjuntoResumenResponse {
  id: number;
  nombreOriginal: string;
  tipoMime: string;
  tamanoBytes: number;
  subidoPorNombre: string;
  createdAt: string;
}

export interface FichaDePacienteResponse {
  id: number;
  citaId: number;
  estado: string;
}

export interface DocumentoResumenResponse {
  id: number;
  tipo: TipoDocumentoClinico;
  nombre: string;
  estado: string;
  motivoCierre?: string;
  citaId: number;
  pacienteId: number;
  pacienteNombre: string;
  pacienteRut?: string;
  fechaAtencion: string;
  especialistaId: number;
  especialistaNombre: string;
}

export interface DocumentosPaginadosResponse {
  total: number;
  page: number;
  pageSize: number;
  items: DocumentoResumenResponse[];
}

export interface DocumentoDetalleResponse {
  id: number;
  tipo: TipoDocumentoClinico;
  nombre: string;
  estado: string;
  motivoCierre?: string;
  cerradaEn?: string;
  origenCreacion: string;
  citaId: number;
  fechaAtencion: string;
  horaAtencion: string;
  servicio: string;
  pacienteId: number;
  pacienteNombre: string;
  pacienteRut?: string;
  especialistaId: number;
  especialistaNombre: string;
  plantillaId?: number;
  plantillaNombre?: string;
  creadoPorTipoActor: string;
  creadoPorActorId?: number;
  tieneArchivo: boolean;
  contenido?: Record<string, string>;
  requiereFirmaProfesional: boolean;
  firmaPacienteLista: boolean;
  firmadoPacienteEn?: string;
  firmaProfesionalLista: boolean;
  firmadoProfesionalEn?: string;
  cargadoEnPapelEn?: string;
  adjuntos: AdjuntoResumenResponse[];
}

export interface AuditoriaEventoResponse {
  id: number;
  entidad: string;
  entidadId: number;
  accion: string;
  tipoActor: string;
  usuarioId?: number;
  usuarioNombre?: string;
  detalle?: string;
  createdAt: string;
}

export interface AuditoriaEventosPaginadasResponse {
  total: number;
  page: number;
  pageSize: number;
  items: AuditoriaEventoResponse[];
}

export interface ReenviarCorreoResponse {
  url: string;
  expiraEn: string;
}

export interface FichaResponse {
  id: number;
  nombre: string;
  citaId: number;
  plantillaId?: number;
  contenido?: Record<string, string>;
  tieneArchivo: boolean;
  archivoCargadoEn?: string;
  estado: string;
  motivoCierre?: string;
  cerradaEn?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecomendacionResponse {
  id: number;
  citaId: number;
  nombre: string;
  tipoRecomendacion: string;
  origenCreacion: string;
  plantillaId?: number;
  contenido?: Record<string, string>;
  tieneArchivo: boolean;
  archivoCargadoEn?: string;
  createdAt: string;
}
