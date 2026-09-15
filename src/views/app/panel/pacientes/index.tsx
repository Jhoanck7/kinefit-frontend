"use client";

import { Suspense } from "react";

import { EmptyState, Paginacion, SearchInput } from "@/components/shared";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";

import { PacienteDetalleModal } from "./components";
import { TAMANO_PAGINA, usePacientes } from "./hooks";

const COLUMNAS = [
  "Nombre",
  "Apellido",
  "RUT",
  "Correo",
  "Teléfono",
  "Convenio",
];

function PacientesContent() {
  const {
    hoy,
    busqueda,
    buscando,
    pagina,
    total,
    inicio,
    visibles,
    pacienteModalId,
    actions,
  } = usePacientes();

  if (!hoy) return <div aria-hidden />;

  return (
    <div className="mx-auto max-w-6xl font-sans shadow-none">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px]">
          <SearchInput
            placeholder="Buscar por RUT, nombre o correo..."
            value={busqueda}
            onChange={actions.setBusqueda}
            ayuda={buscando ? "Buscando…" : undefined}
          />
        </div>
        <Button
          className="rounded-overlay"
          onClick={actions.handleNuevoPaciente}
        >
          Nuevo Paciente
        </Button>
      </div>

      <div className="overflow-hidden rounded-none border border-slate-200 shadow-none font-sans">
        <div className="px-6 py-3.5 border-b border-slate-200 bg-white font-sans">
          <p className="font-sans font-bold text-label text-foreground">
            {total} Pacientes Registrados
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
            {visibles.map(paciente => (
              <TableRow
                key={paciente.id}
                onClick={() => actions.handleAbrirPaciente(paciente.id)}
                tabIndex={0}
                role="button"
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    actions.handleAbrirPaciente(paciente.id);
                  }
                }}
                className="cursor-pointer hover:bg-slate-50/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-slate-900"
              >
                <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                  {paciente.nombre}
                </TableCell>
                <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                  {paciente.apellido}
                </TableCell>
                <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                  {paciente.rut || "Sin RUT"}
                </TableCell>
                <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                  {paciente.email || "Sin Correo"}
                </TableCell>
                <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground whitespace-nowrap">
                  {paciente.telefono || "Sin Teléfono"}
                </TableCell>
                <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                  {paciente.convenio || "Sin Convenio"}
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
            puedeAnterior={pagina > 1}
            puedeSiguiente={inicio + TAMANO_PAGINA < total}
          />
        )}
      </div>

      {total === 0 && (
        <EmptyState
          titulo="Sin Resultados"
          descripcion="Ningún paciente coincide con la búsqueda. Prueba con otro nombre, RUT o correo."
        />
      )}

      <PacienteDetalleModal
        pacienteId={pacienteModalId}
        hoy={hoy}
        onCerrar={actions.handleCerrarModal}
      />
    </div>
  );
}

export default function PacientesView() {
  return (
    <Suspense fallback={<div aria-hidden />}>
      <PacientesContent />
    </Suspense>
  );
}
