"use client";

import Link from "next/link";

import {
  Alerta,
  BottomActionBar,
  Modal,
  StepIndicator,
  TextAreaField,
} from "@/components/shared";
import { Badge, Button, Card } from "@/components/ui";

import { PASOS_NUEVA_RESERVA, useResumenReserva } from "./hooks";

export default function ResumenView() {
  const {
    notaPaciente,
    notaInterna,
    filasResumen,
    confirmarDescarte,
    guardando,
    errorMsg,
    actions,
  } = useResumenReserva();

  return (
    <div className="mx-auto max-w-4xl space-y-6 font-sans shadow-none">
      <div className="mb-6">
        <StepIndicator pasos={PASOS_NUEVA_RESERVA} pasoActivo={5} />
      </div>

      {errorMsg && <Alerta tono="error">{errorMsg}</Alerta>}

      <Card className="border border-border p-6 space-y-6">
        <h2 className="font-sans text-section-title font-bold text-foreground">
          Notas de la Reserva (Opcional)
        </h2>

        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="font-sans text-label font-medium text-muted-foreground">
                Nota para el Paciente
              </span>
              <Badge className="gap-1.5 border-0 bg-blue-800 text-[11px] font-medium text-white">
                El paciente la verá en su confirmación
              </Badge>
            </div>
            <TextAreaField
              etiqueta=""
              value={notaPaciente}
              onChange={e => actions.setNotaPaciente(e.target.value)}
              placeholder="Ej: Recuerde traer ropa cómoda para la sesión..."
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="font-sans text-label font-medium text-muted-foreground">
                Nota Interna
              </span>
              <Badge className="gap-1.5 border-transparent bg-slate-900 text-[11px] font-medium text-white">
                Visible solo para el personal de KineFit
              </Badge>
            </div>
            <TextAreaField
              etiqueta=""
              value={notaInterna}
              onChange={e => actions.setNotaInterna(e.target.value)}
              placeholder="Ej: Paciente prefiere ser atendido por Kinesiólogo hombre..."
            />
          </div>
        </div>

        <div className="border border-border bg-slate-50/70 p-4 rounded-none">
          <p className="font-sans text-[10px] font-bold text-muted-foreground border-b border-border pb-1 mb-3">
            Revisión Final
          </p>
          <dl className="divide-y divide-border">
            {filasResumen.map(fila => (
              <div
                key={fila.etiqueta}
                className="flex items-center justify-between py-2.5 text-xs"
              >
                <dt className="font-sans text-label font-medium text-muted-foreground">
                  {fila.etiqueta}
                </dt>
                <div className="flex items-center gap-3">
                  <dd className="font-sans font-medium text-value text-foreground">
                    {fila.valor ?? "—"}
                  </dd>
                  <Link
                    href={fila.editar}
                    className="font-sans text-[11px] font-bold text-slate-700 hover:text-slate-950 underline"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <BottomActionBar
          abandono={
            <button
              type="button"
              onClick={actions.handleAbrirConfirmarDescarte}
              className="font-sans text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Cancelar Reserva
            </button>
          }
          volver={
            <Button variant="outline" onClick={actions.handleVolver}>
              Volver
            </Button>
          }
          avanzar={
            <Button
              onClick={actions.handleConfirmarReserva}
              disabled={guardando}
            >
              {guardando ? "Registrando..." : "Confirmar Reserva"}
            </Button>
          }
        />
      </Card>

      <Modal
        abierto={confirmarDescarte}
        onCerrar={actions.handleCerrarConfirmarDescarte}
      >
        <div className="bg-white p-6 font-sans shadow-none rounded-overlay space-y-4">
          <h3 className="font-sans text-section-title font-bold text-foreground">
            ¿Descartar esta reserva?
          </h3>
          <p className="font-sans text-xs text-slate-500">
            Se perderá todo lo seleccionado en los pasos anteriores.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={actions.handleCerrarConfirmarDescarte}
            >
              Volver
            </Button>
            <Button onClick={actions.handleDescartar}>Sí, Descartar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
