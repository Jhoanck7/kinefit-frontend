import Image from "next/image";

import { Alerta, Modal } from "@/components/shared";
import { Button } from "@/components/ui";
import { EspecialistaResponse } from "@/models/responses";

interface EliminarEspecialistaModalProps {
  especialista: EspecialistaResponse | null;
  onCancelar: () => void;
  onConfirmar: () => void;
  eliminando: boolean;
}

export function EliminarEspecialistaModal({
  especialista,
  onCancelar,
  onConfirmar,
  eliminando,
}: EliminarEspecialistaModalProps) {
  return (
    <Modal abierto={!!especialista} onCerrar={onCancelar}>
      {especialista && (
        <div className="p-6 space-y-6 text-center">
          <div>
            <h2 className="font-sans text-section-title font-bold text-foreground mb-2">
              ¿Eliminar Especialista?
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Estás a punto de eliminar a{" "}
              <span className="font-bold text-foreground">
                {especialista.nombre}
              </span>{" "}
              ({especialista.cargo}) del sistema.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-none text-left">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
              {especialista.fotoUrl ? (
                <Image
                  src={especialista.fotoUrl}
                  alt={especialista.nombre}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold">
                  {especialista.nombre.charAt(0)}
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-foreground text-sm truncate">
                {especialista.nombre}
              </p>
              <p className="text-xs text-primary font-medium truncate">
                {especialista.cargo}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {especialista.email || "Sin correo"}
              </p>
            </div>
          </div>

          <Alerta tono="advertencia" className="text-left">
            <span className="font-bold">Nota Importante:</span> Esta acción
            eliminará su registro de la base de datos. Si el especialista posee
            citas asociadas, te recomendamos cancelar el borrado y simplemente{" "}
            <span className="font-bold underline">Desactivarlo</span>.
          </Alerta>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              className="rounded-overlay"
              onClick={onCancelar}
              disabled={eliminando}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-overlay"
              onClick={onConfirmar}
              disabled={eliminando}
            >
              {eliminando ? "Eliminando…" : "Sí, Eliminar Especialista"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
