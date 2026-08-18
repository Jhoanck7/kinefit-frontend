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
        <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
          Notas de la reserva (opcional)
        </h2>

        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="font-sans text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Nota para el paciente
              </span>
              <Badge className="gap-1.5 rounded-none border-blue-200 bg-blue-50 text-[11px] font-medium text-blue-950">
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
              <span className="font-sans text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Nota interna
              </span>
              <Badge className="gap-1.5 rounded-none border-transparent bg-slate-900 text-[11px] font-medium text-white">
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

        <div className="border border-slate-200 bg-slate-50/70 p-4 rounded-none">
          <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-1 mb-3">
            Revisión final
          </p>
          <dl className="divide-y divide-slate-200">
            {filasResumen.map(fila => (
              <div
                key={fila.etiqueta}
                className="flex items-center justify-between py-2.5 text-xs"
              >
                <dt className="font-sans text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  {fila.etiqueta}
                </dt>
                <div className="flex items-center gap-3">
                  <dd className="font-sans font-medium text-sm text-slate-900">
                    {fila.valor ?? "—"}
                  </dd>
                  <Link
                    href={fila.editar}
                    className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-950 underline"
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
              className="font-sans text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
            >
              Cancelar reserva
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
              {guardando ? "Registrando..." : "Confirmar reserva"}
            </Button>
          }
        />
      </Card>

      <Modal
        abierto={confirmarDescarte}
        onCerrar={actions.handleCerrarConfirmarDescarte}
      >
        <div className="bg-white p-6 font-sans shadow-none rounded-none space-y-4">
          <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
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
            <Button variant="destructive" onClick={actions.handleDescartar}>
              Sí, descartar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
