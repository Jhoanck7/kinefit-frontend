"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { InfoBadge, InvertedBadge } from "@/components/panel/primitives/Badge";
import { BottomActionBar } from "@/components/panel/primitives/BottomActionBar";
import { Button } from "@/components/panel/primitives/Button";
import { TextAreaField } from "@/components/panel/primitives/CamposFormulario";
import { Card } from "@/components/panel/primitives/Card";
import { Modal } from "@/components/panel/primitives/Modal";
import { StepIndicator } from "@/components/panel/primitives/StepIndicator";
import { fechaISO, formatearFechaExtensa } from "@/lib/panel/domain/formato";
import { agendaService } from "@/lib/services/agenda.service";
import { citaService } from "@/lib/services/cita.service";
import { useNuevaReservaStore } from "@/lib/store/useNuevaReservaStore";

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
    {
      etiqueta: "Servicio",
      valor: servicio ? NOMBRE_SERVICIO[servicio] : undefined,
      editar: "/panel/nueva-reserva/servicio",
    },
    {
      etiqueta: "Fecha",
      valor: fecha ? formatearFechaExtensa(fecha) : undefined,
      editar: "/panel/nueva-reserva/horario",
    },
    {
      etiqueta: "Horario",
      valor: hora || undefined,
      editar: "/panel/nueva-reserva/horario",
    },
    {
      etiqueta: "Especialista",
      valor: especialistaNombre || undefined,
      editar: "/panel/nueva-reserva/especialista",
    },
    {
      etiqueta: "Paciente",
      valor: pacienteNombre || undefined,
      editar: "/panel/nueva-reserva/paciente",
    },
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
      const numEspecialistaId = especialistaId
        ? parseInt(especialistaId.replace(/\D/g, ""), 10) || 1
        : 1;
      const numServicioId = MAPA_SERVICIO_ID[servicio] || 2;
      const fechaStr = fechaISO(fecha);

      let targetBloqueId = bloqueHorarioId;

      if (!targetBloqueId) {
        const agendaRes = await agendaService.getAgenda(
          [numEspecialistaId],
          fechaStr,
          fechaStr
        );
        const dataArr =
          (agendaRes as any)?.data ||
          (Array.isArray(agendaRes) ? agendaRes : []);
        const hBuscada = hora.substring(0, 5);
        const bloqueHallado = dataArr.find(
          (b: any) => b.horaInicio && b.horaInicio.substring(0, 5) === hBuscada
        );
        if (bloqueHallado) {
          targetBloqueId = bloqueHallado.id;
        }
      }

      if (!targetBloqueId) {
        throw new Error(
          "No se encontró el bloque horario seleccionado para esa fecha y hora. Re-selecciona el horario."
        );
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
      const msg =
        err instanceof Error
          ? err.message
          : "Ocurrió un error al guardar la cita.";
      setErrorMsg(msg);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 font-sans shadow-none">
      <div className="mb-6">
        <StepIndicator pasos={PASOS} pasoActivo={5} />
      </div>

      {errorMsg && (
        <div className="border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-800 rounded-none">
          {errorMsg}
        </div>
      )}

      <Card className="rounded-none border-slate-200 shadow-none p-6 space-y-6">
        <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
          Notas de la reserva (opcional)
        </h2>

        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="font-sans text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Nota para el paciente
              </span>
              <InfoBadge>El paciente la verá en su confirmación</InfoBadge>
            </div>
            <TextAreaField
              etiqueta=""
              value={notaPaciente}
              onChange={e => setNotaPaciente(e.target.value)}
              placeholder="Ej: Recuerde traer ropa cómoda para la sesión..."
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="font-sans text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Nota interna
              </span>
              <InvertedBadge>
                Visible solo para el personal de KineFit
              </InvertedBadge>
            </div>
            <TextAreaField
              etiqueta=""
              value={notaInterna}
              onChange={e => setNotaInterna(e.target.value)}
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
                  <button
                    type="button"
                    onClick={() => router.push(fila.editar)}
                    className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-950 underline"
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
              className="font-sans text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900"
            >
              Cancelar reserva
            </button>
          }
          volver={
            <Button
              variante="secundario"
              onClick={() => router.push("/panel/nueva-reserva/paciente")}
            >
              Volver
            </Button>
          }
          avanzar={
            <Button
              variante="primario"
              onClick={handleConfirmarReserva}
              disabled={guardando}
            >
              {guardando ? "Registrando..." : "Confirmar reserva"}
            </Button>
          }
        />
      </Card>

      <Modal
        abierto={confirmarDescarte}
        onCerrar={() => setConfirmarDescarte(false)}
        ancho="max-w-sm"
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
              variante="secundario"
              onClick={() => setConfirmarDescarte(false)}
            >
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
