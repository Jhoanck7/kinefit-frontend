import { type ClassValue, clsx } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const defaultMetadata: Metadata = {
  title: {
    default: "Kinefit - Centro de Kinesiología y Masoterapia",
    template: "%s | Kinefit",
  },
  description: "Centro de rehabilitación kinésica y masoterapia.",
  keywords: [
    "kinesiología",
    "masoterapia",
    "rehabilitación",
    "kinefit",
    "kinefitchile",
    "KineFitChile",
    "kinesiólogo",
    "terapia física",
  ],
  authors: [{ name: "Kinefit" }],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/Kinefit color.png",
  },
  creator: "Kinefit",
  publisher: "Kinefit",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Kinefit - Centro de Kinesiología y Masoterapia",
    description:
      "Centro de rehabilitación kinésica, entrenamiento funcional y bienestar integral.",
    type: "website",
    locale: "es_CL",
    url: "https://kinefitchile.com",
    siteName: "Kinefit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kinefit - Centro de Kinesiología y Masoterapia",
    description:
      "Centro de rehabilitación kinésica, entrenamiento funcional y bienestar integral.",
  },
};

// Datos generales de contacto de la clínica
export const CLINIC_INFO = {
  name: "KineFitChile",
  tagline: "Centro de Kinesiología y Masoterapia",
  email: "contacto@kinefitchile.com",
  phone: "+ 56 9 6207 2672",
  phoneRaw: "+56962072672",
  address: "Pje. Maximiliano Poblete 596, Antofagasta",
  hours: {
    weekday: "Lunes a Viernes: 09:00 - 21:00 hrs.",
    saturday: "Sábados: 10:00 - 20:00 hrs.",
    weekdaySummary: "Lunes a Viernes:\n09:00 a 14:00 / 15:00 a 21:00 hrs.",
    saturdaySummary: "Sábados y Domingos:\n10:00 a 14:00 / 15:00 a 21:00 hrs.",
  },
  socials: {
    instagram: "https://www.instagram.com/kinefit.chile",
    facebook:
      "https://www.facebook.com/profile.php?id=61591559489444&sk=directory_links",
    whatsapp: "https://wa.me/56962072672",
    tiktok: "https://www.tiktok.com/@kinefitchile?_r=1&_t=ZS-97lIyj0Yjvs",
  },
};

// Links de navegación del sitio público
export const NAV_LINKS = [
  { name: "Equipo", href: "#team" },
  { name: "Testimonios", href: "#testimonials" },
  { name: "Proceso", href: "#process" },
  { name: "Instalaciones", href: "#instalaciones" },
  { name: "Ubicación", href: "#location" },
];

// Copy de la sección Hero de la landing
export const HERO_COPY = {
  tagline: "Centro de kinesiología,   rehabilitación y masoterapia",
  description:
    "En KineFit Chile combinamos rehabilitación kinésica avanzada y entrenamiento funcional de alto nivel. Diseñamos un plan de tratamiento a tu medida para sanar lesiones, recuperar movilidad y potenciar tu rendimiento físico.",
  ctaText: "VER Y AGENDAR SERVICIOS AHORA",
  ctaLink: "#agendamiento",
  bullets: [
    "Atención Personalizada",
    "Seguimiento caso a caso",
    "Pacientes Satisfechos",
    "Profesionales certificados",
  ],
};

// Catálogo de servicios y horarios del flujo de reserva
export const BOOKING_SERVICES = [
  {
    id: "1",
    name: "Kinesiología Clínica",
    price: "",
    duration: "",
    priceNumeric: 0,
  },
  { id: "2", name: "Masoterapia", price: "", duration: "", priceNumeric: 0 },
];

export const BOOKING_TIME_SLOTS = [
  "09:00",
  "10:15",
  "11:30",
  "14:00",
  "15:15",
  "16:30",
  "17:45",
];