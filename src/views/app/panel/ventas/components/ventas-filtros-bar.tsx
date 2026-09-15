"use client";

import { SearchInput } from "@/components/shared";
import { Button, Card } from "@/components/ui";

interface VentasFiltrosBarProps {
  rangoFecha: string;
  setRangoFecha: (v: string) => void;
  metodoPago: string;
  setMetodoPago: (v: string) => void;
  busquedaPaciente: string;
  setBusquedaPaciente: (v: string) => void;
  onAbrirNuevaVenta: () => void;
  onAbrirConfiguracion: () => void;
  onExportar: () => void;
}

export function VentasFiltrosBar({
  rangoFecha,
  setRangoFecha,
  metodoPago,
  setMetodoPago,
  busquedaPaciente,
  setBusquedaPaciente,
  onAbrirNuevaVenta,
  onAbrirConfiguracion,
  onExportar,
}: VentasFiltrosBarProps) {
  return (
    <Card className="p-4 rounded-none border border-slate-200 shadow-none font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Buscador de Paciente */}
        <div className="w-64 min-w-[200px]">
          <SearchInput
            placeholder="Buscar por paciente..."
            value={busquedaPaciente}
            onChange={setBusquedaPaciente}
          />
        </div>

        {/* Rango de Fecha */}
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-muted-foreground text-label">
            Fecha:
          </span>
          <select
            value={rangoFecha}
            onChange={e => setRangoFecha(e.target.value)}
            className="rounded-none border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-slate-900 focus:outline-none"
          >
            <option value="hoy">Hoy</option>
            <option value="ayer">Ayer</option>
            <option value="7dias">Últimos 7 Días</option>
            <option value="30dias">Últimos 30 Días</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </div>

        {/* Método de Pago */}
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-muted-foreground text-label">
            Pago:
          </span>
          <select
            value={metodoPago}
            onChange={e => setMetodoPago(e.target.value)}
            className="rounded-none border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-slate-900 focus:outline-none"
          >
            <option value="todos">Todos los Métodos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Debito">Débito</option>
            <option value="Credito">Crédito</option>
          </select>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="rounded-overlay px-3.5 py-2 text-xs"
            onClick={onAbrirConfiguracion}
          >
            Tarifas / POS
          </Button>

          <Button
            variant="outline"
            className="rounded-overlay px-3.5 py-2 text-xs"
            onClick={onExportar}
          >
            Exportar
          </Button>

          <Button
            className="rounded-overlay px-4 py-2 text-xs"
            onClick={onAbrirNuevaVenta}
          >
            Registrar Venta
          </Button>
        </div>
      </div>
    </Card>
  );
}
