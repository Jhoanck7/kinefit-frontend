"use client";

import { Suspense } from "react";

import { SelectField, TextField } from "@/components/shared";
import { Button, Card } from "@/components/ui";

import { useRegistrarPaciente } from "./hooks";

function RegistrarPacienteContent() {
  const {
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
    actions,
  } = useRegistrarPaciente();

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="p-6">
        <h2 className="mb-6 text-lg font-bold text-panel-sidebar">
          Registrar paciente nuevo
        </h2>

        {errorMsg && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={actions.handleEnviar} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField
              etiqueta="Nombre"
              obligatorio
              required
              value={nombre}
              onChange={e => actions.setNombre(e.target.value)}
            />
            <TextField
              etiqueta="Apellido"
              obligatorio
              required
              value={apellido}
              onChange={e => actions.setApellido(e.target.value)}
            />
          </div>
          <TextField
            etiqueta="RUT"
            obligatorio
            required
            placeholder="12.345.678-9"
            value={rut}
            onChange={e => actions.handleCambiarRut(e.target.value)}
          />
          {pacienteExistente && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Ya existe un paciente registrado con este RUT:{" "}
              <strong>{pacienteExistente.nombre}</strong>.{" "}
              <button
                type="button"
                onClick={actions.handleUsarExistente}
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
            onChange={e => actions.setEmail(e.target.value)}
          />
          <TextField
            etiqueta="Teléfono"
            placeholder="+56 9 1234 5678"
            obligatorio
            required
            value={telefono}
            onChange={e => actions.setTelefono(e.target.value)}
          />
          <SelectField
            etiqueta="Convenio institucional"
            value={convenioId}
            onChange={e => actions.setConvenioId(e.target.value)}
          >
            <option value="">Sin convenio</option>
            {convenios.map(c => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </SelectField>

          <div className="flex justify-end gap-3 border-t border-brand-border pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={actions.handleCancelar}
              disabled={guardando}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? "Registrando..." : "Registrar paciente"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function RegistrarPacienteView() {
  return (
    <Suspense fallback={<div className="h-full" aria-hidden />}>
      <RegistrarPacienteContent />
    </Suspense>
  );
}
