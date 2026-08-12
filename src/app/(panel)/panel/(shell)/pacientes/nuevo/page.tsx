"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { pacienteConRut, RUT_DEMO_YA_EXISTENTE } from "@/lib/panel/data/pacientes";
import { listConvenios } from "@/lib/panel/data/convenios";
import { Convenio } from "@/lib/panel/domain/tipos";
import { useNuevaReservaStore } from "@/lib/store/useNuevaReservaStore";
import { Card } from "@/components/panel/primitives/Card";
import { Button } from "@/components/panel/primitives/Button";
import { TextField, SelectField } from "@/components/panel/primitives/CamposFormulario";
import { SimulatedActionNotice } from "@/components/panel/primitives/SimulatedActionNotice";

function RegistrarPacienteContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const retorno = searchParams.get("retorno");
  const setPacienteReserva = useNuevaReservaStore((s) => s.setPaciente);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [rut, setRut] = useState("");
  const [pacienteExistente, setPacienteExistente] = useState<{ id: string; nombre: string } | null>(null);
  const [confirmacion, setConfirmacion] = useState(false);
  const [convenios, setConvenios] = useState<Convenio[]>([]);

  useEffect(() => {
    listConvenios().then(setConvenios);
  }, []);

  async function alCambiarRut(valor: string) {
    setRut(valor);
    if (valor.trim() === RUT_DEMO_YA_EXISTENTE) {
      const existente = await pacienteConRut(valor.trim());
      setPacienteExistente(existente ? { id: existente.id, nombre: `${existente.nombre} ${existente.apellido}` } : null);
    } else {
      setPacienteExistente(null);
    }
  }

  function alEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setConfirmacion(true);
  }

  function alTerminar() {
    if (retorno) {
      if (nombre || apellido) {
        setPacienteReserva(`temp-${Date.now()}`, `${nombre} ${apellido}`.trim());
      }
      router.push(retorno);
    } else {
      router.push("/panel/pacientes");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <h2 className="mb-6 text-lg font-bold text-panel-sidebar">Registrar paciente nuevo</h2>
        <form onSubmit={alEnviar} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField etiqueta="Nombre" obligatorio required value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <TextField etiqueta="Apellido" obligatorio required value={apellido} onChange={(e) => setApellido(e.target.value)} />
          </div>
          <TextField
            etiqueta="RUT"
            obligatorio
            required
            placeholder="12.345.678-9"
            value={rut}
            onChange={(e) => alCambiarRut(e.target.value)}
          />
          {pacienteExistente && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Ya existe un paciente registrado con este RUT: <strong>{pacienteExistente.nombre}</strong>.{" "}
              <button
                type="button"
                onClick={() => router.push(`/panel/pacientes/${pacienteExistente.id}`)}
                className="underline underline-offset-2"
              >
                Usar este paciente
              </button>{" "}
              en vez de registrar uno nuevo.
            </div>
          )}
          <TextField etiqueta="Correo electrónico" type="email" obligatorio required />
          <TextField etiqueta="Teléfono" placeholder="+56 9 1234 5678" obligatorio required />
          <SelectField etiqueta="Convenio institucional" defaultValue="">
            <option value="">Sin convenio</option>
            {convenios.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </SelectField>

          <div className="flex justify-end gap-3 border-t border-brand-border pt-6">
            <Button type="button" variante="secundario" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" variante="primario">
              Registrar paciente
            </Button>
          </div>
        </form>
      </Card>

      <SimulatedActionNotice
        abierto={confirmacion}
        onCerrar={alTerminar}
        titulo="Paciente registrado"
        descripcion="El paciente quedó disponible en la base de pacientes."
      />
    </div>
  );
}

export default function RegistrarPacientePage() {
  return (
    <Suspense fallback={<div aria-hidden />}>
      <RegistrarPacienteContenido />
    </Suspense>
  );
}
