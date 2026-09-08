"use client";

import { Alerta, TextField } from "@/components/shared";
import { Button, Card } from "@/components/ui";

import { useCambiarPassword } from "./hooks";

export default function CambiarPasswordView() {
  const { cargando, errorMsg, actions } = useCambiarPassword();

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <div>
        <h1 className="font-sans text-lg font-bold text-slate-900">
          Cambiar contraseña
        </h1>
        <p className="font-sans text-xs text-slate-500">
          Tu cuenta tiene una contraseña temporal, elegí una nueva para
          continuar
        </p>
      </div>

      <Card className="border border-border p-6">
        {errorMsg && (
          <Alerta tono="error" className="mb-4">
            {errorMsg}
          </Alerta>
        )}

        <form onSubmit={actions.alEnviar} className="space-y-4">
          <TextField
            etiqueta="Contraseña actual"
            type="password"
            name="passwordActual"
            required
          />
          <TextField
            etiqueta="Contraseña nueva"
            type="password"
            name="passwordNueva"
            minLength={10}
            required
          />
          <TextField
            etiqueta="Confirmar contraseña nueva"
            type="password"
            name="passwordConfirmacion"
            minLength={10}
            required
          />
          <Button type="submit" className="w-full mt-2" disabled={cargando}>
            {cargando ? "GUARDANDO..." : "CAMBIAR CONTRASEÑA"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
