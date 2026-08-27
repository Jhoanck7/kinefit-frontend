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
          <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
            Empresas y Convenios
          </h2>
          <p className="font-sans text-xs text-slate-500 mt-0.5">
            Convenios disponibles al registrar un paciente. Afectan el cálculo
            de ventas.
          </p>
        </div>
        <Button onClick={actions.handleAbrirCrear}>Nueva Empresa</Button>
      </div>

      {errorEstado && <Alerta tono="error">{errorEstado}</Alerta>}

      {cargando ? (
        <p className="text-xs text-slate-500 py-8 text-center">
          Cargando empresas...
        </p>
      ) : empresas.length === 0 ? (
        <EmptyState
          titulo="Sin empresas registradas"
          descripcion="Aún no se ha creado ninguna empresa o convenio."
          accion={
            <Button onClick={actions.handleAbrirCrear}>
              Crear primera empresa
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-none border border-slate-200 shadow-none font-sans">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow className="hover:bg-transparent border-b-0">
                <TableHead className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 whitespace-nowrap">
                  Nombre
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 whitespace-nowrap">
                  Estado
                </TableHead>
                <TableHead className="px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 whitespace-nowrap">
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
                const sinLimite = !empresa.vigenteDesde && !empresa.vigenteHasta;
                return (
                <TableRow key={empresa.id} className="hover:bg-slate-50/70">
                  <TableCell className="px-4 py-3 font-medium text-sm text-slate-900">
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
                        Guardando...
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${vigente ? "bg-emerald-700" : "bg-slate-400"}`}
                        aria-hidden
                      />
                      <span
                        className={`font-sans text-[11px] font-bold uppercase tracking-wider ${vigente ? "text-emerald-700" : "text-slate-500"}`}
                      >
                        {sinLimite
                          ? "Sin Límite"
                          : vigente
                            ? "Vigente"
                            : "Fuera de Vigencia"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => actions.handleAbrirEditar(empresa)}
                      className="text-xs font-bold text-blue-900 hover:underline"
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
