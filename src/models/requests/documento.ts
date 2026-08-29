export interface FirmarDocumentoRequest {
  contenido?: Record<string, string>;
  firmaPacienteBase64: string;
  huellaMostrada: string;
}
