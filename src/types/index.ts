// Contrato de error de la API
export interface ApiErrorResponse {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}

// Controlador de servicios
export interface BackendService {
  id: number;
  nombre: string;
  activo: boolean;
}

// Controlador de especialistas
export interface BackendSpecialist {
  id: number;
  nombre: string;
  cargo: string;
  email?: string;
  descripcion?: string;
  fotoUrl?: string;
  servicio?: {
    id: number;
    nombre: string;
  } | null;
  activo: boolean;
  fechasDisponibles?: string[];
}

// Controlador de bloques horarios
export interface BackendTimeSlot {
  id: number;
  horaInicio: string;
  horaFin: string;
  estado: "Disponible" | "Ocupado" | "Bloqueado" | string;
  hora?: string;
  especialistaSanityId?: string;
  fecha?: string;
}

// Controlador de autenticación
export interface AuthPatient {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  perfilCompleto: boolean;
  rut?: string;
  telefono?: string;
}

export interface AuthGoogleResponse {
  data: {
    token: string;
    expiraEn: string;
    paciente: AuthPatient;
  };
  message: string;
}

// Controlador de citas
export interface CreateCitaDto {
  especialistaId: number;
  servicioId: number;
  bloqueHorarioId: number;
  duracionMinutos: number;
  empresaId?: number | null;
  notaPaciente?: string | null;
}

export interface CitaResponseData {
  id?: number;
  citaId?: number;
  pacienteId?: number;
  especialistaId?: number;
  servicioId?: number;
  bloqueHorarioId?: number;
  estado?: string;
  createdAt?: string;
}

// Controlador de transacciones
export interface IniciarTransaccionResponseData {
  transaccionId?: number;
  token: string;
  urlRedireccion: string;
  expiraEn?: string;
}

export interface ConfirmarTransaccionResponseData {
  id: number;
  citaId: number;
  buyOrder: string;
  monto: number;
  estado: "Iniciado" | "Aprobado" | "Rechazado" | "Expirado";
  estadoCita:
    "Confirmada" | "Cancelada" | "Expirada" | "PendientePago" | string;
  createdAt: string;
  updatedAt: string;
  advertencia?: string;
  documentosParaFirmarTokens: string[];
}

// Interfaces del CMS de contenido (Sanity)
export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

export interface CreateAppointmentDtoLegacy {
  serviceId: string;
  date: string;
  timeSlot: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: { asset: { _ref: string; _type: string } };
  publishedAt: string;
  body: unknown[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
}

export interface Usuario {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: Usuario;
}

export interface SanityServiceItem {
  id: number;
  nombre: string;
  description?: string;
  price: string;
  duration: string;
  features?: string[];
}

export interface SanityTeamMemberItem {
  nombre: string;
  cargo: string;
  email: string;
  imageUrl: string;
  specialty?: string;
}

export interface SanityTestimonialItem {
  nombre: string;
  cargo: string;
  content: string;
  rating?: number;
}

export interface SanityGalleryItem {
  title: string;
  description: string;
  imageUrl: string;
  features?: string[];
}
