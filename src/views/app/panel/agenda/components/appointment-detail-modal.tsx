"use client";

import { useState } from "react";

import { Alerta, Modal, ModalCloseButton } from "@/components/shared";
import {
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import {
  useGetAuditoriaCita,
  useGetCita,
  useGetTerminales,
  useUpdateCitaEstadoMutation,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import { COLOR_ROL } from "@/lib/color-rol";
import { definicionEstado, IdAccionCita } from "@/lib/estados";
import {
  formatearFechaExtensa,
  formatearFechaHora,
  formatearRangoHorario,
} from "@/lib/formato";
import { CitaDetalleResponse, CodigoEstadoCita } from "@/models/responses";
import { NuevaVentaModal } from "@/views/app/panel/ventas/components";

import { AuditTrail } from "./audit-trail";
import { DocumentosTab } from "./documentos-tab";
import { EnviarRecomendacionModal } from "./enviar-recomendacion-modal";
import { HitosBoard } from "./hitos-board";

const MAPA_ESTADO_NUEVO: Record<string, string> = {
  confirmar: "Confirmada",
  marcar_asistida: "Atendida",
  marcar_no_asistida: "NoAsistida",
};

export function AppointmentDetailModal({
  citaId,
  onCerrar,
  onSolicitarCancelacion,
  onEstadoCambiar,
}: {
  citaId: string | null;
  hoy: Date;
  onCerrar: () => void;
  onSolicitarCancelacion: () => void;
  onEstadoCambiar?: () => void;
}) {
  const { data: cita } = useGetCita(
    citaId ? Number(citaId) : 0,
    Boolean(citaId)
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [citaAtendidaId, setCitaAtendidaId] = useState<number | null>(null);
  const actualizarEstadoMutation = useUpdateCitaEstadoMutation();

  function alCerrar() {
    setErrorMsg(null);
    onCerrar();
  }

  async function ejecutarAccion(idAccion: IdAccionCita) {
    if (idAccion === "cancelar") {
      onSolicitarCancelacion();
      return;
    }

    const estadoNuevo = MAPA_ESTADO_NUEVO[idAccion];
    if (!estadoNuevo || !cita) return;

    setErrorMsg(null);

    try {
      await actualizarEstadoMutation.mutateAsync({
        id: cita.id,
        data: {
          estadoNuevo,
          confirmadoPor:
            estadoNuevo === "Confirmada" ? "Profesional" : undefined,
        },
      });
      onEstadoCambiar?.();
      // ES17 → ES18: recién al cerrar la atención se pregunta por la
      // recomendación, nunca antes.
      if (estadoNuevo === "Atendida") {
        setCitaAtendidaId(cita.id);
      }
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
    }
  }

  const guardando = actualizarEstadoMutation.isPending;

  return (
    <Modal abierto={Boolean(citaId)} onCerrar={alCerrar}>
      <EnviarRecomendacionModal
        citaId={citaAtendidaId}
        onCerrar={() => setCitaAtendidaId(null)}
      />
      {!cita ? (
        <div className="p-8 text-center font-sans text-xs text-slate-500">
          Cargando reserva…
        </div>
      ) : (
        <DetalleCita
          cita={cita}
          guardando={guardando}
          errorMsg={errorMsg}
          onCerrar={alCerrar}
          onAccion={ejecutarAccion}
        />
      )}
    </Modal>
  );
}

function DetalleCita({
  cita,
  guardando,
  errorMsg,
  onCerrar,
  onAccion,
}: {
  cita: CitaDetalleResponse;
  guardando: boolean;
  errorMsg: string | null;
  onCerrar: () => void;
  onAccion: (idAccion: IdAccionCita) => void;
}) {
  const definicion = definicionEstado(cita.estado as CodigoEstadoCita);
  const colorEstado = COLOR_ROL[definicion.colorRol] ?? COLOR_ROL.gris;
  const [tab, setTab] = useState("detalle");
  const [mostrarCobro, setMostrarCobro] = useState(false);
  const { data: terminales = [] } = useGetTerminales();
  const { data: historial = [] } = useGetAuditoriaCita(cita.id);

  return (
    <div className="bg-white text-foreground font-sans shadow-none rounded-overlay">
      {/* Encabezado del Modal */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm px-6 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-section-title font-bold text-foreground">
              Detalle de Reserva{" "}
              <span className="font-sans font-bold text-foreground">
                #{cita.id}
              </span>
            </h2>
            <span className="border border-slate-200 bg-white px-2 py-0.5 font-sans text-micro-header font-medium text-muted-foreground rounded-none">
              {cita.origen}
            </span>
          </div>
          <p className="font-sans text-xs text-slate-500 mt-0.5">
            Creada el{" "}
            <span className="font-sans text-slate-700 font-medium">
              {formatearFechaHora(new Date(cita.createdAt))}
            </span>
          </p>
        </div>
        <ModalCloseButton onClick={onCerrar} />
      </div>

      {errorMsg && (
        <Alerta tono="error" className="mx-6 mt-4">
          {errorMsg}
        </Alerta>
      )}

      <HitosBoard
        hitos={cita.hitos}
        onIrADocumentos={() => setTab("documentos")}
        onCobrar={() => setMostrarCobro(true)}
      />

      <NuevaVentaModal
        abierto={mostrarCobro}
        onClose={() => setMostrarCobro(false)}
        onCrearVenta={() => setMostrarCobro(false)}
        terminales={terminales}
        citaAsociada={{
          id: cita.id,
          pacienteId: cita.paciente.id,
          pacienteNombre: `${cita.paciente.nombre} ${cita.paciente.apellido}`,
          servicioId: cita.servicio.id,
          servicioNombre: cita.servicio.nombre,
          especialistaNombre: cita.especialista.nombre,
        }}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList
          variant="line"
          className="border-b border-slate-200 px-6 pt-2"
        >
          <TabsTrigger value="detalle">Detalle</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="detalle">
          {/* Cuerpo en Layout de 2 Columnas (Principal + Lateral Interno Paciente) */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* COLUMNA IZQUIERDA PRINCIPAL (2/3) */}
            <div className="md:col-span-2 p-6 space-y-6">
              {/* DETALLES DE LA ATENCIÓN */}
              <div>
                <h3 className="border-b border-slate-200 pb-1 font-sans text-micro-header font-medium text-muted-foreground mb-3">
                  Detalles de la Atención
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-sans text-label font-medium text-muted-foreground block">
                      Servicio
                    </span>
                    <span className="font-sans font-medium text-value text-foreground capitalize block mt-0.5">
                      {cita.servicio.nombre}
                    </span>
                  </div>

                  <div>
                    <span className="font-sans text-label font-medium text-muted-foreground block">
                      Especialista
                    </span>
                    <span className="font-sans font-medium text-value text-foreground block mt-0.5">
                      {cita.especialista.nombre} ({cita.especialista.cargo})
                    </span>
                  </div>

                  <div>
                    <span className="font-sans text-label font-medium text-muted-foreground block">
                      Fecha y Horario
                    </span>
                    <span className="font-sans font-medium text-value text-foreground block mt-0.5">
                      {formatearFechaExtensa(
                        new Date(`${cita.fecha}T00:00:00`)
                      )}
                      , {formatearRangoHorario(cita.horaInicio, cita.horaFin)}
                    </span>
                  </div>

                  <div>
                    <span className="font-sans text-label font-medium text-muted-foreground block">
                      Estado Actual
                    </span>
                    <div className="mt-1">
                      <Badge
                        className="rounded-overlay border-0 text-[11px] font-medium text-white"
                        style={{ backgroundColor: colorEstado.fondoSolido }}
                      >
                        {definicion.etiqueta}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* INFORMACIÓN DE PAGO */}
              <div>
                <h3 className="border-b border-slate-200 pb-1 font-sans text-micro-header font-medium text-muted-foreground mb-3">
                  Información de Pago
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <span className="font-sans text-label font-medium text-muted-foreground block">
                      Monto Anticipo
                    </span>
                    <span className="font-sans font-medium text-value text-foreground mt-0.5 block">
                      {cita.transaccion
                        ? `$${cita.transaccion.monto.toLocaleString("es-CL")} CLP`
                        : "Sin anticipo / Pago presencial"}
                    </span>
                  </div>
                  {cita.transaccion && (
                    <div>
                      <span className="font-sans text-label font-medium text-muted-foreground block">
                        N° Transacción Webpay
                      </span>
                      <span className="font-sans font-medium text-value text-foreground mt-0.5 block">
                        {cita.transaccion.buyOrder}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA SECUNDARIA (1/3) - FICHA RÁPIDA PACIENTE */}
            <div className="md:col-span-1 bg-slate-50/80 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="border-b border-slate-200 pb-1 font-sans text-micro-header font-medium text-muted-foreground">
                  Ficha del Paciente
                </h3>

                <div>
                  <span className="font-sans text-label font-medium text-muted-foreground block">
                    Nombre
                  </span>
                  <p className="font-sans font-medium text-value text-foreground mt-0.5">
                    {cita.paciente.nombre} {cita.paciente.apellido}
                  </p>
                </div>

                <div>
                  <span className="font-sans text-label font-medium text-muted-foreground block">
                    RUT
                  </span>
                  <p className="font-sans font-medium text-value text-foreground mt-0.5">
                    {cita.paciente.rut || "—"}
                  </p>
                </div>

                <div>
                  <span className="font-sans text-label font-medium text-muted-foreground block">
                    Teléfono
                  </span>
                  <p className="font-sans font-medium text-value text-foreground mt-0.5">
                    {cita.paciente.telefono || "—"}
                  </p>
                </div>

                <div>
                  <span className="font-sans text-label font-medium text-muted-foreground block">
                    Correo Electrónico
                  </span>
                  <p
                    className="font-sans font-medium text-value text-foreground mt-0.5 truncate"
                    title={cita.paciente.email}
                  >
                    {cita.paciente.email}
                  </p>
                </div>

                <div>
                  <span className="font-sans text-label font-medium text-muted-foreground block">
                    Convenio
                  </span>
                  <p className="font-sans font-medium text-value text-foreground mt-0.5">
                    Sin Convenio
                  </p>
                </div>
              </div>
            </div>
          </div>

          {historial.length > 0 && (
            <div className="border-t border-slate-200 px-6 py-4">
              <AuditTrail historial={historial} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="documentos">
          <DocumentosTab citaId={cita.id} />
        </TabsContent>
      </Tabs>

      {/* Pie de Acciones */}
      <div className="border-t border-slate-200 bg-slate-50/60 p-4">
        {definicion.acciones.length === 0 ? (
          <p className="font-sans text-xs text-slate-500 text-center">
            {definicion.explicacionSinAcciones}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 justify-end">
            {definicion.acciones.map(accion => {
              const esDestacado =
                accion.estilo === "primario" || accion.estilo === "peligro";

              const estiloBtn = esDestacado
                ? "bg-primary text-white hover:bg-primary-hover border-0 font-bold shadow-none"
                : "border border-slate-200 bg-white hover:bg-slate-50 text-foreground shadow-none";

              return (
                <button
                  key={accion.id}
                  disabled={guardando}
                  onClick={() => onAccion(accion.id)}
                  className={`font-sans text-xs font-bold px-4 py-2 rounded-none transition-all focus:outline-none ${estiloBtn} disabled:opacity-50`}
                >
                  {guardando ? "Procesando..." : accion.etiqueta}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
