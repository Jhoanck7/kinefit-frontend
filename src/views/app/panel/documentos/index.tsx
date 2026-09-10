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

const ESTADOS = [
  { valor: "Borrador", etiqueta: "Borrador" },
  { valor: "Pendiente", etiqueta: "Pendiente" },
  { valor: "Completado", etiqueta: "Completado" },
  { valor: "Bloqueado", etiqueta: "Bloqueado" },
  { valor: "CerradoPorBaja", etiqueta: "Cerrado por baja" },
  { valor: "Anulado", etiqueta: "Anulado" },
];

const ETIQUETA_ESTADO: Record<string, string> = Object.fromEntries(
  ESTADOS.map(e => [e.valor, e.etiqueta])
);

const COLOR_ESTADO: Record<string, string> = {
  Borrador: "bg-slate-400",
  Pendiente: "bg-amber-500",
  Completado: "bg-emerald-600",
  Bloqueado: "bg-red-500",
  CerradoPorBaja: "bg-red-500",
  Anulado: "bg-slate-500",
};

const ESTADOS_INTERRUMPIDOS = new Set(["Bloqueado", "CerradoPorBaja"]);

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
            <span className="font-medium text-slate-400 uppercase tracking-wider text-[11px]">
              Tipo:
            </span>
            <select
              value={tipo}
              onChange={e => actions.setTipo(e.target.value)}
              className="rounded-none border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-slate-900 focus:outline-none"
            >
              <option value="">TODOS LOS TIPOS</option>
              {TIPOS_DOCUMENTO.map(t => (
                <option key={t.valor} value={t.valor}>
                  {t.etiqueta.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-medium text-slate-400 uppercase tracking-wider text-[11px]">
              Estado:
            </span>
            <select
              value={estado}
              onChange={e => actions.setEstado(e.target.value)}
              className="rounded-none border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-slate-900 focus:outline-none"
            >
              <option value="">TODOS</option>
              {ESTADOS.map(e => (
                <option key={e.valor} value={e.valor}>
                  {e.etiqueta.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-medium text-slate-400 uppercase tracking-wider text-[11px]">
              Especialista:
            </span>
            <select
              value={especialistaId}
              onChange={e => actions.setEspecialistaId(e.target.value)}
              className="rounded-none border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-slate-900 focus:outline-none"
            >
              <option value="">TODOS</option>
              {especialistas.map(esp => (
                <option key={esp.id} value={String(esp.id)}>
                  {esp.nombre.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-medium text-slate-400 uppercase tracking-wider text-[11px]">
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
            <span className="font-medium text-slate-400 uppercase tracking-wider text-[11px]">
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
            <Button variant="outline" onClick={actions.handleIrAPlantillas}>
              Plantillas
            </Button>
            <Button onClick={actions.handleRegistrarFicha}>
              Registrar ficha
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden rounded-none border-slate-200 shadow-none font-sans">
        <div className="px-6 py-3.5 border-b border-slate-200 bg-white font-sans">
          <p className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
            {total} documento(s)
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
                <TableCell className="px-4 py-3 font-medium text-sm text-slate-900">
                  {documento.nombre}
                </TableCell>
                <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                  {documento.tipo}
                </TableCell>
                <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${COLOR_ESTADO[documento.estado] ?? "bg-slate-400"}`}
                      aria-hidden
                    />
                    <span
                      className={
                        ESTADOS_INTERRUMPIDOS.has(documento.estado)
                          ? "text-amber-800"
                          : "text-slate-700"
                      }
                    >
                      {ETIQUETA_ESTADO[documento.estado] ?? documento.estado}
                    </span>
                  </span>
                  {documento.motivoCierre && (
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {documento.motivoCierre}
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                  {documento.pacienteNombre}
                </TableCell>
                <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                  {documento.pacienteRut || "Sin RUT"}
                </TableCell>
                <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                  {documento.especialistaNombre}
                </TableCell>
                <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                  {formatearFechaCorta(
                    new Date(`${documento.fechaAtencion}T00:00:00`)
                  )}
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
      </Card>

      {total === 0 && (
        <EmptyState
          titulo="Sin resultados"
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
