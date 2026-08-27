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

import { ServicioModal } from "./components";
import { useServicios } from "./hooks";

const COLUMNAS = ["Orden", "Nombre", "Duración", "Descripción", "Estado"];

export default function ServiciosView() {
  const {
    servicios,
    cargando,
    duracionActiva,
    mostrarModal,
    servicioEditando,
    nombre,
    orden,
    duracionMinutos,
    descripcion,
    imagenUrl,
    error,
    errorEstado,
    guardando,
    actualizandoEstadoId,
    actions,
  } = useServicios();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
            Catálogo de Servicios
          </h2>
          <p className="font-sans text-xs text-slate-500 mt-0.5">
            Los servicios activos alimentan el asistente de reserva y el
            formulario público.
          </p>
        </div>
        <Button onClick={actions.handleAbrirCrear}>Nuevo Servicio</Button>
      </div>

      <div className="border border-slate-200 bg-slate-50/50 p-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900">
            Duración Configurable de Servicios
          </p>
          <p className="font-sans text-xs text-slate-500 mt-0.5">
            Con esto activo, cada servicio exige una duración (30/60/90 min) y
            la reserva exige exactamente esos bloques. Apagado, se mantiene el
            comportamiento actual: el operador arma los bloques a mano.
          </p>
        </div>
        <SwitchField
          etiqueta={duracionActiva ? "Activo" : "Inactivo"}
          checked={duracionActiva}
          onChange={actions.handleToggleDuracionActiva}
        />
      </div>

      {errorEstado && <Alerta tono="error">{errorEstado}</Alerta>}

      {cargando ? (
        <p className="text-xs text-slate-500 py-8 text-center">
          Cargando servicios...
        </p>
      ) : servicios.length === 0 ? (
        <EmptyState
          titulo="Sin servicios registrados"
          descripcion="Aún no se ha creado ningún servicio en el catálogo."
          accion={
            <Button onClick={actions.handleAbrirCrear}>
              Crear primer servicio
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-none border border-slate-200 shadow-none font-sans">
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
              {servicios
                .slice()
                .sort((a, b) => a.orden - b.orden)
                .map(servicio => (
                  <TableRow key={servicio.id} className="hover:bg-slate-50/70">
                    <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                      {servicio.orden}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-medium text-sm text-slate-900">
                      {servicio.nombre}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-medium text-sm text-slate-700">
                      {servicio.duracionMinutos
                        ? `${servicio.duracionMinutos} min`
                        : "Sin Duración"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate">
                      {servicio.descripcion || "Sin Descripción"}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <SwitchField
                        etiqueta={servicio.activo ? "Activo" : "Inactivo"}
                        checked={servicio.activo}
                        onChange={() => actions.handleToggleEstado(servicio)}
                      />
                      {actualizandoEstadoId === servicio.id && (
                        <span className="ml-2 text-[11px] text-slate-400">
                          Guardando...
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => actions.handleAbrirEditar(servicio)}
                        className="text-xs font-bold text-blue-900 hover:underline"
                      >
                        Editar
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ServicioModal
        abierto={mostrarModal}
        onCerrar={actions.handleCerrarModal}
        servicioEditando={servicioEditando}
        nombre={nombre}
        orden={orden}
        duracionMinutos={duracionMinutos}
        duracionActiva={duracionActiva}
        descripcion={descripcion}
        imagenUrl={imagenUrl}
        error={error}
        guardando={guardando}
        onNombreChange={actions.setNombre}
        onOrdenChange={actions.setOrden}
        onDuracionMinutosChange={actions.setDuracionMinutos}
        onDescripcionChange={actions.setDescripcion}
        onFotoChange={actions.handleFotoChange}
        onSubmit={actions.handleGuardar}
      />
    </div>
  );
}
