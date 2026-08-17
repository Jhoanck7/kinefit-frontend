"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useGetFormatoById, useGuardarFormatoMutation } from "@/hooks/api";
import { TipoCampoFormato } from "@/models/responses";

export interface CampoBorrador {
  id: string;
  nombre: string;
  tipo: TipoCampoFormato;
  obligatorio: boolean;
  opciones: string[];
}

export interface SeccionBorrador {
  id: string;
  nombre: string;
  campos: CampoBorrador[];
}

let contadorId = 0;
function idUnico(prefijo: string): string {
  contadorId += 1;
  return `${prefijo}-${contadorId}`;
}

function campoNuevo(): CampoBorrador {
  return {
    id: idUnico("campo"),
    nombre: "",
    tipo: "texto_corto",
    obligatorio: false,
    opciones: [],
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
  { valor: "texto_corto", etiqueta: "Texto corto" },
  { valor: "texto_largo", etiqueta: "Texto largo" },
  { valor: "numerico", etiqueta: "Numérico" },
  { valor: "fecha", etiqueta: "Fecha" },
  { valor: "seleccion", etiqueta: "Selección" },
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
  const [secciones, setSecciones] = useState<SeccionBorrador[]>([
    seccionNueva(),
  ]);
  const [errorNombre, setErrorNombre] = useState<string | undefined>();
  const [errorSecciones, setErrorSecciones] = useState<string | undefined>();
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
  const idEditado = searchParams.get("editar");

  const { data: formatoEditado } = useGetFormatoById(
    idEditado ?? "",
    Boolean(idEditado)
  );
  const guardarFormatoMutation = useGuardarFormatoMutation();

  useEffect(() => {
    if (!formatoEditado) return;
    setFichasDelFormatoEditado(formatoEditado.fichasCreadas);
    setNombreFormato(formatoEditado.nombre);
    if (formatoEditado.secciones && formatoEditado.secciones.length > 0) {
      setSecciones(
        formatoEditado.secciones.map(s => ({
          id: s.id,
          nombre: s.nombre,
          campos: s.campos.map(c => ({
            id: c.id,
            nombre: c.nombre,
            tipo: c.tipo,
            obligatorio: c.obligatorio,
            opciones: c.opciones || [],
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
    if (valido) {
      const formatoIdCalculado = idEditado || `fmt-${Date.now()}`;
      await guardarFormatoMutation.mutateAsync({
        id: formatoIdCalculado,
        nombre: nombreFormato.trim(),
        secciones: secciones.map(s => ({
          id: s.id,
          nombre: s.nombre,
          campos: s.campos.map(c => ({
            id: c.id,
            nombre: c.nombre,
            tipo: c.tipo,
            obligatorio: c.obligatorio,
            opciones: c.opciones,
          })),
        })),
      });
      router.push("/panel/fichas/formatos");
    }
  }

  const handleVolver = () => router.push("/panel/fichas/formatos");
  const handleCancelar = () => router.push("/panel/fichas/formatos");

  const seccionEnBorrado = secciones.find(s => s.id === seccionAEliminar);

  return {
    // Data
    nombreFormato,
    secciones,
    errorNombre,
    errorSecciones,
    seccionAEliminar,
    fichasDelFormatoEditado,
    draggedCampo,
    draggedSeccionIndex,
    idEditado,
    seccionEnBorrado,

    // Actions
    actions: {
      setNombreFormato,
      setSeccionAEliminar,
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
      handleVolver,
      handleCancelar,
    },
  };
};
