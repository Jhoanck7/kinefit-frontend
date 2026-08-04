import { fechaISO, formatearMesAnio } from "@/lib/panel/domain/formato";

const DIAS_SEMANA = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

function primerDiaDelMes(mes: Date): Date {
  return new Date(mes.getFullYear(), mes.getMonth(), 1);
}

function diasDelMes(mes: Date): Date[] {
  const primero = primerDiaDelMes(mes);
  const cantidadDias = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  return Array.from({ length: cantidadDias }, (_, i) => new Date(mes.getFullYear(), mes.getMonth(), i + 1));
}

/** Lunes = 0 ... domingo = 6, para alinear la cuadrícula (P1-3: fines de semana seleccionables). */
function offsetLunes(fecha: Date): number {
  const dia = fecha.getDay();
  return dia === 0 ? 6 : dia - 1;
}

/** Calendario mensual navegable (B.4). Días pasados deshabilitados; fines de semana seleccionables. */
export function MonthCalendar({
  mesVisible,
  fechaSeleccionada,
  hoy,
  onSeleccionarFecha,
  onCambiarMes,
}: {
  mesVisible: Date;
  fechaSeleccionada: Date | null;
  hoy: Date;
  onSeleccionarFecha: (fecha: Date) => void;
  onCambiarMes: (delta: number) => void;
}) {
  const dias = diasDelMes(mesVisible);
  const offsetInicial = offsetLunes(dias[0]);
  const hoyISO = fechaISO(hoy);
  const seleccionadaISO = fechaSeleccionada ? fechaISO(fechaSeleccionada) : null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onCambiarMes(-1)}
          aria-label="Mes anterior"
          className="rounded p-1 text-panel-sidebar hover:bg-panel-fondo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
        >
          ‹
        </button>
        <p className="font-bold text-panel-sidebar">{formatearMesAnio(mesVisible)}</p>
        <button
          type="button"
          onClick={() => onCambiarMes(1)}
          aria-label="Mes siguiente"
          className="rounded p-1 text-panel-sidebar hover:bg-panel-fondo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-brand-muted">
        {DIAS_SEMANA.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: offsetInicial }).map((_, i) => (
          <div key={`vacio-${i}`} />
        ))}
        {dias.map((dia) => {
          const iso = fechaISO(dia);
          const pasado = iso < hoyISO;
          const seleccionado = iso === seleccionadaISO;
          return (
            <button
              key={iso}
              type="button"
              disabled={pasado}
              onClick={() => onSeleccionarFecha(dia)}
              className={`aspect-square rounded-full text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar disabled:cursor-not-allowed disabled:text-brand-border ${
                seleccionado
                  ? "bg-panel-sidebar font-semibold text-white"
                  : pasado
                    ? ""
                    : "text-panel-sidebar hover:bg-panel-fondo"
              }`}
            >
              {dia.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
