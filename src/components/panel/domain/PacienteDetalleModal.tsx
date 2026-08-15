"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  CitaResuelta,
  contadoresPaciente,
  historialPaciente,
} from "@/lib/panel/data/citas";
import { FichaResuelta, fichasDelPaciente } from "@/lib/panel/data/fichas";
import { getPaciente, PacienteResuelto } from "@/lib/panel/data/pacientes";
import { definicionEstado } from "@/lib/panel/domain/estados";
import {
  formatearFechaCorta,
  formatearRangoHorario,
} from "@/lib/panel/domain/formato";

import { Modal } from "../primitives/Modal";

interface PacienteDetalleModalProps {
  pacienteId: string | null;
  hoy: Date;
  onCerrar: () => void;
}

type PestanaPaciente = "contacto" | "historial" | "fichas";

const DOT_COLOR: Record<string, string> = {
  "azul-seleccion": "bg-blue-600",
  ambar: "bg-amber-500",
  verde: "bg-emerald-500",
  "azul-profundo": "bg-indigo-700",
  rojo: "bg-red-500",
  gris: "bg-slate-400",
};

const TEXTO_COLOR: Record<string, string> = {
  "azul-seleccion": "text-blue-700",
  ambar: "text-amber-700",
  verde: "text-emerald-700",
  "azul-profundo": "text-indigo-800",
  rojo: "text-red-700",
  gris: "text-slate-600",
};

