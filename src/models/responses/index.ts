export type {
  BloqueAgendaResponse,
  BloqueoAgendaResponse,
  CitaEnAgendaResponse,
  ConflictoGeneracionResponse,
  GeneracionAgendaResultadoResponse,
  PacienteEnAgendaResponse,
} from "./agenda";
export type { AuditoriaCitaResponse } from "./auditoria";
export type {
  MiPerfilResponse,
  PersonalLoginResponse,
  UsuarioPersonalResponse,
} from "./auth";
export type {
  BloqueHorarioCitaResponse,
  CitaCreadaResponse,
  CitaDetalleResponse,
  CitaEstadoActualizadoResponse,
  CitaResumenResponse,
  CitasPaginadasResponse,
  CitaTransaccionResumenResponse,
  CodigoEstadoCita,
  EspecialistaCitaResponse,
  HitosCitaResponse,
  ImpactoCancelacionResponse,
  PacienteCitaResponse,
  ServicioCitaResponse,
  TransaccionDetalleResponse,
} from "./cita";
export type { ConfiguracionSistemaResponse } from "./configuracion-sistema";
export type { FranjaDisponibleResponse } from "./disponibilidad";
export type {
  DocumentoPacienteResponse,
  DocumentoPublicoResponse,
} from "./documento";
export type { EmpresaResponse } from "./empresa";
export type {
  EspecialistaAdminResponse,
  EspecialistaResponse,
  EspecialistaServicioResponse,
} from "./especialista";
export type {
  FichaAdjuntoResponse,
  FichaResponse,
  FichaResumenResponse,
  FichasPaginadasResponse,
} from "./ficha";
export type {
  CampoFormato,
  CompletadoPor,
  CuerpoFormato,
  FormatoFichaResponse,
  OrigenFormato,
  SeccionFormato,
  TipoCampoFormato,
  TipoDocumentoClinico,
} from "./formato";
export type {
  HorarioCentroResponse,
  PlantillaHorarioResponse,
} from "./horario";
export type { LandingConfigResponse, VoucherItem } from "./landing-config";
export type { ImageUploadResponse } from "./media";
export type {
  ContadoresPacienteResponse,
  HistorialCitaResponse,
  PacienteEstadoResponse,
  PacientePerfilResponse,
  PacienteResponse,
  VerificarRutResponse,
} from "./paciente";
export type {
  ConteoResponse,
  EvolucionTemporalPuntoResponse,
  MovimientoVentaReporteResponse,
  RankingItemResponse,
  ReporteComisionesResponse,
  ReporteComisionProfesionalResponse,
  ReporteOrigenReservasResponse,
  ReporteReservasComparacionResponse,
  ReporteReservasIndicadoresResponse,
  ReporteReservasResponse,
  ReporteVentasResponse,
} from "./reporte";
export type { ServicioDocumentoResponse, ServicioResponse } from "./servicio";
export type {
  ComisionTerminalResponse,
  DesgloseCobroResponse,
  RepartoProfesionalResponse,
  TasaImpuestoResponse,
  TerminalPagoResponse,
  VentaItemResponse,
  VentaResponse,
  VentasPaginadasResponse,
} from "./venta";
