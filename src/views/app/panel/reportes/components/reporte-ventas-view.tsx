"use client";

import { useState } from "react";

import { Paginacion } from "@/components/shared";
import {
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { useGetReporteVentas } from "@/hooks/api";
import { reporteService } from "@/services";

const TAMANO_PAGINA = 8;

const COLUMNAS_REPORTE_VENTAS = [
  "Código / ID",
  "Fecha",
  "Paciente",
  "Método de Pago",
  "Monto Total ($)",
];

interface ReporteVentasViewProps {
  fechaDesde?: string;
  fechaHasta?: string;
}

export function ReporteVentasView({
  fechaDesde,
  fechaHasta,
}: ReporteVentasViewProps) {
  const [pagina, setPagina] = useState(1);
  const [descargando, setDescargando] = useState(false);

  const { data, isLoading: cargando } = useGetReporteVentas({
    fechaDesde,
    fechaHasta,
    page: pagina,
    pageSize: TAMANO_PAGINA,
  });

  const movimientos = data?.movimientos ?? [];
  const total = data?.totalVentas ?? 0;
  const montoTotalPeriodo = data?.montoTotalPeriodo ?? 0;
  const inicio = (pagina - 1) * TAMANO_PAGINA;

  async function handleDescargarCsv() {
    setDescargando(true);
    try {
      const res = await reporteService.descargarReporteVentasCsv({
        fechaDesde,
        fechaHasta,
      });
      const url = URL.createObjectURL(res.data);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `reporte-ventas-${fechaDesde ?? "todo"}.csv`;
      enlace.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("No se pudo generar el archivo CSV.");
    } finally {
      setDescargando(false);
    }
  }

  return (
    <div className="space-y-6 text-sm text-panel-sidebar">
      {/* Tarjetas Resumen del Flujo de Caja */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <span className="text-section-title font-bold text-muted-foreground">
            Monto Total del Período
          </span>
          <p className="mt-2 text-2xl font-bold text-emerald-800">
            ${montoTotalPeriodo.toLocaleString("es-CL")}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              CLP
            </span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Suma total recaudada en el filtro actual
          </p>
        </Card>

        <Card className="p-6">
          <span className="text-section-title font-bold text-muted-foreground">
            Transacciones Registradas
          </span>
          <p className="mt-2 text-2xl font-bold text-panel-sidebar">
            {total} ventas
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Movimientos de caja procesados
          </p>
        </Card>
      </div>

      {/* Exportación */}
      <Card className="p-6 flex flex-wrap items-center justify-center gap-4 text-center text-sm text-panel-sidebar">
        <div>
          <h3 className="text-section-title font-bold text-muted-foreground">
            Exportar Flujo de Caja
          </h3>
          <p className="text-sm text-muted-foreground">
            Descarga directa para contabilidad y conciliación bancaria
          </p>
        </div>
        <Button
          className="px-4 py-2 text-sm"
          onClick={handleDescargarCsv}
          disabled={descargando}
        >
          {descargando ? "Generando..." : "Exportar CSV"}
        </Button>
      </Card>

      {/* Tabla de Movimientos */}
      <div className="overflow-hidden rounded-none border border-slate-200 shadow-none">
        <div className="px-6 py-3.5 border-b border-slate-200 bg-white">
          <p className="font-bold text-panel-sidebar">
            {cargando ? "Cargando..." : "Historial de Movimientos"}
          </p>
        </div>

        <Table>
          <TableHeader className="bg-slate-50/80 border-b border-slate-200">
            <TableRow className="hover:bg-transparent border-b-0">
              {COLUMNAS_REPORTE_VENTAS.map(titulo => (
                <TableHead
                  key={titulo}
                  className={`px-4 py-3 text-table-head font-medium text-muted-foreground whitespace-nowrap ${
                    titulo === "Monto Total ($)" ? "text-right" : ""
                  }`}
                >
                  {titulo}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-200 bg-white">
            {movimientos.map(m => (
              <TableRow key={m.id} className="hover:bg-slate-50/70">
                <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                  #{m.id}
                </TableCell>
                <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                  {m.fecha}
                </TableCell>
                <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                  {m.pacienteNombre}
                </TableCell>
                <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                  {m.metodoPago}
                </TableCell>
                <TableCell className="px-4 py-3 text-right font-normal text-table-cell text-foreground">
                  ${m.monto.toLocaleString("es-CL")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {total > 0 && (
          <Paginacion
            inicio={inicio + 1}
            fin={Math.min(inicio + TAMANO_PAGINA, total)}
            total={total}
            onAnterior={() => setPagina(p => Math.max(1, p - 1))}
            onSiguiente={() =>
              setPagina(p => (inicio + TAMANO_PAGINA < total ? p + 1 : p))
            }
            puedeAnterior={pagina > 1}
            puedeSiguiente={inicio + TAMANO_PAGINA < total}
          />
        )}
      </div>
    </div>
  );
}
