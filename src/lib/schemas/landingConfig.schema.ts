import { LandingConfigData } from "@/lib/services/landingConfig.service";

export type FieldType = "text" | "email" | "password" | "textarea" | "image";

export interface FieldDefinition {
  key: keyof LandingConfigData;
  label: string;
  type: FieldType;
  required?: boolean;
  rows?: number;
  folder?: string;
  gridCols?: 1 | 2 | 3;
  sectionHeader?: string;
}

export interface SectionSchema {
  id: string;
  title: string;
  description: string;
  fields?: FieldDefinition[];
  hasCustomRenderer?: boolean; // For Gallery, Process, Reviews, etc.
}

export const landingConfigSchema: SectionSchema[] = [
  {
    id: "hero",
    title: "1. Sección Principal (Hero)",
    description: "Textos principales y carrusel de fotos de fondo.",
    fields: [
      {
        key: "heroBrandName",
        label: "Nombre de Marca / Destacado",
        type: "text",
        required: true,
        gridCols: 2,
      },
      {
        key: "heroCtaText",
        label: "Texto del Botón Principal CTA",
        type: "text",
        required: true,
        gridCols: 2,
      },
      {
        key: "heroDescription",
        label: "Descripción Principal",
        type: "textarea",
        required: true,
        rows: 3,
        gridCols: 1,
      },
      {
        key: "heroImageUrl1",
        label: "Fondo 1",
        type: "image",
        folder: "kinefit/landing",
        sectionHeader: "Imágenes de Fondo en Carrusel",
        gridCols: 3,
      },
      {
        key: "heroImageUrl2",
        label: "Fondo 2",
        type: "image",
        folder: "kinefit/landing",
        gridCols: 3,
      },
      {
        key: "heroImageUrl3",
        label: "Fondo 3",
        type: "image",
        folder: "kinefit/landing",
        gridCols: 3,
      },
    ],
  },
  {
    id: "about",
    title: "2. Quiénes Somos",
    description: "Descripción de la clínica, video y botón de acción.",
    fields: [
      {
        key: "aboutTitle",
        label: "Título Principal Quiénes Somos",
        type: "text",
        gridCols: 2,
      },
      {
        key: "aboutDescription",
        label: "Descripción Detallada Quiénes Somos",
        type: "textarea",
        rows: 4,
        gridCols: 1,
      },
      {
        key: "aboutCtaText",
        label: "Texto Botón CTA Quiénes Somos",
        type: "text",
        gridCols: 2,
      },
      {
        key: "aboutVideoUrl",
        label: "URL de Video / Reel de Instagram",
        type: "text",
        gridCols: 2,
      },
    ],
  },
  {
    id: "process",
    title: "3. Nuestro Proceso",
    description: "Pasos de atención o metodología de trabajo.",
    hasCustomRenderer: true,
    fields: [
      {
        key: "processTitle",
        label: "Título Principal del Proceso",
        type: "text",
        gridCols: 2,
      },
      {
        key: "processSubtitle",
        label: "Subtítulo / Explicación del Proceso",
        type: "text",
        gridCols: 2,
      },
    ],
  },
  {
    id: "gallery",
    title: "4. Galería Instalaciones",
    description: "Fotos de la clínica, boxes y espacios.",
    hasCustomRenderer: true,
    fields: [],
  },
  {
    id: "team",
    title: "5. Especialistas",
    description: "Configuración visual de la sección del equipo.",
    fields: [
      {
        key: "teamTitle",
        label: "Título Sección Especialistas",
        type: "text",
        gridCols: 2,
      },
      {
        key: "teamSubtitle",
        label: "Subtítulo Sección Especialistas",
        type: "text",
        gridCols: 2,
      },
    ],
  },
  {
    id: "location",
    title: "6. Ubicación y Contacto",
    description: "Dirección, horarios, teléfonos y correos.",
    fields: [
      {
        key: "locationTitle",
        label: "Título Sección Ubicación",
        type: "text",
        gridCols: 2,
      },
      {
        key: "locationSubtitle",
        label: "Subtítulo Sección Ubicación",
        type: "text",
        gridCols: 2,
      },
      {
        key: "clinicName",
        label: "Nombre Oficial de la Clínica",
        type: "text",
        required: true,
        gridCols: 2,
      },
      {
        key: "clinicEmail",
        label: "Correo Electrónico de Contacto",
        type: "email",
        required: true,
        gridCols: 2,
      },
      {
        key: "clinicPhone",
        label: "Teléfono Formateado (ej: +56 9 ...)",
        type: "text",
        required: true,
        gridCols: 2,
      },
      {
        key: "clinicPhoneRaw",
        label: "Teléfono para Links (ej: +569...)",
        type: "text",
        required: true,
        gridCols: 2,
      },
      {
        key: "clinicAddress",
        label: "Dirección Física de la Clínica",
        type: "text",
        required: true,
        gridCols: 1,
      },
      {
        key: "hoursWeekday",
        label: "Horario Lunes a Viernes",
        type: "text",
        required: true,
        gridCols: 2,
      },
      {
        key: "hoursSaturday",
        label: "Horario Sábados / Fin de semana",
        type: "text",
        required: true,
        gridCols: 2,
      },
    ],
  },
  {
    id: "social",
    title: "7. Redes Sociales",
    description: "Links a tus perfiles de redes sociales y Footer.",
    fields: [
      {
        key: "socialInstagram",
        label: "URL de Instagram",
        type: "text",
        gridCols: 2,
      },
      {
        key: "socialFacebook",
        label: "URL de Facebook",
        type: "text",
        gridCols: 2,
      },
      {
        key: "socialWhatsApp",
        label: "URL de WhatsApp (wa.me)",
        type: "text",
        gridCols: 2,
      },
      {
        key: "socialTikTok",
        label: "URL de TikTok",
        type: "text",
        gridCols: 2,
      },
      {
        key: "footerText",
        label: "Texto de Derechos de Autor (Pie de Página)",
        type: "text",
        gridCols: 1,
      },
    ],
  },
  {
    id: "reviews",
    title: "8. Reseñas Google",
    description: "Sincronización de API Places y testimonios.",
    hasCustomRenderer: true,
    fields: [
      {
        key: "testimonialsTitle",
        label: "Título Sección Testimonios",
        type: "text",
        gridCols: 2,
      },
      {
        key: "testimonialsSubtitle",
        label: "Subtítulo Sección Testimonios",
        type: "text",
        gridCols: 2,
      },
    ],
  },
];
