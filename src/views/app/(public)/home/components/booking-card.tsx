"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import {
  useAuthenticateWithGoogleMutation,
  useGetAvailableSlots,
  useGetEspecialistas,
  useGetServices,
  useSubmitBookingMutation,
} from "@/hooks/api";
import { useBookingStore } from "@/stores";

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

export default function BookingCard() {
  const router = useRouter();
  const {
    selectedServiceId,
    selectedServiceName,
    selectedSpecialistId,
    selectedDate,
    selectedBloqueHorarioId,
    selectedDuracionMinutos,
    patientName,
    patientEmail,
    patientPhone,
    patientRut,
    authToken,
    currentStep,
    setSelectedService,
    setSelectedSpecialist,
    setSelectedDate,
    setSelectedTimeSlot,
    setSelectedDuracionMinutos,
    setPatientInfo,
    setAuthToken,
    nextStep,
    prevStep,
    resetBooking,
  } = useBookingStore();

  const [authError, setAuthError] = useState<string | null>(null);

  const { data: services = [], isLoading: loadingServices } = useGetServices();
  const { data: specialists = [], isLoading: loadingSpecialists } =
    useGetEspecialistas(selectedServiceId ?? undefined, true);
  const { data: availableSlots = [], isLoading: loadingSlots } =
    useGetAvailableSlots(
      selectedSpecialistId ?? undefined,
      selectedDate ?? undefined
    );
  const isLoading = loadingServices || loadingSpecialists || loadingSlots;

  const availableDates =
    specialists.find(sp => sp.id === selectedSpecialistId)?.fechasDisponibles ??
    [];

  const authMutation = useAuthenticateWithGoogleMutation();
  const submitMutation = useSubmitBookingMutation();

  const webpayFormRef = useRef<HTMLFormElement>(null);

  const todayStr = React.useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  // Cargar e Inicializar Google Sign-In SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).google?.accounts?.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).google.accounts.id.initialize({
          client_id:
            "590926291917-p4rge48fltejn313oi24ujs5oc4vr6v1.apps.googleusercontent.com",
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

  const handleSpecialistSelect = (id: number, name: string) => {
    setSelectedSpecialist(id, name);
    nextStep();
  };

  const handleDateChange = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const handleTimeSelect = (horaInicio: string, slotId: number) => {
    setSelectedTimeSlot(horaInicio, slotId);
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
      !selectedDuracionMinutos
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
      selectedDuracionMinutos,
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
        <div className="w-16 h-16 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center text-red-600 text-3xl mb-4 font-bold">
          💳
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-wide">
          Transbank Webpay Plus
        </h3>
        <p className="text-xs text-slate-600 max-w-[300px] mb-6 leading-relaxed font-medium">
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
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl px-6 py-3.5 border-2 border-red-600 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Ir a Webpay Plus ($10.000 CLP)
            </button>
          </form>
        ) : (
          <button
            onClick={() => router.push(webpayData.urlRedireccion)}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl px-6 py-3.5 border-2 border-red-600 transition-colors uppercase tracking-wider cursor-pointer"
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
        <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-600 flex items-center justify-center text-emerald-600 text-3xl mb-6 font-bold">
          ✓
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-wide">
          ¡Cita Registrada Exitosamente!
        </h3>
        <p className="text-xs text-slate-600 max-w-[280px] mb-6 leading-relaxed font-medium">
          Tu reserva para{" "}
          <span className="text-slate-900 font-bold">
            {selectedServiceName}
          </span>{" "}
          el <span className="text-slate-900 font-bold">{selectedDate}</span> ha
          sido registrada en el sistema.
        </p>
        <button
          onClick={handleResetBooking}
          className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl px-6 py-3.5 border-2 border-brand-primary transition-colors uppercase tracking-wider cursor-pointer"
        >
          Reservar otra cita
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-[400px] justify-between p-1 bg-transparent">
      {isLoading && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-50 rounded-2xl border-2 border-slate-200">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
              Cargando...
            </span>
          </div>
        </div>
      )}

      {/* Step 1: Service selection */}
      {currentStep === 1 && (
        <div className="flex flex-col gap-6">
          <div className="text-left">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary mb-1">
              Paso 1 de 4
            </h3>
            <p className="text-slate-900 text-base font-extrabold uppercase tracking-tight">
              Selecciona un servicio
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {services
              .filter(s => s.activo)
              .map(service => (
                <button
                  key={service.id}
                  onClick={() =>
                    handleServiceSelect(service.id, service.nombre)
                  }
                  className={`w-full flex justify-between items-center p-4 sm:p-5 rounded-xl border-2 text-left transition-colors cursor-pointer ${
                    selectedServiceId === service.id
                      ? "border-brand-primary bg-slate-100"
                      : "border-slate-300 bg-white hover:border-brand-primary hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {service.nombre}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
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
              <p className="text-xs text-slate-500 font-semibold text-center py-8">
                No hay especialidades disponibles de momento.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Specialist Selection */}
      {currentStep === 2 && (
        <div className="flex flex-col gap-6">
          <div className="text-left">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary mb-1">
              Paso 2 de 4
            </h3>
            <p className="text-slate-900 text-base font-extrabold uppercase tracking-tight">
              Selecciona un Especialista
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {specialists
              .filter(sp => sp.activo)
              .map(sp => (
                <button
                  key={sp.id}
                  onClick={() => handleSpecialistSelect(sp.id, sp.nombre)}
                  className={`w-full flex justify-between items-center p-4 sm:p-5 rounded-xl border-2 text-left transition-colors cursor-pointer ${
                    selectedSpecialistId === sp.id
                      ? "border-brand-primary bg-slate-100"
                      : "border-slate-300 bg-white hover:border-brand-primary hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {sp.nombre}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      {sp.cargo}
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

            {specialists.filter(sp => sp.activo).length === 0 && !isLoading && (
              <p className="text-xs text-slate-500 font-semibold text-center py-8">
                No hay profesionales disponibles para este servicio.
              </p>
            )}
          </div>

          <div className="flex justify-between items-center mt-6 border-t-2 border-slate-200 pt-4">
            <button
              onClick={prevStep}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Atrás
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Date & Time */}
      {currentStep === 3 && (
        <div className="flex flex-col gap-6">
          <div className="text-left">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary mb-1">
              Paso 3 de 4
            </h3>
            <p className="text-slate-900 text-base font-extrabold uppercase tracking-tight">
              Fecha y Horario
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {/* Unified Flat Date Selector */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-slate-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-brand-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  1. Selecciona la Fecha
                </label>
                {selectedDate && (
                  <span className="text-[11px] font-bold text-brand-primary bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-300">
                    {parseDateInfo(selectedDate).formattedFull}
                  </span>
                )}
              </div>

              {availableDates && availableDates.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
                  {availableDates.map(dateStr => {
                    const info = parseDateInfo(dateStr);
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => handleDateChange(dateStr)}
                        className={`p-3 text-xs font-bold rounded-xl border-2 text-center transition-colors cursor-pointer ${
                          isSelected
                            ? "border-brand-primary bg-brand-primary text-white"
                            : "border-slate-300 bg-white text-slate-800 hover:border-brand-primary hover:bg-slate-50"
                        }`}
                      >
                        {info.formattedShort}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate || ""}
                    onChange={e => handleDateChange(e.target.value)}
                    min={todayStr}
                    className="w-full bg-white border-2 border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-brand-primary transition-colors cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Flat Time Slot Selection */}
            {selectedDate && (
              <div>
                <label className="block text-xs text-slate-800 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-brand-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  2. Selecciona la Franja Horaria
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
                  {availableSlots.map(slot => {
                    const displayHora = `${slot.horaInicio} - ${slot.horaFin}`;
                    const isSelected = selectedBloqueHorarioId === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() =>
                          handleTimeSelect(slot.horaInicio, slot.id)
                        }
                        className={`p-3 text-xs font-bold rounded-xl border-2 text-center transition-colors cursor-pointer ${
                          isSelected
                            ? "border-brand-primary bg-brand-primary text-white"
                            : "border-slate-300 bg-white text-slate-800 hover:border-brand-primary hover:bg-slate-50"
                        }`}
                      >
                        {displayHora}
                      </button>
                    );
                  })}

                  {availableSlots.length === 0 && !isLoading && (
                    <p className="text-[11px] text-red-600 font-bold col-span-3 text-center py-4">
                      No hay franjas disponibles ese día.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Duración de la Atención */}
            {selectedBloqueHorarioId && (
              <div>
                <label className="block text-xs text-slate-800 font-bold uppercase tracking-wider mb-2">
                  3. ¿Cuánto Durará tu Atención?
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[30, 60, 90].map(minutos => (
                    <button
                      key={minutos}
                      type="button"
                      onClick={() => setSelectedDuracionMinutos(minutos)}
                      className={`p-3 text-xs font-bold rounded-xl border-2 text-center transition-colors cursor-pointer ${
                        selectedDuracionMinutos === minutos
                          ? "border-brand-primary bg-brand-primary text-white"
                          : "border-slate-300 bg-white text-slate-800 hover:border-brand-primary hover:bg-slate-50"
                      }`}
                    >
                      {minutos} min
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-6 border-t-2 border-slate-200 pt-4">
            <button
              onClick={prevStep}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Atrás
            </button>
            <button
              onClick={nextStep}
              disabled={
                !selectedDate ||
                !selectedBloqueHorarioId ||
                !selectedDuracionMinutos
              }
              className={`rounded-xl px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-2 transition-colors ${
                selectedDate &&
                selectedBloqueHorarioId &&
                selectedDuracionMinutos
                  ? "bg-brand-primary hover:bg-brand-primary-hover border-brand-primary text-white cursor-pointer"
                  : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Patient Info & Google Login */}
      {currentStep === 4 && (
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
          <div className="text-left">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary mb-1">
              Paso 4 de 4
            </h3>
            <p className="text-slate-900 text-base font-extrabold uppercase tracking-tight">
              Datos del Paciente
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Flat Google Sign-In Widget Container */}
            <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-4 text-center space-y-3">
              <span className="text-xs text-slate-700 font-bold block uppercase tracking-wider">
                Inicia sesión con tu cuenta de Google
              </span>

              <div
                id="google-btn-container"
                className="flex justify-center min-h-[40px]"
              />

              {authToken ? (
                <div className="text-xs text-emerald-700 font-bold bg-emerald-100 rounded-lg p-2 border border-emerald-300">
                  ✓ Sesión iniciada correctamente
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleDemoAuth}
                  className="text-[11px] text-brand-primary hover:underline font-bold uppercase cursor-pointer"
                >
                  (Opción 2) Usar Sesión de Paciente de Pruebas
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs text-slate-700 mb-1.5 font-bold uppercase tracking-wider">
                Nombre Completo
              </label>
              <input
                type="text"
                required
                placeholder="JHOAN MONTERO"
                value={patientName}
                onChange={e => handlePatientInfoChange("name", e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-primary transition-colors placeholder:text-slate-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-700 mb-1.5 font-bold uppercase tracking-wider">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                placeholder="jhoanck777@gmail.com"
                value={patientEmail}
                onChange={e => handlePatientInfoChange("email", e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-primary transition-colors placeholder:text-slate-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-700 mb-1.5 font-bold uppercase tracking-wider">
                RUT del Paciente (ej: 11111111-1 o 12345678-5)
              </label>
              <input
                type="text"
                required
                placeholder="11111111-1"
                value={patientRut}
                onChange={e => handlePatientInfoChange("rut", e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-primary transition-colors placeholder:text-slate-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-700 mb-1.5 font-bold uppercase tracking-wider">
                Teléfono Móvil
              </label>
              <input
                type="tel"
                required
                placeholder="+56 9 7551 6503"
                value={patientPhone}
                onChange={e => handlePatientInfoChange("phone", e.target.value)}
                className="w-full bg-white border-2 border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-primary transition-colors placeholder:text-slate-400 font-bold"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-100 border-2 border-red-500 text-xs text-red-700 font-bold text-center">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-between items-center mt-6 border-t-2 border-slate-200 pt-4">
            <button
              type="button"
              onClick={prevStep}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-wider cursor-pointer"
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
              className={`rounded-xl px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-2 transition-colors ${
                !submitMutation.isPending &&
                patientName &&
                patientEmail &&
                patientPhone
                  ? "bg-brand-primary hover:bg-brand-primary-hover border-brand-primary text-white cursor-pointer"
                  : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
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
