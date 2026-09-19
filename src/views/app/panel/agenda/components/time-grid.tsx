import { formatearRangoHorario } from "@/lib/formato";
import { BloqueAgendaResponse, CitaEnAgendaResponse } from "@/models/responses";

import { AppointmentCard } from "./appointment-card";

type ItemFila =
  | {
      tipo: "cita";
      inicio: string;
      termino: string;
      cita: CitaEnAgendaResponse;
    }
  | { tipo: "bloqueado"; inicio: string; termino: string };

const ESTADOS_LIBERADOS = new Set(["Expirada", "Cancelada"]);

export const FILTRO_VIGENTES = "vigentes";

function citaSegunFiltro(
  bloque: BloqueAgendaResponse | undefined,
  estadoFiltro: string
): CitaEnAgendaResponse | undefined {
  const cita = bloque?.cita;
  if (!cita) return undefined;
  if (estadoFiltro === FILTRO_VIGENTES) {
    return ESTADOS_LIBERADOS.has(cita.estado) ? undefined : cita;
  }
  return cita.estado === estadoFiltro ? cita : undefined;
}

function construirFilas(
  rejilla: { inicio: string; termino: string }[],
  bloques: BloqueAgendaResponse[],
  estadoFiltro: string
): ItemFila[] {
  const porHora = new Map(
    bloques.map(b => [b.horaInicio.substring(0, 5), b] as const)
  );
  const items: ItemFila[] = [];
  let i = 0;

  while (i < rejilla.length) {
    const slot = rejilla[i];
    const bloque = porHora.get(slot.inicio);

    const cita = citaSegunFiltro(bloque, estadoFiltro);
    if (cita) {
      const grupoId = cita.grupoCitaId ?? cita.id;
      let k = 0;
      while (i + k < rejilla.length) {
        const siguiente = citaSegunFiltro(
          porHora.get(rejilla[i + k].inicio),
          estadoFiltro
        );
        const siguienteGrupoId = siguiente?.grupoCitaId ?? siguiente?.id;
        if (!siguiente || siguienteGrupoId !== grupoId) break;
        k += 1;
      }
      const numBloques = Math.max(1, k);
      items.push({
        tipo: "cita",
        inicio: slot.inicio,
        termino: rejilla[i + numBloques - 1].termino,
        cita,
      });
      i += numBloques;
      continue;
    }

    if (bloque?.estado === "Bloqueado") {
      let k = 0;
      while (i + k < rejilla.length) {
        const siguiente = porHora.get(rejilla[i + k].inicio);
        if (siguiente?.estado !== "Bloqueado") break;
        if (citaSegunFiltro(siguiente, estadoFiltro)) break;
        k += 1;
      }
      const numBloques = Math.max(1, k);
      items.push({
        tipo: "bloqueado",
        inicio: slot.inicio,
        termino: rejilla[i + numBloques - 1].termino,
      });
      i += numBloques;
      continue;
    }

    i += 1;
  }

  return items;
}

/**
 * Lista de citas del día por especialista: solo se muestran citas y
 * bloqueos, sin fila para los huecos vacíos ni grilla horaria de fondo.
 */
export function TimeGrid({
  rejilla,
  bloques,
  estadoFiltro = FILTRO_VIGENTES,
  onSeleccionarCita,
}: {
  rejilla: { inicio: string; termino: string }[];
  bloques: BloqueAgendaResponse[];
  estadoFiltro?: string;
  onSeleccionarCita: (citaId: string) => void;
}) {
  const filas = construirFilas(rejilla, bloques, estadoFiltro);

  return (
    <ul className="flex w-full flex-col gap-2.5 font-sans shadow-none">
      {filas.map(item => (
        <li key={item.inicio}>
          {item.tipo === "cita" && (
            <AppointmentCard
              cita={item.cita}
              horaInicio={item.inicio}
              horaTermino={item.termino}
              onClick={() => onSeleccionarCita(String(item.cita.id))}
            />
          )}
          {item.tipo === "bloqueado" && (
            <div className="flex w-full items-center justify-center rounded-overlay border border-slate-200 bg-slate-100/70 px-3 py-3 text-center font-sans text-xs font-semibold text-muted-foreground">
              Bloqueado, {formatearRangoHorario(item.inicio, item.termino)}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
