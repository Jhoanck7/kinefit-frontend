"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Modal, ModalCloseButton } from "@/components/shared";
import { Badge } from "@/components/ui";
import { useGetHistorialPorPaciente, useGetPacientePerfil } from "@/hooks/api";
import { COLOR_ROL } from "@/lib/color-rol";
import { definicionEstado } from "@/lib/estados";
import { etiquetaTipoDocumento } from "@/lib/estados-documento";
import { formatearFechaCorta } from "@/lib/formato";
import { CodigoEstadoCita } from "@/models/responses";

interface PacienteDetalleModalProps {
  pacienteId: string | null;
  hoy: Date;
  onCerrar: () => void;
}

type PestanaPaciente = "contacto" | "historial" | "fichas";

export function PacienteDetalleModal({
  pacienteId,
  hoy,
  onCerrar,
}: PacienteDetalleModalProps) {
  const router = useRouter();
  const [pestanaActiva, setPestanaActiva] =
    useState<PestanaPaciente>("contacto");

  const { data: perfil } = useGetPacientePerfil(
    Number(pacienteId),
    Boolean(pacienteId) && Boolean(hoy)
  );
  const { data: fichas = [] } = useGetHistorialPorPaciente(
    Number(pacienteId),
    Boolean(pacienteId)
  );

  useEffect(() => {
    if (!pacienteId) {
      setPestanaActiva("contacto");
    }
  }, [pacienteId]);

  return (
    <Modal abierto={Boolean(pacienteId)} onCerrar={onCerrar}>
      {!perfil ? (
        <div className="p-10 text-center font-sans text-xs text-slate-500">
          Cargando paciente…
        </div>
      ) : (
        <div className="bg-white text-slate-900 font-sans shadow-none rounded-overlay overflow-hidden">
          {/* Encabezado Formal */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm px-6 py-4">
            <div>
              <h2 className="font-sans text-section-title font-bold text-foreground">
                Detalle del Paciente
              </h2>
              <p className="font-sans text-xs text-slate-500 mt-0.5">
                {perfil.nombre} {perfil.apellido}, RUT{" "}
                <span className="text-slate-700 font-medium">
                  {perfil.rut || "—"}
                </span>
              </p>
            </div>
            <ModalCloseButton onClick={onCerrar} />
          </div>

          {/* Barra de Pestañas Limpias */}
          <div className="flex border-b border-slate-200 px-6 bg-white gap-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => setPestanaActiva("contacto")}
              className={`py-3 border-b-2 transition-colors ${
                pestanaActiva === "contacto"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-400 hover:text-slate-800"
              }`}
            >
              Datos Personales
            </button>
            <button
              type="button"
              onClick={() => setPestanaActiva("historial")}
              className={`py-3 border-b-2 transition-colors ${
                pestanaActiva === "historial"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-400 hover:text-slate-800"
              }`}
            >
              Historial de Citas ({perfil.historial.length})
            </button>
            <button
              type="button"
              onClick={() => setPestanaActiva("fichas")}
              className={`py-3 border-b-2 transition-colors ${
                pestanaActiva === "fichas"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-400 hover:text-slate-800"
              }`}
            >
              Documentos ({fichas.length})
            </button>
          </div>

          {/* Cuerpo en Layout de 2 Columnas */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* COLUMNA IZQUIERDA PRINCIPAL (2/3) */}
            <div className="md:col-span-2 p-6 space-y-4">
              {/* PESTAÑA 1: DATOS PERSONALES */}
              {pestanaActiva === "contacto" && (
                <div className="space-y-4">
                  <h3 className="border-b border-slate-200 pb-1 font-sans text-micro-header font-medium text-muted-foreground">
                    Información de Contacto
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <span className="font-sans text-label font-medium text-muted-foreground block">
                        Nombre
                      </span>
                      <p className="font-sans font-medium text-value text-foreground mt-0.5">
                        {perfil.nombre}
                      </p>
                    </div>
                    <div>
                      <span className="font-sans text-label font-medium text-muted-foreground block">
                        Apellido
                      </span>
                      <p className="font-sans font-medium text-value text-foreground mt-0.5">
                        {perfil.apellido}
                      </p>
                    </div>
                    <div>
                      <span className="font-sans text-label font-medium text-muted-foreground block">
                        RUT
                      </span>
                      <p className="font-sans font-medium text-value text-foreground mt-0.5">
                        {perfil.rut || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="font-sans text-label font-medium text-muted-foreground block">
                        Teléfono
                      </span>
                      <p className="font-sans font-medium text-value text-foreground mt-0.5">
                        {perfil.telefono || "—"}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-sans text-label font-medium text-muted-foreground block">
                        Correo Electrónico
                      </span>
                      <p className="font-sans font-medium text-value text-foreground mt-0.5">
                        {perfil.email || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PESTAÑA 2: HISTORIAL DE CITAS */}
              {pestanaActiva === "historial" && (
                <div className="space-y-3">
                  <h3 className="border-b border-slate-200 pb-1 font-sans text-micro-header font-medium text-muted-foreground">
                    Historial de Atenciones
                  </h3>
                  {perfil.historial.length === 0 ? (
                    <p className="font-sans text-xs text-slate-400 py-4 text-center">
                      Sin citas registradas.
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-200 max-h-[260px] overflow-y-auto pr-1">
                      {perfil.historial.map(cita => {
                        const definicion = definicionEstado(
                          cita.estado as CodigoEstadoCita
                        );
                        const color =
                          COLOR_ROL[definicion.colorRol] ??
                          COLOR_ROL["azul-seleccion"];
                        return (
                          <li
                            key={cita.id}
                            className="flex items-center justify-between py-2.5"
                          >
                            <div>
                              <p className="font-sans font-medium text-sm text-slate-700">
                                {formatearFechaCorta(new Date(cita.fecha))},{" "}
                                {cita.horaInicio}
                              </p>
                              <p className="font-sans text-xs text-slate-500 capitalize mt-0.5">
                                {cita.servicio}, {cita.especialista}
                              </p>
                            </div>
                            <Badge
                              className="rounded-overlay border-0 text-[10px] font-medium text-white"
                              style={{ backgroundColor: color.fondoSolido }}
                            >
                              {definicion.etiqueta}
                            </Badge>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}

              {/* PESTAÑA 3: DOCUMENTOS */}
              {pestanaActiva === "fichas" && (
                <div className="space-y-3">
                  <h3 className="border-b border-slate-200 pb-1 font-sans text-micro-header font-medium text-muted-foreground">
                    Documentos
                  </h3>
                  {fichas.length === 0 ? (
                    <p className="font-sans text-xs text-slate-400 py-4 text-center">
                      Sin documentos registrados.
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-200 max-h-[260px] overflow-y-auto pr-1">
                      {fichas.map(doc => (
                        <li
                          key={doc.id}
                          className="flex justify-between items-center py-2.5"
                        >
                          <div>
                            <span className="font-sans font-medium text-value text-foreground block">
                              {doc.nombre}
                            </span>
                            <span className="font-sans text-xs text-slate-500">
                              {etiquetaTipoDocumento(doc.tipo)},{" "}
                              {formatearFechaCorta(new Date(doc.fechaAtencion))}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onCerrar();
                              router.push(
                                `/panel/documentos?documento=${doc.id}`
                              );
                            }}
                            className="font-sans text-xs font-bold text-foreground hover:text-slate-950 border border-slate-200 px-3 py-1 bg-white hover:bg-slate-50 rounded-overlay shadow-none"
                          >
                            Ver Documento
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* COLUMNA DERECHA SECUNDARIA (1/3) - RESUMEN */}
            <div className="md:col-span-1 bg-slate-50/80 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <h3 className="border-b border-border pb-1 font-sans text-micro-header font-medium text-muted-foreground">
                  Resumen Métrico
                </h3>

                <div>
                  <span className="font-sans text-label font-medium text-muted-foreground block">
                    Convenio
                  </span>
                  <p className="font-sans font-medium text-value text-foreground mt-0.5">
                    {perfil.convenio || "Sin Convenio / Particular"}
                  </p>
                </div>

                <div>
                  <span className="font-sans text-label font-medium text-muted-foreground block">
                    Origen Registro
                  </span>
                  <p className="font-sans font-medium text-value text-foreground mt-0.5">
                    {perfil.origenRegistro === "web"
                      ? "Web Autoagendado"
                      : "Registro Manual"}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-sans text-label font-medium text-muted-foreground">
                      Atendidas
                    </span>
                    <span className="font-sans font-medium text-value text-foreground">
                      {perfil.contadores.citasAtendidas}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-sans text-label font-medium text-muted-foreground">
                      Canceladas
                    </span>
                    <span className="font-sans font-medium text-value text-foreground">
                      {perfil.contadores.citasCanceladas}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-sans text-label font-medium text-muted-foreground">
                      No Asistidas
                    </span>
                    <span className="font-sans font-medium text-value text-foreground">
                      {perfil.contadores.citasNoAsistidas}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pie de Acciones */}
          <div className="border-t border-slate-200 bg-slate-50/60 p-4 flex justify-end">
            <button
              type="button"
              onClick={onCerrar}
              className="font-sans text-xs font-bold px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-foreground rounded-overlay shadow-none"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
