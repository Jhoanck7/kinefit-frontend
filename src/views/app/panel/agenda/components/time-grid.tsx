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

function construirFilas(
  rejilla: { inicio: string; termino: string }[],
  bloques: BloqueAgendaResponse[]
): ItemFila[] {
  const porHora = new Map(
    bloques.map(b => [b.horaInicio.substring(0, 5), b] as const)
  );
  const items: ItemFila[] = [];
  let i = 0;

  while (i < rejilla.length) {
    const slot = rejilla[i];
    const bloque = porHora.get(slot.inicio);

    if (bloque?.cita) {
      const grupoId = bloque.cita.grupoCitaId ?? bloque.cita.id;
      let k = 0;
      while (i + k < rejilla.length) {
        const siguiente = porHora.get(rejilla[i + k].inicio);
        const siguienteGrupoId =
          siguiente?.cita?.grupoCitaId ?? siguiente?.cita?.id;
        if (!siguiente || siguienteGrupoId !== grupoId) break;
        k += 1;
      }
      const numBloques = Math.max(1, k);
      items.push({
        tipo: "cita",
        inicio: slot.inicio,
        termino: rejilla[i + numBloques - 1].termino,
        cita: bloque.cita,
      });
      i += numBloques;
      continue;
    }

    if (!bloque || bloque.estado === "Disponible") {
      let k = 0;
      while (i + k < rejilla.length) {
        const siguiente = porHora.get(rejilla[i + k].inicio);
        if (siguiente && siguiente.estado !== "Disponible") break;
        k += 1;
      }
      i += Math.max(1, k);
      continue;
    }

    // Bloqueado
    let k = 0;
    while (i + k < rejilla.length) {
      const siguiente = porHora.get(rejilla[i + k].inicio);
      if (!siguiente || siguiente.estado !== "Bloqueado") break;
      k += 1;
    }
    const numBloques = Math.max(1, k);
    items.push({
      tipo: "bloqueado",
      inicio: slot.inicio,
      termino: rejilla[i + numBloques - 1].termino,
    });
    i += numBloques;
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
  onSeleccionarCita,
}: {
  rejilla: { inicio: string; termino: string }[];
  bloques: BloqueAgendaResponse[];
  onSeleccionarCita: (citaId: string) => void;
}) {
  const filas = construirFilas(rejilla, bloques);

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
              Bloqueado
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
