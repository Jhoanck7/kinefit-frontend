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
    <Card className="p-4 rounded-none border-slate-200 shadow-none font-sans">
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
          <span className="font-medium text-slate-400 uppercase tracking-wider text-[11px]">
            Fecha:
          </span>
          <select
            value={rangoFecha}
            onChange={e => setRangoFecha(e.target.value)}
            className="rounded-none border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-slate-900 focus:outline-none"
          >
            <option value="hoy">HOY</option>
            <option value="ayer">AYER</option>
            <option value="7dias">ÚLTIMOS 7 DÍAS</option>
            <option value="30dias">ÚLTIMOS 30 DÍAS</option>
            <option value="personalizado">PERSONALIZADO</option>
          </select>
        </div>

        {/* Método de Pago */}
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-slate-400 uppercase tracking-wider text-[11px]">
            Pago:
          </span>
          <select
            value={metodoPago}
            onChange={e => setMetodoPago(e.target.value)}
            className="rounded-none border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-slate-900 focus:outline-none"
          >
            <option value="todos">TODOS LOS MÉTODOS</option>
            <option value="Efectivo">EFECTIVO</option>
            <option value="Transferencia">TRANSFERENCIA</option>
            <option value="Debito">DÉBITO</option>
            <option value="Credito">CRÉDITO</option>
          </select>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="px-3.5 py-2 text-xs"
            onClick={onAbrirConfiguracion}
          >
            TARIFAS / POS
          </Button>

          <Button
            variant="outline"
            className="px-3.5 py-2 text-xs"
            onClick={onExportar}
          >
            EXPORTAR
          </Button>

          <Button className="px-4 py-2 text-xs" onClick={onAbrirNuevaVenta}>
            REGISTRAR VENTA
          </Button>
        </div>
      </div>
    </Card>
  );
}
