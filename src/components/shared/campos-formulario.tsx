import {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  useId,
} from "react";

import { Input, Label, Textarea } from "@/components/ui";

const CLASE_CONTROL =
  "w-full rounded-none border border-slate-200 bg-white px-3 py-2 text-xs font-sans text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 focus-visible:border-slate-900 transition-colors shadow-none h-auto";

function Etiqueta({
  texto,
  obligatorio,
  htmlFor,
}: {
  texto: string;
  obligatorio?: boolean;
  htmlFor?: string;
}) {
  if (!texto) return null;
  return (
    <Label
      htmlFor={htmlFor}
      className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-sans"
    >
      {texto}
      {obligatorio && <span className="text-red-600 ml-0.5">*</span>}
    </Label>
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
      <Input id={inputId} type="text" className={CLASE_CONTROL} {...props} />
      {ayuda && !error && (
        <p className="mt-1 text-xs text-slate-500 font-sans">{ayuda}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600 font-sans">{error}</p>}
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
      <Input id={inputId} type="number" className={CLASE_CONTROL} {...props} />
      {ayuda && !error && (
        <p className="mt-1 text-xs text-slate-500 font-sans">{ayuda}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600 font-sans">{error}</p>}
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
      <Textarea
        id={inputId}
        rows={3}
        className={`${CLASE_CONTROL} ${className}`}
        {...props}
      />
      {ayuda && !error && (
        <p className="mt-1 text-xs text-slate-500 font-sans">{ayuda}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600 font-sans">{error}</p>}
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
      {ayuda && !error && (
        <p className="mt-1 text-xs text-slate-500 font-sans">{ayuda}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600 font-sans">{error}</p>}
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
    <label
      htmlFor={inputId}
      className="inline-flex items-center gap-2 cursor-pointer select-none font-sans"
    >
      <span
        className={`relative inline-flex h-5 w-10 items-center rounded-none transition-colors ${
          checked ? "bg-[#003366]" : "bg-slate-300"
        }`}
      >
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="peer absolute inset-0 opacity-0 cursor-pointer focus-visible:outline-none"
        />
        <span
          className={`inline-block h-3.5 w-3.5 transform bg-white transition-transform peer-focus-visible:ring-1 peer-focus-visible:ring-[#003366] ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </span>
      <span className="text-xs font-semibold text-slate-900">{etiqueta}</span>
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
    <div className="font-sans">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <Input
          type="search"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${CLASE_CONTROL} pl-9`}
        />
      </div>
      {ayuda && (
        <p className="mt-1 text-xs text-slate-500 font-sans">{ayuda}</p>
      )}
    </div>
  );
}
