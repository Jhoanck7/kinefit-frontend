"use client";

import { Suspense } from "react";

import { FichaDetalleModal } from "@/components/panel/domain/FichaDetalleModal";
import { NeutralBadge } from "@/components/panel/primitives/Badge";
import { SearchInput } from "@/components/panel/primitives/CamposFormulario";
import { EmptyState } from "@/components/panel/primitives/EmptyState";
import { Paginacion } from "@/components/panel/primitives/Table";
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
  formatearFechaCorta,
  formatearRangoHorario,
} from "@/lib/panel/domain/formato";

import { TAMANO_PAGINA, useFichas } from "./hooks";

const COLUMNAS = [
  "Paciente",
  "RUT",
  "Tipo de ficha",
  "Fecha de atención",
  "Reserva asociada",
  "Registrada por",
];

function FichasContenido() {
  const {
    hoy,
    busqueda,
    tipo,
    desde,
    hasta,
    formatos,
    total,
    inicio,
    visibles,
    fichaModalId,
    actions,
  } = useFichas();

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
              {formatos.map(f => (
                <option key={f.id} value={f.nombre}>
                  {f.nombre.toUpperCase()}
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
            <Button variant="outline" onClick={actions.handleIrAFormatos}>
              Formatos de ficha
            </Button>
            <Button onClick={actions.handleNuevaFicha}>Nueva ficha</Button>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden rounded-none border-slate-200 shadow-none font-sans">
        <div className="px-6 py-3.5 border-b border-slate-200 bg-white font-sans">
          <p className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
            {total} fichas registradas
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
            {visibles.map(ficha => (
              <TableRow
                key={ficha.id}
                onClick={() => actions.handleAbrirFicha(ficha.id)}
                tabIndex={0}
                role="button"
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    actions.handleAbrirFicha(ficha.id);
                  }
                }}
                className="cursor-pointer hover:bg-slate-50/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-slate-900"
              >
                <TableCell className="px-4 py-3 font-medium text-sm text-slate-900">
                  {ficha.paciente.nombre} {ficha.paciente.apellido}
                </TableCell>
                <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                  {ficha.paciente.rut || "—"}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <NeutralBadge>{ficha.tipo}</NeutralBadge>
                </TableCell>
                <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                  {formatearFechaCorta(ficha.cita.fecha)}
                </TableCell>
                <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                  {formatearFechaCorta(ficha.cita.fecha)} ·{" "}
                  {formatearRangoHorario(
                    ficha.cita.horaInicio,
                    ficha.cita.horaTermino
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                  {ficha.registradaPor}
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
          descripcion="Ninguna ficha coincide con la búsqueda o el filtro seleccionado."
        />
      )}

      <FichaDetalleModal
        fichaId={fichaModalId}
        hoy={hoy}
        onCerrar={actions.handleCerrarModal}
        onSeleccionarFicha={actions.handleAbrirFicha}
      />
    </div>
  );
}

export default function FichasView() {
  return (
    <Suspense fallback={<div aria-hidden />}>
      <FichasContenido />
    </Suspense>
  );
}
