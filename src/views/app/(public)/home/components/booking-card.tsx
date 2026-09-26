"use client";

import { CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import {
  useAuthenticateWithGoogleMutation,
  useGetEmpresasPublico,
  useGetEspecialistasDisponibles,
  useGetFechasDisponibles,
  useGetHorasDisponibles,
  useGetServices,
  useSubmitBookingMutation,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import { fechaISO } from "@/lib/formato";
import {
  bloquesRequeridos,
  sonConsecutivas,
  sumarMinutos,
} from "@/lib/horario";
import {
  esRutValido,
  esTelefonoValido,
  limpiarRut,
  limpiarTelefono,
} from "@/lib/validadores";
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
    patientConvenioId,
    authToken,
    currentStep,
    setSelectedService,
    setSelectedHorario,
    setSelectedSpecialist,
    setPatientInfo,
    setPatientConvenioId,
    setAuthToken,
    nextStep,
    prevStep,
    resetBooking,
  } = useBookingStore();

  const [authError, setAuthError] = useState<string | null>(null);
  const [consentimientoAceptado, setConsentimientoAceptado] = useState(false);
  const consentimientoRef = useRef(consentimientoAceptado);
  useEffect(() => {
    consentimientoRef.current = consentimientoAceptado;
  }, [consentimientoAceptado]);
  const [errorSeleccion, setErrorSeleccion] = useState<string | null>(null);
  const [resolviendoEspecialistaId, setResolviendoEspecialistaId] = useState<
    number | null
  >(null);
  const [errorResolucion, setErrorResolucion] = useState<string | null>(null);

  const { data: services = [], isLoading: loadingServices } = useGetServices();
  const { data: convenios = [] } = useGetEmpresasPublico(authToken);

  const servicioSeleccionado = services.find(s => s.id === selectedServiceId);
  const duracionFijaDelServicio = Boolean(
    servicioSeleccionado?.duracionMinutos
  );
  const bloquesExigidos = duracionFijaDelServicio
    ? bloquesRequeridos(servicioSeleccionado?.duracionMinutos)
    : 0;
  const duracionServicioEfectiva =
    servicioSeleccionado?.duracionMinutos ?? DURACION_BLOQUE_MIN;

  const duracionMinutos = selectedHoras.length * DURACION_BLOQUE_MIN;
  const horaInicio = [...selectedHoras].sort()[0] ?? "";
  const todayIso = fechaISO(new Date());

  const { isLoading: loadingFechas } = useGetFechasDisponibles(
    selectedServiceId ?? 0,
    duracionServicioEfectiva,
    Boolean(selectedServiceId)
  );
  const { data: horasDisponibles = [], isLoading: loadingHoras } =
    useGetHorasDisponibles(
      selectedServiceId ?? 0,
      selectedDate ?? "",
      duracionServicioEfectiva,
      Boolean(selectedServiceId) && Boolean(selectedDate)
    );

  const esFechaHoy = selectedDate === todayIso;
  const horaActualHHMM = new Date().toLocaleTimeString("en-GB", {
    timeZone: "America/Santiago",
    hour: "2-digit",
    minute: "2-digit",
  });
  const horasVigentes = esFechaHoy
    ? horasDisponibles.filter(h => h > horaActualHHMM)
    : horasDisponibles;
  const horasManana = horasVigentes.filter(h => h < LIMITE_MANANA);
  const horasTarde = horasVigentes.filter(h => h >= LIMITE_MANANA);

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

  const [googleListo, setGoogleListo] = useState(false);

  // Cargar e inicializar el SDK de Google Sign-In una sola vez: initialize()
  // llamado más de una vez por el mismo cliente es lo que generaba el
  // warning "initialize() is called multiple times" y podía dejar el botón
  // atado a una instancia GSI obsoleta.
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
              if (!consentimientoRef.current) {
                setAuthError(
                  "Aceptá la política de privacidad antes de iniciar sesión."
                );
                return;
              }
              const escrito = useBookingStore.getState();
              if (!esRutValido(escrito.patientRut)) {
                setAuthError(
                  "Completá tu RUT antes de iniciar sesión, así tus datos quedan en una sola ficha."
                );
                return;
              }
              setAuthError(null);
              try {
                const result = await authMutation.mutateAsync({
                  idToken: response.credential,
                  consentimientoAceptado: true,
                  rut: limpiarRut(escrito.patientRut),
                });
                setAuthToken(result.data.token);
                setPatientInfo({
                  name: `${result.data.paciente.nombre} ${result.data.paciente.apellido}`.trim(),
                  email: result.data.paciente.email,
                  phone: result.data.paciente.telefono || escrito.patientPhone,
                  rut: result.data.paciente.rut || escrito.patientRut,
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
        setGoogleListo(true);
      }
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Renderiza el botón cada vez que el paso 4 monta su contenedor: initialize()
  // ya corrió una única vez arriba, esto solo dibuja el widget en el DOM
  // actual.
  useEffect(() => {
    if (!googleListo || currentStep !== 4) return;
    const btnContainer = document.getElementById("google-btn-container");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (btnContainer && (window as any).google?.accounts?.id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).google.accounts.id.renderButton(btnContainer, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
      });
    }
  }, [googleListo, currentStep]);

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

    const maxBloques = duracionFijaDelServicio ? bloquesExigidos : MAX_BLOQUES;

    if (yaSeleccionada) {
      nuevas = selectedHoras.filter(h => h !== hora);
    } else {
      if (selectedHoras.length >= maxBloques) {
        setErrorSeleccion(
          duracionFijaDelServicio
            ? `Este servicio dura ${servicioSeleccionado?.duracionMinutos} min (${bloquesExigidos} bloque(s)).`
            : "Puedes reservar como máximo 3 bloques (90 minutos)."
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
    if (duracionFijaDelServicio && selectedHoras.length !== bloquesExigidos) {
      setErrorSeleccion(
        `Este servicio dura ${servicioSeleccionado?.duracionMinutos} min (${bloquesExigidos} bloque(s)).`
      );
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

  const rutLimpio = limpiarRut(patientRut);
  const rutEsValido = esRutValido(patientRut);
  const mostrarErrorRut = rutLimpio.length >= 7 && !rutEsValido;
  const puedeIniciarSesion = consentimientoAceptado && rutEsValido;

  const telefonoLimpio = limpiarTelefono(patientPhone);
  const telefonoEsValido = esTelefonoValido(patientPhone);
  const mostrarErrorTelefono = telefonoLimpio.length >= 9 && !telefonoEsValido;

  const perfilCompleto = rutEsValido && telefonoEsValido;

  const datosCompletos = Boolean(
    patientName &&
    patientEmail &&
    patientRut &&
    rutEsValido &&
    patientPhone &&
    telefonoEsValido
  );
  const seleccionCompleta = Boolean(
    selectedServiceId &&
    selectedSpecialistId &&
    selectedBloqueHorarioId &&
    duracionMinutos
  );
  const puedeReservar =
    Boolean(authToken) && datosCompletos && seleccionCompleta;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!datosCompletos) {
      setAuthError("Completá tus datos antes de continuar.");
      return;
    }
    if (!authToken) {
      setAuthError(
        "Iniciá sesión con tu cuenta de Google para confirmar la reserva."
      );
      return;
    }
    if (
      !selectedServiceId ||
      !selectedSpecialistId ||
      !selectedBloqueHorarioId ||
      !duracionMinutos
    ) {
      setAuthError(
        "Falta elegir el servicio, el horario o la profesional. Volvé atrás para completarlo."
      );
      return;
    }
    setAuthError(null);

    submitMutation.mutate({
      selectedServiceId,
      selectedSpecialistId,
      selectedBloqueHorarioId,
      selectedDuracionMinutos: duracionMinutos,
      patientName,
      patientPhone,
      patientRut,
      patientConvenioId,
      authToken,
    });
  };

  const handleResetBooking = () => {
    submitMutation.reset();
    resetBooking();
  };

  const errorMsg =
    (submitMutation.isError
      ? handleApiError(submitMutation.error).message
      : null) ?? authError;

  if (submitMutation.isSuccess && webpayData) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center p-4 py-8 bg-transparent">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-600 mb-4 shadow-lg shadow-red-500/10">
          <CreditCard className="w-8 h-8" strokeWidth={2} />
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
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-global px-6 py-3.5 transition-colors tracking-wider cursor-pointer shadow-md"
            >
              Ir a Webpay Plus ($10.000 CLP)
            </button>
          </form>
        ) : (
          <button
            onClick={() => router.push(webpayData.urlRedireccion)}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-global px-6 py-3.5 transition-colors tracking-wider cursor-pointer shadow-md"
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
          className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-global px-6 py-3.5 transition-colors tracking-wider cursor-pointer"
        >
          Reservar Otra Cita
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
            <span className="text-xs font-semibold text-brand-primary tracking-wider">
              Cargando...
            </span>
          </div>
        </div>
      )}

      {/* Step 1: Service selection */}
      {currentStep === 1 && (
        <div className="flex flex-col h-full">
          <div className="text-left shrink-0 mb-6">
            <h3 className="text-sm font-semibold tracking-wider text-brand-primary mb-1">
              Paso 1 de 4
            </h3>
            <p className="text-slate-800 text-base font-bold">
              Selecciona un Servicio
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
                    {service.descripcion && (
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        {service.descripcion}
                      </span>
                    )}
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
            <h3 className="text-sm font-semibold tracking-wider text-brand-primary mb-1">
              Paso 2 de 4
            </h3>
            <p className="text-slate-800 text-base font-bold">
              Fecha y Horario
            </p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-4">
            {errorSeleccion && (
              <p className="text-[11px] text-white font-semibold bg-rose-600 rounded-overlay px-3 py-2">
                {errorSeleccion}
              </p>
            )}

            {/* Selector de fecha (calcado de nueva-reserva/horario) */}
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-slate-400 tracking-wider block">
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
                  Fecha Seleccionada:{" "}
                  <span className="font-medium text-slate-900">
                    {parseDateInfo(selectedDate).formattedFull}
                  </span>
                </p>
              )}
              {horaInicio && selectedHoras.length > 0 && (
                <p className="text-xs text-slate-700 pt-1">
                  Horario Seleccionado:{" "}
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
              {servicioSeleccionado?.duracionMinutos && (
                <p
                  className={`rounded-overlay px-3 py-2 text-[11px] font-semibold text-white ${
                    selectedHoras.length === bloquesExigidos
                      ? "bg-emerald-600"
                      : "bg-brand-primary"
                  }`}
                >
                  Este servicio dura {servicioSeleccionado.duracionMinutos} min,
                  así que necesita {bloquesExigidos}{" "}
                  {bloquesExigidos === 1 ? "bloque" : "bloques"} de 30 min.
                  Llevas {selectedHoras.length} de {bloquesExigidos}.
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
            ) : horasVigentes.length === 0 ? (
              <p className="text-xs text-slate-400">
                Sin bloques disponibles para esta fecha. Prueba con otra.
              </p>
            ) : (
              <>
                <div>
                  <p className="text-[11px] font-medium text-slate-400 tracking-wider mb-2">
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
                  <p className="text-[11px] font-medium text-slate-400 tracking-wider mb-2">
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
              className="text-xs font-semibold text-brand-muted hover:text-slate-900 transition-colors tracking-wider cursor-pointer"
            >
              Atrás
            </button>
            <button
              onClick={handleContinuarHorario}
              disabled={
                selectedHoras.length === 0 ||
                (duracionFijaDelServicio &&
                  selectedHoras.length !== bloquesExigidos)
              }
              className={`rounded-global px-6 py-3.5 text-xs font-bold tracking-wider transition-colors ${
                selectedHoras.length > 0 &&
                (!duracionFijaDelServicio ||
                  selectedHoras.length === bloquesExigidos)
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
            <h3 className="text-sm font-semibold tracking-wider text-brand-primary mb-1">
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
              <p className="text-[11px] text-white font-semibold text-center bg-rose-600 rounded-overlay px-3 py-2">
                {errorResolucion}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center shrink-0 mt-4 border-t border-brand-border/30 pt-4">
            <button
              onClick={prevStep}
              className="text-xs font-semibold text-brand-muted hover:text-slate-900 transition-colors tracking-wider cursor-pointer"
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
            <h3 className="text-sm font-semibold tracking-wider text-brand-primary mb-1">
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
                Inicia Sesión con tu Cuenta de Google
              </span>

              <label className="flex items-start gap-2 text-left text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentimientoAceptado}
                  onChange={e => setConsentimientoAceptado(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  He leído y acepto la{" "}
                  <a
                    href="/politica-de-privacidad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-primary underline underline-offset-2"
                  >
                    Política de Privacidad
                  </a>
                </span>
              </label>

              <div
                id="google-btn-container"
                className={`flex justify-center min-h-[40px] ${puedeIniciarSesion ? "" : "opacity-40 pointer-events-none"}`}
              />
              {!consentimientoAceptado ? (
                <p className="text-table-head text-slate-400">
                  Aceptá la política de privacidad para continuar
                </p>
              ) : (
                !rutEsValido && (
                  <p className="text-table-head text-slate-400">
                    Completá tu RUT más abajo para poder iniciar sesión
                  </p>
                )
              )}

              {authToken &&
                (perfilCompleto ? (
                  <div className="text-xs text-white font-bold bg-emerald-600 rounded-overlay p-2">
                    Sesión Iniciada Correctamente
                  </div>
                ) : (
                  <div className="text-xs text-white font-bold bg-amber-600 rounded-overlay p-2">
                    Sesión iniciada. Completá tu teléfono para poder reservar
                  </div>
                ))}
            </div>

            <div>
              <label className="block text-xs text-brand-muted mb-1.5 font-medium">
                Nombre Completo
              </label>
              <input
                type="text"
                required
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
                value={patientEmail}
                onChange={e => handlePatientInfoChange("email", e.target.value)}
                className="w-full bg-white border border-brand-border rounded-global p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-primary transition-colors placeholder:text-slate-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs text-brand-muted mb-1.5 font-medium">
                RUT del Paciente
              </label>
              <input
                type="text"
                required
                placeholder="ej: 12345678-5"
                value={patientRut}
                onChange={e => handlePatientInfoChange("rut", e.target.value)}
                className={`w-full bg-white border rounded-global p-3 text-sm text-slate-900 focus:outline-none transition-colors placeholder:text-slate-400 font-medium ${
                  mostrarErrorRut
                    ? "border-rose-400 focus:border-rose-500"
                    : rutEsValido && rutLimpio.length > 0
                      ? "border-emerald-400 focus:border-emerald-500"
                      : "border-brand-border focus:border-brand-primary"
                }`}
              />
              {mostrarErrorRut && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">
                  RUT Inválido
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-brand-muted mb-1.5 font-medium">
                Teléfono Móvil
              </label>
              <input
                type="tel"
                required
                placeholder="ej: 56912345678"
                value={patientPhone}
                onChange={e => handlePatientInfoChange("phone", e.target.value)}
                className={`w-full bg-white border rounded-global p-3 text-sm text-slate-900 focus:outline-none transition-colors placeholder:text-slate-400 font-medium ${
                  mostrarErrorTelefono
                    ? "border-rose-400 focus:border-rose-500"
                    : telefonoEsValido && telefonoLimpio.length > 0
                      ? "border-emerald-400 focus:border-emerald-500"
                      : "border-brand-border focus:border-brand-primary"
                }`}
              />
              {mostrarErrorTelefono && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">
                  Teléfono inválido, debe ser un celular chileno (ej:
                  56912345678)
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-brand-muted mb-1.5 font-medium">
                Convenio
              </label>
              <select
                value={patientConvenioId}
                onChange={e => setPatientConvenioId(e.target.value)}
                className="w-full bg-white border border-brand-border rounded-global p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-primary transition-colors font-medium"
              >
                <option value="">Sin Convenio</option>
                {convenios.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-overlay bg-rose-600 text-xs text-white font-semibold text-center">
              {errorMsg}
            </div>
          )}

          {!authToken && datosCompletos && (
            <p className="text-table-head text-slate-500 text-center mt-3">
              Iniciá sesión con Google, arriba, para habilitar la reserva
            </p>
          )}

          <div className="flex justify-between items-center shrink-0 mt-4 border-t border-brand-border/30 pt-4">
            <button
              type="button"
              onClick={prevStep}
              className="text-xs font-semibold text-brand-muted hover:text-slate-900 transition-colors tracking-wider cursor-pointer"
            >
              Atrás
            </button>
            <button
              type="submit"
              disabled={submitMutation.isPending || !puedeReservar}
              className={`rounded-global px-6 py-3.5 text-xs font-bold tracking-wider transition-colors ${
                !submitMutation.isPending && puedeReservar
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
