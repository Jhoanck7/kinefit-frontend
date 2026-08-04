import { Formato } from "../../domain/tipos";

/**
 * Campos provisorios (B.12): la estructura definitiva de la ficha clínica
 * la define la especialista Valeria Araneda. Se construyen tal cual para
 * que pueda evaluarlos y corregirlos.
 */
function seccionesBase(): Formato["secciones"] {
  return [
    {
      id: "sec-antecedentes",
      nombre: "Antecedentes del paciente",
      campos: [
        { id: "edad", nombre: "Edad", tipo: "numerico", obligatorio: true, placeholder: "Ej: 34", ayuda: "Solo valores numéricos" },
        { id: "estatura", nombre: "Estatura", tipo: "numerico", obligatorio: true, placeholder: "Ej: 175", ayuda: "Solo valores numéricos" },
        { id: "peso", nombre: "Peso", tipo: "numerico", obligatorio: true, placeholder: "Ej: 70", ayuda: "Solo valores numéricos" },
        { id: "enfermedades_base", nombre: "Enfermedades de base", tipo: "texto_largo", obligatorio: false, placeholder: "Indique si padece alguna enfermedad relevante..." },
      ],
    },
    {
      id: "sec-motivo",
      nombre: "Motivo de consulta",
      campos: [
        { id: "motivo_descripcion", nombre: "Descripción", tipo: "texto_largo", obligatorio: true, placeholder: "Describa el motivo principal de la visita..." },
        { id: "antecedentes_relevantes", nombre: "Antecedentes relevantes", tipo: "texto_largo", obligatorio: false, placeholder: "Información clínica previa relevante al motivo..." },
        { id: "observaciones_sesion", nombre: "Observaciones de la sesión", tipo: "texto_largo", obligatorio: false, placeholder: "Notas sobre la evaluación o tratamiento inicial..." },
      ],
    },
  ];
}

export const FORMATOS: Formato[] = [
  {
    id: "fmt-masoterapia",
    nombre: "Ficha de Masoterapia",
    secciones: seccionesBase(),
    modificadoHaceDias: 3,
  },
  {
    id: "fmt-kinesiologia",
    nombre: "Ficha de Kinesiología",
    secciones: seccionesBase(),
    modificadoHaceDias: 9,
  },
];
