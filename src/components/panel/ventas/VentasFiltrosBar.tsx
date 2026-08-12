"use client";

import { Button } from "@/components/panel/primitives/Button";
import { Card } from "@/components/panel/primitives/Card";
import { SearchInput } from "@/components/panel/primitives/CamposFormulario";

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
    <Card>
      {/* Contenedor Centrado de Filtros Soportados por Backend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-panel-sidebar">
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
          <span className="font-semibold text-brand-muted text-sm">Fecha:</span>
          <select
            value={rangoFecha}
            onChange={(e) => setRangoFecha(e.target.value)}
            className="rounded-lg border border-brand-border bg-panel-fondo px-3 py-2 text-sm font-medium text-panel-sidebar transition-colors focus:border-panel-sidebar focus:bg-white focus:outline-none"
          >
            <option value="hoy">Hoy</option>
            <option value="ayer">Ayer</option>
            <option value="7dias">Últimos 7 días</option>
            <option value="30dias">Últimos 30 días</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </div>

        {/* Método de Pago */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-brand-muted text-sm">Método de Pago:</span>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            className="rounded-lg border border-brand-border bg-panel-fondo px-3 py-2 text-sm font-medium text-panel-sidebar transition-colors focus:border-panel-sidebar focus:bg-white focus:outline-none"
          >
            <option value="todos">Todos los métodos</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Debito">Débito</option>
            <option value="Credito">Crédito</option>
          </select>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button variante="secundario" className="px-4 py-2 text-sm" onClick={onAbrirConfiguracion}>
            Tarifas / POS
          </Button>

          <Button variante="secundario" className="px-4 py-2 text-sm" onClick={onExportar}>
            Exportar
          </Button>

          <Button variante="primario" className="px-4 py-2 text-sm" onClick={onAbrirNuevaVenta}>
            Registrar Venta
          </Button>
        </div>
      </div>
    </Card>
  );
}
