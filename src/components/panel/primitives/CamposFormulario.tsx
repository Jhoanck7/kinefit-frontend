import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, useId } from "react";

const CLASE_CONTROL =
  "w-full rounded-lg border border-brand-border bg-white px-3.5 py-2.5 text-sm text-panel-sidebar placeholder:text-brand-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-panel-sidebar focus-visible:border-panel-sidebar transition-colors";

function Etiqueta({ texto, obligatorio, htmlFor }: { texto: string; obligatorio?: boolean; htmlFor?: string }) {
  if (!texto) return null;
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-panel-sidebar mb-1.5">
      {texto}
      {obligatorio && <span className="text-red-600 ml-0.5">*</span>}
    </label>
  );
}

interface CampoBaseProps {
  etiqueta: string;
  obligatorio?: boolean;
  ayuda?: string;
  error?: string;
}

export function TextField({
  etiqueta,
  obligatorio,
  ayuda,
  error,
  id,
  ...props
}: CampoBaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const inputId = id ?? etiqueta.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <Etiqueta texto={etiqueta} obligatorio={obligatorio} htmlFor={inputId} />
      <input id={inputId} type="text" className={CLASE_CONTROL} {...props} />
      {ayuda && !error && <p className="mt-1 text-xs text-brand-muted">{ayuda}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function NumberField({
  etiqueta,
  obligatorio,
  ayuda,
  error,
  id,
  ...props
}: CampoBaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const inputId = id ?? etiqueta.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <Etiqueta texto={etiqueta} obligatorio={obligatorio} htmlFor={inputId} />
      <input id={inputId} type="number" className={CLASE_CONTROL} {...props} />
      {ayuda && !error && <p className="mt-1 text-xs text-brand-muted">{ayuda}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function TextAreaField({
  etiqueta,
  obligatorio,
  ayuda,
  error,
  id,
  className = "",
  ...props
}: CampoBaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const inputId = id ?? etiqueta.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <Etiqueta texto={etiqueta} obligatorio={obligatorio} htmlFor={inputId} />
      <textarea id={inputId} rows={3} className={`${CLASE_CONTROL} ${className}`} {...props} />
      {ayuda && !error && <p className="mt-1 text-xs text-brand-muted">{ayuda}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function SelectField({
  etiqueta,
  obligatorio,
  ayuda,
  error,
  id,
  children,
  ...props
}: CampoBaseProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const inputId = id ?? etiqueta.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <Etiqueta texto={etiqueta} obligatorio={obligatorio} htmlFor={inputId} />
      <select id={inputId} className={CLASE_CONTROL} {...props}>
        {children}
      </select>
      {ayuda && !error && <p className="mt-1 text-xs text-brand-muted">{ayuda}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function SwitchField({
  etiqueta,
  checked,
  onChange,
  id,
}: {
  etiqueta: string;
  checked: boolean;
  onChange: (valor: boolean) => void;
  id?: string;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <label htmlFor={inputId} className="inline-flex items-center gap-2 cursor-pointer select-none">
      <span
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-panel-sidebar" : "bg-slate-300"
        }`}
      >
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 opacity-0 cursor-pointer focus-visible:outline-none"
        />
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-panel-sidebar ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
      <span className="text-sm font-medium text-panel-sidebar">{etiqueta}</span>
    </label>
  );
}

export function SearchInput({
  placeholder,
  value,
  onChange,
  ayuda,
}: {
  placeholder: string;
  value: string;
  onChange: (valor: string) => void;
  ayuda?: string;
}) {
  return (
    <div>
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${CLASE_CONTROL} pl-10`}
        />
      </div>
      {ayuda && <p className="mt-1 text-xs text-brand-muted">{ayuda}</p>}
    </div>
  );
}
