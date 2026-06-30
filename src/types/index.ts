export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface CreateAppointmentDto {
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
  slug: {
    current: string;
  };
  mainImage?: {
    asset: {
      _ref: string;
      _type: string;
    };
  };
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
  role: string; // ej: "Paciente" o "Kinesiologo"
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