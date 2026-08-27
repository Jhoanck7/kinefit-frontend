"use client";

import { useState } from "react";

import {
  useCreateServicioMutation,
  useGetConfiguracionSistema,
  useGetServicios,
  useUpdateConfiguracionSistemaMutation,
  useUpdateServicioEstadoMutation,
  useUpdateServicioMutation,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import { ServicioResponse } from "@/models/responses";

export const useServicios = () => {
  const { data: servicios = [], isLoading: cargando } = useGetServicios(false);
  const { data: configuracionSistema } = useGetConfiguracionSistema();
  const duracionActiva = configuracionSistema?.duracionServiciosActiva ?? false;

  const crearMutation = useCreateServicioMutation();
  const actualizarMutation = useUpdateServicioMutation();
  const estadoMutation = useUpdateServicioEstadoMutation();
  const duracionMutation = useUpdateConfiguracionSistemaMutation();

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
      if (servicioEditando) {
        await actualizarMutation.mutateAsync({
          id: servicioEditando.id,
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
        await crearMutation.mutateAsync({
          nombre,
          orden,
          duracionMinutos,
          imagenPublicId: imagenPublicId || undefined,
          imagenAlt: imagenAlt || undefined,
          descripcion: descripcion || undefined,
        });
      }
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
    error,
    errorEstado,
    guardando: crearMutation.isPending || actualizarMutation.isPending,
    actualizandoEstadoId: estadoMutation.isPending
      ? estadoMutation.variables?.id
      : null,

    actions: {
      setNombre,
      setOrden,
      setDuracionMinutos,
      setDescripcion,
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
