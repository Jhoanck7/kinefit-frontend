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
        <Button onClick={actions.handleNuevoPaciente}>NUEVO PACIENTE</Button>
      </div>

      <div className="overflow-hidden rounded-none border border-slate-200 shadow-none font-sans">
        <div className="px-6 py-3.5 border-b border-slate-200 bg-white font-sans">
          <p className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
            {total} pacientes registrados
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
                <TableCell className="px-4 py-3 font-medium text-sm text-slate-900">
                  {paciente.nombre}
                  <span
                    title={
                      paciente.origenRegistro === "web"
                        ? "Registrado desde la web"
                        : "Registrado por el personal"
                    }
                    className="ml-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
                    style={{
                      backgroundColor:
                        paciente.origenRegistro === "web"
                          ? "#003366"
                          : "#94a3b8",
                    }}
                  />
                </TableCell>
                <TableCell className="px-4 py-3 font-medium text-sm text-slate-900">
                  {paciente.apellido}
                </TableCell>
                <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                  {paciente.rut || "Sin RUT"}
                </TableCell>
                <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                  {paciente.email || "Sin Correo"}
                </TableCell>
                <TableCell className="px-4 py-3 font-medium text-sm text-slate-700 whitespace-nowrap">
                  {paciente.telefono || "Sin Teléfono"}
                </TableCell>
                <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                  {paciente.convenio || "Sin Convenio"}
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
            puedeAnterior={pagina > 1}
            puedeSiguiente={inicio + TAMANO_PAGINA < total}
          />
        )}
      </div>

      {total === 0 && (
        <EmptyState
          titulo="Sin resultados"
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
