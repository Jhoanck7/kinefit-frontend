"use client";

import { Paginacion } from "@/components/shared";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";

import {
  ConfiguracionFinancieraModal,
  NuevaVentaModal,
  VentaDetalleModal,
  VentasFiltrosBar,
} from "./components";
import { TAMANO_PAGINA, useVentas } from "./hooks";

const COLUMNAS = [
  "ID / Venta",
  "Fecha",
  "Cliente",
  "Servicio",
  "Monto Bruto",
  "Método Pago",
  "Terminal POS",
  "Comisión POS",
  "IVA",
  "Monto Neto",
  "Pago Prof.",
  "Margen Clínica",
];

export default function VentasView() {
  const {
    ventasFiltradas,
    total,
    terminales,
    cargando,
    ventaSeleccionada,
    inicio,
    modalNuevaVenta,
    modalConfig,
    rangoFecha,
    metodoPago,
    busquedaPaciente,
    actions,
  } = useVentas();

  return (
    <div className="mx-auto max-w-6xl space-y-4 font-sans shadow-none">
      {/* Barra de Filtros */}
      <VentasFiltrosBar
        rangoFecha={rangoFecha}
        setRangoFecha={actions.handleCambiarRango}
        metodoPago={metodoPago}
        setMetodoPago={actions.handleCambiarMetodoPago}
        busquedaPaciente={busquedaPaciente}
        setBusquedaPaciente={actions.setBusquedaPaciente}
        onAbrirNuevaVenta={() => actions.setModalNuevaVenta(true)}
        onAbrirConfiguracion={() => actions.setModalConfig(true)}
        onExportar={actions.handleExportar}
      />

      {/* Tabla Principal de Ventas */}
      <Card className="p-0 overflow-hidden rounded-none border-slate-200 shadow-none font-sans">
        <div className="px-6 py-3.5 border-b border-slate-200 bg-white font-sans">
          <p className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
            {cargando ? "Cargando..." : `${total} ventas registradas`}
          </p>
        </div>

        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow className="hover:bg-transparent border-b-0">
              {COLUMNAS.map(titulo => (
                <TableHead
                  key={titulo}
                  className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 whitespace-nowrap"
                >
                  {titulo}
                </TableHead>
              ))}
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-200 bg-white">
            {ventasFiltradas.map(venta => {
              const primerItem = venta.items[0];
              return (
                <TableRow
                  key={venta.id}
                  onClick={() => actions.setVentaSeleccionada(venta)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      actions.setVentaSeleccionada(venta);
                    }
                  }}
                  className="cursor-pointer hover:bg-slate-50/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-slate-900"
                >
                  <TableCell className="px-4 py-3 font-medium text-sm text-slate-900">
                    {venta.codigoDisplay}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                    {venta.fechaFormateada}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                    {venta.pacienteNombre}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                    {primerItem?.servicioNombre ?? "Atención"}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-sm text-slate-900 whitespace-nowrap">
                    ${venta.montoBruto.toLocaleString("es-CL")}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                    {venta.metodoPago}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                    {venta.terminalNombre ?? "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                    {venta.comisionPosMonto > 0
                      ? `-$${venta.comisionPosMonto.toLocaleString("es-CL")}`
                      : "$0"}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                    ${venta.ivaMonto.toLocaleString("es-CL")}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                    ${venta.montoNeto.toLocaleString("es-CL")}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                    {venta.pagoProfesional
                      ? `$${venta.pagoProfesional.toLocaleString("es-CL")}`
                      : "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                    {venta.margenClinica
                      ? `$${venta.margenClinica.toLocaleString("es-CL")}`
                      : "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <svg
                      className="inline h-4 w-4 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {total > 0 && (
          <Paginacion
            inicio={inicio + 1}
            fin={Math.min(inicio + TAMANO_PAGINA, total)}
            total={total}
            onAnterior={actions.handlePaginaAnterior}
            onSiguiente={actions.handlePaginaSiguiente}
            puedeAnterior={inicio > 0}
            puedeSiguiente={inicio + TAMANO_PAGINA < total}
          />
        )}
      </Card>

      {/* Modales */}
      <VentaDetalleModal
        venta={ventaSeleccionada}
        onClose={() => actions.setVentaSeleccionada(null)}
      />
      <NuevaVentaModal
        abierto={modalNuevaVenta}
        onClose={() => actions.setModalNuevaVenta(false)}
        terminales={terminales}
        onCrearVenta={() => actions.cargarVentas()}
      />
      <ConfiguracionFinancieraModal
        abierto={modalConfig}
        onClose={actions.handleCerrarConfig}
      />
    </div>
  );
}
