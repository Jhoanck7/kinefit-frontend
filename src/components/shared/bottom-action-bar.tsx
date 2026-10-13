import { ReactNode } from "react";

/** Barra de acciones inferior del panel, con abandono a la izquierda y volver/avanzar a la derecha */
export function BottomActionBar({
  abandono,
  volver,
  avanzar,
}: {
  abandono?: ReactNode;
  volver?: ReactNode;
  avanzar?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-t border-brand-border pt-6 mt-8">
      <div>{abandono}</div>
      <div className="flex items-center gap-3">
        {volver}
        {avanzar}
      </div>
    </div>
  );
}
