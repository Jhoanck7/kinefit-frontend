"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNuevaReservaStore } from "@/lib/store/useNuevaReservaStore";
import { formatearFechaExtensa } from "@/lib/panel/domain/formato";
import { Card } from "@/components/panel/primitives/Card";
import { Button } from "@/components/panel/primitives/Button";
import { TextAreaField } from "@/components/panel/primitives/CamposFormulario";
import { InfoBadge, InvertedBadge } from "@/components/panel/primitives/Badge";
import { SummaryPanel } from "@/components/panel/primitives/SummaryPanel";
import { StepIndicator } from "@/components/panel/primitives/StepIndicator";
import { BottomActionBar } from "@/components/panel/primitives/BottomActionBar";
import { Modal } from "@/components/panel/primitives/Modal";

const PASOS = [{ etiqueta: "Horario" }, { etiqueta: "Paciente" }, { etiqueta: "Servicio" }, { etiqueta: "Notas y resumen" }];

const NOMBRE_SERVICIO: Record<string, string> = {
  masoterapia: "Masoterapia",
  kinesiologia: "Kinesiología",
};

export default function NuevaReservaResumenPage() {
  const router = useRouter();
  const { fecha, hora, pacienteNombre, servicio, notaPaciente, notaInterna, setNotaPaciente, setNotaInterna, reiniciar } =
    useNuevaReservaStore();
  const [confirmarDescarte, setConfirmarDescarte] = useState(false);

  const filasResumen = [
    { etiqueta: "Fecha", valor: fecha ? formatearFechaExtensa(fecha) : undefined, editar: "/panel/nueva-reserva/horario" },
    { etiqueta: "Horario", valor: hora || undefined, editar: "/panel/nueva-reserva/horario" },
    { etiqueta: "Paciente", valor: pacienteNombre || undefined, editar: "/panel/nueva-reserva/paciente" },
    { etiqueta: "Servicio", valor: servicio ? NOMBRE_SERVICIO[servicio] : undefined, editar: "/panel/nueva-reserva/servicio" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <StepIndicator pasos={PASOS} pasoActivo={4} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_320px]">
        <Card>
          <h2 className="mb-4 text-lg font-bold text-panel-sidebar">Notas de la reserva (opcional)</h2>

          <div className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-sm font-medium text-panel-sidebar">Nota para el paciente</span>
                <InfoBadge icono={<span aria-hidden>👁</span>}>El paciente la verá en su confirmación</InfoBadge>
              </div>
              <TextAreaField
                etiqueta=""
                value={notaPaciente}
                onChange={(e) => setNotaPaciente(e.target.value)}
                placeholder="Ej: Recuerde traer ropa cómoda para la sesión..."
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-sm font-medium text-panel-sidebar">Nota interna</span>
                <InvertedBadge icono={<span aria-hidden>🔒</span>}>Visible solo para el personal de KineFit</InvertedBadge>
              </div>
              <TextAreaField
                etiqueta=""
                className="bg-panel-seleccion"
                value={notaInterna}
                onChange={(e) => setNotaInterna(e.target.value)}
                placeholder="Ej: Paciente prefiere ser atendido por Kinesiólogo hombre..."
              />
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-panel-seleccion p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-muted">Revisión final</p>
            <dl className="divide-y divide-brand-border/60">
              {filasResumen.map((fila) => (
                <div key={fila.etiqueta} className="flex items-center justify-between py-2 text-sm">
                  <dt className="font-semibold text-brand-muted">{fila.etiqueta}</dt>
                  <div className="flex items-center gap-3">
                    <dd className="text-panel-sidebar">{fila.valor ?? "—"}</dd>
                    <button
                      type="button"
                      onClick={() => router.push(fila.editar)}
                      className="text-xs text-panel-sidebar underline underline-offset-2"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <BottomActionBar
            abandono={
              <button
                type="button"
                onClick={() => setConfirmarDescarte(true)}
                className="text-sm text-panel-sidebar underline underline-offset-2"
              >
                Cancelar reserva
              </button>
            }
            volver={
              <Button variante="secundario" onClick={() => router.push("/panel/nueva-reserva/servicio")}>
                Volver
              </Button>
            }
            avanzar={
              <Button variante="primario" onClick={() => router.push("/panel/nueva-reserva/listo")}>
                Confirmar reserva
              </Button>
            }
          />
        </Card>

        <SummaryPanel
          filas={filasResumen.map((f) => ({ etiqueta: f.etiqueta.toUpperCase(), valor: f.valor }))}
        />
      </div>

      <Modal abierto={confirmarDescarte} onCerrar={() => setConfirmarDescarte(false)} ancho="max-w-sm">
        <div className="p-6">
          <h3 className="text-lg font-bold text-panel-sidebar">¿Descartar esta reserva?</h3>
          <p className="mt-2 text-sm text-brand-muted">Se perderá todo lo seleccionado en los pasos anteriores.</p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variante="secundario" onClick={() => setConfirmarDescarte(false)}>
              Volver
            </Button>
            <Button
              variante="peligro"
              onClick={() => {
                reiniciar();
                router.push("/panel/agenda");
              }}
            >
              Sí, descartar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
