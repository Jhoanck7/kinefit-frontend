import { EspecialistaResponse } from "@/models/responses";
import { especialistaService } from "@/services";

import { Especialista } from "../domain/tipos";
import { ESPECIALISTAS } from "./_seed/especialistas";

function mapBackendDtoToDomain(dto: EspecialistaResponse): Especialista {
  return {
    id: String(dto.id),
    nombre: dto.nombre,
    cargo: dto.cargo,
    // El enum de strings de Servicio (dominio del panel) todavía no está
    // conectado a los IDs reales de servicios del backend (pendiente de
    // rediseño). No se hardcodea una lista falsa mientras tanto.
    servicios: [],
  };
}

export async function listEspecialistas(): Promise<Especialista[]> {
  try {
    const res = await especialistaService.getEspecialistas(undefined, true);
    const lista = res.data.data;
    if (lista.length > 0) {
      return lista.map(mapBackendDtoToDomain);
    }
  } catch {
    // Fallback a seed data
  }
  return ESPECIALISTAS;
}

export async function getEspecialista(
  id: string
): Promise<Especialista | undefined> {
  try {
    const espId = parseInt(id.replace(/\D/g, ""), 10);
    if (!isNaN(espId)) {
      const res = await especialistaService.getEspecialistas(undefined, true);
      const hallado = res.data.data.find(e => e.id === espId);
      if (hallado) return mapBackendDtoToDomain(hallado);
    }
  } catch {
    // Fallback
  }
  return ESPECIALISTAS.find(e => e.id === id);
}
