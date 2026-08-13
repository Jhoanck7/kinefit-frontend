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
      let k = 0;
      let horaActual = cita.horaInicio;
      const horaTerminoCita = cita.horaTermino || "";
      while (i + k < rejilla.length && (horaTerminoCita ? horaActual < horaTerminoCita : k < 1)) {
        horaActual = rejilla[i + k].termino;
        k += 1;
      }
      const numBloques = Math.max(1, k);
      items.push({ tipo: "cita", inicio: bloque.inicio, bloques: numBloques, cita });
      i += numBloques;
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
      const numBloques = Math.max(1, k);
      items.push({ tipo: "bloqueo", inicio: bloque.inicio, bloques: numBloques, bloqueo });
      i += numBloques;
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

/**
 * TimeGrid Frameless Minimalista:
 * - Grilla separada solo por líneas horizontales de 1px en color gris muy claro (border-slate-100)
 * - Tipografía Satoshi unificada
 */
export function TimeGrid({
  rejilla,
  citas,
  bloqueos,
  horaActual,
  onSeleccionarCita,
  onSeleccionarBloqueVacio,
  ocultarHoras = false,
}: {
  rejilla: { inicio: string; termino: string }[];
  citas: CitaResuelta[];
  bloqueos: BloqueoResuelto[];
  horaActual: string | null;
  onSeleccionarCita: (citaId: string) => void;
  onSeleccionarBloqueVacio: (hora: string) => void;
  ocultarHoras?: boolean;
}) {
  const filas = construirFilas(rejilla, citas, bloqueos);
  const lineaHoraActual = horaActual ? offsetHoraActual(rejilla, horaActual) : null;

  return (
    <div className="flex w-full select-none shadow-none font-sans">
      {!ocultarHoras && (
        <div className="w-12 shrink-0">
          {rejilla.map((bloque) => (
            <div
              key={bloque.inicio}
              style={{ height: ALTURA_FILA_PX }}
              className="flex items-start justify-end border-b border-slate-100 pr-2 pt-1 font-sans text-[11px] font-medium text-slate-400"
            >
              {bloque.inicio}
            </div>
          ))}
        </div>
      )}

      <div className={`relative flex-1 ${!ocultarHoras ? "border-l border-slate-100" : ""}`}>
        {filas.map((item) => (
          <div
            key={item.inicio}
            style={{ height: item.bloques * ALTURA_FILA_PX }}
            className="border-b border-slate-100"
          >
            {item.tipo === "cita" && (
              <AppointmentCard cita={item.cita} onClick={() => onSeleccionarCita(item.cita.id)} />
            )}
            {item.tipo === "bloqueo" && (
              <div className="flex h-full w-full items-center justify-center border-b border-slate-100 bg-slate-100/70 p-1 text-center font-sans text-xs font-semibold uppercase tracking-wider text-slate-600 rounded-none shadow-none">
                {item.bloqueo.motivo}
              </div>
            )}
            {item.tipo === "vacio" && (
              <button
                type="button"
                onClick={() => onSeleccionarBloqueVacio(item.inicio)}
                aria-label={`Iniciar reserva a las ${item.inicio}`}
                className="h-full w-full rounded-none transition-colors hover:bg-slate-50/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-blue-900"
              />
            )}
          </div>
        ))}

        {lineaHoraActual !== null && (
          <div
            className="pointer-events-none absolute left-0 right-0 border-t-2 border-red-500 z-10"
            style={{ top: lineaHoraActual }}
            aria-hidden
          >
            <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
          </div>
        )}
      </div>
    </div>
  );
}
