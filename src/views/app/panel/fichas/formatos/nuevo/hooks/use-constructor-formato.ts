"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  useCreateFormatoMutation,
  useGetFormatoById,
  useUpdateFormatoMutation,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import { UpdateFormatoFichaRequest } from "@/models/requests";
import {
  CompletadoPor,
  TipoCampoFormato,
  TipoDocumentoClinico,
} from "@/models/responses";

export interface CampoBorrador {
  id: string;
  nombre: string;
  tipo: TipoCampoFormato;
  obligatorio: boolean;
  opciones: string[];
  completadoPor: CompletadoPor;
}

export interface SeccionBorrador {
  id: string;
  nombre: string;
  campos: CampoBorrador[];
}

let contadorId = 0;
function idUnico(prefijo: string): string {
  contadorId += 1;
  return `${prefijo}-${Date.now()}-${contadorId}`;
}

function campoNuevo(): CampoBorrador {
  return {
    id: idUnico("campo"),
    nombre: "",
    tipo: "TextoCorto",
    obligatorio: false,
    opciones: [],
    completadoPor: "Profesional",
  };
}

function seccionNueva(): SeccionBorrador {
  return {
    id: idUnico("seccion"),
    nombre: "Nueva sección",
    campos: [campoNuevo()],
  };
}

export const TIPOS_CAMPO: { valor: TipoCampoFormato; etiqueta: string }[] = [
  { valor: "TextoCorto", etiqueta: "Texto corto" },
  { valor: "TextoLargo", etiqueta: "Texto largo" },
  { valor: "Numerico", etiqueta: "Numérico" },
  { valor: "Fecha", etiqueta: "Fecha" },
  { valor: "Seleccion", etiqueta: "Selección" },
  { valor: "TextoInformativo", etiqueta: "Texto informativo" },
];

export const TIPOS_DOCUMENTO: {
  valor: TipoDocumentoClinico;
  etiqueta: string;
}[] = [
  { valor: "FichaClinica", etiqueta: "Ficha clínica" },
  { valor: "Recomendacion", etiqueta: "Recomendaciones" },
  { valor: "Consentimiento", etiqueta: "Consentimiento informado" },
];

export const COMPLETADO_POR: { valor: CompletadoPor; etiqueta: string }[] = [
  { valor: "Profesional", etiqueta: "La profesional" },
  { valor: "Paciente", etiqueta: "El paciente" },
];

