import type { ReactNode } from "react";

type CollabFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  icon?: ReactNode;
  required?: boolean;
};

export function CollabField({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  autoComplete,
  icon,
  required
}: CollabFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block font-pixel text-xs uppercase text-white/58">
        {label}
        {required ? <span className="text-lemon"> *</span> : null}
      </span>
      <span className="relative block">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/36">
            {icon}
          </span>
        ) : null}
        <input
          aria-invalid={Boolean(error)}
          className={`h-12 w-full rounded-2xl border bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-lemon/55 focus:ring-2 focus:ring-lemon/15 ${
            icon ? "pl-11" : ""
          } ${error ? "border-red-400/45" : "border-white/10"}`}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
      </span>
      {error ? <span className="mt-2 block text-xs text-red-300">{error}</span> : null}
    </label>
  );
}

type CollabTextareaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  minLength?: number;
  required?: boolean;
};

export function CollabTextarea({
  label,
  value,
  onChange,
  error,
  placeholder,
  minLength,
  required
}: CollabTextareaProps) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 font-pixel text-xs uppercase text-white/58">
        <span>
          {label}
          {required ? <span className="text-lemon"> *</span> : null}
        </span>
        {minLength ? (
          <span className={value.trim().length >= minLength ? "text-lemon" : "text-white/36"}>
            {value.trim().length}/{minLength}
          </span>
        ) : null}
      </span>
      <textarea
        aria-invalid={Boolean(error)}
        className={`min-h-40 w-full resize-y rounded-2xl border bg-black/30 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-lemon/55 focus:ring-2 focus:ring-lemon/15 ${
          error ? "border-red-400/45" : "border-white/10"
        }`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      {error ? <span className="mt-2 block text-xs text-red-300">{error}</span> : null}
    </label>
  );
}
