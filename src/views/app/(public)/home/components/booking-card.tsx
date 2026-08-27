"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import {
  useAuthenticateWithGoogleMutation,
  useGetEspecialistasDisponibles,
  useGetFechasDisponibles,
  useGetHorasDisponibles,
  useGetServices,
  useSubmitBookingMutation,
} from "@/hooks/api";
import { bloqueHorarioService } from "@/services";
import { useBookingStore } from "@/stores";

const DURACION_BLOQUE_MIN = 30;
const MAX_BLOQUES = 3;
const LIMITE_MANANA = "13:00";

const parseDateInfo = (dateStr: string) => {
  if (!dateStr || !dateStr.includes("-")) {
    return {
      dayName: "",
      dayNumber: "",
      monthName: "",
      formattedFull: dateStr,
      formattedShort: dateStr,
    };
  }
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const monthNames = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const dayName = dayNames[d.getDay()] || "";
  const monthName = monthNames[d.getMonth()] || "";
  return {
    dayName,
    dayNumber: day,
    monthName,
    formattedFull: `${dayName}, ${day} ${monthName}`,
    formattedShort: `${dayName} ${day} ${monthName}`,
  };
};

function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(":").map(Number);
  const total = h * 60 + m + minutos;
  const hFin = Math.floor(total / 60);
  const mFin = total % 60;
  return `${hFin.toString().padStart(2, "0")}:${mFin.toString().padStart(2, "0")}`;
}

function sonConsecutivas(horasOrdenadas: string[]): boolean {
  for (let i = 1; i < horasOrdenadas.length; i++) {
    if (
      sumarMinutos(horasOrdenadas[i - 1], DURACION_BLOQUE_MIN) !==
      horasOrdenadas[i]
    ) {
      return false;
    }
  }
  return true;
}

