import { Button } from "@/components/ui";
import { CATALOGO_ESTADOS } from "@/lib/estados";
import { fechaISO } from "@/lib/formato";
import { EspecialistaResponse } from "@/models/responses";

import { FILTRO_VIGENTES } from "./time-grid";

interface AgendaToolbarProps {
  dia: Date;
  especialistas: EspecialistaResponse[];
  especialistaSeleccionado: string;
  estadoSeleccionado: string;
  onCambiarEstado: (estado: string) => void;
  onCambiarEspecialista: (id: string) => void;
  onIrADia: (delta: number) => void;
  onIrAHoy: () => void;
  onCambiarFecha: (valor: string) => void;
  onAbrirBloqueos: () => void;
  onNuevaReserva: () => void;
}

export function AgendaToolbar({
  dia,
  especialistas,
  especialistaSeleccionado,
  estadoSeleccionado,
  onCambiarEstado,
  onCambiarEspecialista,
  onIrADia,
  onIrAHoy,
  onCambiarFecha,
  onAbrirBloqueos,
  onNuevaReserva,
}: AgendaToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 bg-white p-3 rounded-none shadow-none">
      {/* Controles de Navegación por Día */}
      <div className="flex items-center gap-2">
        <div className="flex items-center border border-slate-200 bg-white divide-x divide-slate-200 rounded-none">
          <button
            type="button"
            onClick={() => onIrADia(-1)}
            aria-label="Día anterior"
            className="px-3 py-1.5 font-sans text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={onIrAHoy}
            className="px-3 py-1.5 font-sans text-xs font-bold text-slate-900 hover:bg-slate-50 focus:outline-none"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => onIrADia(1)}
            aria-label="Día siguiente"
            className="px-3 py-1.5 font-sans text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none"
          >
            Siguiente
          </button>
        </div>

        <input
          type="date"
          value={fechaISO(dia)}
          onChange={e => onCambiarFecha(e.target.value)}
          className="border border-slate-200 bg-white px-3 py-1.5 font-sans text-xs font-medium text-slate-900 rounded-none focus:border-slate-900 focus:outline-none cursor-pointer"
        />
      </div>

      {/* Filtro por Especialista + Botones */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={estadoSeleccionado}
          onChange={e => onCambiarEstado(e.target.value)}
          className="border border-slate-200 bg-white px-3 py-1.5 font-sans text-xs font-medium text-slate-900 rounded-none focus:border-slate-900 focus:outline-none cursor-pointer"
        >
          <option value={FILTRO_VIGENTES}>Reservas Vigentes</option>
          {Object.values(CATALOGO_ESTADOS).map(estado => (
            <option key={estado.codigo} value={estado.codigo}>
              {estado.etiqueta}
            </option>
          ))}
        </select>

        <select
          value={especialistaSeleccionado}
          onChange={e => onCambiarEspecialista(e.target.value)}
          className="border border-slate-200 bg-white px-3 py-1.5 font-sans text-xs font-medium text-slate-900 rounded-none focus:border-slate-900 focus:outline-none cursor-pointer"
        >
          <option value="todas">Todas las Especialistas</option>
          {especialistas.map(esp => (
            <option key={esp.id} value={esp.id}>
              {esp.nombre}
            </option>
          ))}
        </select>

        <Button
          variant="outline"
          className="rounded-overlay"
          onClick={onAbrirBloqueos}
        >
          Bloqueos
        </Button>

        <Button className="rounded-overlay" onClick={onNuevaReserva}>
          Nueva Reserva
        </Button>
      </div>
    </div>
  );
}
