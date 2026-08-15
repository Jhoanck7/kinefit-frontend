"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { listConvenios } from "@/lib/panel/data/convenios";
import {
  pacienteConRut,
  RUT_DEMO_YA_EXISTENTE,
} from "@/lib/panel/data/pacientes";
import { Convenio } from "@/lib/panel/domain/tipos";
import { useNuevaReservaStore } from "@/lib/store/useNuevaReservaStore";
import { pacienteService } from "@/services";

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
  const [convenios, setConvenios] = useState<Convenio[]>([]);

  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    listConvenios().then(setConvenios);
  }, []);

  // Actions
  const handleCambiarRut = async (valor: string) => {
    setRut(valor);
    if (valor.trim() === RUT_DEMO_YA_EXISTENTE || valor.trim().length >= 8) {
      try {
        const res = await pacienteService.verificarRut(valor.trim());
        const { existe, paciente } = res.data.data;
        if (existe && paciente) {
          setPacienteExistente({
            id: String(paciente.id),
            nombre: `${paciente.nombre} ${paciente.apellido}`,
          });
          return;
        }
      } catch {
        // Fallback local
      }
      const existente = await pacienteConRut(valor.trim());
      setPacienteExistente(
        existente
          ? {
              id: existente.id,
              nombre: `${existente.nombre} ${existente.apellido}`,
            }
          : null
      );
    } else {
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

    setGuardando(true);
    setErrorMsg(null);

    try {
      const numConvenioId = convenioId ? parseInt(convenioId, 10) : undefined;
      const res = await pacienteService.create({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        rut: rut.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        empresaId: isNaN(numConvenioId!) ? undefined : numConvenioId,
      });
      const creado = res.data.data;

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
    } finally {
      setGuardando(false);
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
    guardando,
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
