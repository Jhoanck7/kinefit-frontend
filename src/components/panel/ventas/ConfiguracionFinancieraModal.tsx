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
    <Modal abierto={abierto} onCerrar={onClose}>
      <div>
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-4 border-b border-brand-border p-6">
          <div>
            <h2 className="text-lg font-bold text-panel-sidebar">
              Configuración Financiera
            </h2>
            <p className="text-xs text-brand-muted">
              Gestión de comisiones POS, porcentajes de reparto y tasa de IVA vigente
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-full p-1.5 text-brand-muted hover:bg-panel-fondo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar"
          >
            &times;
          </button>
        </div>

        {/* Selector de pestañas */}
        <div className="flex border-b border-brand-border px-6 pt-2">
          <button
            type="button"
            onClick={() => setTab("terminales")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              tab === "terminales"
                ? "border-panel-sidebar text-panel-sidebar"
                : "border-transparent text-brand-muted hover:text-panel-sidebar"
            }`}
          >
            Máquinas POS ({terminales.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("repartos")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              tab === "repartos"
                ? "border-panel-sidebar text-panel-sidebar"
                : "border-transparent text-brand-muted hover:text-panel-sidebar"
            }`}
          >
            Acuerdos de Reparto ({acuerdos.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("iva")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              tab === "iva"
                ? "border-panel-sidebar text-panel-sidebar"
                : "border-transparent text-brand-muted hover:text-panel-sidebar"
            }`}
          >
            Tasa IVA Vigente
          </button>
        </div>

        {/* Contenido principal */}
        <div className="p-6 space-y-4 text-sm text-panel-sidebar">
          {/* TAB 1: Terminales POS */}
          {tab === "terminales" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-brand-muted text-sm">
                  Terminales y comisiones aplicadas al cobrar con tarjetas de débito o crédito:
                </p>
                {!mostrarFormTerminal && (
                  <Button
                    variante="secundario"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => {
                      resetFormTerminal();
                      setMostrarFormTerminal(true);
                    }}
                  >
                    Agregar Terminal POS
                  </Button>
                )}
              </div>

              {/* Formulario de Terminal POS (Diferenciación Débito vs Crédito + Botón Cancelar abajo) */}
              {mostrarFormTerminal && (
                <form onSubmit={handleGuardarTerminal} className="rounded-xl border border-brand-border bg-panel-fondo p-4 space-y-4">
                  <h4 className="font-bold text-panel-sidebar text-sm">
                    {terminalEditandoId ? "Editar Terminal POS" : "Registrar Nueva Terminal POS"}
                  </h4>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted mb-1">Nombre Terminal</label>
                      <input
                        type="text"
                        placeholder="Ej. Tuu POS Transbank, Redelcom"
                        value={nombreTerminal}
                        onChange={(e) => setNombreTerminal(e.target.value)}
                        required
                        className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-muted mb-1">Plazo de Abono (Días)</label>
                      <input
                        type="number"
                        min="0"
                        value={plazoAbono}
                        onChange={(e) => setPlazoAbono(parseInt(e.target.value) || 0)}
                        className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Sección 1: Configuración Débito */}
                  <div className="p-3 rounded-lg border border-brand-border bg-white space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-panel-sidebar block">
                      Comisión por Pagos con Débito
                    </span>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-brand-muted mb-1">Comisión Débito (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={pctDebito}
                          onChange={(e) => setPctDebito(parseFloat(e.target.value) || 0)}
                          className="w-full rounded-lg border border-brand-border bg-panel-fondo px-3 py-1.5 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-brand-muted mb-1">Cargo Fijo Débito (CLP)</label>
                        <input
                          type="number"
                          min="0"
                          value={cargoFijoDebito}
                          onChange={(e) => setCargoFijoDebito(parseInt(e.target.value) || 0)}
                          className="w-full rounded-lg border border-brand-border bg-panel-fondo px-3 py-1.5 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sección 2: Configuración Crédito */}
                  <div className="p-3 rounded-lg border border-brand-border bg-white space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-panel-sidebar block">
                      Comisión por Pagos con Crédito
                    </span>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-brand-muted mb-1">Comisión Crédito (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={pctCredito}
                          onChange={(e) => setPctCredito(parseFloat(e.target.value) || 0)}
                          className="w-full rounded-lg border border-brand-border bg-panel-fondo px-3 py-1.5 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-brand-muted mb-1">Cargo Fijo Crédito (CLP)</label>
                        <input
                          type="number"
                          min="0"
                          value={cargoFijoCredito}
                          onChange={(e) => setCargoFijoCredito(parseInt(e.target.value) || 0)}
                          className="w-full rounded-lg border border-brand-border bg-panel-fondo px-3 py-1.5 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción agrupados abajo a la derecha */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-brand-border">
                    <Button variante="secundario" className="px-4 py-1.5 text-xs" type="button" onClick={resetFormTerminal}>
                      Cancelar
                    </Button>
                    <Button variante="primario" className="px-4 py-1.5 text-xs" type="submit">
                      {terminalEditandoId ? "Actualizar Terminal" : "Guardar Terminal"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Lista de Terminales Existentes con Botones Editar/Eliminar y Semántica de Color Neutra */}
              <div className="divide-y divide-brand-border rounded-xl border border-brand-border bg-white">
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
                        <span className="font-bold text-panel-sidebar text-sm block">{t.nombre}</span>
                        <span className="text-brand-muted text-sm">Abono en {t.plazoAbonoDias} día(s) hábil(es)</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <div className="font-semibold text-panel-sidebar">
                            Débito: <span className="font-bold">{pctDeb}%</span>
                            {fixDeb > 0 && <span className="text-brand-muted text-xs"> (+${fixDeb})</span>}
                          </div>
                          <div className="font-semibold text-panel-sidebar">
                            Crédito: <span className="font-bold">{pctCred}%</span>
                            {fixCred > 0 && <span className="text-brand-muted text-xs"> (+${fixCred})</span>}
                          </div>
                        </div>

                        {/* Botones Editar / Eliminar */}
                        <div className="flex items-center gap-1 border-l border-brand-border pl-3">
                          <button
                            type="button"
                            onClick={() => handleEditarTerminal(t)}
                            title="Editar comisiones y plazo"
                            className="rounded-lg p-1.5 text-brand-muted hover:bg-panel-seleccion hover:text-panel-sidebar transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEliminarTerminal(t.id)}
                            title="Eliminar terminal"
                            className="rounded-lg p-1.5 text-brand-muted hover:bg-rose-50 hover:text-rose-700 transition-colors"
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
                <p className="text-brand-muted text-sm">
                  Porcentajes vigentes de distribución de honorarios por especialista:
                </p>
                {!mostrarFormReparto && (
                  <Button
                    variante="secundario"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => {
                      resetFormReparto();
                      setMostrarFormReparto(true);
                    }}
                  >
                    Nuevo Acuerdo de Reparto
                  </Button>
                )}
              </div>

              {/* Formulario de Acuerdo de Reparto */}
              {mostrarFormReparto && (
                <form onSubmit={handleGuardarReparto} className="rounded-xl border border-brand-border bg-panel-fondo p-4 space-y-3">
                  <h4 className="font-bold text-panel-sidebar text-sm">
                    {repartoEditandoId ? "Editar Acuerdo de Reparto" : "Definir Acuerdo de Reparto"}
                  </h4>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted mb-1">Especialista</label>
                      <select
                        value={especialistaNombre}
                        onChange={(e) => setEspecialistaNombre(e.target.value)}
                        className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
                      >
                        <option value="Francesca Astudillo">Francesca Astudillo</option>
                        <option value="Valeria Sepúlveda">Valeria Sepúlveda</option>
                        <option value="Constanza Morales">Constanza Morales</option>
                        <option value="Ignacio Soto">Ignacio Soto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-muted mb-1">
                        % Profesional ({pctProf}% / {100 - pctProf}% Centro)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={pctProf}
                        onChange={(e) => setPctProf(parseInt(e.target.value) || 0)}
                        className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-muted mb-1">Vigente Desde</label>
                      <input
                        type="date"
                        value={fechaVigenciaReparto}
                        onChange={(e) => setFechaVigenciaReparto(e.target.value)}
                        className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Botones de acción agrupados abajo */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-brand-border">
                    <Button variante="secundario" className="px-4 py-1.5 text-xs" type="button" onClick={resetFormReparto}>
                      Cancelar
                    </Button>
                    <Button variante="primario" className="px-4 py-1.5 text-xs" type="submit">
                      {repartoEditandoId ? "Actualizar Acuerdo" : "Guardar Acuerdo"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Lista de Acuerdos Existentes */}
              <div className="divide-y divide-brand-border rounded-xl border border-brand-border bg-white">
                {acuerdos.map((a) => (
                  <div key={a.id} className="p-4 flex justify-between items-center gap-3">
                    <div>
                      <span className="font-bold text-panel-sidebar text-sm block">{a.especialistaNombre}</span>
                      <span className="text-brand-muted text-sm">Vigente desde: {a.vigenteDesde}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex gap-2 text-sm">
                        <span className="rounded-lg bg-emerald-50 px-3 py-1 text-emerald-800 font-bold text-sm">
                          {a.porcentajeProfesional}% Prof.
                        </span>
                        <span className="rounded-lg bg-panel-seleccion px-3 py-1 text-panel-sidebar font-bold text-sm">
                          {a.porcentajeCentro}% Clínica
                        </span>
                      </div>

                      <div className="flex items-center gap-1 border-l border-brand-border pl-3">
                        <button
                          type="button"
                          onClick={() => handleEditarReparto(a)}
                          title="Editar porcentaje de reparto"
                          className="rounded-lg p-1.5 text-brand-muted hover:bg-panel-seleccion hover:text-panel-sidebar transition-colors text-sm"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminarReparto(a.id)}
                          title="Eliminar acuerdo"
                          className="rounded-lg p-1.5 text-brand-muted hover:bg-rose-50 hover:text-rose-700 transition-colors text-sm"
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
                <p className="text-brand-muted text-sm">
                  Tasa de Impuesto al Valor Agregado (IVA) configurada en el sistema para prestaciones afectas:
                </p>
                {!mostrarFormIva && (
                  <Button
                    variante="secundario"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => setMostrarFormIva(true)}
                  >
                    Modificar Tasa IVA
                  </Button>
                )}
              </div>

              {mostrarFormIva && (
                <form onSubmit={handleGuardarIva} className="rounded-xl border border-brand-border bg-panel-fondo p-4 space-y-3">
                  <h4 className="font-bold text-panel-sidebar text-sm">Definir Nueva Tasa de IVA</h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted mb-1">Porcentaje IVA (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={pctIva}
                        onChange={(e) => setPctIva(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-muted mb-1">Vigente Desde</label>
                      <input
                        type="date"
                        value={fechaVigenciaIva}
                        onChange={(e) => setFechaVigenciaIva(e.target.value)}
                        className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-panel-sidebar focus:border-panel-sidebar focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-brand-border">
                    <Button variante="secundario" className="px-4 py-1.5 text-xs" type="button" onClick={() => setMostrarFormIva(false)}>
                      Cancelar
                    </Button>
                    <Button variante="primario" className="px-4 py-1.5 text-xs" type="submit">
                      Actualizar Tasa IVA
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {tasasIva.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border border-brand-border p-4 flex justify-between items-center ${
                      idx === 0 ? "bg-panel-fondo border-panel-sidebar" : "bg-white opacity-80"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-panel-sidebar text-sm">IVA Débito Fiscal Chile</span>
                        {idx === 0 && (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                            Vigente
                          </span>
                        )}
                      </div>
                      <span className="text-brand-muted text-sm block mt-0.5">Vigente desde: {item.vigenteDesde}</span>
                    </div>
                    <span className="text-xl font-bold text-panel-sidebar">{item.porcentaje}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-brand-border p-6 flex justify-end">
          <Button variante="primario" onClick={onClose}>
            Entendido
          </Button>
        </div>
      </div>
    </Modal>
  );
}
