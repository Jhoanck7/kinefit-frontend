import { Especialista } from "../domain/tipos";
import { ESPECIALISTAS } from "./_seed/especialistas";

export async function listEspecialistas(): Promise<Especialista[]> {
  return ESPECIALISTAS;
}

export async function getEspecialista(id: string): Promise<Especialista | undefined> {
  return ESPECIALISTAS.find((e) => e.id === id);
}
