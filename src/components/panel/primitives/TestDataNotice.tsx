/**
 * Aviso permanente y discreto de datos de prueba (DD-7, G-12). Vive en el
 * cromo del panel, visible en toda vista, para que nadie reporte "los
 * pacientes no son reales" como si fuera un defecto.
 */
export function TestDataNotice() {
  return (
    <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-6 py-1.5 text-xs text-amber-800">
      <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <span>
        Prototipo con datos de prueba. Nada de lo que ocurra aquí se guarda ni afecta información real.
      </span>
    </div>
  );
}
