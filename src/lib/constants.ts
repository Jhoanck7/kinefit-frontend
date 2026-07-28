/**
 * Kinefit Centralized Configuration Constants
 * Use this file to modify text copy, contact details, navigation links, services, and carousel slides.
 * In the future, these can be replaced by dynamic API responses or CMS fetches.
 */

// 1. Clinic General Contact & Info
export const CLINIC_INFO = {
  name: "KineFitChile",
  tagline: "Centro de Kinesiología y Masoterapia",
  email: "contacto@kinefitchile.com",
  phone: "+ 56 9 6207 2672",
  phoneRaw: "+56962072672", // for wa.me / tel links
  address: "Pje. Maximiliano Poblete 596, Antofagasta",
  hours: {
    weekday: "Lunes a Viernes: 09:00 - 21:00 hrs.",
    saturday: "Sábados: 10:00 - 20:00 hrs.",
    weekdaySummary: "Lunes a Viernes:\n09:00 a 14:00 / 15:00 a 21:00 hrs.",
    saturdaySummary: "Sábados y Domingos:\n10:00 a 14:00 / 15:00 a 21:00 hrs."
  },
  socials: {
    instagram: "https://www.instagram.com/kinefit.chile",
    facebook: "https://www.facebook.com/profile.php?id=61591559489444&sk=directory_links",
    whatsapp: "https://wa.me/56962072672",
    tiktok: "https://www.tiktok.com/@kinefitchile?_r=1&_t=ZS-97lIyj0Yjvs"
  }
};

// 2. Navigation Link Items
// 
export const NAV_LINKS = [
  { name: 'Equipo', href: '#team' },
  { name: 'Testimonios', href: '#testimonials' },
  { name: 'Proceso', href: '#process' },
  { name: 'Instalaciones', href: '#instalaciones' },
  { name: 'Ubicación', href: '#location' },
];

// 3. Hero Section Copy
export const HERO_COPY = {
  tagline: "Centro de kinesiología,",
  brandName: "rehabilitación y masoterapia",
  description: "En KineFit Chile combinamos rehabilitación kinésica avanzada y entrenamiento funcional de alto nivel. Diseñamos un plan de tratamiento a tu medida para sanar lesiones, recuperar movilidad y potenciar tu rendimiento físico.",
  ctaText: "VER Y AGENDAR SERVICIOS AHORA",
  ctaLink: "#agendamiento",
  bullets: [
    'Atención Personalizada',
    'Seguimiento caso a caso',
    'Pacientes Satisfechos',
    'Profesionales certificados'

  ]
};

// 4. Booking Flow Options (Services & Time Slots)
export const BOOKING_SERVICES = [
  { id: '1', name: 'Kinesiología Clínica', price: '', duration: '', priceNumeric: 0 },
  { id: '2', name: 'Masoterapia', price: '', duration: '', priceNumeric: 0 },
];

export const BOOKING_TIME_SLOTS = [
  '09:00', 
  '10:15', 
  '11:30', 
  '14:00', 
  '15:15', 
  '16:30', 
  '17:45'
];

// 5. Facilities & Services Carousel Slides
export const CAROUSEL_SLIDES = [
  {
    title: "Gimnasio Kinésico de Vanguardia",
    description: "Espacio equipado con tecnología de resistencia avanzada y herramientas de entrenamiento funcional para readaptación física.",
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1600&q=80",
    features: ["Poleas cónicas", "Plataformas de inercia", "Zonas de peso libre"]
  },
  {
    title: "Área de Entrenamiento Funcional y Cardio",
    description: "Zona dedicada al acondicionamiento aeróbico y muscular guiado, ideal para transiciones seguras de rehabilitación a deporte.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80",
    features: ["Cintas de correr profesionales", "Bicicletas estáticas", "Espacio de estiramiento"]
  },
  {
    title: "Laboratorio de Valoración Funcional",
    description: "Sistemas avanzados de análisis de movimiento y fuerza para detectar desequilibrios musculares de forma objetiva.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80",
    features: ["Sensores de movimiento", "Dinamómetros digitales", "Grabación de alta velocidad"]
  },
  {
    title: "Zona de Recuperación y Masoterapia",
    description: "Espacio enfocado en la regeneración de tejidos, descarga muscular post-entrenamiento y técnicas de relajación miofascial.",
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1600&q=80",
    features: ["Presoterapia neumática", "Pistolas de percusión", "Masajes de descarga"]
  }
];

