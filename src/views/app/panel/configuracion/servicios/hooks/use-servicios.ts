"use client";

import { useState } from "react";

import {
  useActualizarDocumentosServicioMutation,
  useCreateServicioMutation,
  useGetPlantillas,
  useGetServicios,
  useUpdateServicioEstadoMutation,
  useUpdateServicioMutation,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import { ServicioDocumentoInput } from "@/models/requests";
import { ServicioResponse } from "@/models/responses";

export const useServicios = () => {
  const { data: servicios = [], isLoading: cargando } = useGetServicios(false);
  const { data: plantillas = [] } = useGetPlantillas(true);

  const crearMutation = useCreateServicioMutation();
  const actualizarMutation = useUpdateServicioMutation();
  const estadoMutation = useUpdateServicioEstadoMutation();
  const documentosMutation = useActualizarDocumentosServicioMutation();

  const [mostrarModal, setMostrarModal] = useState(false);
  const [servicioEditando, setServicioEditando] =
    useState<ServicioResponse | null>(null);
  const [nombre, setNombre] = useState("");
  const [orden, setOrden] = useState(0);
  const [exigeDuracion, setExigeDuracion] = useState(false);
  const [duracionMinutos, setDuracionMinutos] = useState<number | undefined>(
    undefined
  );
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [imagenPublicId, setImagenPublicId] = useState("");
  const [imagenAlt, setImagenAlt] = useState("");
  const [documentos, setDocumentos] = useState<ServicioDocumentoInput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [errorEstado, setErrorEstado] = useState<string | null>(null);

  const handleAbrirCrear = () => {
    setServicioEditando(null);
    setNombre("");
    setOrden(servicios.length);
    setExigeDuracion(false);
    setDuracionMinutos(undefined);
    setDescripcion("");
    setImagenUrl("");
    setImagenPublicId("");
    setImagenAlt("");
    setDocumentos([]);
    setError(null);
    setMostrarModal(true);
  };

  const handleAbrirEditar = (servicio: ServicioResponse) => {
    setServicioEditando(servicio);
    setNombre(servicio.nombre);
    setOrden(servicio.orden);
    setExigeDuracion(Boolean(servicio.duracionMinutos));
    setDuracionMinutos(servicio.duracionMinutos);
    setDescripcion(servicio.descripcion || "");
    setImagenUrl(servicio.imagenUrl || "");
    setImagenPublicId(servicio.imagenPublicId || "");
    setImagenAlt(servicio.imagenAlt || "");
    setDocumentos(
      servicio.documentos.map(d => ({
        plantillaId: d.plantillaId,
        obligatorio: d.obligatorio,
        momento: d.momento,
        vigenciaDias: d.vigenciaDias,
      }))
    );
    setError(null);
    setMostrarModal(true);
  };

  const handleCerrarModal = () => setMostrarModal(false);

  const handleFotoChange = (secureUrl: string, publicId?: string) => {
    setImagenUrl(secureUrl);
    setImagenPublicId(publicId || "");
  };

  const handleToggleExigeDuracion = (checked: boolean) => {
    setExigeDuracion(checked);
    if (!checked) {
      setDuracionMinutos(undefined);
    }
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (exigeDuracion && !duracionMinutos) {
      setError("Selecciona la duración predeterminada de este servicio.");
      return;
    }
    const duracionAEnviar = exigeDuracion ? duracionMinutos : undefined;
    try {
      let id: number;
      if (servicioEditando) {
        id = servicioEditando.id;
        await actualizarMutation.mutateAsync({
          id,
          data: {
            nombre,
            orden,
            duracionMinutos: duracionAEnviar,
            imagenPublicId: imagenPublicId || undefined,
            imagenAlt: imagenAlt || undefined,
            descripcion: descripcion || undefined,
          },
        });
      } else {
        const creado = await crearMutation.mutateAsync({
          nombre,
          orden,
          duracionMinutos: duracionAEnviar,
          imagenPublicId: imagenPublicId || undefined,
          imagenAlt: imagenAlt || undefined,
          descripcion: descripcion || undefined,
        });
        id = creado!.id;
      }
      await documentosMutation.mutateAsync({ id, documentos });
      setMostrarModal(false);
    } catch (err: unknown) {
      setError(handleApiError(err).message);
    }
  };

  const handleToggleEstado = async (servicio: ServicioResponse) => {
    setErrorEstado(null);
    try {
      await estadoMutation.mutateAsync({
        id: servicio.id,
        activo: !servicio.activo,
      });
    } catch (err: unknown) {
      setErrorEstado(handleApiError(err).message);
    }
  };

  return {
    servicios,
    cargando,
    mostrarModal,
    servicioEditando,
    nombre,
    orden,
    exigeDuracion,
    duracionMinutos,
    descripcion,
    imagenUrl,
    plantillas,
    documentos,
    error,
    errorEstado,
    guardando:
      crearMutation.isPending ||
      actualizarMutation.isPending ||
      documentosMutation.isPending,
    actualizandoEstadoId: estadoMutation.isPending
      ? estadoMutation.variables?.id
      : null,

    actions: {
      setNombre,
      setOrden,
      handleToggleExigeDuracion,
      setDuracionMinutos,
      setDescripcion,
      setDocumentos,
      handleAbrirCrear,
      handleAbrirEditar,
      handleCerrarModal,
      handleFotoChange,
      handleGuardar,
      handleToggleEstado,
    },
  };
};
