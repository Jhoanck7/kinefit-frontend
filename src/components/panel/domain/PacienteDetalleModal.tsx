"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHoyPanel } from "@/lib/panel/reloj";
import { getPaciente, PacienteResuelto } from "@/lib/panel/data/pacientes";
import { historialPaciente, contadoresPaciente, CitaResuelta } from "@/lib/panel/data/citas";
import { fichasDelPaciente, FichaResuelta } from "@/lib/panel/data/fichas";
import { definicionEstado } from "@/lib/panel/domain/estados";
import { formatearFechaCorta, formatearRangoHorario } from "@/lib/panel/domain/formato";
import { Modal } from "../primitives/Modal";
import { Button } from "../primitives/Button";
import { StatusPill } from "../primitives/StatusPill";
import { OriginBadge } from "../primitives/OriginBadge";

interface PacienteDetalleModalProps {
  pacienteId: string | null;
  hoy: Date;
  onCerrar: () => void;
}

type PestanaPaciente = "contacto" | "historial" | "fichas";

export function PacienteDetalleModal({ pacienteId, hoy, onCerrar }: PacienteDetalleModalProps) {
  const router = useRouter();
  const [paciente, setPaciente] = useState<PacienteResuelto | null>(null);
  const [historial, setHistorial] = useState<CitaResuelta[]>([]);
  const [contadores, setContadores] = useState({ atendidas: 0, canceladas: 0, noAsistidas: 0 });
  const [fichas, setFichas] = useState<FichaResuelta[]>([]);
  const [pestanaActiva, setPestanaActiva] = useState<PestanaPaciente>("contacto");

  useEffect(() => {
    if (!pacienteId || !hoy) {
      setPaciente(null);
      setPestanaActiva("contacto");
      return;
    }
    getPaciente(pacienteId).then((p) => setPaciente(p ?? null));
    historialPaciente(pacienteId, hoy).then(setHistorial);
    contadoresPaciente(pacienteId, hoy).then(setContadores);
    fichasDelPaciente(pacienteId, hoy).then(setFichas);
  }, [pacienteId, hoy]);

  return (
    <Modal abierto={Boolean(pacienteId)} onCerrar={onCerrar}>
      {!paciente ? (
        <div className="p-10 text-center text-sm text-brand-muted">Cargando…</div>
      ) : (
        <div className="text-sm text-panel-sidebar">
          {/* Encabezado Formal */}
          <div className="flex items-start justify-between gap-4 border-b border-brand-border p-6 pb-4">
            <div>
              <h2 className="text-lg font-bold text-panel-sidebar">
                Detalle de Paciente
              </h2>
              <p className="text-xs text-brand-muted mt-0.5 font-medium">
                {paciente.nombre} {paciente.apellido} | RUT {paciente.rut}
              </p>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar modal"
              className="rounded-full p-1.5 text-brand-muted hover:bg-panel-fondo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
            >
              &times;
            </button>
          </div>

          {/* Barra de 3 Pestañas Limpias */}
          <div className="flex border-b border-brand-border px-6 bg-white gap-6 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setPestanaActiva("contacto")}
              className={`py-3 border-b-2 transition-colors ${
                pestanaActiva === "contacto"
                  ? "border-panel-sidebar text-panel-sidebar font-bold"
                  : "border-transparent text-brand-muted hover:text-panel-sidebar"
              }`}
            >
              Datos personales y contacto
            </button>
            <button
              type="button"
              onClick={() => setPestanaActiva("historial")}
              className={`py-3 border-b-2 transition-colors ${
                pestanaActiva === "historial"
                  ? "border-panel-sidebar text-panel-sidebar font-bold"
                  : "border-transparent text-brand-muted hover:text-panel-sidebar"
              }`}
            >
              Resumen e Historial ({historial.length})
            </button>
            <button
              type="button"
              onClick={() => setPestanaActiva("fichas")}
              className={`py-3 border-b-2 transition-colors ${
                pestanaActiva === "fichas"
                  ? "border-panel-sidebar text-panel-sidebar font-bold"
                  : "border-transparent text-brand-muted hover:text-panel-sidebar"
              }`}
            >
              Fichas clínicas ({fichas.length})
            </button>
          </div>

          {/* Contenido Limpio de las 3 Pestañas */}
          <div className="p-6">
            {/* PESTAÑA 1: DATOS PERSONALES Y CONTACTO */}
            {pestanaActiva === "contacto" && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-1">
                  <span className="text-brand-muted font-medium">Nombre:</span>
                  <span className="font-bold text-panel-sidebar">
                    {paciente.nombre} {paciente.apellido}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-brand-muted font-medium">RUT:</span>
                  <span className="font-semibold text-panel-sidebar">{paciente.rut}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-brand-muted font-medium">Contacto:</span>
                  <span className="font-medium text-panel-sidebar">
                    {paciente.telefono} | {paciente.correo}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-brand-muted font-medium">Convenio:</span>
                  <span className="font-semibold text-panel-sidebar">
                    {paciente.convenio ? paciente.convenio.nombre : "Particular"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-brand-muted font-medium">Origen Registro:</span>
                  <span className="font-semibold text-panel-sidebar">
                    {paciente.origenRegistro === "web" ? "Web autoagendado" : "Registro manual"}
                  </span>
                </div>
              </div>
            )}

            {/* PESTAÑA 2: RESUMEN DE ATENCIONES E HISTORIAL DE CITAS */}
            {pestanaActiva === "historial" && (
              <div className="space-y-4">
                {/* Sección 1: Resumen de Atenciones */}
                <div className="space-y-2">
                  <p className="border-b border-brand-border pb-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted">
                    Resumen de Atenciones
                  </p>
                  <div className="space-y-1 text-sm pt-0.5">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-brand-muted font-medium">Citas Atendidas:</span>
                      <span className="font-bold text-panel-sidebar">{contadores.atendidas}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-brand-muted font-medium">Citas Canceladas:</span>
                      <span className="font-bold text-panel-sidebar">{contadores.canceladas}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-brand-muted font-medium">Citas No Asistidas:</span>
                      <span className="font-bold text-panel-sidebar">{contadores.noAsistidas}</span>
                    </div>
                  </div>
                </div>

                {/* Sección 2: Historial de Citas */}
                <div className="space-y-2 pt-2">
                  <p className="border-b border-brand-border pb-1.5 text-xs font-bold uppercase tracking-wider text-brand-muted">
                    Historial de Citas
                  </p>
                  <div className="pt-1">
                    {historial.length === 0 ? (
                      <p className="text-sm text-brand-muted py-2 text-center">Sin citas registradas.</p>
                    ) : (
                      <ul className="divide-y divide-brand-border/60 max-h-[180px] overflow-y-auto pr-1">
                        {historial.map((cita) => {
                          const definicion = definicionEstado(cita.estado);
                          return (
                            <li key={cita.id} className="flex items-center justify-between py-2 text-sm">
                              <div>
                                <p className="font-semibold text-panel-sidebar">
                                  {formatearFechaCorta(cita.fecha)} | {formatearRangoHorario(cita.horaInicio, cita.horaTermino)}
                                </p>
                                <p className="text-xs text-brand-muted capitalize mt-0.5">
                                  {cita.servicio} | {cita.especialista.nombre}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <OriginBadge origen={cita.origen} />
                                <StatusPill etiqueta={definicion.etiqueta} colorRol={definicion.colorRol} conTrama={definicion.conTrama} />
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA 3: FICHAS CLÍNICAS REGISTRADAS */}
            {pestanaActiva === "fichas" && (
              <div>
                {fichas.length === 0 ? (
                  <p className="text-sm text-brand-muted py-4 text-center">Sin fichas clínicas registradas.</p>
                ) : (
                  <ul className="divide-y divide-brand-border/60 max-h-[280px] overflow-y-auto pr-1">
                    {fichas.map((ficha) => (
                      <li key={ficha.id} className="flex justify-between items-center py-2.5 text-sm">
                        <span className="font-semibold text-panel-sidebar">{ficha.tipo}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-brand-muted">{formatearFechaCorta(ficha.cita.fecha)}</span>
                          <button
                            type="button"
                            onClick={() => {
                              onCerrar();
                              router.push(`/panel/fichas/${ficha.id}`);
                            }}
                            className="text-xs font-semibold text-panel-sidebar underline underline-offset-2"
                          >
                            Ver ficha
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Pie de Acciones */}
          <div className="border-t border-brand-border p-6 flex justify-end">
            <Button
              variante="secundario"
              onClick={onCerrar}
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
