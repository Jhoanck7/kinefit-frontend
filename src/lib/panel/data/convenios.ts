import { Convenio } from "../domain/tipos";
import { CONVENIOS } from "./_seed/convenios";

export async function listConvenios(): Promise<Convenio[]> {
  return CONVENIOS;
}

export async function getConvenio(id: string): Promise<Convenio | undefined> {
  return CONVENIOS.find((c) => c.id === id);
}
