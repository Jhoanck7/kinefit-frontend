import { Especialista, Servicio } from "../domain/tipos";
import { ESPECIALISTAS } from "./_seed/especialistas";
import { catalogosService, EspecialistaBackendDto } from "@/lib/services/catalogos.service";

function mapBackendDtoToDomain(dto: EspecialistaBackendDto): Especialista {
  const serviciosDefault: Servicio[] = [
    "embarazadas",
    "masajes_pareja",
    "masajes",
    "masajes_premium",
    "masajes_reductivos",
    "voucher_regalo",
    "kinesiologia",
  ];
  return {
    id: String(dto.id),
    nombre: dto.nombre,
    cargo: dto.cargo,
    servicios: serviciosDefault,
  };
}

export async function listEspecialistas(): Promise<Especialista[]> {
  try {
    const res = await catalogosService.getEspecialistas();
    if (res && Array.isArray(res) && res.length > 0) {
      return res.map(mapBackendDtoToDomain);
    }
  } catch {
    // Fallback a seed data
  }
  return ESPECIALISTAS;
}

export async function getEspecialista(id: string): Promise<Especialista | undefined> {
  try {
    const espId = parseInt(id.replace(/\D/g, ""), 10);
    if (!isNaN(espId)) {
      const res = await catalogosService.getEspecialistas();
      const hallado = res.find((e) => e.id === espId);
      if (hallado) return mapBackendDtoToDomain(hallado);
    }
  } catch {
    // Fallback
  }
  return ESPECIALISTAS.find((e) => e.id === id);
}
