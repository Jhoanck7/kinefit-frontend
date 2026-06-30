/**
 * Kinefit Centralized Configuration Constants
 * Use this file to modify text copy, contact details, navigation links, services, and carousel slides.
 * In the future, these can be replaced by dynamic API responses or CMS fetches.
 */

// 1. Clinic General Contact & Info
export const CLINIC_INFO = {
  name: "KineFitChile",
  tagline: "Centro de Kinesiología y Masoterapia",
  email: "contacto@kinefit.cl",
  phone: "+ 569 62072672",
  phoneRaw: "+56962072672", // for wa.me / tel links
  address: "Pje. Maximiliano Poblete 596, Antofagasta",
  hours: {
    weekday: "Lunes a Viernes: 08:00 - 20:00 hrs.",
    saturday: "Sábados: 09:00 - 14:00 hrs.",
    weekdaySummary: "Lunes a Viernes:\n08:00 - 20:00 hrs.",
    saturdaySummary: "Sábados:\n09:00 - 14:00 hrs."
  },
  socials: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    whatsapp: "https://wa.me/56962072672"
  }
};

// 2. Navigation Link Items
// 
export const NAV_LINKS = [
  { name: 'Servicios', href: '#services' },
  { name: 'Instalaciones', href: '#instalaciones' },
  { name: 'Proceso', href: '#process' },
  { name: 'Equipo', href: '#team' },
  { name: 'Testimonios', href: '#testimonials' }
];

// 3. Hero Section Copy
export const HERO_COPY = {
  tagline: "Centro de kinesiología,",
  brandName: "rehabilitación y masoterapia",
  description: "En KineFit Chile combinamos rehabilitación kinésica avanzada y entrenamiento funcional de alto nivel. Diseñamos un camino a tu medida para sanar lesiones, recuperar movilidad y potenciar tu rendimiento físico.",
  ctaText: "Nuestros especialistas",
  ctaLink: "#team",
  bullets: [
    'Atención Personalizada',
    'Horarios Flexibles',
    'Pacientes Satisfechos',
  ]
};

// 4. Booking Flow Options (Services & Time Slots)
export const BOOKING_SERVICES = [
  { id: '1', name: 'Kinesiología Clínica', price: '$35.000', duration: '60 min', priceNumeric: 35000 },
  { id: '2', name: 'Masoterapia', price: '$30.000', duration: '50 min', priceNumeric: 30000 },
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
    title: "Boxes de Terapia Manual Privados",
    description: "Ambientes climatizados y confortables diseñados para terapias manuales ortopédicas, punción seca y evaluaciones personalizadas.",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80",
    features: ["Camillas eléctricas", "Privacidad acústica", "Equipos de electroterapia"]
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
    title: "Alta y Mantenimiento",
    description: "Evaluamos tu mejoría final, realizamos el alta clínica y te entregamos pautas domiciliarias de ejercicios preventivos para evitar cualquier reincidencia."
  }
];

// 8. Clinic Medical and Coaching Staff
export const CLINIC_TEAM = [
  {
    name: "Constanza Maldonado V.",
    role: "Kinesióloga",
    specialty: "Terapia Manual Ortopédica e Infiltraciones Clínicas",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    email: "constanza.maldonado@kinefit.cl"
  },
  {
    name: "Diego Exequiel B.",
    role: "Gerente",
    specialty: "",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
    email: "Diego.exequiel@kinefit.cl"
  },
  {
    name: "Valeria Araneda T.",
    role: "Kinesióloga",
    specialty: "Kinesiología Deportiva",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    email: "valentina.araneda@kinefit.cl"
  },
  {
    name: "Franchesca Astudillo C.",
    role: "Masoterapeuta",
    specialty: "Masoterapia",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    email: "nicolas.pardo@kinefit.cl"
  }
];


// 9. Verified Patient Testimonials
export const CLINIC_TESTIMONIALS = [
  {
    quote: "La rehabilitación deportiva de Kinefit me permitió volver a competir en tiempo récord tras mi desgarro. El gimnasio está súper bien equipado y la dedicación es del 100%.",
    author: "Carlos Mendoza",
    role: "Corredor de Trail running",
    initials: "CM",
    color: "bg-blue-100 text-brand-primary"
  },
  {
    quote: "Llegué con un dolor lumbar crónico insoportable que limitaba mi trabajo. Gracias a la terapia manual y al plan de ejercicios clínicos hoy puedo hacer mi vida totalmente libre de dolor.",
    author: "Andrea Valenzuela",
    role: "Ingeniera Civil",
    initials: "AV",
    color: "bg-emerald-100 text-emerald-600"
  },
  {
    quote: "El gimnasio clínico de Kinefit es increíble. Los entrenamientos funcionales están totalmente adaptados a mis lesiones pasadas, permitiéndome ganar fuerza sin miedo a lesionarme.",
    author: "Roberto Muñoz",
    role: "Emprendedor",
    initials: "RM",
    color: "bg-indigo-100 text-indigo-600"
  }
];
