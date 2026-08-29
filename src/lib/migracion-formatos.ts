import { CreateFormatoFichaRequest } from "@/models/requests";
import { CampoFormato, TipoCampoFormato } from "@/models/responses";

const STORAGE_KEY = "kinefit_formatos";

/** Forma con la que el constructor guardaba los formatos en el navegador. */
interface FormatoLocal {
  id: string;
  nombre: string;
  secciones: {
    id: string;
    nombre: string;
    campos: {
      id: string;
      nombre: string;
      tipo: string;
      obligatorio?: boolean;
      ayuda?: string;
      opciones?: string[];
    }[];
  }[];
}

const TIPOS_ANTIGUOS: Record<string, TipoCampoFormato> = {
  texto_corto: "TextoCorto",
  texto_largo: "TextoLargo",
  numerico: "Numerico",
  fecha: "Fecha",
  seleccion: "Seleccion",
};

export function hayFormatosLocales(): boolean {
  return leerFormatosLocales().length > 0;
}

function leerFormatosLocales(): FormatoLocal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FormatoLocal[]) : [];
  } catch {
    return [];
  }
}

function aPeticion(formato: FormatoLocal): CreateFormatoFichaRequest {
  return {
    nombre: formato.nombre,
    tipo: "FichaClinica",
    cuerpo: {
      secciones: formato.secciones.map((seccion, indiceSeccion) => ({
        id: seccion.id,
        nombre: seccion.nombre,
        orden: indiceSeccion,
        campos: seccion.campos.map((campo, indiceCampo): CampoFormato => ({
          id: campo.id,
          nombre: campo.nombre,
          tipo: TIPOS_ANTIGUOS[campo.tipo] ?? "TextoCorto",
          obligatorio: campo.obligatorio ?? false,
          ayuda: campo.ayuda,
          opciones: campo.opciones,
          completadoPor: "Profesional",
          orden: indiceCampo,
        })),
      })),
    },
    requiereFirmaPaciente: false,
    requiereFirmaProfesional: false,
  };
}

/**
 * Sube al servidor los formatos que quedaron en este navegador. La clave solo
 * se borra si todos subieron: si alguno falla se conserva para reintentar.
 */
export async function migrarFormatosLocales(
  subir: (peticion: CreateFormatoFichaRequest) => Promise<unknown>
): Promise<{ migrados: number; fallidos: number }> {
  const locales = leerFormatosLocales();
  let migrados = 0;
  let fallidos = 0;

  for (const formato of locales) {
    try {
      await subir(aPeticion(formato));
      migrados += 1;
    } catch {
      fallidos += 1;
    }
  }

  if (fallidos === 0 && typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
  return { migrados, fallidos };
}
