"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  useAbrirArchivoPlantillaMutation,
  useCrearPlantillaConsentimientoMutation,
  useCrearPlantillaFichaMutation,
  useCrearPlantillaRecomendacionMutation,
  useGetPlantillaById,
  useImportarPlantillaConsentimientoMutation,
  useImportarPlantillaRecomendacionMutation,
  useUpdatePlantillaMutation,
} from "@/hooks/api";
import { handleApiError } from "@/lib/api";
import { CATALOGO_TIPOS_DOCUMENTO } from "@/lib/estados-documento";
import { UpdatePlantillaRequest } from "@/models/requests";
import {
  CompletadoPor,
  TipoCampoFormato,
  TipoDocumentoClinico,
} from "@/models/responses";

interface CampoBorrador {
  id: string;
  nombre: string;
  tipo: TipoCampoFormato;
  obligatorio: boolean;
  opciones: string[];
  completadoPor: CompletadoPor;
}

interface SeccionBorrador {
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
    nombre: "Nueva Sección",
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
  { valor: "Firma", etiqueta: "Firma" },
];

export const TIPOS_DOCUMENTO: {
  valor: TipoDocumentoClinico;
  etiqueta: string;
}[] = (
  Object.entries(CATALOGO_TIPOS_DOCUMENTO) as [TipoDocumentoClinico, string][]
).map(([valor, etiqueta]) => ({ valor, etiqueta }));

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

export type ModoConstruccion = "elegir" | "campos" | "archivo";

