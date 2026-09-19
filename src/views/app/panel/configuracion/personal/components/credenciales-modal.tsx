import { Alerta, Modal, ModalCloseButton } from "@/components/shared";
import { Button } from "@/components/ui";
import { UsuarioPersonalCreadoResponse } from "@/models/responses";

interface CredencialesModalProps {
  credenciales: UsuarioPersonalCreadoResponse | null;
  onCerrar: () => void;
}

export function CredencialesModal({
  credenciales,
  onCerrar,
}: CredencialesModalProps) {
  return (
    <Modal
      abierto={Boolean(credenciales)}
      onCerrar={onCerrar}
      ancho="sm:max-w-md"
    >
      <div className="bg-white text-foreground font-sans shadow-none rounded-overlay">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm px-6 py-4">
          <h2 className="font-sans text-section-title font-bold text-foreground">
            Cuenta Creada
          </h2>
          <ModalCloseButton onClick={onCerrar} />
        </div>

        {credenciales && (
          <div className="p-6 space-y-4">
            <Alerta tono="advertencia">{credenciales.advertencia}</Alerta>

            <div>
              <span className="font-sans text-label font-medium text-muted-foreground block mb-1">
                Correo
              </span>
              <p className="font-sans text-value font-medium text-foreground">
                {credenciales.usuario.email}
              </p>
            </div>

            <div>
              <span className="font-sans text-label font-medium text-muted-foreground block mb-1">
                Contraseña Temporal
              </span>
              <p className="font-mono text-value font-bold text-foreground select-all bg-slate-50 border border-slate-200 rounded-overlay px-3 py-2">
                {credenciales.passwordTemporal}
              </p>
            </div>

            <div className="flex justify-end border-t border-slate-200 pt-5">
              <Button className="rounded-overlay" onClick={onCerrar}>
                Entendido
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
