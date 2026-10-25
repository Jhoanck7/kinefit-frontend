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
  bloques: BloqueAgendaResponse[],
  estadoFiltro: string
): ItemFila[] {
  const hora = (valor: string) => valor.substring(0, 5);
  const items: ItemFila[] = [];
  let i = 0;

  while (i < bloques.length) {
    const bloque = bloques[i];
    const cita = citaSegunFiltro(bloque, estadoFiltro);

    if (cita) {
      const grupoId = cita.grupoCitaId ?? cita.id;
      let fin = i;
      while (fin + 1 < bloques.length) {
        const siguiente = citaSegunFiltro(bloques[fin + 1], estadoFiltro);
        if ((siguiente?.grupoCitaId ?? siguiente?.id) !== grupoId) break;
        fin += 1;
      }
      items.push({
        tipo: "cita",
        inicio: hora(bloque.horaInicio),
        termino: hora(bloques[fin].horaFin),
        cita,
      });
      i = fin + 1;
      continue;
    }

    if (bloque.estado === "Bloqueado") {
      let fin = i;
      while (fin + 1 < bloques.length) {
        const siguiente = bloques[fin + 1];
        if (
          siguiente.estado !== "Bloqueado" ||
          citaSegunFiltro(siguiente, estadoFiltro) ||
          hora(siguiente.horaInicio) !== hora(bloques[fin].horaFin)
        )
          break;
        fin += 1;
      }
      items.push({
        tipo: "bloqueado",
        inicio: hora(bloque.horaInicio),
        termino: hora(bloques[fin].horaFin),
      });
      i = fin + 1;
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
  bloques,
  estadoFiltro = FILTRO_VIGENTES,
  onSeleccionarCita,
}: {
  bloques: BloqueAgendaResponse[];
  estadoFiltro?: string;
  onSeleccionarCita: (citaId: string) => void;
}) {
  const filas = construirFilas(bloques, estadoFiltro);

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
