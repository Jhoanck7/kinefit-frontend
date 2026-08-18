"use client";

import { useEffect, useState } from "react";

import {
  useCreateEspecialistaMutation,
  useDeleteEspecialistaMutation,
  useGetEspecialistas,
  useUpdateEspecialistaMutation,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import { EspecialistaResponse } from "@/models/responses";
import { appointmentService } from "@/services";
import { BackendService } from "@/types";

export const useEspecialistas = () => {
  const { data: especialistas = [], isLoading: cargando } = useGetEspecialistas(
    undefined,
    false
  );
  const [servicios, setServicios] = useState<BackendService[]>([]);

  useEffect(() => {
    appointmentService.getServices(false).then(res => {
      setServicios(res.data.data || []);
    });
  }, []);

  const crearMutation = useCreateEspecialistaMutation();
  const actualizarMutation = useUpdateEspecialistaMutation();
  const eliminarMutation = useDeleteEspecialistaMutation();

  const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCargo, setNuevoCargo] = useState("");
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [nuevosServicioIds, setNuevosServicioIds] = useState<number[]>([]);
  const [nuevaFotoUrl, setNuevaFotoUrl] = useState("");
  const [nuevaFotoPublicId, setNuevaFotoPublicId] = useState("");
  const [errorCrear, setErrorCrear] = useState<string | null>(null);

  const [especialistaAEliminar, setEspecialistaAEliminar] =
    useState<EspecialistaResponse | null>(null);

  const [especialistaAEditarId, setEspecialistaAEditarId] = useState<
    number | null
  >(null);
  const [editFormData, setEditFormData] = useState<EspecialistaResponse | null>(
    null
  );
  const [editServicioIds, setEditServicioIds] = useState<number[]>([]);
  const [editFotoPublicId, setEditFotoPublicId] = useState("");
  const [errorEditar, setErrorEditar] = useState<string | null>(null);

  const [notificacion, setNotificacion] = useState<string | null>(null);

  // Actions
  const handleAbrirFormNuevo = () => {
    setNuevoNombre("");
    setNuevoCargo("");
    setNuevoEmail("");
    setNuevaDescripcion("");
    setNuevosServicioIds([]);
    setNuevaFotoUrl("");
    setNuevaFotoPublicId("");
    setErrorCrear(null);
    setMostrarFormNuevo(true);
  };

  const handleCerrarFormNuevo = () => setMostrarFormNuevo(false);

  const handleAbrirEdicion = (esp: EspecialistaResponse) => {
    setEspecialistaAEditarId(esp.id);
    setEditFormData(esp);
    setEditServicioIds(esp.servicios.map(s => s.id));
    setEditFotoPublicId("");
    setErrorEditar(null);
  };

  const handleCerrarEdicion = () => {
    setEspecialistaAEditarId(null);
    setEditFormData(null);
  };

  const handleCrearEspecialista = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevosServicioIds.length === 0) {
      setErrorCrear("Selecciona al menos un servicio.");
      return;
    }
    setErrorCrear(null);
    try {
      const nuevo = await crearMutation.mutateAsync({
        nombre: nuevoNombre,
        cargo: nuevoCargo,
        servicioIds: nuevosServicioIds,
        email: nuevoEmail || undefined,
        descripcion: nuevaDescripcion || undefined,
        fotoPublicId: nuevaFotoPublicId || undefined,
      });
      setNotificacion(
        `El integrante "${nuevo.nombre}" (${nuevo.cargo}) ha sido registrado en el equipo.`
      );
      setMostrarFormNuevo(false);
    } catch (err: unknown) {
      setErrorCrear(handleApiError(err).message);
    }
  };

  const handleGuardarEspecialista = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;
    if (editServicioIds.length === 0) {
      setErrorEditar("Selecciona al menos un servicio.");
      return;
    }
    setErrorEditar(null);
    try {
      await actualizarMutation.mutateAsync({
        id: editFormData.id,
        data: {
          nombre: editFormData.nombre,
          cargo: editFormData.cargo,
          servicioIds: editServicioIds,
          email: editFormData.email || undefined,
          descripcion: editFormData.descripcion || undefined,
          fotoPublicId: editFotoPublicId || undefined,
        },
      });
      setNotificacion(
        `Los datos de ${editFormData.nombre} fueron guardados correctamente.`
      );
      setEspecialistaAEditarId(null);
      setEditFormData(null);
    } catch (err: unknown) {
      setErrorEditar(handleApiError(err).message);
    }
  };

  const handleSolicitarEliminacion = () => {
    if (!editFormData) return;
    setEspecialistaAEliminar(editFormData);
    setEspecialistaAEditarId(null);
    setEditFormData(null);
  };

  const handleCancelarEliminacion = () => setEspecialistaAEliminar(null);

  const handleConfirmarEliminacion = async () => {
    if (!especialistaAEliminar) return;
    try {
      await eliminarMutation.mutateAsync(especialistaAEliminar.id);
      setNotificacion(
        `El especialista "${especialistaAEliminar.nombre}" ha sido eliminado permanentemente del sistema.`
      );
      setEspecialistaAEliminar(null);
    } catch (err: unknown) {
      setNotificacion(handleApiError(err).message);
    }
  };

  const handleCerrarNotificacion = () => setNotificacion(null);

  const handleEditarFotoChange = (secureUrl: string, publicId?: string) => {
    if (!editFormData) return;
    setEditFormData({ ...editFormData, fotoUrl: secureUrl });
    setEditFotoPublicId(publicId || "");
  };

  const handleEditarCampo = (
    campo: keyof EspecialistaResponse,
    valor: string
  ) => {
    if (!editFormData) return;
    setEditFormData({ ...editFormData, [campo]: valor });
  };

  return {
    // Data
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
    creando: crearMutation.isPending,
    guardando: actualizarMutation.isPending,
    eliminando: eliminarMutation.isPending,

    // Actions
    actions: {
      setNuevoNombre,
      setNuevoCargo,
      setNuevoEmail,
      setNuevaDescripcion,
      setNuevosServicioIds,
      setNuevaFotoUrl,
      setNuevaFotoPublicId,
      setEditServicioIds,
      handleAbrirFormNuevo,
      handleCerrarFormNuevo,
      handleAbrirEdicion,
      handleCerrarEdicion,
      handleCrearEspecialista,
      handleGuardarEspecialista,
      handleSolicitarEliminacion,
      handleCancelarEliminacion,
      handleConfirmarEliminacion,
      handleCerrarNotificacion,
      handleEditarFotoChange,
      handleEditarCampo,
    },
  };
};
