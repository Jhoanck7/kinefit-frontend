import { Formato } from "../domain/tipos";
import { FORMATOS } from "./_seed/formatos";
import { FICHAS } from "./_seed/fichas";
import { sumarDias } from "../domain/formato";

export interface FormatoResuelto extends Omit<Formato, "modificadoHaceDias"> {
  modificadoEn: Date;
  fichasCreadas: number;
}

function resolver(formato: Formato, hoy: Date): FormatoResuelto {
  const { modificadoHaceDias, ...resto } = formato;
  return {
    ...resto,
    modificadoEn: sumarDias(hoy, -modificadoHaceDias),
    fichasCreadas: FICHAS.filter((f) => f.formatoId === formato.id).length,
  };
}

export async function listFormatos(hoy: Date): Promise<FormatoResuelto[]> {
  return FORMATOS.map((f) => resolver(f, hoy));
}

export async function getFormato(id: string, hoy: Date): Promise<FormatoResuelto | undefined> {
  const formato = FORMATOS.find((f) => f.id === id);
  return formato ? resolver(formato, hoy) : undefined;
}
