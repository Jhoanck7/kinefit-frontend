"use client";

import React, { useEffect } from 'react';
import { useBookingStore } from '@/lib/store/useBookingStore';

export default function BookingCard() {
  const {
    services,
    specialists,
    availableSlots,
    selectedServiceId,
    selectedServiceName,
    selectedSpecialistSanityId,
    selectedSpecialistName,
    selectedDate,
    selectedTimeSlot,
    selectedBloqueHorarioId,
    patientName,
    patientEmail,
    patientPhone,
    currentStep,
    isLoading,
    isSubmitting,
    error,
    success,
    fetchServices,
    setSelectedService,
    setSelectedSpecialist,
    setSelectedDate,
    setSelectedTimeSlot,
    setPatientInfo,
    nextStep,
    prevStep,
    resetBooking,
    submitBooking
  } = useBookingStore();

  // Obtener fecha de mañana para el min del input
  const tomorrowStr = React.useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, []);

  // Cargar servicios al iniciar
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleServiceSelect = (id: number, name: string) => {
    setSelectedService(id, name);
    nextStep();
  };

  const handleSpecialistSelect = (sanityId: string, name: string) => {
    setSelectedSpecialist(sanityId, name);
    nextStep();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleTimeSelect = (slotHora: string, slotId: number) => {
    // La hora viene en formato HH:mm:ss, la limpiamos a HH:mm
    const timeCleaned = slotHora.substring(0, 5);
    setSelectedTimeSlot(timeCleaned, slotId);
  };

  const handlePatientInfoChange = (field: 'name' | 'email' | 'phone', value: string) => {
    setPatientInfo({
      name: field === 'name' ? value : patientName,
      email: field === 'email' ? value : patientEmail,
      phone: field === 'phone' ? value : patientPhone,
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (patientName && patientEmail && patientPhone) {
      await submitBooking();
    }
  };

  if (success) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center p-4 py-8 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-lg shadow-emerald-500/10">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">¡Cita Reservada con Éxito!</h3>
        <p className="text-xs text-brand-muted max-w-[280px] mb-6 leading-relaxed">
          Tu reserva para <span className="text-slate-900 font-semibold">{selectedServiceName}</span> con <span className="text-slate-900 font-semibold">{selectedSpecialistName}</span> el <span className="text-slate-900 font-semibold">{selectedDate}</span> a las <span className="text-slate-900 font-semibold">{selectedTimeSlot} hrs</span> ha sido confirmada en el sistema.
        </p>
        <button
          onClick={resetBooking}
          className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl px-6 py-3.5 transition-colors uppercase tracking-wider"
        >
          Reservar otra cita
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-[400px] justify-between p-2">
      
      {/* Loader General */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-50 rounded-3xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider">Cargando...</span>
          </div>
        </div>
      )}

      {/* Step 1: Service selection */}
      {currentStep === 1 && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="text-left">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-1">Paso 1 de 4</h3>
            <p className="text-slate-800 text-base font-bold">Selecciona un servicio</p>
          </div>
          
          <div className="flex flex-col gap-3">
            {services.filter(s => s.activo).map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceSelect(service.id, service.nombre)}
                className={`w-full flex justify-between items-center p-4 sm:p-5 rounded-2xl border text-left transition-all ${
                  selectedServiceId === service.id
                    ? 'border-brand-primary bg-brand-primary/10 shadow-md shadow-brand-primary/10'
                    : 'border-brand-border bg-white hover:border-brand-primary/50 hover:bg-slate-50'
                }`}
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{service.nombre}</h4>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Servicio Activo</span>
                </div>
                <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}

            {services.filter(s => s.activo).length === 0 && !isLoading && (
              <p className="text-xs text-brand-muted text-center py-8">No hay especialidades disponibles de momento.</p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Specialist Selection */}
      {currentStep === 2 && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="text-left">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-1">Paso 2 de 4</h3>
            <p className="text-slate-800 text-base font-bold">Selecciona un Especialista</p>
          </div>

          <div className="flex flex-col gap-3">
            {specialists.filter(sp => sp.activo).map((sp) => (
              <button
                key={sp.sanityId}
                onClick={() => handleSpecialistSelect(sp.sanityId, sp.nombre)}
                className={`w-full flex justify-between items-center p-4 sm:p-5 rounded-2xl border text-left transition-all ${
                  selectedSpecialistSanityId === sp.sanityId
                    ? 'border-brand-primary bg-brand-primary/10 shadow-md shadow-brand-primary/10'
                    : 'border-brand-border bg-white hover:border-brand-primary/50 hover:bg-slate-50'
                }`}
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{sp.nombre}</h4>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{sp.cargo}</span>
                </div>
                <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}

            {specialists.filter(sp => sp.activo).length === 0 && !isLoading && (
              <p className="text-xs text-brand-muted text-center py-8">No hay profesionales disponibles para esta especialidad.</p>
            )}
          </div>

          <div className="flex justify-between items-center mt-6 border-t border-brand-border/30 pt-4">
            <button
              onClick={prevStep}
              className="text-xs font-semibold text-brand-muted hover:text-slate-900 transition-colors uppercase tracking-wider"
            >
              Atrás
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Date & Time */}
      {currentStep === 3 && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="text-left">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-1">Paso 3 de 4</h3>
            <p className="text-slate-800 text-base font-bold">Fecha y Horario</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-brand-muted mb-1.5 font-medium">1. Elige una Fecha</label>
              <input
                type="date"
                value={selectedDate || ''}
                onChange={handleDateChange}
                min={tomorrowStr}
                className="w-full bg-white border border-brand-border rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>

            {selectedDate && (
              <div>
                <label className="block text-xs text-brand-muted mb-2 font-medium">2. Selecciona una Hora disponible</label>
                <div className="grid grid-cols-3 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleTimeSelect(slot.hora, slot.id)}
                      className={`p-3 text-xs font-bold rounded-xl border text-center transition-all ${
                        selectedBloqueHorarioId === slot.id
                          ? 'border-brand-primary bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                          : 'border-brand-border bg-white text-slate-700 hover:border-brand-primary hover:bg-slate-50'
                      }`}
                    >
                      {slot.hora.substring(0, 5)}
                    </button>
                  ))}

                  {availableSlots.length === 0 && !isLoading && (
                    <p className="text-[11px] text-rose-500 font-medium col-span-3 text-center py-4">No hay bloques disponibles para esta fecha.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-6 border-t border-brand-border/30 pt-4">
            <button
              onClick={prevStep}
              className="text-xs font-semibold text-brand-muted hover:text-slate-900 transition-colors uppercase tracking-wider"
            >
              Atrás
            </button>
            <button
              onClick={nextStep}
              disabled={!selectedDate || !selectedBloqueHorarioId}
              className={`rounded-xl px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                selectedDate && selectedBloqueHorarioId
                  ? 'bg-brand-primary hover:bg-brand-primary-hover text-white cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Patient Info / Submit */}
      {currentStep === 4 && (
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-6 animate-fade-in">
          <div className="text-left">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-primary mb-1">Paso 4 de 4</h3>
            <p className="text-slate-800 text-base font-bold">Datos de Contacto</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-brand-muted mb-1.5 font-medium">Nombre Completo</label>
              <input
                type="text"
                required
                placeholder="Juan Pérez"
                value={patientName}
                onChange={(e) => handlePatientInfoChange('name', e.target.value)}
                className="w-full bg-white border border-brand-border rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-primary transition-colors placeholder:text-slate-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs text-brand-muted mb-1.5 font-medium">Correo Electrónico</label>
              <input
                type="email"
                required
                placeholder="juan.perez@email.com"
                value={patientEmail}
                onChange={(e) => handlePatientInfoChange('email', e.target.value)}
                className="w-full bg-white border border-brand-border rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-primary transition-colors placeholder:text-slate-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs text-brand-muted mb-1.5 font-medium">Teléfono Móvil</label>
              <input
                type="tel"
                required
                placeholder="+56 9 1234 5678"
                value={patientPhone}
                onChange={(e) => handlePatientInfoChange('phone', e.target.value)}
                className="w-full bg-white border border-brand-border rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-primary transition-colors placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          {error && <span className="text-xs text-rose-500 font-semibold">{error}</span>}

          <div className="flex justify-between items-center mt-6 border-t border-brand-border/30 pt-4">
            <button
              type="button"
              onClick={prevStep}
              className="text-xs font-semibold text-brand-muted hover:text-slate-900 transition-colors uppercase tracking-wider"
            >
              Atrás
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !patientName || !patientEmail || !patientPhone}
              className={`rounded-xl px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                !isSubmitting && patientName && patientEmail && patientPhone
                  ? 'bg-brand-primary hover:bg-brand-primary-hover text-white cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Procesando...' : 'Confirmar Reserva'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
