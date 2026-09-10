"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  useAdjuntarFichaMutation,
  useCreateFichaMutation,
  useGetCita,
  useGetPlantillas,
  useSubirAdjuntoMutation,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import { useNuevaFichaStore } from "@/stores";

export type ModoRegistroFicha = "plantilla" | "archivo";

export const useNuevaFichaContenido = () => {
  const router = useRouter();
  const {
    pacienteNombre,
    citaId,
    plantillaId,
    contenido,
    adjuntos,
    setPlantilla,
    setCampo,
    agregarAdjunto,
    quitarAdjunto,
    reiniciar,
  } = useNuevaFichaStore();

  const [modo, setModo] = useState<ModoRegistroFicha>("plantilla");
  const [archivoFicha, setArchivoFicha] = useState<File | null>(null);
  const [nombreArchivoFicha, setNombreArchivoFicha] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const crearFichaMutation = useCreateFichaMutation();
  const adjuntarFichaMutation = useAdjuntarFichaMutation();
  const subirAdjuntoMutation = useSubirAdjuntoMutation();

  // RF3: solo interesan las plantillas de tipo Ficha — el asistente jamás
  // ofrece plantillas de Consentimiento o Recomendación acá.
  const { data: plantillasDisponibles = [] } = useGetPlantillas();
  const plantillasFicha = plantillasDisponibles.filter(
    p => p.tipo === "FichaClinica"
  );
  const { data: cita } = useGetCita(
    citaId ? Number(citaId) : 0,
    Boolean(citaId)
  );

  useEffect(() => {
    if (plantillasFicha.length > 0 && !plantillaId) {
      setPlantilla(plantillasFicha[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantillasFicha.length]);

  const opcionesPlantilla = plantillasFicha.map(p => ({
    id: String(p.id),
    titulo: p.nombre,
  }));
  const plantilla = plantillasFicha.find(p => p.id === plantillaId) ?? null;
  const nombrePlantilla = plantilla?.nombre;

  const handleSeleccionarPlantilla = (id: string) => setPlantilla(Number(id));

  const handleCambiarCampo = (
    campoId: string,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => setCampo(campoId, e.target.value);

  const handleCancelar = () => {
    reiniciar();
    router.push("/panel/documentos");
  };

  const handleVolver = () => router.push("/panel/documentos/nueva/reserva");

  const handleIrACrearPlantilla = () =>
    router.push("/panel/documentos/plantillas/nuevo");

  const handleCerrarError = () => setErrorMsg(null);

  // RF3
  const handleCambiarModo = (nuevoModo: ModoRegistroFicha) => {
    setModo(nuevoModo);
    setErrorMsg(null);
  };

  async function guardarConPlantilla() {
    if (!citaId || !plantillaId) return;
    const creada = await crearFichaMutation.mutateAsync({
      citaId: Number(citaId),
      plantillaId: plantillaId,
      contenido: (contenido as Record<string, string>) || {},
    });

    const nombresFallidos: string[] = [];
    if (adjuntos && adjuntos.length > 0) {
      for (const archivo of adjuntos) {
        try {
          await subirAdjuntoMutation.mutateAsync({
            documentoId: creada.id,
            archivo,
          });
        } catch {
          nombresFallidos.push(archivo.name);
        }
      }
    }

    if (nombresFallidos.length > 0) {
      setErrorMsg(
        `La ficha se guardó, pero estos adjuntos no se pudieron subir: ${nombresFallidos.join(", ")}. Volvé a intentarlo desde el detalle de la ficha.`
      );
      return false;
    }
    return true;
  }

  // RF6: la ficha ya viene hecha, se adjunta el archivo directamente.
  async function guardarConArchivo() {
    if (!citaId || !archivoFicha) return false;
    await adjuntarFichaMutation.mutateAsync({
      citaId: Number(citaId),
      archivo: archivoFicha,
      nombre: nombreArchivoFicha.trim() || undefined,
    });
    return true;
  }

  const handleGuardar = async () => {
    if (!citaId) return;
    if (modo === "archivo" && !archivoFicha) {
      setErrorMsg("Adjuntá el archivo de la ficha antes de guardar.");
      return;
    }

    setErrorMsg(null);
    try {
      const exito =
        modo === "plantilla"
          ? await guardarConPlantilla()
          : await guardarConArchivo();
      if (exito === false) {
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }
      reiniciar();
      router.push("/panel/documentos");
    } catch (err: unknown) {
      setErrorMsg(handleApiError(err).message);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return {
    pacienteNombre,
    citaId,
    plantillaId,
    contenido,
    adjuntos,
    cita,
    plantilla,
    opcionesPlantilla,
    modo,
    archivoFicha,
    nombreArchivoFicha,
    guardando:
      crearFichaMutation.isPending ||
      adjuntarFichaMutation.isPending ||
      subirAdjuntoMutation.isPending,
    errorMsg,
    nombrePlantilla,

    actions: {
      handleSeleccionarPlantilla,
      handleCambiarCampo,
      agregarAdjunto,
      quitarAdjunto,
      handleCancelar,
      handleVolver,
      handleIrACrearPlantilla,
      handleCerrarError,
      handleCambiarModo,
      setArchivoFicha,
      setNombreArchivoFicha,
      handleGuardar,
    },
  };
};