export function PacienteDetalleModal({
  pacienteId,
  hoy,
  onCerrar,
}: PacienteDetalleModalProps) {
  const router = useRouter();
  const [paciente, setPaciente] = useState<PacienteResuelto | null>(null);
  const [historial, setHistorial] = useState<CitaResuelta[]>([]);
  const [contadores, setContadores] = useState({
    atendidas: 0,
    canceladas: 0,
    noAsistidas: 0,
  });
  const [fichas, setFichas] = useState<FichaResuelta[]>([]);
  const [pestanaActiva, setPestanaActiva] =
    useState<PestanaPaciente>("contacto");

  useEffect(() => {
    if (!pacienteId || !hoy) {
      setPaciente(null);
      setPestanaActiva("contacto");
      return;
    }
    getPaciente(pacienteId).then(p => setPaciente(p ?? null));
    historialPaciente(pacienteId, hoy).then(setHistorial);
    contadoresPaciente(pacienteId, hoy).then(setContadores);
    fichasDelPaciente(pacienteId, hoy).then(setFichas);
  }, [pacienteId, hoy]);

  return (
    <Modal abierto={Boolean(pacienteId)} onCerrar={onCerrar} ancho="max-w-3xl">
      {!paciente ? (
        <div className="p-10 text-center font-sans text-xs text-slate-500">
          Cargando paciente…
        </div>
      ) : (
        <div className="bg-white text-slate-900 font-sans shadow-none rounded-none">
          {/* Encabezado Formal */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
            <div>
              <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
                Ficha del Paciente
              </h2>
              <p className="font-sans text-xs text-slate-500 mt-0.5">
                {paciente.nombre} {paciente.apellido} · RUT{" "}
                <span className="text-slate-700 font-medium">
                  {paciente.rut || "—"}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar modal"
              className="p-1 font-sans text-sm text-slate-400 hover:text-slate-900 rounded-none focus:outline-none"
            >
              ✕
            </button>
          </div>

          {/* Barra de Pestañas Limpias */}
          <div className="flex border-b border-slate-200 px-6 bg-white gap-6 text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setPestanaActiva("contacto")}
              className={`py-3 border-b-2 transition-colors ${
                pestanaActiva === "contacto"
                  ? "border-[#003366] text-[#003366]"
                  : "border-transparent text-slate-400 hover:text-slate-800"
              }`}
            >
              Datos personales
            </button>
            <button
              type="button"
              onClick={() => setPestanaActiva("historial")}
              className={`py-3 border-b-2 transition-colors ${
                pestanaActiva === "historial"
                  ? "border-[#003366] text-[#003366]"
                  : "border-transparent text-slate-400 hover:text-slate-800"
              }`}
            >
              Historial de citas ({historial.length})
            </button>
            <button
              type="button"
              onClick={() => setPestanaActiva("fichas")}
              className={`py-3 border-b-2 transition-colors ${
                pestanaActiva === "fichas"
                  ? "border-[#003366] text-[#003366]"
                  : "border-transparent text-slate-400 hover:text-slate-800"
              }`}
            >
              Fichas clínicas ({fichas.length})
            </button>
          </div>

          {/* Cuerpo en Layout de 2 Columnas */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* COLUMNA IZQUIERDA PRINCIPAL (2/3) */}
            <div className="md:col-span-2 p-6 space-y-4">
              {/* PESTAÑA 1: DATOS PERSONALES */}
              {pestanaActiva === "contacto" && (
                <div className="space-y-4">
                  <h3 className="border-b border-slate-200 pb-1 font-sans text-[10px] font-medium uppercase tracking-widest text-slate-400">
                    INFORMACIÓN DE CONTACTO
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                        Nombre
                      </span>
                      <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                        {paciente.nombre}
                      </p>
                    </div>
                    <div>
                      <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                        Apellido
                      </span>
                      <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                        {paciente.apellido}
                      </p>
                    </div>
                    <div>
                      <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                        RUT
                      </span>
                      <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                        {paciente.rut || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                        Teléfono
                      </span>
                      <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                        {paciente.telefono || "—"}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                        Correo Electrónico
                      </span>
                      <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                        {paciente.correo || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PESTAÑA 2: HISTORIAL DE CITAS */}
              {pestanaActiva === "historial" && (
                <div className="space-y-3">
                  <h3 className="border-b border-slate-200 pb-1 font-sans text-[10px] font-medium uppercase tracking-widest text-slate-400">
                    HISTORIAL DE ATENCIONES
                  </h3>
                  {historial.length === 0 ? (
                    <p className="font-sans text-xs text-slate-400 py-4 text-center">
                      Sin citas registradas.
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-200 max-h-[260px] overflow-y-auto pr-1">
                      {historial.map(cita => {
                        const definicion = definicionEstado(cita.estado);
                        const dotColor =
                          DOT_COLOR[definicion.colorRol] ?? "bg-slate-400";
                        const textoColor =
                          TEXTO_COLOR[definicion.colorRol] ?? "text-slate-600";
                        return (
                          <li
                            key={cita.id}
                            className="flex items-center justify-between py-2.5"
                          >
                            <div>
                              <p className="font-sans font-medium text-sm text-slate-900">
                                {formatearFechaCorta(cita.fecha)} ·{" "}
                                {formatearRangoHorario(
                                  cita.horaInicio,
                                  cita.horaTermino
                                )}
                              </p>
                              <p className="font-sans text-xs text-slate-500 capitalize mt-0.5">
                                {cita.servicio} · {cita.especialista.nombre}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${dotColor}`}
                                aria-hidden
                              />
                              <span
                                className={`font-sans text-[10px] font-bold uppercase tracking-wider ${textoColor}`}
                              >
                                {definicion.etiqueta}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}

              {/* PESTAÑA 3: FICHAS CLÍNICAS */}
              {pestanaActiva === "fichas" && (
                <div className="space-y-3">
                  <h3 className="border-b border-slate-200 pb-1 font-sans text-[10px] font-medium uppercase tracking-widest text-slate-400">
                    FICHAS CLÍNICAS
                  </h3>
                  {fichas.length === 0 ? (
                    <p className="font-sans text-xs text-slate-400 py-4 text-center">
                      Sin fichas clínicas registradas.
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-200 max-h-[260px] overflow-y-auto pr-1">
                      {fichas.map(ficha => (
                        <li
                          key={ficha.id}
                          className="flex justify-between items-center py-2.5"
                        >
                          <div>
                            <span className="font-sans font-medium text-sm text-slate-900 block">
                              {ficha.tipo}
                            </span>
                            <span className="font-sans text-xs text-slate-500">
                              {formatearFechaCorta(ficha.cita.fecha)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onCerrar();
                              router.push(`/panel/fichas/${ficha.id}`);
                            }}
                            className="font-sans text-xs font-bold uppercase tracking-wider text-slate-800 hover:text-slate-950 border border-slate-200 px-3 py-1 bg-white hover:bg-slate-50 rounded-none shadow-none"
                          >
                            VER FICHA
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
                <h3 className="border-b border-slate-200 pb-1 font-sans text-[10px] font-medium uppercase tracking-widest text-slate-400">
                  RESUMEN MÉTRICO
                </h3>

                <div>
                  <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                    Convenio
                  </span>
                  <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                    {paciente.convenio
                      ? paciente.convenio.nombre
                      : "Sin convenio / Particular"}
                  </p>
                </div>

                <div>
                  <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                    Origen Registro
                  </span>
                  <p className="font-sans font-medium text-sm text-slate-900 mt-0.5">
                    {paciente.origenRegistro === "web"
                      ? "Web autoagendado"
                      : "Registro manual"}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      Atendidas
                    </span>
                    <span className="font-sans font-medium text-sm text-slate-900">
                      {contadores.atendidas}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      Canceladas
                    </span>
                    <span className="font-sans font-medium text-sm text-slate-900">
                      {contadores.canceladas}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      No Asistidas
                    </span>
                    <span className="font-sans font-medium text-sm text-slate-900">
                      {contadores.noAsistidas}
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
              className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-none shadow-none"
            >
              CERRAR
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
