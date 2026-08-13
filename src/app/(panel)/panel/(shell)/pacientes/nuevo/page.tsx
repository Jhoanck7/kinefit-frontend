"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { pacienteConRut, RUT_DEMO_YA_EXISTENTE } from "@/lib/panel/data/pacientes";
import { listConvenios } from "@/lib/panel/data/convenios";
import { Convenio } from "@/lib/panel/domain/tipos";
import { pacienteService } from "@/lib/services/paciente.service";
import { useNuevaReservaStore } from "@/lib/store/useNuevaReservaStore";
import { Card } from "@/components/panel/primitives/Card";
import { Button } from "@/components/panel/primitives/Button";
import { TextField, SelectField } from "@/components/panel/primitives/CamposFormulario";

function RegistrarPacienteContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const retorno = searchParams.get("retorno");
  const setPacienteReserva = useNuevaReservaStore((s) => s.setPaciente);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [convenioId, setConvenioId] = useState<string>("");

  const [pacienteExistente, setPacienteExistente] = useState<{ id: string; nombre: string } | null>(null);
  const [convenios, setConvenios] = useState<Convenio[]>([]);

  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    listConvenios().then(setConvenios);
  }, []);

  async function alCambiarRut(valor: string) {
    setRut(valor);
    if (valor.trim() === RUT_DEMO_YA_EXISTENTE || valor.trim().length >= 8) {
      try {
        const res = await pacienteService.verificarRut(valor.trim());
        if (res?.existe && res.paciente) {
          setPacienteExistente({
            id: String(res.paciente.id),
            nombre: `${res.paciente.nombre} ${res.paciente.apellido}`,
          });
          return;
        }
      } catch {
        // Fallback local
      }
      const existente = await pacienteConRut(valor.trim());
      setPacienteExistente(existente ? { id: existente.id, nombre: `${existente.nombre} ${existente.apellido}` } : null);
    } else {
      setPacienteExistente(null);
    }
  }

  async function alEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!nombre.trim() || !apellido.trim() || !rut.trim() || !email.trim()) {
      setErrorMsg("Completa todos los campos obligatorios.");
      return;
    }

    setGuardando(true);
    setErrorMsg(null);

    try {
      const numConvenioId = convenioId ? parseInt(convenioId, 10) : undefined;
      const creado = await pacienteService.create({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        rut: rut.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        empresaId: isNaN(numConvenioId!) ? undefined : numConvenioId,
      });

      if (retorno) {
        setPacienteReserva(String(creado.id), `${creado.nombre} ${creado.apellido}`.trim());
        router.push(retorno);
      } else {
        router.push("/panel/pacientes");
      }
    } catch (err: unknown) {
      console.error("Error al registrar paciente en Backend:", err);
      const msg = err instanceof Error ? err.message : "No se pudo registrar el paciente en el backend.";
      setErrorMsg(msg);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <h2 className="mb-6 text-lg font-bold text-panel-sidebar">Registrar paciente nuevo</h2>

        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
            {errorMsg}
          </div>
        )}

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
          <TextField
            etiqueta="Correo electrónico"
            type="email"
            obligatorio
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            etiqueta="Teléfono"
            placeholder="+56 9 1234 5678"
            obligatorio
            required
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          <SelectField
            etiqueta="Convenio institucional"
            value={convenioId}
            onChange={(e) => setConvenioId(e.target.value)}
          >
            <option value="">Sin convenio</option>
            {convenios.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </SelectField>

          <div className="flex justify-end gap-3 border-t border-brand-border pt-6">
            <Button type="button" variante="secundario" onClick={() => router.back()} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" variante="primario" disabled={guardando}>
              {guardando ? "Registrando..." : "Registrar paciente"}
            </Button>
          </div>
        </form>
      </Card>
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
