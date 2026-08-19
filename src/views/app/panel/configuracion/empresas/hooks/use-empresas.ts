"use client";

import { useState } from "react";

import {
  useCreateEmpresaMutation,
  useGetEmpresas,
  useUpdateEmpresaEstadoMutation,
  useUpdateEmpresaMutation,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import { EmpresaResponse } from "@/models/responses";

export const useEmpresas = () => {
  const { data: empresas = [], isLoading: cargando } = useGetEmpresas(false);

  const crearMutation = useCreateEmpresaMutation();
  const actualizarMutation = useUpdateEmpresaMutation();
  const estadoMutation = useUpdateEmpresaEstadoMutation();

  const [mostrarModal, setMostrarModal] = useState(false);
  const [empresaEditando, setEmpresaEditando] =
    useState<EmpresaResponse | null>(null);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorEstado, setErrorEstado] = useState<string | null>(null);

  const handleAbrirCrear = () => {
    setEmpresaEditando(null);
    setNombre("");
    setError(null);
    setMostrarModal(true);
  };

  const handleAbrirEditar = (empresa: EmpresaResponse) => {
    setEmpresaEditando(empresa);
    setNombre(empresa.nombre);
    setError(null);
    setMostrarModal(true);
  };

  const handleCerrarModal = () => setMostrarModal(false);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (empresaEditando) {
        await actualizarMutation.mutateAsync({
          id: empresaEditando.id,
          data: { nombre },
        });
      } else {
        await crearMutation.mutateAsync({ nombre });
      }
      setMostrarModal(false);
    } catch (err: unknown) {
      setError(handleApiError(err).message);
    }
  };

  const handleToggleEstado = async (empresa: EmpresaResponse) => {
    setErrorEstado(null);
    try {
      await estadoMutation.mutateAsync({
        id: empresa.id,
        activo: !empresa.activo,
      });
    } catch (err: unknown) {
      setErrorEstado(handleApiError(err).message);
    }
  };

  return {
    empresas,
    cargando,
    mostrarModal,
    empresaEditando,
    nombre,
    error,
    errorEstado,
    guardando: crearMutation.isPending || actualizarMutation.isPending,
    actualizandoEstadoId: estadoMutation.isPending
      ? estadoMutation.variables?.id
      : null,

    actions: {
      setNombre,
      handleAbrirCrear,
      handleAbrirEditar,
      handleCerrarModal,
      handleGuardar,
      handleToggleEstado,
    },
  };
};
