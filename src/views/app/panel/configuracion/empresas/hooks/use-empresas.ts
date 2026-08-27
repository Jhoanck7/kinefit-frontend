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
  const [vigenteDesde, setVigenteDesde] = useState("");
  const [vigenteHasta, setVigenteHasta] = useState("");
  const [convenios, setConvenios] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [errorEstado, setErrorEstado] = useState<string | null>(null);

  const handleAbrirCrear = () => {
    setEmpresaEditando(null);
    setNombre("");
    setVigenteDesde("");
    setVigenteHasta("");
    setConvenios({});
    setError(null);
    setMostrarModal(true);
  };

  const handleAbrirEditar = (empresa: EmpresaResponse) => {
    setEmpresaEditando(empresa);
    setNombre(empresa.nombre);
    setVigenteDesde(empresa.vigenteDesde ?? "");
    setVigenteHasta(empresa.vigenteHasta ?? "");
    setConvenios(
      Object.fromEntries(empresa.convenios.map(c => [c.servicioId, c.porcentaje]))
    );
    setError(null);
    setMostrarModal(true);
  };

  const handleCerrarModal = () => setMostrarModal(false);

  const handleToggleConvenio = (servicioId: number, activo: boolean) => {
    setConvenios(prev => {
      const next = { ...prev };
      if (activo) {
        next[servicioId] = next[servicioId] ?? 10;
      } else {
        delete next[servicioId];
      }
      return next;
    });
  };

  const handlePorcentajeConvenio = (servicioId: number, porcentaje: number) => {
    setConvenios(prev => ({ ...prev, [servicioId]: porcentaje }));
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const data = {
        nombre,
        vigenteDesde: vigenteDesde || undefined,
        vigenteHasta: vigenteHasta || undefined,
        convenios: Object.entries(convenios).map(([servicioId, porcentaje]) => ({
          servicioId: Number(servicioId),
          porcentaje,
        })),
      };
      if (empresaEditando) {
        await actualizarMutation.mutateAsync({
          id: empresaEditando.id,
          data,
        });
      } else {
        await crearMutation.mutateAsync(data);
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
    vigenteDesde,
    vigenteHasta,
    convenios,
    error,
    errorEstado,
    guardando: crearMutation.isPending || actualizarMutation.isPending,
    actualizandoEstadoId: estadoMutation.isPending
      ? estadoMutation.variables?.id
      : null,

    actions: {
      setNombre,
      setVigenteDesde,
      setVigenteHasta,
      handleToggleConvenio,
      handlePorcentajeConvenio,
      handleAbrirCrear,
      handleAbrirEditar,
      handleCerrarModal,
      handleGuardar,
      handleToggleEstado,
    },
  };
};
