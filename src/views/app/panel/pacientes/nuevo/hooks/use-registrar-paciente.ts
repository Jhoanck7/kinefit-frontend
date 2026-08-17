"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useCreatePacienteMutation } from "@/hooks/api";
import { listConvenios } from "@/lib/panel/data/convenios";
import { EmpresaResponse } from "@/models/responses";
import { pacienteService } from "@/services";
import { useNuevaReservaStore } from "@/stores";

export const useRegistrarPaciente = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const retorno = searchParams.get("retorno");
  const setPacienteReserva = useNuevaReservaStore(s => s.setPaciente);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [convenioId, setConvenioId] = useState<string>("");

  const [pacienteExistente, setPacienteExistente] = useState<{
    id: string;
    nombre: string;
  } | null>(null);
  const [convenios, setConvenios] = useState<EmpresaResponse[]>([]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const createPacienteMutation = useCreatePacienteMutation();

  useEffect(() => {
    listConvenios().then(setConvenios);
  }, []);

  // Actions
  const handleCambiarRut = async (valor: string) => {
    setRut(valor);
    if (valor.trim().length < 8) {
      setPacienteExistente(null);
      return;
    }
    try {
      const res = await pacienteService.verificarRut(valor.trim());
      const { existe, paciente } = res.data.data;
      setPacienteExistente(
        existe && paciente
          ? {
              id: String(paciente.id),
              nombre: `${paciente.nombre} ${paciente.apellido}`,
            }
          : null
      );
    } catch {
      setPacienteExistente(null);
    }
  };

  const handleUsarExistente = () => {
    if (pacienteExistente) {
      router.push(`/panel/pacientes/${pacienteExistente.id}`);
    }
  };

  const handleCancelar = () => router.back();

  const handleEnviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!nombre.trim() || !apellido.trim() || !rut.trim() || !email.trim()) {
      setErrorMsg("Completa todos los campos obligatorios.");
      return;
    }

    setErrorMsg(null);

    try {
      const numConvenioId = convenioId ? parseInt(convenioId, 10) : undefined;
      const creado = await createPacienteMutation.mutateAsync({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        rut: rut.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        empresaId: isNaN(numConvenioId!) ? undefined : numConvenioId,
      });

      if (retorno) {
        setPacienteReserva(
          String(creado.id),
          `${creado.nombre} ${creado.apellido}`.trim()
        );
        router.push(retorno);
      } else {
        router.push("/panel/pacientes");
      }
    } catch (err: unknown) {
      console.error("Error al registrar paciente en Backend:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo registrar el paciente en el backend.";
      setErrorMsg(msg);
    }
  };

  return {
    // Data
    nombre,
    apellido,
    rut,
    email,
    telefono,
    convenioId,
    pacienteExistente,
    convenios,
    guardando: createPacienteMutation.isPending,
    errorMsg,

    // Actions
    actions: {
      setNombre,
      setApellido,
      setEmail,
      setTelefono,
      setConvenioId,
      handleCambiarRut,
      handleUsarExistente,
      handleCancelar,
      handleEnviar,
    },
  };
};
