"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { Alerta, EmptyState, SwitchField } from "@/components/shared";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";

import { PersonalModal } from "./components";
import { usePersonal } from "./hooks";

export default function PersonalView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const yaAplicoPrefill = useRef(false);

  const {
    usuarios,
    cargando,
    mostrarModal,
    usuarioEditando,
    nombre,
    email,
    rol,
    especialistaId,
    password,
    error,
    errorEstado,
    guardando,
    actualizandoEstadoId,
    actions,
  } = usePersonal();

  useEffect(() => {
    if (yaAplicoPrefill.current) return;
    const especialistaIdParam = searchParams.get("crearParaEspecialista");
    if (!especialistaIdParam) return;

    yaAplicoPrefill.current = true;
    actions.handleAbrirCrear({
      especialistaId: Number(especialistaIdParam),
      nombre: searchParams.get("nombre") ?? undefined,
    });
    router.replace("/panel/configuracion?tab=personal");
  }, [searchParams, router, actions]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-sans text-section-title font-bold text-foreground">
            Cuentas de Personal
          </h2>
          <p className="font-sans text-xs text-slate-500 mt-0.5">
            Accesos individuales al panel. Cada cuenta usa su propio correo y
            contraseña, sin cuentas compartidas.
          </p>
        </div>
        <Button
          className="rounded-overlay"
          onClick={() => actions.handleAbrirCrear()}
        >
          Nueva Cuenta
        </Button>
      </div>

      {errorEstado && <Alerta tono="error">{errorEstado}</Alerta>}

      {cargando ? (
        <p className="text-xs text-slate-500 py-8 text-center">
          Cargando cuentas…
        </p>
      ) : usuarios.length === 0 ? (
        <EmptyState
          titulo="Sin Cuentas de Personal"
          descripcion="Aún no se ha creado ninguna cuenta de acceso al panel."
          accion={
            <Button
              className="rounded-overlay"
              onClick={() => actions.handleAbrirCrear()}
            >
              Crear Primera Cuenta
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-none border border-slate-200 shadow-none font-sans">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow className="hover:bg-transparent border-b-0">
                <TableHead className="px-4 py-3 text-table-head font-bold text-muted-foreground whitespace-nowrap">
                  Nombre
                </TableHead>
                <TableHead className="px-4 py-3 text-table-head font-bold text-muted-foreground whitespace-nowrap">
                  Correo
                </TableHead>
                <TableHead className="px-4 py-3 text-table-head font-bold text-muted-foreground whitespace-nowrap">
                  Rol
                </TableHead>
                <TableHead className="px-4 py-3 text-table-head font-bold text-muted-foreground whitespace-nowrap">
                  Estado
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-200 bg-white">
              {usuarios.map(usuario => (
                <TableRow key={usuario.id} className="hover:bg-slate-50/70">
                  <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                    {usuario.nombre}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                    {usuario.email}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-normal text-table-cell text-foreground">
                    {usuario.rol}
                    {usuario.especialistaNombre && (
                      <span className="text-slate-400">
                        , {usuario.especialistaNombre}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <SwitchField
                      etiqueta={usuario.activo ? "Activo" : "Inactivo"}
                      checked={usuario.activo}
                      onChange={() => actions.handleToggleEstado(usuario)}
                    />
                    {actualizandoEstadoId === usuario.id && (
                      <span className="ml-2 text-[11px] text-slate-400">
                        Guardando…
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => actions.handleAbrirEditar(usuario)}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Editar
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PersonalModal
        abierto={mostrarModal}
        onCerrar={actions.handleCerrarModal}
        usuarioEditando={usuarioEditando}
        nombre={nombre}
        email={email}
        rol={rol}
        especialistaId={especialistaId}
        password={password}
        error={error}
        guardando={guardando}
        onNombreChange={actions.setNombre}
        onEmailChange={actions.setEmail}
        onRolChange={actions.setRol}
        onEspecialistaIdChange={actions.setEspecialistaId}
        onPasswordChange={actions.setPassword}
        onSubmit={actions.handleGuardar}
      />
    </div>
  );
}
