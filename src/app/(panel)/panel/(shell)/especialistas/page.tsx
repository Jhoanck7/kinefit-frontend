"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/panel/primitives/Card";
import { Button } from "@/components/panel/primitives/Button";
import { TextField } from "@/components/panel/primitives/CamposFormulario";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Modal } from "@/components/panel/primitives/Modal";
import { SimulatedActionNotice } from "@/components/panel/primitives/SimulatedActionNotice";
import { specialistService } from "@/lib/services/specialist.service";
import { appointmentService } from "@/lib/services/appointment.service";
import { BackendSpecialist, BackendService } from "@/types";

export default function EspecialistasPage() {
  const [especialistas, setEspecialistas] = useState<BackendSpecialist[]>([]);
  const [servicios, setServicios] = useState<BackendService[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false);
  const [creando, setCreando] = useState(false);
  const [guardandoId, setGuardandoId] = useState<number | null>(null);
  
  // Estado Pop up de Eliminación
  const [especialistaAEliminar, setEspecialistaAEliminar] = useState<BackendSpecialist | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Estado Pop up de Edición
  const [especialistaAEditarId, setEspecialistaAEditarId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<BackendSpecialist | null>(null);

  const [notificacion, setNotificacion] = useState<string | null>(null);

  // Formulario Nuevo Especialista / Gerente
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCargo, setNuevoCargo] = useState("");
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [nuevoServicioId, setNuevoServicioId] = useState<number | "0">("0");
  const [nuevaFotoUrl, setNuevaFotoUrl] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [listEspecialistas, resServicios] = await Promise.all([
        specialistService.getEspecialistas(undefined, false),
        appointmentService.getServices(false),
      ]);
      setEspecialistas(listEspecialistas);
      setServicios(resServicios.data || []);
    } catch (err: unknown) {
      console.error("Error al cargar datos:", err);
    } finally {
      setCargando(false);
    }
  }

  function handleFieldChange(id: number, field: keyof BackendSpecialist, value: unknown) {
    setEspecialistas((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  }

  async function handleCrearEspecialista(e: React.FormEvent) {
    e.preventDefault();
    setCreando(true);
    try {
      const sId = nuevoServicioId === "0" || nuevoServicioId === 0 ? undefined : Number(nuevoServicioId);

      const nuevo = await specialistService.createEspecialista({
        nombre: nuevoNombre,
        cargo: nuevoCargo,
        email: nuevoEmail,
        descripcion: nuevaDescripcion,
        servicioId: sId,
        fotoUrl: nuevaFotoUrl,
      });

      setEspecialistas((prev) => [nuevo, ...prev]);
      setNotificacion(`El integrante "${nuevo.nombre}" (${nuevo.cargo}) ha sido registrado en el equipo.`);

      // Limpiar formulario
      setNuevoNombre("");
      setNuevoCargo("");
      setNuevoEmail("");
      setNuevaDescripcion("");
      setNuevaFotoUrl("");
      setNuevoServicioId("0");
      setMostrarFormNuevo(false);
    } catch (err: unknown) {
      console.error("Error al crear especialista/gerente:", err);
      const msg = err instanceof Error ? err.message : "No se pudo crear el integrante del equipo.";
      alert(msg);
    } finally {
      setCreando(false);
    }
  }

  async function handleGuardarEspecialista(e: React.FormEvent, especialista: BackendSpecialist) {
    e.preventDefault();
    setGuardandoId(especialista.id);
    try {
      const sId = especialista.servicio?.id ? especialista.servicio.id : undefined;

      const actualizada = await specialistService.updateEspecialista(especialista.id, {
        nombre: especialista.nombre,
        cargo: especialista.cargo,
        servicioId: sId,
        email: especialista.email || "",
        descripcion: especialista.descripcion || "",
        fotoUrl: especialista.fotoUrl || "",
      });

      setEspecialistas((prev) =>
        prev.map((item) => (item.id === especialista.id ? { ...item, ...actualizada } : item))
      );
      setNotificacion(`Los datos de ${especialista.nombre} fueron guardados correctamente.`);
      
      // Close modal on success
      setEspecialistaAEditarId(null);
      setEditFormData(null);
    } catch (err: unknown) {
      console.error("Error al guardar especialista:", err);
      alert("No se pudo actualizar la información del integrante en el servidor.");
    } finally {
      setGuardandoId(null);
    }
  }

  async function ConfirmarEliminacion() {
    if (!especialistaAEliminar) return;

    setEliminando(true);
    try {
      await specialistService.deleteEspecialista(especialistaAEliminar.id);
      setEspecialistas((prev) => prev.filter((e) => e.id !== especialistaAEliminar.id));
      setNotificacion(`El especialista "${especialistaAEliminar.nombre}" ha sido eliminado permanentemente del sistema.`);
      setEspecialistaAEliminar(null);
    } catch (err: unknown) {
      console.error("Error al eliminar especialista:", err);
      const msg = err instanceof Error ? err.message : "No se pudo eliminar al especialista.";
      alert(msg);
    } finally {
      setEliminando(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-panel-sidebar">Gestión del Equipo y Gerencia</h1>
          <p className="text-sm text-brand-muted">
            Agrega, edita o elimina integrantes del equipo.
          </p>
        </div>

        <Button
          variante={mostrarFormNuevo ? "secundario" : "primario"}
          onClick={() => setMostrarFormNuevo(!mostrarFormNuevo)}
        >
          {mostrarFormNuevo ? "✕ Cancelar" : "➕ Agregar Integrante del Equipo"}
        </Button>
      </div>

      {/* Lista de Integrantes Existentes */}
      {cargando ? (
        <Card>
          <p className="text-sm text-brand-muted py-8 text-center">Cargando equipo desde el servidor...</p>
        </Card>
      ) : especialistas.length === 0 ? (
        <Card>
          <p className="text-sm text-brand-muted py-8 text-center">No hay integrantes registrados en el equipo.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {especialistas.map((esp) => (
            <div 
              key={esp.id} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-brand-primary/50 transition-all hover:shadow-lg group flex flex-col justify-between"
              onClick={() => {
                setEspecialistaAEditarId(esp.id);
                setEditFormData({ ...esp, servicio: esp.servicio ? { ...esp.servicio } : null });
              }}
            >
              <div className="flex flex-col items-center gap-3 text-center mb-4 relative pt-8 px-4">
                 <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md group-hover:border-brand-primary/20 transition-colors shrink-0">
                    {esp.fotoUrl ? (
                      <Image src={esp.fotoUrl} alt={esp.nombre} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-primary text-white font-bold text-2xl">
                        {esp.nombre.charAt(0)}
                      </div>
                    )}
                 </div>
                 <div>
                    <h2 className="font-bold text-slate-900 text-lg group-hover:text-brand-primary transition-colors">{esp.nombre}</h2>
                    <p className="text-sm text-brand-primary font-semibold">{esp.cargo}</p>
                 </div>
              </div>
              <div className="bg-slate-50 border-t border-slate-100 p-4 rounded-b-2xl flex justify-between items-center text-xs">
                  <span className={`px-2.5 py-1 rounded-full font-bold ${esp.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {esp.activo ? '● Activo' : '○ Inactivo'}
                  </span>
  
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POP-UP / MODAL DE EDICIÓN */}
      <Modal
        abierto={!!especialistaAEditarId}
        onCerrar={() => { setEspecialistaAEditarId(null); setEditFormData(null); }}
        ancho="max-w-3xl"
      >
        {especialistaAEditarId && editFormData && (() => {
          const esp = editFormData;
          return (
            <div className="p-2 sm:p-4">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Editar Perfil del Integrante</h2>
                <div className="flex items-center gap-3">

                    {/* Botón Eliminar */}
                    <button
                      type="button"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setEspecialistaAEliminar(especialistas.find(orig => orig.id === esp.id) || esp); 
                        setEspecialistaAEditarId(null); 
                        setEditFormData(null);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-all"
                      title="Eliminar especialista"
                    >
                      <span className="hidden sm:inline">Eliminar</span>
                    </button>
                </div>
              </div>
                {/* Subidor de Foto de Perfil */}
              <div className="pt-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <ImageUploader
                    etiqueta="Foto de Perfil"
                    value={esp.fotoUrl || ""}
                    onChange={(secureUrl) => setEditFormData({ ...esp, fotoUrl: secureUrl })}
                    folder="kinefit/especialistas"
                  />
              </div>
              <form onSubmit={async (e) => {
                await handleGuardarEspecialista(e, esp);
              }} className="space-y-6">
                
                {/* Formulario de Campos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    etiqueta="Nombre Completo"
                    value={esp.nombre}
                    onChange={(e) => setEditFormData({ ...esp, nombre: e.target.value })}
                    obligatorio
                    required
                  />

                  <TextField
                    etiqueta="Cargo por Rol"
                    value={esp.cargo}
                    onChange={(e) => setEditFormData({ ...esp, cargo: e.target.value })}
                    obligatorio
                    required
                  />

                  <div>
                    <label className="mb-1 block text-xs font-medium text-panel-sidebar">
                      Área / Servicio Asignado
                    </label>
                    <select
                      value={esp.servicio?.id || "0"}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "0") {
                          setEditFormData({ ...esp, servicio: null });
                        } else {
                          const sFound = servicios.find((s) => s.id === Number(val));
                          setEditFormData({ ...esp, servicio: sFound ? { id: sFound.id, nombre: sFound.nombre } : null });
                        }
                      }}
                      className="w-full rounded-xl border border-brand-border p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    >
                      <option value="0">Sin Servicio Clínico (Gerencia / Dirección / Administración)</option>
                      {servicios.map((srv) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <TextField
                    etiqueta="Correo Electrónico de Contacto"
                    type="email"
                    value={esp.email || ""}
                    onChange={(e) => setEditFormData({ ...esp, email: e.target.value })}
                  />

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-panel-sidebar">
                      Experiencia / Biografía / Resumen
                    </label>
                    <textarea
                      value={esp.descripcion || ""}
                      onChange={(e) => setEditFormData({ ...esp, descripcion: e.target.value })}
                      rows={4}
                      placeholder="Resumen del perfil o biografía..."
                      className="w-full rounded-xl border border-brand-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                    />
                  </div>
                </div>



                <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                  <Button
                    type="button"
                    variante="secundario"
                    onClick={() => { setEspecialistaAEditarId(null); setEditFormData(null); }}
                  >
                    Cerrar sin guardar
                  </Button>
                  <Button
                    type="submit"
                    variante="primario"
                    disabled={guardandoId === esp.id}
                  >
                    {guardandoId === esp.id ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                </div>
              </form>
            </div>
          );
        })()}
      </Modal>

      {/* POP-UP / MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <Modal
        abierto={!!especialistaAEliminar}
        onCerrar={() => setEspecialistaAEliminar(null)}
        ancho="max-w-md"
      >
        {especialistaAEliminar && (
          <div className="p-6 space-y-6 text-center">
            {/* Icono de Advertencia Peligro */}
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl font-bold shadow-inner">
              ⚠️
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                ¿Eliminar Especialista?
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Estás a punto de eliminar a <span className="font-bold text-slate-900">{especialistaAEliminar.nombre}</span> ({especialistaAEliminar.cargo}) del sistema.
              </p>
            </div>

            {/* Tarjeta Resumen Especialista */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-left">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                {especialistaAEliminar.fotoUrl ? (
                  <Image
                    src={especialistaAEliminar.fotoUrl}
                    alt={especialistaAEliminar.nombre}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand-primary text-white font-bold">
                    {especialistaAEliminar.nombre.charAt(0)}
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-slate-900 text-sm truncate">{especialistaAEliminar.nombre}</p>
                <p className="text-xs text-brand-primary font-medium truncate">{especialistaAEliminar.cargo}</p>
                <p className="text-[11px] text-slate-500 truncate">{especialistaAEliminar.email || "Sin correo"}</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
              <p className="text-xs text-amber-800 leading-normal">
                <span className="font-bold">⚠️ Nota Importante:</span> Esta acción eliminará su registro de la base de datos. Si el especialista posee citas asociadas, te recomendamos cancelar el borrado y simplemente <span className="font-bold underline">Desactivarlo</span>.
              </p>
            </div>

            {/* Botones del Pop Up */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variante="secundario"
                onClick={() => setEspecialistaAEliminar(null)}
                disabled={eliminando}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variante="peligro"
                onClick={ConfirmarEliminacion}
                disabled={eliminando}
              >
                {eliminando ? "Eliminando..." : "Sí, Eliminar Especialista"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <SimulatedActionNotice
        abierto={!!notificacion}
        onCerrar={() => setNotificacion(null)}
        titulo="Acción Completada"
        descripcion={notificacion || ""}
      />
    </div>
  );
}