function mover<T>(lista: T[], indice: number, direccion: -1 | 1): T[] {
  const destino = indice + direccion;
  if (destino < 0 || destino >= lista.length) return lista;
  const copia = [...lista];
  [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
  return copia;
}

export const useConstructorFormato = () => {
  const router = useRouter();
  const [nombreFormato, setNombreFormato] = useState("");
  const [tipoDocumento, setTipoDocumento] =
    useState<TipoDocumentoClinico>("FichaClinica");
  const [requiereFirmaPaciente, setRequiereFirmaPaciente] = useState(false);
  const [requiereFirmaProfesional, setRequiereFirmaProfesional] =
    useState(false);
  const [secciones, setSecciones] = useState<SeccionBorrador[]>([
    seccionNueva(),
  ]);
  const [errorNombre, setErrorNombre] = useState<string | undefined>();
  const [errorSecciones, setErrorSecciones] = useState<string | undefined>();
  const [errorGuardado, setErrorGuardado] = useState<string | undefined>();
  const [confirmacionPendiente, setConfirmacionPendiente] = useState<
    string | null
  >(null);
  const [seccionAEliminar, setSeccionAEliminar] = useState<string | null>(null);
  const [fichasDelFormatoEditado, setFichasDelFormatoEditado] = useState(0);

  const [draggedCampo, setDraggedCampo] = useState<{
    seccionId: string;
    index: number;
  } | null>(null);
  const [draggedSeccionIndex, setDraggedSeccionIndex] = useState<number | null>(
    null
  );

  const searchParams = useSearchParams();
  const idEditado = Number(searchParams.get("editar")) || null;

  const { data: formatoEditado } = useGetFormatoById(
    idEditado ?? 0,
    Boolean(idEditado)
  );
  const crearMutation = useCreateFormatoMutation();
  const actualizarMutation = useUpdateFormatoMutation();

  useEffect(() => {
    if (!formatoEditado) return;
    setFichasDelFormatoEditado(formatoEditado.fichasAsociadas);
    setNombreFormato(formatoEditado.nombre);
    setTipoDocumento(formatoEditado.tipo);
    setRequiereFirmaPaciente(formatoEditado.requiereFirmaPaciente);
    setRequiereFirmaProfesional(formatoEditado.requiereFirmaProfesional);
    const seccionesGuardadas = formatoEditado.cuerpo?.secciones ?? [];
    if (seccionesGuardadas.length > 0) {
      setSecciones(
        seccionesGuardadas.map(s => ({
          id: s.id,
          nombre: s.nombre,
          campos: s.campos.map(c => ({
            id: c.id,
            nombre: c.nombre,
            tipo: c.tipo,
            obligatorio: c.obligatorio,
            opciones: c.opciones || [],
            completadoPor: c.completadoPor ?? "Profesional",
          })),
        }))
      );
    }
  }, [formatoEditado]);

  function actualizarSeccion(id: string, cambios: Partial<SeccionBorrador>) {
    setSecciones(prev =>
      prev.map(s => (s.id === id ? { ...s, ...cambios } : s))
    );
  }

  function actualizarCampo(
    seccionId: string,
    campoId: string,
    cambios: Partial<CampoBorrador>
  ) {
    setSecciones(prev =>
      prev.map(s =>
        s.id !== seccionId
          ? s
          : {
              ...s,
              campos: s.campos.map(c =>
                c.id === campoId ? { ...c, ...cambios } : c
              ),
            }
      )
    );
  }

  function agregarCampo(seccionId: string) {
    setSecciones(prev =>
      prev.map(s =>
        s.id === seccionId ? { ...s, campos: [...s.campos, campoNuevo()] } : s
      )
    );
  }

  function quitarCampo(seccionId: string, campoId: string) {
    setSecciones(prev =>
      prev.map(s =>
        s.id === seccionId
          ? { ...s, campos: s.campos.filter(c => c.id !== campoId) }
          : s
      )
    );
  }

  function moverCampo(seccionId: string, indice: number, direccion: -1 | 1) {
    setSecciones(prev =>
      prev.map(s =>
        s.id === seccionId
          ? { ...s, campos: mover(s.campos, indice, direccion) }
          : s
      )
    );
  }

  function moverSeccion(indice: number, direccion: -1 | 1) {
    setSecciones(prev => mover(prev, indice, direccion));
  }

  function moverCampoDirecto(
    fromSeccionId: string,
    fromIndex: number,
    toSeccionId: string,
    toIndex: number
  ) {
    setSecciones(prev => {
      const copia = prev.map(s => ({ ...s, campos: [...s.campos] }));
      const sourceSec = copia.find(s => s.id === fromSeccionId);
      const destSec = copia.find(s => s.id === toSeccionId);
      if (!sourceSec || !destSec) return prev;

      const [campoRemovido] = sourceSec.campos.splice(fromIndex, 1);
      if (!campoRemovido) return prev;

      destSec.campos.splice(toIndex, 0, campoRemovido);
      return copia;
    });
  }

  function moverSeccionDirecto(fromIndex: number, toIndex: number) {
    setSecciones(prev => {
      if (
        fromIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex < 0 ||
        toIndex >= prev.length
      )
        return prev;
      const copia = [...prev];
      const [seccionRemovida] = copia.splice(fromIndex, 1);
      copia.splice(toIndex, 0, seccionRemovida);
      return copia;
    });
  }

  function eliminarSeccionConfirmado() {
    setSecciones(prev => prev.filter(s => s.id !== seccionAEliminar));
    setSeccionAEliminar(null);
  }

  function agregarSeccion() {
    setSecciones(prev => [...prev, seccionNueva()]);
  }

  function construirPeticion(): UpdateFormatoFichaRequest {
    return {
      nombre: nombreFormato.trim(),
      tipo: tipoDocumento,
      cuerpo: {
        secciones: secciones.map((s, indiceSeccion) => ({
          id: s.id,
          nombre: s.nombre,
          orden: indiceSeccion,
          campos: s.campos.map((c, indiceCampo) => ({
            id: c.id,
            nombre: c.nombre,
            tipo: c.tipo,
            obligatorio: c.obligatorio,
            opciones: c.opciones,
            completadoPor: c.completadoPor,
            orden: indiceCampo,
          })),
        })),
      },
      requiereFirmaPaciente,
      requiereFirmaProfesional,
    };
  }

  async function guardar(confirmar: boolean) {
    const peticion = construirPeticion();
    if (idEditado) {
      await actualizarMutation.mutateAsync({
        id: idEditado,
        data: peticion,
        confirmar,
      });
    } else {
      await crearMutation.mutateAsync({
        ...peticion,
        cuerpo: peticion.cuerpo!,
      });
    }
    router.push("/panel/fichas/formatos");
  }

  async function alGuardar() {
    let valido = true;
    if (!nombreFormato.trim()) {
      setErrorNombre("El formato debe tener un nombre.");
      valido = false;
    } else {
      setErrorNombre(undefined);
    }
    if (
      secciones.length === 0 ||
      secciones.some(s => s.campos.length === 0 || !s.nombre.trim())
    ) {
      setErrorSecciones(
        "Cada sección debe tener nombre y al menos un campo con nombre."
      );
      valido = false;
    } else if (secciones.some(s => s.campos.some(c => !c.nombre.trim()))) {
      setErrorSecciones("Todos los campos deben tener un nombre.");
      valido = false;
    } else {
      setErrorSecciones(undefined);
    }
    if (!valido) return;

    setErrorGuardado(undefined);
    try {
      await guardar(false);
    } catch (err: unknown) {
      const error = handleApiError(err);
      // El servidor avisa que el formato ya se usó: se pide confirmación.
      if (error.details === "FORMATO_EN_USO") {
        setConfirmacionPendiente(error.message);
        return;
      }
      setErrorGuardado(error.message);
    }
  }

  async function confirmarGuardado() {
    setConfirmacionPendiente(null);
    setErrorGuardado(undefined);
    try {
      await guardar(true);
    } catch (err: unknown) {
      setErrorGuardado(handleApiError(err).message);
    }
  }

  const handleVolver = () => router.push("/panel/fichas/formatos");
  const handleCancelar = () => router.push("/panel/fichas/formatos");

  const seccionEnBorrado = secciones.find(s => s.id === seccionAEliminar);

  return {
    // Data
    nombreFormato,
    tipoDocumento,
    requiereFirmaPaciente,
    requiereFirmaProfesional,
    secciones,
    errorNombre,
    errorSecciones,
    errorGuardado,
    confirmacionPendiente,
    seccionAEliminar,
    fichasDelFormatoEditado,
    draggedCampo,
    draggedSeccionIndex,
    idEditado,
    seccionEnBorrado,
    guardando: crearMutation.isPending || actualizarMutation.isPending,

    // Actions
    actions: {
      setNombreFormato,
      setTipoDocumento,
      setRequiereFirmaPaciente,
      setRequiereFirmaProfesional,
      setSeccionAEliminar,
      setConfirmacionPendiente,
      setDraggedCampo,
      setDraggedSeccionIndex,
      actualizarSeccion,
      actualizarCampo,
      agregarCampo,
      quitarCampo,
      moverCampo,
      moverSeccion,
      moverCampoDirecto,
      moverSeccionDirecto,
      eliminarSeccionConfirmado,
      agregarSeccion,
      alGuardar,
      confirmarGuardado,
      handleVolver,
      handleCancelar,
    },
  };
};
