"use client";

import { useState } from "react";
import { Modal } from "@/components/panel/primitives/Modal";
import { Button } from "@/components/panel/primitives/Button";
import { TERMINALES_MOCK, ACUERDOS_REPARTO_MOCK, TASAS_IVA_MOCK, TerminalPOS, AcuerdoReparto } from "@/lib/mock/ventas";

interface ConfiguracionFinancieraModalProps {
  abierto: boolean;
  onClose: () => void;
}

export function ConfiguracionFinancieraModal({ abierto, onClose }: ConfiguracionFinancieraModalProps) {
  const [tab, setTab] = useState<"terminales" | "repartos" | "iva">("terminales");

  // Estado local de lista
  const [terminales, setTerminales] = useState<TerminalPOS[]>(TERMINALES_MOCK);
  const [acuerdos, setAcuerdos] = useState<AcuerdoReparto[]>(ACUERDOS_REPARTO_MOCK);
  const [tasasIva, setTasasIva] = useState(TASAS_IVA_MOCK);

  // Estado de edición / creación para Terminales POS
  const [mostrarFormTerminal, setMostrarFormTerminal] = useState(false);
  const [terminalEditandoId, setTerminalEditandoId] = useState<string | null>(null);
  const [nombreTerminal, setNombreTerminal] = useState("");
  const [plazoAbono, setPlazoAbono] = useState(1);
  const [pctDebito, setPctDebito] = useState(1.23);
  const [cargoFijoDebito, setCargoFijoDebito] = useState(0);
  const [pctCredito, setPctCredito] = useState(1.89);
  const [cargoFijoCredito, setCargoFijoCredito] = useState(0);

  // Estado de edición / creación para Acuerdos de Reparto
  const [mostrarFormReparto, setMostrarFormReparto] = useState(false);
  const [repartoEditandoId, setRepartoEditandoId] = useState<string | null>(null);
  const [especialistaNombre, setEspecialistaNombre] = useState("Francesca Astudillo");
  const [pctProf, setPctProf] = useState(50);
  const [fechaVigenciaReparto, setFechaVigenciaReparto] = useState("2026-08-01");

  // Estado para Tasa IVA
  const [mostrarFormIva, setMostrarFormIva] = useState(false);
  const [pctIva, setPctIva] = useState(19);
  const [fechaVigenciaIva, setFechaVigenciaIva] = useState("2026-08-01");

  // Reset de formulario de terminal
  function resetFormTerminal() {
    setTerminalEditandoId(null);
    setNombreTerminal("");
    setPlazoAbono(1);
    setPctDebito(1.23);
    setCargoFijoDebito(0);
    setPctCredito(1.89);
    setCargoFijoCredito(0);
    setMostrarFormTerminal(false);
  }

  // Abrir formulario para editar terminal existente
  function handleEditarTerminal(t: TerminalPOS) {
    setTerminalEditandoId(t.id);
    setNombreTerminal(t.nombre);
    setPlazoAbono(t.plazoAbonoDias);

    const deb = t.comisiones.find((c) => c.metodoPago === "Debito");
    const cred = t.comisiones.find((c) => c.metodoPago === "Credito");

    setPctDebito(deb ? deb.porcentaje : t.comisionPorcentaje);
    setCargoFijoDebito(deb ? deb.cargoFijo : t.cargoFijo);
    setPctCredito(cred ? cred.porcentaje : t.comisionPorcentaje + 0.6);
    setCargoFijoCredito(cred ? cred.cargoFijo : 0);

    setMostrarFormTerminal(true);
  }

  // Eliminar / Desactivar terminal
  function handleEliminarTerminal(id: string) {
    if (confirm("¿Estás seguro de eliminar esta terminal POS?")) {
      setTerminales(terminales.filter((t) => t.id !== id));
    }
  }

  // Guardar o actualizar terminal
  function handleGuardarTerminal(e: React.FormEvent) {
    e.preventDefault();
    if (!nombreTerminal.trim()) return;

    const terminalActualizada: TerminalPOS = {
      id: terminalEditandoId ?? `term-${Date.now()}`,
      nombre: nombreTerminal,
      plazoAbonoDias: plazoAbono,
      activo: true,
      comisionPorcentaje: pctDebito,
      cargoFijo: cargoFijoDebito,
      comisiones: [
        { metodoPago: "Debito", porcentaje: pctDebito, cargoFijo: cargoFijoDebito },
        { metodoPago: "Credito", porcentaje: pctCredito, cargoFijo: cargoFijoCredito },
      ],
    };

    if (terminalEditandoId) {
      setTerminales(terminales.map((t) => (t.id === terminalEditandoId ? terminalActualizada : t)));
    } else {
      setTerminales([...terminales, terminalActualizada]);
    }

    resetFormTerminal();
  }

  // Reset de formulario de reparto
  function resetFormReparto() {
    setRepartoEditandoId(null);
    setEspecialistaNombre("Francesca Astudillo");
    setPctProf(50);
    setFechaVigenciaReparto("2026-08-01");
    setMostrarFormReparto(false);
  }

  // Editar reparto existente
  function handleEditarReparto(a: AcuerdoReparto) {
    setRepartoEditandoId(a.id);
    setEspecialistaNombre(a.especialistaNombre);
    setPctProf(a.porcentajeProfesional);
    setFechaVigenciaReparto(a.vigenteDesde);
    setMostrarFormReparto(true);
  }

  // Eliminar acuerdo de reparto
  function handleEliminarReparto(id: string) {
    if (confirm("¿Estás seguro de eliminar este acuerdo de reparto?")) {
      setAcuerdos(acuerdos.filter((a) => a.id !== id));
    }
  }

  // Guardar o actualizar acuerdo de reparto
  function handleGuardarReparto(e: React.FormEvent) {
    e.preventDefault();

    const acuerdoActualizado: AcuerdoReparto = {
      id: repartoEditandoId ?? `acuerdo-${Date.now()}`,
      especialistaId: `esp-${Date.now()}`,
      especialistaNombre: especialistaNombre,
      porcentajeProfesional: pctProf,
      porcentajeCentro: 100 - pctProf,
      vigenteDesde: fechaVigenciaReparto,
    };

    if (repartoEditandoId) {
      setAcuerdos(acuerdos.map((a) => (a.id === repartoEditandoId ? acuerdoActualizado : a)));
    } else {
      setAcuerdos([acuerdoActualizado, ...acuerdos]);
    }

    resetFormReparto();
  }

  // Guardar nueva tasa de IVA
  function handleGuardarIva(e: React.FormEvent) {
    e.preventDefault();
    setTasasIva([
      {
        id: `iva-${Date.now()}`,
        porcentaje: pctIva,
        vigenteDesde: fechaVigenciaIva,
      },
      ...tasasIva,
    ]);
    setMostrarFormIva(false);
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
                    onClick={() => {
                      resetFormTerminal();
                      setMostrarFormTerminal(true);
                    }}
                    className="font-sans text-xs font-bold uppercase tracking-wider px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-none shadow-none"
                  >
                    AGREGAR POS
                  </button>
                )}
              </div>

              {mostrarFormTerminal && (
                <form onSubmit={handleGuardarTerminal} className="border border-slate-200 bg-slate-50/50 p-4 space-y-3 rounded-none">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900">
                    {terminalEditandoId ? "Editar Terminal POS" : "Registrar Nueva Terminal POS"}
                  </h4>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">Nombre Terminal</label>
                      <input
                        type="text"
                        placeholder="Ej. Tuu POS Transbank, Redelcom"
                        value={nombreTerminal}
                        onChange={(e) => setNombreTerminal(e.target.value)}
                        required
                        className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">Plazo de Abono (Días)</label>
                      <input
                        type="number"
                        min="0"
                        value={plazoAbono}
                        onChange={(e) => setPlazoAbono(parseInt(e.target.value) || 0)}
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
                        <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">% Débito</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={pctDebito}
                          onChange={(e) => setPctDebito(parseFloat(e.target.value) || 0)}
                          className="w-full rounded-none border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">Cargo Fijo (CLP)</label>
                        <input
                          type="number"
                          min="0"
                          value={cargoFijoDebito}
                          onChange={(e) => setCargoFijoDebito(parseInt(e.target.value) || 0)}
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
                        <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">% Crédito</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={pctCredito}
                          onChange={(e) => setPctCredito(parseFloat(e.target.value) || 0)}
                          className="w-full rounded-none border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">Cargo Fijo (CLP)</label>
                        <input
                          type="number"
                          min="0"
                          value={cargoFijoCredito}
                          onChange={(e) => setCargoFijoCredito(parseInt(e.target.value) || 0)}
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
                      className="font-sans text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 bg-[#003366] hover:bg-[#002244] text-white rounded-none shadow-none"
                    >
                      {terminalEditandoId ? "Actualizar" : "Guardar"}
                    </button>
                  </div>
                </form>
              )}

              <div className="divide-y divide-slate-200 border border-slate-200 bg-white rounded-none">
                {terminales.map((t) => {
                  const comDebito = t.comisiones?.find((c) => c.metodoPago === "Debito");
                  const comCredito = t.comisiones?.find((c) => c.metodoPago === "Credito");

                  const pctDeb = comDebito ? comDebito.porcentaje : t.comisionPorcentaje;
                  const fixDeb = comDebito ? comDebito.cargoFijo : t.cargoFijo;

                  const pctCred = comCredito ? comCredito.porcentaje : t.comisionPorcentaje + 0.6;
                  const fixCred = comCredito ? comCredito.cargoFijo : 0;

                  return (
                    <div key={t.id} className="p-4 flex flex-wrap justify-between items-center gap-3">
                      <div>
                        <span className="font-sans font-medium text-sm text-slate-900 block">{t.nombre}</span>
                        <span className="font-sans text-xs text-slate-500">Abono en {t.plazoAbonoDias} día(s)</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right text-xs">
                          <div className="font-sans text-slate-800">
                            Débito: <span className="font-medium text-slate-900">{pctDeb}%</span>
                            {fixDeb > 0 && <span className="text-slate-400"> (+${fixDeb})</span>}
                          </div>
                          <div className="font-sans text-slate-800">
                            Crédito: <span className="font-medium text-slate-900">{pctCred}%</span>
                            {fixCred > 0 && <span className="text-slate-400"> (+${fixCred})</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                          <button
                            type="button"
                            onClick={() => handleEditarTerminal(t)}
                            className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-950 underline"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEliminarTerminal(t.id)}
                            className="font-sans text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-800 underline"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Acuerdos de Reparto */}
          {tab === "repartos" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-sans text-xs text-slate-500">
                  Porcentajes de distribución de honorarios por especialista:
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
                <form onSubmit={handleGuardarReparto} className="border border-slate-200 bg-slate-50/50 p-4 space-y-3 rounded-none">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900">
                    {repartoEditandoId ? "Editar Acuerdo" : "Definir Acuerdo"}
                  </h4>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">Especialista</label>
                      <select
                        value={especialistaNombre}
                        onChange={(e) => setEspecialistaNombre(e.target.value)}
                        className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                      >
                        <option value="Francesca Astudillo">Francesca Astudillo</option>
                        <option value="Valeria Sepúlveda">Valeria Sepúlveda</option>
                        <option value="Constanza Morales">Constanza Morales</option>
                        <option value="Ignacio Soto">Ignacio Soto</option>
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
                        onChange={(e) => setPctProf(parseInt(e.target.value) || 0)}
                        className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">Vigente Desde</label>
                      <input
                        type="date"
                        value={fechaVigenciaReparto}
                        onChange={(e) => setFechaVigenciaReparto(e.target.value)}
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
                      className="font-sans text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 bg-[#003366] hover:bg-[#002244] text-white rounded-none shadow-none"
                    >
                      {repartoEditandoId ? "Actualizar" : "Guardar"}
                    </button>
                  </div>
                </form>
              )}

              <div className="divide-y divide-slate-200 border border-slate-200 bg-white rounded-none">
                {acuerdos.map((a) => (
                  <div key={a.id} className="p-4 flex justify-between items-center gap-3">
                    <div>
                      <span className="font-sans font-medium text-sm text-slate-900 block">{a.especialistaNombre}</span>
                      <span className="font-sans text-xs text-slate-500">Vigente desde: {a.vigenteDesde}</span>
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

                      <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                        <button
                          type="button"
                          onClick={() => handleEditarReparto(a)}
                          className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-950 underline"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminarReparto(a.id)}
                          className="font-sans text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-800 underline"
                        >
                          Eliminar
                        </button>
                      </div>
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
                  Tasa de Impuesto al Valor Agregado (IVA) para prestaciones afectas:
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
                <form onSubmit={handleGuardarIva} className="border border-slate-200 bg-slate-50/50 p-4 space-y-3 rounded-none">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-900">Definir Nueva Tasa de IVA</h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">% IVA</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={pctIva}
                        onChange={(e) => setPctIva(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-sans text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">Vigente Desde</label>
                      <input
                        type="date"
                        value={fechaVigenciaIva}
                        onChange={(e) => setFechaVigenciaIva(e.target.value)}
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
                      className="font-sans text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 bg-[#003366] hover:bg-[#002244] text-white rounded-none shadow-none"
                    >
                      Actualizar
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {tasasIva.map((item, idx) => (
                  <div
                    key={item.id}
                    className="border border-slate-200 p-4 flex justify-between items-center bg-white rounded-none"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-medium text-sm text-slate-900">IVA Débito Fiscal Chile</span>
                        {idx === 0 && (
                          <span className="border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-emerald-800 rounded-none">
                            Vigente
                          </span>
                        )}
                      </div>
                      <span className="font-sans text-xs text-slate-500 block mt-0.5">Vigente desde: {item.vigenteDesde}</span>
                    </div>
                    <span className="font-sans font-medium text-lg text-slate-900">{item.porcentaje}%</span>
                  </div>
                ))}
              </div>
            </div>
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