// 6. Services Key Bullet Features
export const CLINIC_SERVICES_FEATURES = [
  ["Terapia manual ortopédica", "Tratamiento del dolor lumbar/cervical", "Electroterapia y ultrasonido", "Ejercicios terapéuticos guiados"],
  ["Acondicionamiento físico de salud", "Fortalecimiento muscular correctivo", "Prevención activa de lesiones", "Evaluación de postura y fuerza"],
  ["Readaptación deportiva post-lesión", "Retorno seguro a la competencia", "Prevención de recaídas atléticas", "Optimización de gestos deportivos"]
];

// 7. Step-by-Step Process Timeline
export const CLINIC_PROCESS_STEPS = [
  {
    num: "01",
    title: "Evaluación Inicial",
    description: "Realizamos un diagnóstico kinesiológico riguroso, analizando rangos de movilidad, fuerza muscular y patrones de movimiento para identificar la raíz de tu malestar."
  },
  {
    num: "02",
    title: "Diseño del Plan",
    description: "Elaboramos un programa terapéutico personalizado y adaptado a tus objetivos de recuperación, plazos diarios y nivel deportivo actual."
  },
  {
    num: "03",
    title: "Sesiones de Terapia",
    description: "Ejecutamos el plan combinando técnicas avanzadas de terapia manual, electroterapia de punta y ejercicios guiados específicos para la reeducación funcional."
  },
  {
    num: "04",
    title: "Alta y/o Reforzamiento",
    description: "Evaluamos tu mejoría final, realizamos el alta clínica y te entregamos pautas domiciliarias de ejercicios preventivos para evitar cualquier reincidencia."
  }
];

// 8. Clinic Medical and Coaching Staff
export const CLINIC_TEAM = [
    {
    name: "Franchesca Astudillo C.",
    role: "Masoterapeuta",
    specialty: "Masoterapeuta con 3 años de experiencia en diversas técnicas de masoterapia, enfocada en la recuperación muscular, el alivio del dolor y el bienestar físico",
    image: "/Franchesca.jpg",
    email: "franchesca@kinefitchile.com"
  },
  {
    name: "Valeria Araneda T.",
    role: "Kinesióloga",
    specialty: "Profesional con 5 años de experiencia en Kinesiología y rehabilitación, además de 10 años de experiencia en masoterapia.",
    image: "/Valeria.jpg",
    email: "valeria@kinefitchile.com"
  },
  {
    name: "Constanza Maldonado V.",
    role: "Kinesióloga",
    specialty: "Profesional con 2 años de experiencia en kinesiología de rehabilitación, traumatológica, dolor crónico, geriátrica, respiratoria y masoterapia.",
    image: "/Constanza.jpg",
    email: "constanza@kinefitchile.com"
  },
  
  { 
    name: "Diego Exequiel B.",
    role: "Gerente",
    specialty: "Administrador Público con 4 años de experiencia en gestión de equipos y organizaciones del mundo público, privado y grupos intermedios.",
    image: "/Diego.jpg",
    email: "contacto@kinefitchile.com"
  },
];


// 9. Verified Patient Testimonials
export const CLINIC_TESTIMONIALS = [
  {
    quote: "La rehabilitación deportiva de Kinefit me permitió volver a competir en mi deporte tras mi lesión de poleas. El gimnasio está súper bien equipado y la dedicación del equipo fue excelente",
    author: "Francisco Jofré",
    role: "Escalador",
    initials: "FJ",
    color: "bg-blue-100 text-brand-primary"
  },
  {
    quote: "Llegué con un dolor lumbar crónico insoportable que limitaba mi trabajo. Gracias a la terapia manual y al plan de ejercicios clínicos hoy puedo realizar mis actividades cotidianas sin dolor.",
    author: "Andrea Valenzuela",
    role: "Ingeniera Civil",
    initials: "AV",
    color: "bg-emerald-100 text-emerald-600"
  },
  {
    quote: "La infraestructura para masoterapia es excelente. Gracias al equipamiento y al tratamiento recibido, pude volver a mis actividades con mucho menos estrés y molestias musculares.",
    author: "Maximiliano Ramírez",
    role: "Desarrollador Web",
    initials: "MR",
    color: "bg-indigo-100 text-indigo-600"
  }
];
