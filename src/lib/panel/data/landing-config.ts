import {
  CAROUSEL_SLIDES,
  CLINIC_INFO,
  CLINIC_PROCESS_STEPS,
  HERO_COPY,
} from "@/lib/constants";
import { LandingConfigResponse } from "@/models/responses";
import { landingConfigService } from "@/services";

export type LandingConfigData = LandingConfigResponse;

export interface GallerySlideItem {
  title: string;
  description: string;
  image: string;
  features: string[];
}

export interface ProcessStepItem {
  num: string;
  title: string;
  description: string;
}

export const defaultProcessSteps: ProcessStepItem[] = CLINIC_PROCESS_STEPS;

export interface GoogleReviewItem {
  author: string;
  role?: string;
  quote: string;
  rating: number;
  date?: string;
  avatarUrl?: string;
  isVerifiedGoogle?: boolean;
}

export const defaultGoogleReviews: GoogleReviewItem[] = [
  {
    author: "Constanza Silva",
    role: "Paciente de Kinesiología y Rehabilitación",
    quote:
      "Excelente atención kinésica. Llegué con una lesión en la rodilla por deporte y gracias a las sesiones personalizadas pude retomar mis entrenamientos sin dolor. 100% recomendado.",
    rating: 5,
    date: "Hace 2 semanas",
    isVerifiedGoogle: true,
  },
  {
    author: "Felipe Morales",
    role: "Masoterapia Deportiva",
    quote:
      "El servicio de masoterapia de descarga es increíble. El ambiente es impecable y la profesionalismo de todo el equipo se nota desde que ingresas a la clínica.",
    rating: 5,
    date: "Hace 1 mes",
    isVerifiedGoogle: true,
  },
  {
    author: "Camila Arancibia",
    role: "Readaptación Funcional",
    quote:
      "Muy profesionales en todo el proceso de evaluación y ejercicios guiados. Te explican cada etapa de tu recuperación con mucha paciencia.",
    rating: 5,
    date: "Hace 3 semanas",
    isVerifiedGoogle: true,
  },
];

export const defaultLandingConfig: LandingConfigData = {
  heroTagline: HERO_COPY.tagline,
  heroBrandName: CLINIC_INFO.name,
  heroDescription: HERO_COPY.description,
  heroCtaText: HERO_COPY.ctaText,
  heroBadgeText: "✨ KineFit Chile • Salud & Rehabilitación",
  heroBulletsJson: JSON.stringify([
    "Sin filas de espera",
    "Rehabilitación Kinésica",
    "Gimnasio Clínico",
    "Atención por Fonasa e Isapre",
  ]),
  heroImageUrl: "",
  heroImageUrl1:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1920&q=80",
  heroImageUrl2:
    "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1920&q=80",
  heroImageUrl3:
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1920&q=80",
  clinicName: CLINIC_INFO.name,
  clinicEmail: CLINIC_INFO.email,
  clinicPhone: CLINIC_INFO.phone,
  clinicPhoneRaw: CLINIC_INFO.phoneRaw,
  clinicAddress: CLINIC_INFO.address,
  hoursWeekday: CLINIC_INFO.hours.weekday,
  hoursSaturday: CLINIC_INFO.hours.saturday,
  socialInstagram: CLINIC_INFO.socials.instagram,
  socialFacebook: CLINIC_INFO.socials.facebook,
  socialWhatsApp: CLINIC_INFO.socials.whatsapp,
  socialTikTok: CLINIC_INFO.socials.tiktok,
  galleryJson: JSON.stringify(CAROUSEL_SLIDES),
  aboutVideoUrl: "https://www.instagram.com/kinefit.chile",
  aboutTitle: "Un Enfoque Integral para tu Cuerpo y Salud",
  aboutDescription:
    "En Kinefit Chile combinamos kinesiología clínica ortopédica, entrenamiento de readaptación funcional y masoterapia de alta gama. Nuestro objetivo principal es acompañarte en tu recuperación, eliminando el dolor desde la causa raíz y devolviéndote la libertad de movimiento.",
  aboutCtaText: "Agendar Atención Kinésica",
  processTitle: "¿Cómo Funciona Tu Atención en KineFit Chile?",
  processSubtitle:
    "Un método estructurado paso a paso diseñado para garantizar tu pronta recuperación y bienestar duradero.",
  processStepsJson: JSON.stringify(defaultProcessSteps),
  teamTitle: "Nuestros Especialistas",
  teamSubtitle:
    "Profesionales certificados comprometidos con tu rehabilitación y rendimiento.",
  testimonialsTitle: "Opiniones Reales de Nuestros Pacientes",
  testimonialsSubtitle:
    "Testimonios verificados en Google Maps de personas que han recuperado su salud y rendimiento.",
  locationTitle: "Visítanos en Antofagasta",
  locationSubtitle:
    "Estamos ubicados en un sector accesible de Antofagasta para brindarte la mejor atención kinésica.",
  footerText:
    "© 2026 Kinefit Chile. Todos los derechos reservados. Centro de Kinesiología y Rehabilitación.",
  googleReviewsUrl: "https://maps.google.com/?q=Kinefit+Chile+Antofagasta",
  googlePlaceId: "",
  reviewsJson: JSON.stringify(defaultGoogleReviews),
};

export async function getLandingConfig(): Promise<LandingConfigData> {
  try {
    const res = await landingConfigService.getConfig();
    return res.data.data || defaultLandingConfig;
  } catch (err) {
    console.warn(
      "Backend indisponible para cargar configuración de landing page. Usando fallback local:",
      err
    );
    return defaultLandingConfig;
  }
}

export async function updateLandingConfig(
  data: LandingConfigData
): Promise<LandingConfigData> {
  const res = await landingConfigService.updateConfig(data);
  return res.data.data;
}

export async function sincronizarGoogleReviews(): Promise<{
  data: LandingConfigData | null;
  message: string;
}> {
  const res = await landingConfigService.sincronizarGoogleReviews();
  return { data: res.data.data ?? null, message: res.data.message ?? "" };
}
