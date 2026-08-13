import { Formato } from "../domain/tipos";
import { fichaService } from "@/lib/services/ficha.service";

export interface FormatoResuelto extends Omit<Formato, "modificadoHaceDias"> {
  modificadoEn: Date;
  fichasCreadas: number;
}

const STORAGE_KEY = "kinefit_formatos";

export function getFormatosGuardados(): Formato[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Formato[];
  } catch {
    // Error al leer de localStorage
  }
  return [];
}

export function guardarFormato(formato: Formato): void {
  if (typeof window === "undefined") return;
  try {
    const existentes = getFormatosGuardados();
    const indice = existentes.findIndex((f) => f.id === formato.id);
    if (indice >= 0) {
      existentes[indice] = formato;
    } else {
      existentes.push(formato);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existentes));
  } catch {
    // Error al escribir en localStorage
  }
}

export async function listFormatos(_hoy?: Date): Promise<FormatoResuelto[]> {
  const formatosLocales = getFormatosGuardados();

  if (formatosLocales.length === 0) {
    return [];
  }

  let countFichasMap: Record<string, number> = {};
  try {
    const res = await fichaService.getAll();
    const fichas = res?.data || [];
    fichas.forEach((f) => {
      const fId = f.formatoId || f.tipo || "general";
      countFichasMap[fId] = (countFichasMap[fId] || 0) + 1;
    });
  } catch {
    // Fallback silencioso
  }

  return formatosLocales.map((f) => ({
    id: f.id,
    nombre: f.nombre,
    secciones: f.secciones,
    modificadoEn: new Date(),
    fichasCreadas: countFichasMap[f.id] || 0,
  }));
}

export async function getFormato(id: string, hoy: Date): Promise<FormatoResuelto | undefined> {
  const lista = await listFormatos(hoy);
  return lista.find((f) => f.id === id);
}

export function obtenerEtiquetaCampo(campoId: string): string {
  const todosFormatos = getFormatosGuardados();
  for (const fmt of todosFormatos) {
    for (const sec of fmt.secciones) {
      const campo = sec.campos.find((c) => c.id === campoId);
      if (campo && campo.nombre && campo.nombre.trim()) {
        return campo.nombre.trim();
      }
    }
  }
  return campoId.replace(/_/g, " ").replace(/^campo-\d+/i, "Campo");
}