function HorariosGrid({
  horas,
  seleccionadas,
  onSeleccionar,
}: {
  horas: string[];
  seleccionadas: string[];
  onSeleccionar: (hora: string) => void;
}) {
  if (horas.length === 0) {
    return (
      <p className="text-xs text-slate-400">
        Sin horarios disponibles en este tramo.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {horas.map(hora => {
        const seleccionado = seleccionadas.includes(hora);
        return (
          <button
            key={hora}
            type="button"
            onClick={() => onSeleccionar(hora)}
            className={`flex items-center justify-center gap-1 rounded-global border px-2 py-2 text-xs transition-colors cursor-pointer ${
              seleccionado
                ? "border-brand-primary bg-brand-primary text-white font-bold"
                : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span>{hora}</span>
            {seleccionado && <span className="text-[10px] font-bold">✓</span>}
          </button>
        );
      })}
    </div>
  );
}

export default function BookingCard() {
  const router = useRouter();
  const {
    selectedServiceId,
    selectedServiceName,
    selectedDate,
    selectedHoras,
    selectedSpecialistId,
    selectedBloqueHorarioId,
    patientName,
    patientEmail,
    patientPhone,
    patientRut,
    authToken,
    currentStep,
    setSelectedService,
    setSelectedHorario,
    setSelectedSpecialist,
    setPatientInfo,
    setAuthToken,
    nextStep,
    prevStep,
    resetBooking,
  } = useBookingStore();

  const [authError, setAuthError] = useState<string | null>(null);
  const [errorSeleccion, setErrorSeleccion] = useState<string | null>(null);
  const [resolviendoEspecialistaId, setResolviendoEspecialistaId] = useState<
    number | null
  >(null);
  const [errorResolucion, setErrorResolucion] = useState<string | null>(null);

  const { data: services = [], isLoading: loadingServices } = useGetServices();

  const duracionMinutos = selectedHoras.length * DURACION_BLOQUE_MIN;
  const horaInicio = [...selectedHoras].sort()[0] ?? "";
  const todayIso = new Date().toISOString().slice(0, 10);

  const { isLoading: loadingFechas } = useGetFechasDisponibles(
    selectedServiceId ?? 0,
    DURACION_BLOQUE_MIN,
    Boolean(selectedServiceId)
  );
  const { data: horasDisponibles = [], isLoading: loadingHoras } =
    useGetHorasDisponibles(
      selectedServiceId ?? 0,
      selectedDate ?? "",
      DURACION_BLOQUE_MIN,
      Boolean(selectedServiceId) && Boolean(selectedDate)
    );

  const horasManana = horasDisponibles.filter(h => h < LIMITE_MANANA);
  const horasTarde = horasDisponibles.filter(h => h >= LIMITE_MANANA);

  const {
    data: especialistasDisponibles = [],
    isLoading: loadingEspecialistas,
  } = useGetEspecialistasDisponibles(
    selectedServiceId ?? 0,
    selectedDate ?? "",
    horaInicio,
    duracionMinutos,
    currentStep === 3 &&
      Boolean(selectedServiceId) &&
      Boolean(selectedDate) &&
      Boolean(horaInicio)
  );

  const isLoading =
    loadingServices ||
    (currentStep === 2 && (loadingFechas || loadingHoras)) ||
    (currentStep === 3 && loadingEspecialistas);

  const authMutation = useAuthenticateWithGoogleMutation();
  const submitMutation = useSubmitBookingMutation();

  const webpayFormRef = useRef<HTMLFormElement>(null);

  // Cargar e Inicializar Google Sign-In SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (googleClientId && (window as any).google?.accounts?.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: async (response: any) => {
            if (response && response.credential) {
              setAuthError(null);
              try {
                const result = await authMutation.mutateAsync(
                  response.credential
                );
                setAuthToken(result.data.token);
                setPatientInfo({
                  name: `${result.data.paciente.nombre} ${result.data.paciente.apellido}`.trim(),
                  email: result.data.paciente.email,
                  phone: result.data.paciente.telefono || "",
                  rut: result.data.paciente.rut || "",
                });
              } catch (err: unknown) {
                setAuthError(
                  err instanceof Error
                    ? err.message
                    : "Error al autenticar con Google."
                );
              }
            }
          },
        });

        const btnContainer = document.getElementById("google-btn-container");
        if (btnContainer) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).google.accounts.id.renderButton(btnContainer, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
          });
        }
      }
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const webpayData = submitMutation.data?.webpayData;

  // Redirección a Webpay
  useEffect(() => {
    if (webpayData) {
      if (webpayData.urlRedireccion.startsWith("/")) {
        router.push(webpayData.urlRedireccion);
      } else if (webpayFormRef.current) {
        webpayFormRef.current.submit();
      }
    }
  }, [webpayData, router]);

  const handleServiceSelect = (id: number, name: string) => {
    setSelectedService(id, name);
    nextStep();
  };

  const handleSeleccionarHora = (hora: string) => {
    if (!selectedDate) return;

    const yaSeleccionada = selectedHoras.includes(hora);
    let nuevas: string[];

    if (yaSeleccionada) {
      nuevas = selectedHoras.filter(h => h !== hora);
    } else {
      if (selectedHoras.length >= MAX_BLOQUES) {
        setErrorSeleccion(
          "Puedes reservar como máximo 3 bloques (90 minutos)."
        );
        return;
      }
      nuevas = [...selectedHoras, hora].sort();
    }

    if (nuevas.length > 1 && !sonConsecutivas(nuevas)) {
      setErrorSeleccion(
        "Los bloques deben ser consecutivos. Selecciona horarios seguidos."
      );
      return;
    }

    setErrorSeleccion(null);
    setSelectedHorario(selectedDate, nuevas);
  };

  const handleDateChange = (dateStr: string) => {
    setErrorSeleccion(null);
    setSelectedHorario(dateStr, []);
  };

  const handleContinuarHorario = () => {
    if (selectedHoras.length === 0) {
      setErrorSeleccion("Selecciona al menos un bloque de horario.");
      return;
    }
    nextStep();
  };

  const handleSpecialistSelect = async (id: number) => {
    const especialista = especialistasDisponibles.find(e => e.id === id);
    if (!especialista || !selectedDate) return;

    setErrorResolucion(null);
    setResolviendoEspecialistaId(id);
    try {
      const res = await bloqueHorarioService.getDisponibles(id, selectedDate);
      const bloque = res.data.data.find(
        b => b.horaInicio === horaInicio && b.estado === "Disponible"
      );
      if (bloque) {
        setSelectedSpecialist(especialista.id, especialista.nombre, bloque.id);
        nextStep();
      } else {
        setErrorResolucion(
          "Ningún especialista tiene disponible esa franja completa. Prueba con otro horario."
        );
      }
    } catch {
      setErrorResolucion(
        "No se pudo confirmar la disponibilidad. Intenta nuevamente."
      );
    } finally {
      setResolviendoEspecialistaId(null);
    }
  };

  const handlePatientInfoChange = (
    field: "name" | "email" | "phone" | "rut",
    value: string
  ) => {
    setPatientInfo({
      name: field === "name" ? value : patientName,
      email: field === "email" ? value : patientEmail,
      phone: field === "phone" ? value : patientPhone,
      rut: field === "rut" ? value : patientRut,
    });
  };

  const handleDemoAuth = () => {
    setAuthToken("demo-paciente-jwt-token");
    if (!patientName) {
      setPatientInfo({
        name: "Jhoan Montero",
        email: "jhoanck777@gmail.com",
        phone: "+56975516503",
        rut: "11111111-1",
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !patientName ||
      !patientEmail ||
      !patientPhone ||
      !patientRut ||
      !selectedServiceId ||
      !selectedSpecialistId ||
      !selectedBloqueHorarioId ||
      !duracionMinutos
    ) {
      return;
    }

    let tokenToUse = authToken;
    if (!tokenToUse) {
      handleDemoAuth();
      tokenToUse = "demo-paciente-jwt-token";
    }

    submitMutation.mutate({
      selectedServiceId,
      selectedSpecialistId,
      selectedBloqueHorarioId,
      selectedDuracionMinutos: duracionMinutos,
      patientName,
      patientPhone,
      patientRut,
      authToken: tokenToUse,
    });
  };

  const handleResetBooking = () => {
    submitMutation.reset();
    resetBooking();
  };

  const errorMsg =
    (submitMutation.error instanceof Error
      ? submitMutation.error.message
      : null) ?? authError;

  if (submitMutation.isSuccess && webpayData) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center p-4 py-8 bg-transparent">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-600 text-3xl mb-4 shadow-lg shadow-red-500/10">
          💳
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Transbank Webpay Plus
        </h3>
        <p className="text-xs text-brand-muted max-w-[300px] mb-6 leading-relaxed">
          Conectando de forma segura con la pasarela de pago Transbank Webpay...
        </p>

        {webpayData.urlRedireccion.startsWith("http") ? (
          <form
            ref={webpayFormRef}
            action={webpayData.urlRedireccion}
            method="POST"
            target="_self"
          >
            <input type="hidden" name="token_ws" value={webpayData.token} />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-global px-6 py-3.5 transition-colors uppercase tracking-wider cursor-pointer shadow-md"
            >
              Ir a Webpay Plus ($10.000 CLP)
            </button>
          </form>
        ) : (
          <button
            onClick={() => router.push(webpayData.urlRedireccion)}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-global px-6 py-3.5 transition-colors uppercase tracking-wider cursor-pointer shadow-md"
          >
            Abrir Pasarela Webpay Plus ($10.000 CLP)
          </button>
        )}
      </div>
    );
  }

  if (submitMutation.isSuccess && !webpayData) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center p-4 py-8 bg-transparent">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 text-3xl mb-6 shadow-lg shadow-emerald-500/10">
          ✓
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          ¡Cita Registrada Exitosamente!
        </h3>
        <p className="text-xs text-brand-muted max-w-[280px] mb-6 leading-relaxed">
          Tu reserva para{" "}
          <span className="text-slate-900 font-semibold">
            {selectedServiceName}
          </span>{" "}
          el{" "}
          <span className="text-slate-900 font-semibold">{selectedDate}</span>{" "}
          ha sido registrada en el sistema.
        </p>
        <button
          onClick={handleResetBooking}
          className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-global px-6 py-3.5 transition-colors uppercase tracking-wider cursor-pointer"
        >
          Reservar otra cita
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[460px] p-1 bg-transparent">
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-50 rounded-3xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider">
              Cargando...
            </span>
          </div>
        </div>
      )}

      {/* Step 1: Service selection */}
      {currentStep === 1 && (
        <div className="flex flex-col h-full">
          <div className="text-left shrink-0 mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-1">
              Paso 1 de 4
            </h3>
            <p className="text-slate-800 text-base font-bold">
              Selecciona un servicio
            </p>
          </div>

          <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto pr-1">
            {services
              .filter(s => s.activo)
              .map(service => (
                <button
                  key={service.id}
                  onClick={() =>
                    handleServiceSelect(service.id, service.nombre)
                  }
                  className={`w-full flex justify-between items-center p-4 sm:p-5 rounded-global border text-left transition-all cursor-pointer ${
                    selectedServiceId === service.id
                      ? "border-brand-primary bg-brand-primary/10 shadow-md shadow-brand-primary/10"
                      : "border-brand-border bg-white hover:border-brand-primary/50 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {service.nombre}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Servicio Operativo
                    </span>
                  </div>
                  <svg
                    className="w-5 h-5 text-brand-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}

            {services.filter(s => s.activo).length === 0 && !isLoading && (
              <p className="text-xs text-brand-muted text-center py-8">
                No hay especialidades disponibles de momento.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Horario */}
      {currentStep === 2 && (
        <div className="flex flex-col h-full">
          <div className="text-left shrink-0 mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-1">
              Paso 2 de 4
            </h3>
            <p className="text-slate-800 text-base font-bold">
              Fecha y Horario
            </p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-4">
            {errorSeleccion && (
              <p className="text-[11px] text-rose-600 font-semibold bg-rose-50 border border-rose-200 rounded-global px-3 py-2">
                {errorSeleccion}
              </p>
            )}

            {/* Selector de fecha (calcado de nueva-reserva/horario) */}
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Seleccionar Fecha de Atención
              </label>
              <input
                type="date"
                value={selectedDate ?? ""}
                min={todayIso}
                onChange={e => handleDateChange(e.target.value)}
                className="w-full rounded-global border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-brand-primary focus:outline-none cursor-pointer"
              />
              {selectedDate && (
                <p className="text-xs text-slate-700 pt-1">
                  Fecha seleccionada:{" "}
                  <span className="font-medium text-slate-900">
                    {parseDateInfo(selectedDate).formattedFull}
                  </span>
                </p>
              )}
              {horaInicio && selectedHoras.length > 0 && (
                <p className="text-xs text-slate-700 pt-1">
                  Horario seleccionado:{" "}
                  <span className="font-medium text-slate-900">
                    {horaInicio} a{" "}
                    {sumarMinutos(
                      [...selectedHoras].sort().slice(-1)[0],
                      DURACION_BLOQUE_MIN
                    )}{" "}
                    hrs
                  </span>{" "}
                  ({duracionMinutos} minutos)
                </p>
              )}
            </div>

            {/* Selector de horario acumulativo (1 a 3 bloques consecutivos) */}
            {!selectedDate ? (
              <p className="text-xs text-slate-400">
                Selecciona primero una fecha para ver los horarios.
              </p>
            ) : loadingHoras ? (
              <p className="text-xs text-slate-400">
                Cargando horarios disponibles...
              </p>
            ) : horasDisponibles.length === 0 ? (
              <p className="text-xs text-slate-400">
                Sin bloques disponibles para esta fecha. Prueba con otra.
              </p>
            ) : (
              <>
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Mañana
                  </p>
                  <HorariosGrid
                    horas={horasManana}
                    seleccionadas={selectedHoras}
                    onSeleccionar={handleSeleccionarHora}
                  />
                </div>
                <div className="border-t border-slate-200" />
                <div>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Tarde
                  </p>
                  <HorariosGrid
                    horas={horasTarde}
                    seleccionadas={selectedHoras}
                    onSeleccionar={handleSeleccionarHora}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between items-center shrink-0 mt-4 border-t border-brand-border/30 pt-4">
            <button
              onClick={prevStep}
              className="text-xs font-semibold text-brand-muted hover:text-slate-900 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Atrás
            </button>
            <button
              onClick={handleContinuarHorario}
              disabled={selectedHoras.length === 0}
              className={`rounded-global px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                selectedHoras.length > 0
                  ? "bg-brand-primary hover:bg-brand-primary-hover text-white cursor-pointer shadow-md"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Especialista */}
      {currentStep === 3 && (
        <div className="flex flex-col h-full">
          <div className="text-left shrink-0 mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-1">
              Paso 3 de 4
            </h3>
            <p className="text-slate-800 text-base font-bold">
              Selecciona un Especialista
            </p>
          </div>

          <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto pr-1">
            {especialistasDisponibles.map(sp => (
              <button
                key={sp.id}
                onClick={() => handleSpecialistSelect(sp.id)}
                disabled={resolviendoEspecialistaId !== null}
                className={`w-full flex justify-between items-center p-4 sm:p-5 rounded-global border text-left transition-all cursor-pointer disabled:cursor-wait ${
                  selectedSpecialistId === sp.id
                    ? "border-brand-primary bg-brand-primary/10 shadow-md shadow-brand-primary/10"
                    : "border-brand-border bg-white hover:border-brand-primary/50 hover:bg-slate-50"
                }`}
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {sp.nombre}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {sp.cargo}
                  </span>
                </div>
                {resolviendoEspecialistaId === sp.id ? (
                  <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg
                    className="w-5 h-5 text-brand-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </button>
            ))}

            {especialistasDisponibles.length === 0 && !isLoading && (
              <p className="text-xs text-brand-muted text-center py-8">
                Ningún especialista tiene disponible esa franja completa. Prueba
                con otro horario.
              </p>
            )}

            {errorResolucion && (
              <p className="text-[11px] text-rose-500 font-semibold text-center">
                {errorResolucion}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center shrink-0 mt-4 border-t border-brand-border/30 pt-4">
            <button
              onClick={prevStep}
              className="text-xs font-semibold text-brand-muted hover:text-slate-900 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Atrás
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Patient Info & Google Login */}
      {currentStep === 4 && (
        <form onSubmit={handleFormSubmit} className="flex flex-col h-full">
          <div className="text-left shrink-0 mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-1">
              Paso 4 de 4
            </h3>
            <p className="text-slate-800 text-base font-bold">
              Datos del Paciente
            </p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-4">
            {/* Google Sign-In Widget Container */}
            <div className="bg-slate-50 border border-slate-200 rounded-global p-4 text-center space-y-3">
              <span className="text-xs text-slate-600 font-semibold block">
                Inicia sesión con tu cuenta de Google
              </span>

              <div
                id="google-btn-container"
                className="flex justify-center min-h-[40px]"
              />

              {authToken ? (
                <div className="text-xs text-emerald-600 font-bold bg-emerald-50 rounded-lg p-2 border border-emerald-200">
                  ✓ Sesión iniciada correctamente
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleDemoAuth}
                  className="text-[11px] text-brand-primary hover:underline font-semibold cursor-pointer"
                >
                  (Opción 2) Usar Sesión de Paciente de Pruebas
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs text-brand-muted mb-1.5 font-medium">
                Nombre Completo
              </label>
              <input
                type="text"
                required
                placeholder="JHOAN MONTERO"
                value={patientName}
                onChange={e => handlePatientInfoChange("name", e.target.value)}
                className="w-full bg-white border border-brand-border rounded-global p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-primary transition-colors placeholder:text-slate-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs text-brand-muted mb-1.5 font-medium">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                placeholder="jhoanck777@gmail.com"
                value={patientEmail}
                onChange={e => handlePatientInfoChange("email", e.target.value)}
                className="w-full bg-white border border-brand-border rounded-global p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-primary transition-colors placeholder:text-slate-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs text-brand-muted mb-1.5 font-medium">
                RUT del Paciente (ej: 11111111-1 o 12345678-5)
              </label>
              <input
                type="text"
                required
                placeholder="11111111-1"
                value={patientRut}
                onChange={e => handlePatientInfoChange("rut", e.target.value)}
                className="w-full bg-white border border-brand-border rounded-global p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-primary transition-colors placeholder:text-slate-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs text-brand-muted mb-1.5 font-medium">
                Teléfono Móvil
              </label>
              <input
                type="tel"
                required
                placeholder="+56 9 7551 6503"
                value={patientPhone}
                onChange={e => handlePatientInfoChange("phone", e.target.value)}
                className="w-full bg-white border border-brand-border rounded-global p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-primary transition-colors placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-global bg-rose-50 border border-rose-200 text-xs text-rose-600 font-semibold text-center">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-between items-center shrink-0 mt-4 border-t border-brand-border/30 pt-4">
            <button
              type="button"
              onClick={prevStep}
              className="text-xs font-semibold text-brand-muted hover:text-slate-900 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Atrás
            </button>
            <button
              type="submit"
              disabled={
                submitMutation.isPending ||
                !patientName ||
                !patientEmail ||
                !patientPhone
              }
              className={`rounded-global px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                !submitMutation.isPending &&
                patientName &&
                patientEmail &&
                patientPhone
                  ? "bg-brand-primary hover:bg-brand-primary-hover text-white cursor-pointer shadow-md"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {submitMutation.isPending
                ? "Procesando Cita..."
                : "Reservar y Pagar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
