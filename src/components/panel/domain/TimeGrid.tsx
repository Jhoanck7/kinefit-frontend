import { CitaResuelta, BloqueoResuelto } from "@/lib/panel/data/citas";
import { AppointmentCard } from "./AppointmentCard";

const ALTURA_FILA_PX = 56;

type ItemFila =
  | { tipo: "cita"; inicio: string; bloques: number; cita: CitaResuelta }
  | { tipo: "bloqueo"; inicio: string; bloques: number; bloqueo: BloqueoResuelto }
  | { tipo: "vacio"; inicio: string; termino: string; bloques: number };

function construirFilas(
  rejilla: { inicio: string; termino: string }[],
  citas: CitaResuelta[],
  bloqueos: BloqueoResuelto[]
): ItemFila[] {
  const items: ItemFila[] = [];
  let i = 0;
  while (i < rejilla.length) {
    const bloque = rejilla[i];
    const cita = citas.find((c) => c.horaInicio === bloque.inicio);
    if (cita) {
      items.push({ tipo: "cita", inicio: bloque.inicio, bloques: 1, cita });
      i += 1;
      continue;
    }
    const bloqueo = bloqueos.find((b) => b.horaInicio === bloque.inicio);
    if (bloqueo) {
      let k = 0;
      let horaActual = bloqueo.horaInicio;
      while (i + k < rejilla.length && horaActual < bloqueo.horaTermino) {
        horaActual = rejilla[i + k].termino;
        k += 1;
      }
      items.push({ tipo: "bloqueo", inicio: bloque.inicio, bloques: k, bloqueo });
      i += k;
      continue;
    }
    items.push({ tipo: "vacio", inicio: bloque.inicio, termino: bloque.termino, bloques: 1 });
    i += 1;
  }
  return items;
}

function minutosDe(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

/** Offset en px de la hora actual sobre la rejilla, o `null` si cae fuera de los tramos (p. ej., en la colación). */
function offsetHoraActual(rejilla: { inicio: string; termino: string }[], horaActual: string): number | null {
  const minutosActual = minutosDe(horaActual);
  for (let idx = 0; idx < rejilla.length; idx++) {
    const inicioMin = minutosDe(rejilla[idx].inicio);
    const terminoMin = minutosDe(rejilla[idx].termino);
    if (minutosActual >= inicioMin && minutosActual < terminoMin) {
      const fraccion = (minutosActual - inicioMin) / (terminoMin - inicioMin);
      return (idx + fraccion) * ALTURA_FILA_PX;
    }
  }
  return null;
}

export function TimeGrid({
  rejilla,
  citas,
  bloqueos,
  horaActual,
  onSeleccionarCita,
  onSeleccionarBloqueVacio,
}: {
  rejilla: { inicio: string; termino: string }[];
  citas: CitaResuelta[];
  bloqueos: BloqueoResuelto[];
  /** Hora "HH:MM" si el día mostrado es hoy; `null` en caso contrario (A-8). */
  horaActual: string | null;
  onSeleccionarCita: (citaId: string) => void;
  onSeleccionarBloqueVacio: (hora: string) => void;
}) {
  const filas = construirFilas(rejilla, citas, bloqueos);
  const lineaHoraActual = horaActual ? offsetHoraActual(rejilla, horaActual) : null;

  return (
    <div className="flex">
      <div className="w-16 shrink-0">
        {rejilla.map((bloque) => (
          <div
            key={bloque.inicio}
            style={{ height: ALTURA_FILA_PX }}
            className="flex items-start justify-end border-b border-brand-border/60 pr-2 pt-1 text-[11px] text-brand-muted"
          >
            {bloque.inicio}
          </div>
        ))}
      </div>

      <div className="relative flex-1 border-l border-brand-border">
        {filas.map((item) => (
          <div
            key={item.inicio}
            style={{ height: item.bloques * ALTURA_FILA_PX }}
            className="border-b border-brand-border/60"
          >
            {item.tipo === "cita" && (
              <AppointmentCard cita={item.cita} onClick={() => onSeleccionarCita(item.cita.id)} />
            )}
            {item.tipo === "bloqueo" && (
              <div className="flex h-full w-full items-center justify-center bg-slate-700 text-sm font-bold text-white">
                {item.bloqueo.motivo}
              </div>
            )}
            {item.tipo === "vacio" && (
              <button
                type="button"
                onClick={() => onSeleccionarBloqueVacio(item.inicio)}
                aria-label={`Iniciar reserva a las ${item.inicio}`}
                className="h-full w-full transition-colors hover:bg-panel-fondo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-panel-sidebar"
              />
            )}
          </div>
        ))}

        {lineaHoraActual !== null && (
          <div
            className="pointer-events-none absolute left-0 right-0 border-t-2 border-red-500"
            style={{ top: lineaHoraActual }}
            aria-hidden
          >
            <span className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-red-500" />
          </div>
        )}
      </div>
    </div>
  );
}