export const useConstructorPlantilla = () => {
  const router = useRouter();
  const [nombrePlantilla, setNombrePlantilla] = useState("");
  const [tipoDocumento, setTipoDocumento] =
    useState<TipoDocumentoClinico>("FichaClinica");
  const [modo, setModo] = useState<ModoConstruccion>("campos");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string | undefined>();
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
  const [documentosDeLaPlantillaEditada, setDocumentosDeLaPlantillaEditada] =
    useState(0);
  const [urlArchivoActual, setUrlArchivoActual] = useState<string | null>(null);

  const [draggedCampo, setDraggedCampo] = useState<{
    seccionId: string;
    index: number;
  } | null>(null);
  const [draggedSeccionIndex, setDraggedSeccionIndex] = useState<number | null>(
    null
  );

  const searchParams = useSearchParams();
  const idEditado = Number(searchParams.get("editar")) || null;

  const { data: plantillaEditada } = useGetPlantillaById(
    idEditado ?? 0,
    Boolean(idEditado)
  );
  const crearFichaMutation = useCrearPlantillaFichaMutation();
  const crearConsentimientoMutation = useCrearPlantillaConsentimientoMutation();
  const crearRecomendacionMutation = useCrearPlantillaRecomendacionMutation();
  const actualizarMutation = useUpdatePlantillaMutation();
  const importarConsentimientoMutation =
    useImportarPlantillaConsentimientoMutation();
  const importarRecomendacionMutation =
    useImportarPlantillaRecomendacionMutation();
  const abrirArchivoMutation = useAbrirArchivoPlantillaMutation();

  function cambiarTipoDocumento(tipo: TipoDocumentoClinico) {
    setTipoDocumento(tipo);
    setModo(tipo === "FichaClinica" ? "campos" : "elegir");
    setArchivo(null);
    setErrorArchivo(undefined);
    setErrorGuardado(undefined);
  }

  function elegirModo(nuevoModo: ModoConstruccion) {
    setModo(nuevoModo);
    setErrorGuardado(undefined);
    setErrorArchivo(undefined);
  }

  useEffect(() => {
    if (!plantillaEditada) return;
    setDocumentosDeLaPlantillaEditada(plantillaEditada.documentosAsociados);
    setNombrePlantilla(plantillaEditada.nombre);
    setTipoDocumento(plantillaEditada.tipo);
    setModo(plantillaEditada.origen === "Documento" ? "archivo" : "campos");
    setRequiereFirmaPaciente(plantillaEditada.requiereFirmaPaciente);
    setRequiereFirmaProfesional(plantillaEditada.requiereFirmaProfesional);
    const seccionesGuardadas = plantillaEditada.cuerpo?.secciones ?? [];
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
  }, [plantillaEditada]);

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

  function construirCuerpo() {
    return {
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
    };
  }

  async function guardar(confirmar: boolean) {
    const nombre = nombrePlantilla.trim();

    if (idEditado) {
      const peticion: UpdatePlantillaRequest = {
        nombre,
        requiereFirmaPaciente,
        requiereFirmaProfesional,
        ...(modo === "campos" ? { cuerpo: construirCuerpo() } : {}),
      };
      await actualizarMutation.mutateAsync({
        id: idEditado,
        data: peticion,
        confirmar,
      });
    } else if (modo === "archivo") {
      if (!archivo) return;
      if (tipoDocumento === "Consentimiento") {
        await importarConsentimientoMutation.mutateAsync({
          archivo,
          nombre,
          requiereFirmaPaciente: true,
          requiereFirmaProfesional,
        });
      } else {
        await importarRecomendacionMutation.mutateAsync({ archivo, nombre });
      }
    } else if (tipoDocumento === "FichaClinica") {
      await crearFichaMutation.mutateAsync({
        nombre,
        cuerpo: construirCuerpo(),
      });
    } else if (tipoDocumento === "Consentimiento") {
      await crearConsentimientoMutation.mutateAsync({
        nombre,
        cuerpo: construirCuerpo(),
        requiereFirmaPaciente,
        requiereFirmaProfesional,
        servicios: [],
      });
    } else {
      await crearRecomendacionMutation.mutateAsync({
        nombre,
        cuerpo: construirCuerpo(),
        servicios: [],
      });
    }
    router.push("/panel/documentos/plantillas");
  }

  async function alGuardar() {
    let valido = true;
    if (!nombrePlantilla.trim()) {
      setErrorNombre("La plantilla debe tener un nombre.");
      valido = false;
    } else {
      setErrorNombre(undefined);
    }

    if (modo === "archivo") {
      setErrorSecciones(undefined);
      if (!archivo) {
        setErrorArchivo("Debes adjuntar un archivo PDF.");
        valido = false;
      } else {
        setErrorArchivo(undefined);
      }
    } else {
      setErrorArchivo(undefined);
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
    }
    if (!valido) return;

    setErrorGuardado(undefined);
    try {
      await guardar(false);
    } catch (err: unknown) {
      const error = handleApiError(err);
      // El servidor avisa que la plantilla ya se usó: se pide confirmación.
      if (error.details === "PLANTILLA_EN_USO") {
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

  const handleVolver = () => router.push("/panel/documentos/plantillas");
  const handleCancelar = () => router.push("/panel/documentos/plantillas");

  async function handleAbrirArchivoActual() {
    if (!idEditado) return;
    const blob = await abrirArchivoMutation.mutateAsync(idEditado);
    window.open(URL.createObjectURL(blob), "_blank");
  }

  async function handleVerArchivoActualAqui() {
    if (urlArchivoActual) {
      setUrlArchivoActual(null);
      return;
    }
    if (!idEditado) return;
    const blob = await abrirArchivoMutation.mutateAsync(idEditado);
    setUrlArchivoActual(URL.createObjectURL(blob));
  }

  const seccionEnBorrado = secciones.find(s => s.id === seccionAEliminar);

  return {
    nombrePlantilla,
    tipoDocumento,
    modo,
    archivo,
    errorArchivo,
    requiereFirmaPaciente,
    requiereFirmaProfesional,
    secciones,
    errorNombre,
    errorSecciones,
    errorGuardado,
    confirmacionPendiente,
    seccionAEliminar,
    documentosDeLaPlantillaEditada,
    draggedCampo,
    draggedSeccionIndex,
    idEditado,
    seccionEnBorrado,
    urlArchivoActual,
    guardando:
      crearFichaMutation.isPending ||
      crearConsentimientoMutation.isPending ||
      crearRecomendacionMutation.isPending ||
      importarConsentimientoMutation.isPending ||
      importarRecomendacionMutation.isPending ||
      actualizarMutation.isPending,

    actions: {
      setNombrePlantilla,
      cambiarTipoDocumento,
      elegirModo,
      setArchivo,
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
      handleAbrirArchivoActual,
      handleVerArchivoActualAqui,
    },
  };
};
