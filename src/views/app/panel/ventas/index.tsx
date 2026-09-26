"use client";

import { Alerta, Paginacion } from "@/components/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { formatearFechaHora } from "@/lib/formato";

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
  "Descuento Convenio",
  "Monto Bruto",
  "Método Pago",
  "Terminal POS",
  "Comisión POS",
  "IVA",
  "Monto Neto",
  "Pago Prof.",
  "Margen de la Empresa",
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
    errorExportar,
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

      {errorExportar && <Alerta tono="error">{errorExportar}</Alerta>}

      {/* Tabla Principal de Ventas */}
      <div className="overflow-hidden rounded-none border border-slate-200 shadow-none font-sans">
        <div className="px-6 py-3.5 border-b border-slate-200 bg-white font-sans">
          <p className="font-sans font-bold text-label text-foreground">
            {cargando ? "Cargando…" : `${total} Ventas Registradas`}
          </p>
        </div>

        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow className="hover:bg-transparent border-b-0">
              {COLUMNAS.map(titulo => (
                <TableHead
                  key={titulo}
                  className="px-4 py-3 text-table-head font-bold text-muted-foreground whitespace-nowrap"
                >
                  {titulo}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-200 bg-white">
            {ventasFiltradas.map(venta => {
              const primerItem = venta.items[0];
              const montoNeto =
                venta.desglose.montoTotal - (venta.desglose.impuesto ?? 0);
              return (
                <TableRow
                  key={venta.id}
                  onClick={() => actions.setVentaSeleccionada(venta.id)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      actions.setVentaSeleccionada(venta.id);
                    }
                  }}
                  className="cursor-pointer hover:bg-slate-50/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-slate-900"
                >
                  <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                    #{venta.id}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                    {formatearFechaHora(new Date(venta.createdAt))}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                    {venta.pacienteNombre ?? "Cliente sin registrar"}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                    {primerItem?.servicioNombre ??
                      primerItem?.descripcion ??
                      "Atención"}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                    {venta.desglose.descuentoConvenio
                      ? `-$${venta.desglose.descuentoConvenio.toLocaleString("es-CL")}`
                      : "Sin Convenio"}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground whitespace-nowrap">
                    ${venta.desglose.montoTotal.toLocaleString("es-CL")}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                    {venta.metodoPago}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                    {venta.terminalNombre ?? "No Aplica"}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                    {!venta.terminalPagoId
                      ? "No Aplica"
                      : venta.desglose.comisionTerminal > 0
                        ? `-$${venta.desglose.comisionTerminal.toLocaleString("es-CL")}`
                        : "$0"}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                    ${(venta.desglose.impuesto ?? 0).toLocaleString("es-CL")}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                    ${montoNeto.toLocaleString("es-CL")}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                    {venta.desglose.montoProfesional
                      ? `$${venta.desglose.montoProfesional.toLocaleString("es-CL")}`
                      : "Sin Reparto Configurado"}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                    {venta.desglose.montoCentro
                      ? `$${venta.desglose.montoCentro.toLocaleString("es-CL")}`
                      : "Sin Reparto Configurado"}
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
      </div>

      {/* Modales */}
      <VentaDetalleModal
        venta={ventaSeleccionada}
        terminales={terminales}
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
