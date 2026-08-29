"use client";

import { useState } from "react";

import {
  useActualizarDocumentosServicioMutation,
  useCreateServicioMutation,
  useGetConfiguracionSistema,
  useGetFormatos,
  useGetServicios,
  useUpdateConfiguracionSistemaMutation,
  useUpdateServicioEstadoMutation,
  useUpdateServicioMutation,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import { ServicioDocumentoInput } from "@/models/requests";
import { ServicioResponse } from "@/models/responses";

export const useServicios = () => {
  const { data: servicios = [], isLoading: cargando } = useGetServicios(false);
  const { data: configuracionSistema } = useGetConfiguracionSistema();
  const { data: formatos = [] } = useGetFormatos(true);
  const duracionActiva = configuracionSistema?.duracionServiciosActiva ?? false;

  const crearMutation = useCreateServicioMutation();
  const actualizarMutation = useUpdateServicioMutation();
  const estadoMutation = useUpdateServicioEstadoMutation();
  const duracionMutation = useUpdateConfiguracionSistemaMutation();
  const documentosMutation = useActualizarDocumentosServicioMutation();

  const [mostrarModal, setMostrarModal] = useState(false);
  const [servicioEditando, setServicioEditando] =
    useState<ServicioResponse | null>(null);
  const [nombre, setNombre] = useState("");
  const [orden, setOrden] = useState(0);
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
    setDuracionMinutos(servicio.duracionMinutos);
    setDescripcion(servicio.descripcion || "");
    setImagenUrl(servicio.imagenUrl || "");
    setImagenPublicId(servicio.imagenPublicId || "");
    setImagenAlt(servicio.imagenAlt || "");
    setDocumentos(
      servicio.documentos.map(d => ({
        formatoFichaId: d.formatoFichaId,
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

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      let id: number;
      if (servicioEditando) {
        id = servicioEditando.id;
        await actualizarMutation.mutateAsync({
          id,
          data: {
            nombre,
            orden,
            duracionMinutos,
            imagenPublicId: imagenPublicId || undefined,
            imagenAlt: imagenAlt || undefined,
            descripcion: descripcion || undefined,
          },
        });
      } else {
        const creado = await crearMutation.mutateAsync({
          nombre,
          orden,
          duracionMinutos,
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

  const handleToggleDuracionActiva = async () => {
    await duracionMutation.mutateAsync({
      duracionServiciosActiva: !duracionActiva,
    });
  };

  return {
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
    formatos,
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
      setDuracionMinutos,
      setDescripcion,
      setDocumentos,
      handleAbrirCrear,
      handleAbrirEditar,
      handleCerrarModal,
      handleFotoChange,
      handleGuardar,
      handleToggleEstado,
      handleToggleDuracionActiva,
    },
  };
};
