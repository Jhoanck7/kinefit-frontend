"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/panel/primitives/Button";
import { Card } from "@/components/panel/primitives/Card";
import {
  FilaTabla,
  Paginacion,
  Table,
} from "@/components/panel/primitives/Table";
import {
  descargarReporteVentasCsv,
  getReporteVentas,
  ReporteVentasResuelto,
} from "@/lib/panel/data/reportes";

const TAMANO_PAGINA = 8;

const COLUMNAS_REPORTE_VENTAS = [
  { titulo: "Código / ID" },
  { titulo: "Fecha" },
  { titulo: "Paciente" },
  { titulo: "Método de Pago" },
  { titulo: "Monto Total ($)", className: "text-right" },
];

interface ReporteVentasViewProps {
  fechaDesde?: string;
  fechaHasta?: string;
}

export function ReporteVentasView({
  fechaDesde,
  fechaHasta,
}: ReporteVentasViewProps) {
  const [data, setData] = useState<ReporteVentasResuelto>({
    totalVentas: 0,
    montoTotalPeriodo: 0,
    page: 1,
    pageSize: TAMANO_PAGINA,
    movimientos: [],
  });
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    getReporteVentas({
      fechaDesde,
      fechaHasta,
      page: pagina,
      pageSize: TAMANO_PAGINA,
    }).then(res => {
      setData(res);
      setCargando(false);
    });
  }, [fechaDesde, fechaHasta, pagina]);

  const total = data.totalVentas;
  const inicio = (pagina - 1) * TAMANO_PAGINA;

  async function handleDescargarCsv() {
    setDescargando(true);
    try {
      await descargarReporteVentasCsv({ fechaDesde, fechaHasta });
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
        <Card>
          <span className="text-sm font-bold uppercase tracking-wider text-brand-muted">
            Monto Total del Período
          </span>
          <p className="mt-2 text-2xl font-bold text-emerald-800">
            ${data.montoTotalPeriodo.toLocaleString("es-CL")}{" "}
            <span className="text-sm font-normal text-brand-muted">CLP</span>
          </p>
          <p className="mt-1 text-sm text-brand-muted">
            Suma total recaudada en el filtro actual
          </p>
        </Card>

        <Card>
          <span className="text-sm font-bold uppercase tracking-wider text-brand-muted">
            Transacciones Registradas
          </span>
          <p className="mt-2 text-2xl font-bold text-panel-sidebar">
            {data.totalVentas} ventas
          </p>
          <p className="mt-1 text-sm text-brand-muted">
            Movimientos de caja procesados
          </p>
        </Card>
      </div>

      {/* Exportación */}
      <Card className="flex flex-wrap items-center justify-center gap-4 text-center text-sm text-panel-sidebar">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted">
            Exportar Flujo de Caja
          </h3>
          <p className="text-sm text-brand-muted">
            Descarga directa para contabilidad y conciliación bancaria
          </p>
        </div>
        <Button
          variante="primario"
          className="px-4 py-2 text-sm"
          onClick={handleDescargarCsv}
          disabled={descargando}
        >
          {descargando ? "Generando..." : "Exportar CSV"}
        </Button>
      </Card>

      {/* Tabla de Movimientos usando la primitiva Table canónica */}
      <Table
        columnas={COLUMNAS_REPORTE_VENTAS}
        encabezado={
          <p className="font-bold text-panel-sidebar">
            {cargando ? "Cargando..." : "Historial de Movimientos"}
          </p>
        }
        pie={
          total > 0 ? (
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
          ) : undefined
        }
      >
        {data.movimientos.map(m => (
          <FilaTabla key={m.id}>
            <td className="px-4 py-3 font-bold text-panel-sidebar">
              {m.codigo}
            </td>
            <td className="px-4 py-3 text-brand-muted">{m.fecha}</td>
            <td className="px-4 py-3 font-medium text-panel-sidebar">
              {m.pacienteNombre}
            </td>
            <td className="px-4 py-3 text-panel-sidebar">{m.metodoPago}</td>
            <td className="px-4 py-3 text-right font-bold text-panel-sidebar">
              ${m.monto.toLocaleString("es-CL")}
            </td>
          </FilaTabla>
        ))}
      </Table>
    </div>
  );
}
