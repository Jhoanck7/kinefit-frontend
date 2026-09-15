"use client";

import { Suspense } from "react";

import { EmptyState, Paginacion, SearchInput } from "@/components/shared";
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
import {
  CATALOGO_ESTADOS_DOCUMENTO,
  CodigoEstadoDocumento,
  etiquetaTipoDocumento,
  ORDEN_ESTADOS_DOCUMENTO,
} from "@/lib/estados-documento";
import { formatearFechaCorta } from "@/lib/formato";
import { TIPOS_DOCUMENTO } from "@/views/app/panel/documentos/plantillas/nuevo/hooks";

import { DocumentoDetalleModal } from "./components";
import { TAMANO_PAGINA, useDocumentos } from "./hooks";

const COLUMNAS = [
  "Documento",
  "Tipo",
  "Estado",
  "Paciente",
  "RUT",
  "Especialista",
  "Fecha de atención",
];

function DocumentosContenido() {
  const {
    hoy,
    busqueda,
    tipo,
    estado,
    especialistaId,
    especialistas,
    desde,
    hasta,
    total,
    inicio,
    visibles,
    documentoModalId,
    actions,
  } = useDocumentos();

  if (!hoy) return <div aria-hidden />;

  return (
    <div className="mx-auto max-w-6xl space-y-4 font-sans shadow-none">
      <Card className="p-4 border border-border">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="w-64 min-w-[200px]">
            <SearchInput
              placeholder="Buscar por paciente o RUT..."
              value={busqueda}
              onChange={actions.setBusqueda}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-medium text-muted-foreground text-label">
              Tipo:
            </span>
            <select
              value={tipo}
              onChange={e => actions.setTipo(e.target.value)}
              className="rounded-none border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-slate-900 focus:outline-none"
            >
              <option value="">Todos los Tipos</option>
              {TIPOS_DOCUMENTO.map(t => (
                <option key={t.valor} value={t.valor}>
                  {t.etiqueta}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-medium text-muted-foreground text-label">
              Estado:
            </span>
            <select
              value={estado}
              onChange={e => actions.setEstado(e.target.value)}
              className="rounded-none border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-slate-900 focus:outline-none"
            >
              <option value="">Todos</option>
              {ORDEN_ESTADOS_DOCUMENTO.map(codigo => (
                <option key={codigo} value={codigo}>
                  {CATALOGO_ESTADOS_DOCUMENTO[codigo].etiqueta}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-medium text-muted-foreground text-label">
              Especialista:
            </span>
            <select
              value={especialistaId}
              onChange={e => actions.setEspecialistaId(e.target.value)}
              className="rounded-none border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-slate-900 focus:outline-none"
            >
              <option value="">Todos</option>
              {especialistas.map(esp => (
                <option key={esp.id} value={String(esp.id)}>
                  {esp.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-medium text-muted-foreground text-label">
              Desde:
            </span>
            <input
              type="date"
              value={desde}
              onChange={e => actions.setDesde(e.target.value)}
              className="rounded-none border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800 focus:border-slate-900 focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-medium text-muted-foreground text-label">
              Hasta:
            </span>
            <input
              type="date"
              value={hasta}
              onChange={e => actions.setHasta(e.target.value)}
              className="rounded-none border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800 focus:border-slate-900 focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="rounded-overlay"
              onClick={actions.handleIrAPlantillas}
            >
              Plantillas
            </Button>
            <Button
              className="rounded-overlay"
              onClick={actions.handleRegistrarFicha}
            >
              Registrar Ficha
            </Button>
          </div>
        </div>
      </Card>

      <div className="overflow-hidden rounded-none border border-slate-200 shadow-none font-sans">
        <div className="px-6 py-3.5 border-b border-slate-200 bg-white font-sans">
          <p className="font-sans font-bold text-label text-foreground">
            {total} Documento(s)
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
            {visibles.map(documento => (
              <TableRow
                key={documento.id}
                onClick={() => actions.handleAbrirDocumento(documento.id)}
                tabIndex={0}
                role="button"
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    actions.handleAbrirDocumento(documento.id);
                  }
                }}
                className="cursor-pointer hover:bg-slate-50/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-slate-900"
              >
                <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                  {documento.nombre}
                </TableCell>
                <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                  {etiquetaTipoDocumento(documento.tipo)}
                </TableCell>
                <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                  {CATALOGO_ESTADOS_DOCUMENTO[
                    documento.estado as CodigoEstadoDocumento
                  ]?.etiqueta ?? documento.estado}
                  {documento.motivoCierre && (
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {documento.motivoCierre}
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                  {documento.pacienteNombre}
                </TableCell>
                <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                  {documento.pacienteRut || "Sin RUT"}
                </TableCell>
                <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                  {documento.especialistaNombre}
                </TableCell>
                <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                  {formatearFechaCorta(
                    new Date(`${documento.fechaAtencion}T00:00:00`)
                  )}
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
            onAnterior={actions.handlePaginaAnterior}
            onSiguiente={actions.handlePaginaSiguiente}
            puedeAnterior={inicio > 0}
            puedeSiguiente={inicio + TAMANO_PAGINA < total}
          />
        )}
      </div>

      {total === 0 && (
        <EmptyState
          titulo="Sin Resultados"
          descripcion="Ningún documento coincide con la búsqueda o el filtro seleccionado."
        />
      )}

      <DocumentoDetalleModal
        documentoId={documentoModalId}
        hoy={hoy}
        onCerrar={actions.handleCerrarModal}
      />
    </div>
  );
}

export default function DocumentosView() {
  return (
    <Suspense fallback={<div aria-hidden />}>
      <DocumentosContenido />
    </Suspense>
  );
}
