"use client";

import { Card } from "@/components/panel/primitives/Card";
import { Modal } from "@/components/panel/primitives/Modal";
import { Button } from "@/components/ui";

import {
  CrearEspecialistaModal,
  EditarEspecialistaModal,
  EliminarEspecialistaModal,
  EspecialistaCard,
} from "./components";
import { useEspecialistas } from "./hooks";

export default function EspecialistasView() {
  const {
    especialistas,
    cargando,
    servicios,
    mostrarFormNuevo,
    nuevoNombre,
    nuevoCargo,
    nuevoEmail,
    nuevaDescripcion,
    nuevosServicioIds,
    nuevaFotoUrl,
    errorCrear,
    especialistaAEliminar,
    especialistaAEditarId,
    editFormData,
    editServicioIds,
    errorEditar,
    notificacion,
    creando,
    guardando,
    eliminando,
    actions,
  } = useEspecialistas();

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-panel-sidebar">
            Gestión del Equipo y Gerencia
          </h1>
          <p className="text-sm text-brand-muted">
            Agrega, edita o elimina integrantes del equipo.
          </p>
        </div>

        <Button onClick={actions.handleAbrirFormNuevo}>
          ➕ Agregar Integrante del Equipo
        </Button>
      </div>

      {/* Lista de Integrantes Existentes */}
      {cargando ? (
        <Card>
          <p className="text-sm text-brand-muted py-8 text-center">
            Cargando equipo desde el servidor...
          </p>
        </Card>
      ) : especialistas.length === 0 ? (
        <Card>
          <p className="text-sm text-brand-muted py-8 text-center">
            No hay integrantes registrados en el equipo.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {especialistas.map(esp => (
            <EspecialistaCard
              key={esp.id}
              especialista={esp}
              onClick={() => actions.handleAbrirEdicion(esp)}
            />
          ))}
        </div>
      )}

      <CrearEspecialistaModal
        abierto={mostrarFormNuevo}
        onCerrar={actions.handleCerrarFormNuevo}
        servicios={servicios}
        nombre={nuevoNombre}
        cargo={nuevoCargo}
        email={nuevoEmail}
        descripcion={nuevaDescripcion}
        servicioIds={nuevosServicioIds}
        fotoUrl={nuevaFotoUrl}
        error={errorCrear}
        guardando={creando}
        onNombreChange={actions.setNuevoNombre}
        onCargoChange={actions.setNuevoCargo}
        onEmailChange={actions.setNuevoEmail}
        onDescripcionChange={actions.setNuevaDescripcion}
        onServicioIdsChange={actions.setNuevosServicioIds}
        onFotoChange={(secureUrl, publicId) => {
          actions.setNuevaFotoUrl(secureUrl);
          actions.setNuevaFotoPublicId(publicId || "");
        }}
        onSubmit={actions.handleCrearEspecialista}
      />

      <EditarEspecialistaModal
        abierto={!!especialistaAEditarId}
        onCerrar={actions.handleCerrarEdicion}
        especialista={editFormData}
        servicios={servicios}
        servicioIds={editServicioIds}
        error={errorEditar}
        guardando={guardando}
        onCampoChange={actions.handleEditarCampo}
        onServicioIdsChange={actions.setEditServicioIds}
        onFotoChange={actions.handleEditarFotoChange}
        onSolicitarEliminacion={actions.handleSolicitarEliminacion}
        onSubmit={actions.handleGuardarEspecialista}
      />

      <EliminarEspecialistaModal
        especialista={especialistaAEliminar}
        onCancelar={actions.handleCancelarEliminacion}
        onConfirmar={actions.handleConfirmarEliminacion}
        eliminando={eliminando}
      />

      <Modal
        abierto={!!notificacion}
        onCerrar={actions.handleCerrarNotificacion}
        ancho="max-w-md"
      >
        <div className="p-8 text-center">
          <h2 className="text-lg font-semibold text-panel-sidebar">
            Acción Completada
          </h2>
          <p className="mt-2 text-sm text-brand-muted">{notificacion}</p>
          <Button
            className="mt-6"
            onClick={actions.handleCerrarNotificacion}
            autoFocus
          >
            Entendido
          </Button>
        </div>
      </Modal>
    </div>
  );
}
