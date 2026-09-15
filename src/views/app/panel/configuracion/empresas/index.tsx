"use client";

import { Alerta, EmptyState, SwitchField } from "@/components/shared";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { fechaISO } from "@/lib/formato";

import { EmpresaModal } from "./components";
import { useEmpresas } from "./hooks";

export default function EmpresasView() {
  const {
    empresas,
    cargando,
    mostrarModal,
    empresaEditando,
    nombre,
    vigenteDesde,
    vigenteHasta,
    convenios,
    error,
    errorEstado,
    guardando,
    actualizandoEstadoId,
    actions,
  } = useEmpresas();

  const hoy = fechaISO(new Date());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-sans text-section-title font-bold text-foreground">
            Empresas y Convenios
          </h2>
          <p className="font-sans text-xs text-slate-500 mt-0.5">
            Convenios disponibles al registrar un paciente. Afectan el cálculo
            de ventas.
          </p>
        </div>
        <Button className="rounded-overlay" onClick={actions.handleAbrirCrear}>
          Nueva Empresa
        </Button>
      </div>

      {errorEstado && <Alerta tono="error">{errorEstado}</Alerta>}

      {cargando ? (
        <p className="text-xs text-slate-500 py-8 text-center">
          Cargando empresas…
        </p>
      ) : empresas.length === 0 ? (
        <EmptyState
          titulo="Sin Empresas Registradas"
          descripcion="Aún no se ha creado ninguna empresa o convenio."
          accion={
            <Button
              className="rounded-overlay"
              onClick={actions.handleAbrirCrear}
            >
              Crear Primera Empresa
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-none border border-slate-200 shadow-none font-sans">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow className="hover:bg-transparent border-b-0">
                <TableHead className="px-4 py-3 text-table-head font-bold text-muted-foreground whitespace-nowrap">
                  Nombre
                </TableHead>
                <TableHead className="px-4 py-3 text-table-head font-bold text-muted-foreground whitespace-nowrap">
                  Estado
                </TableHead>
                <TableHead className="px-4 py-3 text-table-head font-bold text-muted-foreground whitespace-nowrap">
                  Vigencia
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-200 bg-white">
              {empresas.map(empresa => {
                const vigente =
                  (!empresa.vigenteDesde || empresa.vigenteDesde <= hoy) &&
                  (!empresa.vigenteHasta || empresa.vigenteHasta >= hoy);
                const sinLimite =
                  !empresa.vigenteDesde && !empresa.vigenteHasta;
                return (
                  <TableRow key={empresa.id} className="hover:bg-slate-50/70">
                    <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                      {empresa.nombre}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <SwitchField
                        etiqueta={empresa.activo ? "Activo" : "Inactivo"}
                        checked={empresa.activo}
                        onChange={() => actions.handleToggleEstado(empresa)}
                      />
                      {actualizandoEstadoId === empresa.id && (
                        <span className="ml-2 text-[11px] text-slate-400">
                          Guardando…
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                      {sinLimite
                        ? "Sin Límite"
                        : vigente
                          ? "Vigente"
                          : "Fuera de Vigencia"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => actions.handleAbrirEditar(empresa)}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Editar
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <EmpresaModal
        abierto={mostrarModal}
        onCerrar={actions.handleCerrarModal}
        empresaEditando={empresaEditando}
        nombre={nombre}
        vigenteDesde={vigenteDesde}
        vigenteHasta={vigenteHasta}
        convenios={convenios}
        error={error}
        guardando={guardando}
        onNombreChange={actions.setNombre}
        onVigenteDesdeChange={actions.setVigenteDesde}
        onVigenteHastaChange={actions.setVigenteHasta}
        onToggleConvenio={actions.handleToggleConvenio}
        onPorcentajeConvenio={actions.handlePorcentajeConvenio}
        onSubmit={actions.handleGuardar}
      />
    </div>
  );
}
