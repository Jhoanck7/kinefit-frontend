"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNuevaReservaStore } from "@/lib/store/useNuevaReservaStore";
import { fechaISO, formatearFechaExtensa } from "@/lib/panel/domain/formato";
import { citaService } from "@/lib/services/cita.service";
import { agendaService } from "@/lib/services/agenda.service";
import { Card } from "@/components/panel/primitives/Card";
import { Button } from "@/components/panel/primitives/Button";
import { TextAreaField } from "@/components/panel/primitives/CamposFormulario";
import { InfoBadge, InvertedBadge } from "@/components/panel/primitives/Badge";
import { StepIndicator } from "@/components/panel/primitives/StepIndicator";
import { BottomActionBar } from "@/components/panel/primitives/BottomActionBar";
import { Modal } from "@/components/panel/primitives/Modal";

const PASOS = [
  { etiqueta: "Servicio" },
  { etiqueta: "Horario" },
  { etiqueta: "Especialista" },
  { etiqueta: "Paciente" },
  { etiqueta: "Notas y resumen" },
];

const NOMBRE_SERVICIO: Record<string, string> = {
  embarazadas: "Embarazadas",
  masajes_pareja: "Masajes en pareja (masoterapia)",
  masajes: "Masajes (masoterapia)",
  masajes_premium: "Masajes Premium (masoterapia premium)",
  masajes_reductivos: "Masajes Reductivos",
  voucher_regalo: "Voucher para Regalo",
  kinesiologia: "Kinesiología",
};

const MAPA_SERVICIO_ID: Record<string, number> = {
  masajes: 1,
  kinesiologia: 2,
  embarazadas: 3,
  masajes_pareja: 4,
  masajes_premium: 5,
  masajes_reductivos: 6,
  voucher_regalo: 7,
};

export default function NuevaReservaResumenPage() {
  const router = useRouter();
  const {
    fecha,
    hora,
    bloqueHorarioId,
    pacienteId,
    pacienteNombre,
    especialistaId,
    especialistaNombre,
    servicio,
    notaPaciente,
    notaInterna,
    setNotaPaciente,
    setNotaInterna,
    reiniciar,
  } = useNuevaReservaStore();

  const [confirmarDescarte, setConfirmarDescarte] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filasResumen = [
    { etiqueta: "Servicio", valor: servicio ? NOMBRE_SERVICIO[servicio] : undefined, editar: "/panel/nueva-reserva/servicio" },
    { etiqueta: "Fecha", valor: fecha ? formatearFechaExtensa(fecha) : undefined, editar: "/panel/nueva-reserva/horario" },
    { etiqueta: "Horario", valor: hora || undefined, editar: "/panel/nueva-reserva/horario" },
    { etiqueta: "Especialista", valor: especialistaNombre || undefined, editar: "/panel/nueva-reserva/especialista" },
    { etiqueta: "Paciente", valor: pacienteNombre || undefined, editar: "/panel/nueva-reserva/paciente" },
  ];

  async function handleConfirmarReserva() {
    if (!fecha || !hora || !pacienteId || !servicio) {
      setErrorMsg("Faltan datos obligatorios para registrar la reserva.");
      return;
    }

    setGuardando(true);
    setErrorMsg(null);

    try {
      const numPacienteId = parseInt(pacienteId.replace(/\D/g, ""), 10) || 1;
      const numEspecialistaId = especialistaId ? parseInt(especialistaId.replace(/\D/g, ""), 10) || 1 : 1;
      const numServicioId = MAPA_SERVICIO_ID[servicio] || 2;
      const fechaStr = fechaISO(fecha);

      let targetBloqueId = bloqueHorarioId;

      // Si no tenemos el bloqueHorarioId directo, resolverlo desde la API /agenda
      if (!targetBloqueId) {
        const agendaRes = await agendaService.getAgenda([numEspecialistaId], fechaStr, fechaStr);
        const dataArr = (agendaRes as any)?.data || (Array.isArray(agendaRes) ? agendaRes : []);
        const hBuscada = hora.substring(0, 5);
        const bloqueHallado = dataArr.find((b: any) => b.horaInicio && b.horaInicio.substring(0, 5) === hBuscada);
        if (bloqueHallado) {
          targetBloqueId = bloqueHallado.id;
        }
      }

      if (!targetBloqueId) {
        throw new Error("No se encontró el bloque horario seleccionado para esa fecha y hora. Re-selecciona el horario.");
      }

      await citaService.createManual({
        pacienteId: numPacienteId,
        especialistaId: numEspecialistaId,
        servicioId: numServicioId,
        bloqueHorarioId: targetBloqueId,
        notaPaciente: notaPaciente || undefined,
        notaInterna: notaInterna || undefined,
      });

      router.push("/panel/nueva-reserva/listo");
    } catch (err: unknown) {
      console.error("Error al registrar la cita en Backend:", err);
      const msg = err instanceof Error ? err.message : "Ocurrió un error al guardar la cita.";
      setErrorMsg(msg);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="mb-8">
        <StepIndicator pasos={PASOS} pasoActivo={5} />
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          {errorMsg}
        </div>
      )}

      <Card>
        <h2 className="mb-4 text-lg font-bold text-panel-sidebar">Notas de la reserva (opcional)</h2>

        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-sm font-medium text-panel-sidebar">Nota para el paciente</span>
              <InfoBadge>El paciente la verá en su confirmación</InfoBadge>
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
              <InvertedBadge>Visible solo para el personal de KineFit</InvertedBadge>
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
                  <dd className="text-panel-sidebar font-medium">{fila.valor ?? "—"}</dd>
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
            <Button variante="secundario" onClick={() => router.push("/panel/nueva-reserva/paciente")}>
              Volver
            </Button>
          }
          avanzar={
            <Button variante="primario" onClick={handleConfirmarReserva} disabled={guardando}>
              {guardando ? "Registrando..." : "Confirmar reserva"}
            </Button>
          }
        />
      </Card>

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
