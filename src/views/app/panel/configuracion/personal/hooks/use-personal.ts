"use client";

import { useState } from "react";

import {
  useCreateUsuarioPersonalMutation,
  useGetUsuariosPersonal,
  useUpdateUsuarioPersonalEstadoMutation,
  useUpdateUsuarioPersonalMutation,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import {
  UsuarioPersonalAdminResponse,
  UsuarioPersonalCreadoResponse,
} from "@/models/responses";

export const usePersonal = () => {
  const { data: usuarios = [], isLoading: cargando } =
    useGetUsuariosPersonal(false);

  const crearMutation = useCreateUsuarioPersonalMutation();
  const actualizarMutation = useUpdateUsuarioPersonalMutation();
  const estadoMutation = useUpdateUsuarioPersonalEstadoMutation();

  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] =
    useState<UsuarioPersonalAdminResponse | null>(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("Especialista");
  const [especialistaId, setEspecialistaId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [errorEstado, setErrorEstado] = useState<string | null>(null);
  const [credencialesCreadas, setCredencialesCreadas] =
    useState<UsuarioPersonalCreadoResponse | null>(null);

  const handleAbrirCrear = (prefill?: {
    nombre?: string;
    especialistaId?: number;
  }) => {
    setUsuarioEditando(null);
    setNombre(prefill?.nombre ?? "");
    setEmail("");
    setRol("Especialista");
    setEspecialistaId(
      prefill?.especialistaId ? String(prefill.especialistaId) : ""
    );
    setError(null);
    setMostrarModal(true);
  };

  const handleAbrirEditar = (usuario: UsuarioPersonalAdminResponse) => {
    setUsuarioEditando(usuario);
    setNombre(usuario.nombre);
    setEmail(usuario.email);
    setRol(usuario.rol);
    setEspecialistaId(
      usuario.especialistaId ? String(usuario.especialistaId) : ""
    );
    setError(null);
    setMostrarModal(true);
  };

  const handleCerrarModal = () => setMostrarModal(false);
  const handleCerrarCredenciales = () => setCredencialesCreadas(null);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const especialistaIdNum = especialistaId
        ? Number(especialistaId)
        : undefined;

      if (usuarioEditando) {
        await actualizarMutation.mutateAsync({
          id: usuarioEditando.id,
          data: { nombre, rol, especialistaId: especialistaIdNum },
        });
      } else {
        const creado = await crearMutation.mutateAsync({
          nombre,
          email,
          rol,
          especialistaId: especialistaIdNum,
        });
        setCredencialesCreadas(creado);
      }
      setMostrarModal(false);
    } catch (err: unknown) {
      setError(handleApiError(err).message);
    }
  };

  const handleToggleEstado = async (usuario: UsuarioPersonalAdminResponse) => {
    setErrorEstado(null);
    try {
      await estadoMutation.mutateAsync({
        id: usuario.id,
        activo: !usuario.activo,
      });
    } catch (err: unknown) {
      setErrorEstado(handleApiError(err).message);
    }
  };

  return {
    usuarios,
    cargando,
    mostrarModal,
    usuarioEditando,
    nombre,
    email,
    rol,
    especialistaId,
    error,
    errorEstado,
    credencialesCreadas,
    guardando: crearMutation.isPending || actualizarMutation.isPending,
    actualizandoEstadoId: estadoMutation.isPending
      ? estadoMutation.variables?.id
      : null,

    actions: {
      setNombre,
      setEmail,
      setRol,
      setEspecialistaId,
      handleAbrirCrear,
      handleAbrirEditar,
      handleCerrarModal,
      handleCerrarCredenciales,
      handleGuardar,
      handleToggleEstado,
    },
  };
};
