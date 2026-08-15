"use client";

import { Suspense } from "react";

import { PacienteDetalleModal } from "@/components/panel/domain/PacienteDetalleModal";
import { NeutralBadge } from "@/components/panel/primitives/Badge";
import { SearchInput } from "@/components/panel/primitives/CamposFormulario";
import { EmptyState } from "@/components/panel/primitives/EmptyState";
import {
  CeldaChevron,
  FilaTabla,
  Paginacion,
  Table,
} from "@/components/panel/primitives/Table";
import { Button } from "@/components/ui";

import { TAMANO_PAGINA, usePacientes } from "./hooks";

const COLUMNAS = [
  { titulo: "Nombre" },
  { titulo: "Apellido" },
  { titulo: "RUT" },
  { titulo: "Correo" },
  { titulo: "Teléfono", className: "whitespace-nowrap" },
  { titulo: "Convenio" },
];

function PacientesContent() {
  const {
    hoy,
    busqueda,
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
          />
        </div>
        <Button onClick={actions.handleNuevoPaciente}>NUEVO PACIENTE</Button>
      </div>

      <Table
        columnas={COLUMNAS}
        encabezado={
          <p className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
            {total} pacientes registrados
          </p>
        }
        pie={
          total > 0 ? (
            <Paginacion
              inicio={inicio + 1}
              fin={Math.min(inicio + TAMANO_PAGINA, total)}
              total={total}
              onAnterior={actions.handlePaginaAnterior}
              onSiguiente={actions.handlePaginaSiguiente}
              puedeAnterior={pagina > 1}
              puedeSiguiente={inicio + TAMANO_PAGINA < total}
            />
          ) : undefined
        }
      >
        {visibles.map(paciente => (
          <FilaTabla
            key={paciente.id}
            onClick={() => actions.handleAbrirPaciente(paciente.id)}
          >
            <td className="px-4 py-3 font-sans font-medium text-sm text-slate-900">
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
                    paciente.origenRegistro === "web" ? "#003366" : "#94a3b8",
                }}
              />
            </td>
            <td className="px-4 py-3 font-sans font-medium text-sm text-slate-900">
              {paciente.apellido}
            </td>
            <td className="px-4 py-3 font-sans font-medium text-sm text-slate-700">
              {paciente.rut || "—"}
            </td>
            <td className="px-4 py-3 font-sans font-medium text-sm text-slate-700">
              {paciente.correo || "—"}
            </td>
            <td className="px-4 py-3 font-sans font-medium text-sm text-slate-700 whitespace-nowrap">
              {paciente.telefono || "—"}
            </td>
            <td className="px-4 py-3">
              {paciente.convenio ? (
                <NeutralBadge>{paciente.convenio.nombre}</NeutralBadge>
              ) : (
                <span className="font-sans text-xs text-slate-400">—</span>
              )}
            </td>
            <CeldaChevron />
          </FilaTabla>
        ))}
      </Table>

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
