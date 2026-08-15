"use client";

import { useEffect, useState } from "react";

import { Modal } from "@/components/panel/primitives/Modal";
import { listEspecialistas } from "@/lib/panel/data/especialistas";
import {
  crearReparto,
  crearTasaIva,
  crearTerminal,
  listRepartos,
  listTasasIva,
  listTerminales,
  RepartoResuelto,
  TasaIvaResuelta,
  TerminalResuelto,
} from "@/lib/panel/data/ventas";
import { fechaISO } from "@/lib/panel/domain/formato";
import { Especialista } from "@/lib/panel/domain/tipos";

interface ConfiguracionFinancieraModalProps {
  abierto: boolean;
  onClose: () => void;
}

export function ConfiguracionFinancieraModal({
  abierto,
  onClose,
}: ConfiguracionFinancieraModalProps) {
  const [tab, setTab] = useState<"terminales" | "repartos" | "iva">(
    "terminales"
  );

  const [terminales, setTerminales] = useState<TerminalResuelto[]>([]);
  const [acuerdos, setAcuerdos] = useState<RepartoResuelto[]>([]);
  const [tasasIva, setTasasIva] = useState<TasaIvaResuelta[]>([]);
  const [especialistas, setEspecialistas] = useState<Especialista[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto) return;
    Promise.all([
      listTerminales(),
      listRepartos(),
      listTasasIva(),
      listEspecialistas(),
    ]).then(([t, r, iva, esp]) => {
      setTerminales(t);
      setAcuerdos(r);
      setTasasIva(iva);
      setEspecialistas(esp);
      setCargando(false);
    });
  }, [abierto]);

  // Estado de creación de Terminal POS
  const [mostrarFormTerminal, setMostrarFormTerminal] = useState(false);
  const [nombreTerminal, setNombreTerminal] = useState("");
  const [plazoAbono, setPlazoAbono] = useState(1);
  const [pctDebito, setPctDebito] = useState(1.23);
  const [cargoFijoDebito, setCargoFijoDebito] = useState(0);
  const [pctCredito, setPctCredito] = useState(1.89);
  const [cargoFijoCredito, setCargoFijoCredito] = useState(0);
  const [guardandoTerminal, setGuardandoTerminal] = useState(false);

  function resetFormTerminal() {
    setNombreTerminal("");
    setPlazoAbono(1);
    setPctDebito(1.23);
    setCargoFijoDebito(0);
    setPctCredito(1.89);
    setCargoFijoCredito(0);
    setMostrarFormTerminal(false);
  }

  async function handleGuardarTerminal(e: React.FormEvent) {
    e.preventDefault();
    if (!nombreTerminal.trim()) return;
    setGuardandoTerminal(true);
    setErrorMsg(null);
    try {
      const creado = await crearTerminal({
        nombre: nombreTerminal.trim(),
        plazoAbonoDias: plazoAbono,
        comisionDebito: pctDebito,
        cargoFijoDebito,
        comisionCredito: pctCredito,
        cargoFijoCredito,
      });
      setTerminales(prev => [...prev, creado]);
      resetFormTerminal();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "No se pudo registrar el terminal."
      );
    } finally {
      setGuardandoTerminal(false);
    }
  }

  // Estado de creación de Acuerdo de Reparto
  const [mostrarFormReparto, setMostrarFormReparto] = useState(false);
  const [especialistaIdReparto, setEspecialistaIdReparto] = useState("");
  const [pctProf, setPctProf] = useState(50);
  const [fechaVigenciaReparto, setFechaVigenciaReparto] = useState(
    fechaISO(new Date())
  );
  const [guardandoReparto, setGuardandoReparto] = useState(false);

  function resetFormReparto() {
    setEspecialistaIdReparto(especialistas[0]?.id ?? "");
    setPctProf(50);
    setFechaVigenciaReparto(fechaISO(new Date()));
    setMostrarFormReparto(false);
  }

  function handleEditarReparto(a: RepartoResuelto) {
    setEspecialistaIdReparto(a.especialistaId);
    setPctProf(a.porcentajeProfesional);
    setFechaVigenciaReparto(fechaISO(new Date()));
    setMostrarFormReparto(true);
  }

  async function handleGuardarReparto(e: React.FormEvent) {
    e.preventDefault();
    const numEspId = parseInt(especialistaIdReparto.replace(/\D/g, ""), 10);
    if (isNaN(numEspId)) return;
    setGuardandoReparto(true);
    setErrorMsg(null);
    try {
      const creado = await crearReparto({
        especialistaId: numEspId,
        porcentajeProfesional: pctProf,
        vigenteDesde: fechaVigenciaReparto,
      });
      setAcuerdos(prev => [
        creado,
        ...prev.filter(a => a.especialistaId !== creado.especialistaId),
      ]);
      resetFormReparto();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "No se pudo registrar el acuerdo de reparto."
      );
    } finally {
      setGuardandoReparto(false);
    }
  }

  // Estado de creación de Tasa IVA
  const [mostrarFormIva, setMostrarFormIva] = useState(false);
  const [pctIva, setPctIva] = useState(19);
  const [fechaVigenciaIva, setFechaVigenciaIva] = useState(
    fechaISO(new Date())
  );
  const [guardandoIva, setGuardandoIva] = useState(false);

  async function handleGuardarIva(e: React.FormEvent) {
    e.preventDefault();
    setGuardandoIva(true);
    setErrorMsg(null);
    try {
      const creada = await crearTasaIva({
        porcentaje: pctIva,
        vigenteDesde: fechaVigenciaIva,
      });
      setTasasIva(prev => [creada, ...prev]);
      setMostrarFormIva(false);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "No se pudo registrar la tasa de IVA."
      );
    } finally {
      setGuardandoIva(false);
    }
  }

  return (
    <Modal abierto={abierto} onCerrar={onClose} ancho="max-w-3xl">
      <div className="bg-white text-slate-900 font-sans shadow-none rounded-none">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
          <div>
            <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-900">
              Configuración Financiera
            </h2>
            <p className="font-sans text-xs text-slate-500 mt-0.5">
              Gestión de comisiones POS, repartos de honorarios e IVA
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1 font-sans text-sm text-slate-400 hover:text-slate-900 rounded-none focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* Selector de pestañas */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-4 text-xs font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setTab("terminales")}
            className={`py-3 border-b-2 transition-colors ${
              tab === "terminales"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-400 hover:text-slate-800"
            }`}
          >
            Máquinas POS ({terminales.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("repartos")}
            className={`py-3 border-b-2 transition-colors ${
              tab === "repartos"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-400 hover:text-slate-800"
            }`}
          >
            Acuerdos de Reparto ({acuerdos.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("iva")}
            className={`py-3 border-b-2 transition-colors ${
              tab === "iva"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-400 hover:text-slate-800"
            }`}
          >
            Tasa IVA Vigente
          </button>
        </div>

        {/* Contenido principal */}
        <div className="p-6 space-y-4 font-sans text-xs">
          {errorMsg && (
            <div className="border border-red-300 bg-red-50 p-3 font-sans text-xs font-semibold text-red-800 rounded-none">
              {errorMsg}
            </div>
          )}

          {cargando ? (
            <p className="font-sans text-xs text-slate-500 py-8 text-center">
              Cargando configuración financiera...
            </p>
          ) : (
            <>
              {/* TAB 1: Terminales POS */}
              {tab === "terminales" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-sans text-xs text-slate-500">
                      Terminales y comisiones aplicadas al cobrar con tarjetas:
                    </p>
                    {!mostrarFormTerminal && (
                      <button
                        type="button"
                        onClick={() => setMostrarFormTerminal(true)}
                        className="font-sans text-xs font-bold uppercase tracking-wider px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-none shadow-none"
                      >
                        AGREGAR POS
                      </button>
                    )}
                  </div>

                  {mostrarFormTerminal && (
                    <form
                      onSubmit={handleGuardarTerminal}
                      className="border border-slate-200 bg-slate-50/50 p-4 space-y-3 rounded-none"
                    >
                      <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900">
                        Registrar Nueva Terminal POS
                      </h4>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                            Nombre Terminal
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. Tuu POS Transbank, Redelcom"
                            value={nombreTerminal}
                            onChange={e => setNombreTerminal(e.target.value)}
                            required
                            className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                            Plazo de Abono (Días)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={plazoAbono}
                            onChange={e =>
                              setPlazoAbono(parseInt(e.target.value) || 0)
                            }
                            className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="p-3 border border-slate-200 bg-white space-y-2 rounded-none">
                        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-800 block">
                          Comisión Débito
                        </span>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                              % Débito
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={pctDebito}
                              onChange={e =>
                                setPctDebito(parseFloat(e.target.value) || 0)
                              }
                              className="w-full rounded-none border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                              Cargo Fijo (CLP)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={cargoFijoDebito}
                              onChange={e =>
                                setCargoFijoDebito(
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full rounded-none border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-3 border border-slate-200 bg-white space-y-2 rounded-none">
                        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-slate-800 block">
                          Comisión Crédito
                        </span>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                              % Crédito
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={pctCredito}
                              onChange={e =>
                                setPctCredito(parseFloat(e.target.value) || 0)
                              }
                              className="w-full rounded-none border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                              Cargo Fijo (CLP)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={cargoFijoCredito}
                              onChange={e =>
                                setCargoFijoCredito(
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full rounded-none border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={resetFormTerminal}
                          className="font-sans text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-none shadow-none"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={guardandoTerminal}
                          className="font-sans text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 bg-[#003366] hover:bg-[#002244] text-white rounded-none shadow-none disabled:opacity-50"
                        >
                          {guardandoTerminal ? "Guardando..." : "Guardar"}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="divide-y divide-slate-200 border border-slate-200 bg-white rounded-none">
                    {terminales.length === 0 && (
                      <p className="p-4 font-sans text-xs text-slate-400 text-center">
                        Sin terminales registradas.
                      </p>
                    )}
                    {terminales.map(t => (
                      <div
                        key={t.id}
                        className="p-4 flex flex-wrap justify-between items-center gap-3"
                      >
                        <div>
                          <span className="font-sans font-medium text-sm text-slate-900 block">
                            {t.nombre}
                          </span>
                          <span className="font-sans text-xs text-slate-500">
                            Abono en {t.plazoAbonoDias} día(s)
                          </span>
                        </div>

                        <div className="text-right text-xs">
                          <div className="font-sans text-slate-800">
                            Débito:{" "}
                            <span className="font-medium text-slate-900">
                              {t.comisionDebito ?? "—"}%
                            </span>
                          </div>
                          <div className="font-sans text-slate-800">
                            Crédito:{" "}
                            <span className="font-medium text-slate-900">
                              {t.comisionCredito ?? "—"}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: Acuerdos de Reparto */}
              {tab === "repartos" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-sans text-xs text-slate-500">
                      Porcentajes de distribución de honorarios por
                      especialista:
                    </p>
                    {!mostrarFormReparto && (
                      <button
                        type="button"
                        onClick={() => {
                          resetFormReparto();
                          setMostrarFormReparto(true);
                        }}
                        className="font-sans text-xs font-bold uppercase tracking-wider px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-none shadow-none"
                      >
                        NUEVO ACUERDO
                      </button>
                    )}
                  </div>

                  {mostrarFormReparto && (
                    <form
                      onSubmit={handleGuardarReparto}
                      className="border border-slate-200 bg-slate-50/50 p-4 space-y-3 rounded-none"
                    >
                      <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900">
                        Definir Acuerdo
                      </h4>
                      <p className="font-sans text-[11px] text-slate-500">
                        Registrar un nuevo acuerdo para un especialista con uno
                        vigente cierra automáticamente el anterior en la fecha
                        indicada.
                      </p>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                            Especialista
                          </label>
                          <select
                            value={especialistaIdReparto}
                            onChange={e =>
                              setEspecialistaIdReparto(e.target.value)
                            }
                            className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                          >
                            {especialistas.map(esp => (
                              <option key={esp.id} value={esp.id}>
                                {esp.nombre}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                            % Profesional ({pctProf}% / {100 - pctProf}% Centro)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={pctProf}
                            onChange={e =>
                              setPctProf(parseInt(e.target.value) || 0)
                            }
                            className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                            Vigente Desde
                          </label>
                          <input
                            type="date"
                            value={fechaVigenciaReparto}
                            onChange={e =>
                              setFechaVigenciaReparto(e.target.value)
                            }
                            className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={resetFormReparto}
                          className="font-sans text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-none shadow-none"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={guardandoReparto}
                          className="font-sans text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 bg-[#003366] hover:bg-[#002244] text-white rounded-none shadow-none disabled:opacity-50"
                        >
                          {guardandoReparto ? "Guardando..." : "Guardar"}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="divide-y divide-slate-200 border border-slate-200 bg-white rounded-none">
                    {acuerdos.length === 0 && (
                      <p className="p-4 font-sans text-xs text-slate-400 text-center">
                        Sin acuerdos de reparto registrados.
                      </p>
                    )}
                    {acuerdos.map(a => (
                      <div
                        key={a.id}
                        className="p-4 flex justify-between items-center gap-3"
                      >
                        <div>
                          <span className="font-sans font-medium text-sm text-slate-900 block">
                            {a.especialistaNombre}
                          </span>
                          <span className="font-sans text-xs text-slate-500">
                            Vigente desde: {a.vigenteDesde}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex gap-2">
                            <span className="border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-sans text-xs font-medium text-slate-800 rounded-none">
                              {a.porcentajeProfesional}% Prof.
                            </span>
                            <span className="border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-sans text-xs font-medium text-slate-800 rounded-none">
                              {a.porcentajeCentro}% Clínica
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleEditarReparto(a)}
                            className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-950 underline border-l border-slate-200 pl-3"
                          >
                            Nueva versión
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: Tasa de IVA */}
              {tab === "iva" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-sans text-xs text-slate-500">
                      Tasa de Impuesto al Valor Agregado (IVA) para prestaciones
                      afectas:
                    </p>
                    {!mostrarFormIva && (
                      <button
                        type="button"
                        onClick={() => setMostrarFormIva(true)}
                        className="font-sans text-xs font-bold uppercase tracking-wider px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-none shadow-none"
                      >
                        MODIFICAR TASA IVA
                      </button>
                    )}
                  </div>

                  {mostrarFormIva && (
                    <form
                      onSubmit={handleGuardarIva}
                      className="border border-slate-200 bg-slate-50/50 p-4 space-y-3 rounded-none"
                    >
                      <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900">
                        Definir Nueva Tasa de IVA
                      </h4>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                            % IVA
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={pctIva}
                            onChange={e =>
                              setPctIva(parseFloat(e.target.value) || 0)
                            }
                            className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                            Vigente Desde
                          </label>
                          <input
                            type="date"
                            value={fechaVigenciaIva}
                            onChange={e => setFechaVigenciaIva(e.target.value)}
                            className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => setMostrarFormIva(false)}
                          className="font-sans text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-none shadow-none"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={guardandoIva}
                          className="font-sans text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 bg-[#003366] hover:bg-[#002244] text-white rounded-none shadow-none disabled:opacity-50"
                        >
                          {guardandoIva ? "Guardando..." : "Actualizar"}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2">
                    {tasasIva.length === 0 && (
                      <p className="p-4 font-sans text-xs text-slate-400 text-center border border-slate-200 bg-white">
                        Sin tasas de IVA registradas.
                      </p>
                    )}
                    {tasasIva.map((item, idx) => (
                      <div
                        key={item.id}
                        className="border border-slate-200 p-4 flex justify-between items-center bg-white rounded-none"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-sans font-medium text-sm text-slate-900">
                              IVA Débito Fiscal Chile
                            </span>
                            {idx === 0 && (
                              <span className="border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-emerald-800 rounded-none">
                                Vigente
                              </span>
                            )}
                          </div>
                          <span className="font-sans text-xs text-slate-500 block mt-0.5">
                            Vigente desde: {item.vigenteDesde}
                          </span>
                        </div>
                        <span className="font-sans font-medium text-lg text-slate-900">
                          {item.porcentaje}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50/60 p-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="font-sans text-xs font-bold uppercase tracking-wider px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-none shadow-none"
          >
            ENTENDIDO
          </button>
        </div>
      </div>
    </Modal>
  );
}
