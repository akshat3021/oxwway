"use client";

import { Field, inputClass } from "./ui";
import type { FieldDef } from "../_lib/resources";
import type { FormState } from "../_lib/form";

export function FormFields({
  fields,
  state,
  errors,
  onChange,
  idPrefix,
  disabled,
  lockedFields,
}: {
  fields: FieldDef[];
  state: FormState;
  errors: Record<string, string>;
  onChange: (name: string, value: string) => void;
  idPrefix: string;
  disabled?: boolean;
  /** Fields shown read-only with an explanation (e.g. publish state for editors). */
  lockedFields?: Record<string, string>;
}) {
  return (
    <div className="grid grid-cols-1 gap-5">
      {fields.map((f) => {
        const id = `${idPrefix}-${f.name}`;
        const error = errors[f.name];
        const locked = lockedFields?.[f.name];
        const common = {
          id,
          name: f.name,
          value: state[f.name] ?? "",
          disabled: disabled || !!locked,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": error ? `${id}-error` : f.help ? `${id}-help` : undefined,
          className: inputClass,
        } as const;

        let control;
        if (f.type === "textarea" || f.type === "specs" || f.type === "urls") {
          control = (
            <textarea
              {...common}
              rows={f.rows ?? 4}
              maxLength={f.maxLength ? f.maxLength * 2 : undefined}
              placeholder={f.placeholder}
              spellCheck={f.type === "textarea"}
              onChange={(e) => onChange(f.name, e.target.value)}
            />
          );
        } else if (f.type === "select") {
          control = (
            <select {...common} onChange={(e) => onChange(f.name, e.target.value)}>
              {f.options?.map((o) => (
                <option key={o.value} value={o.value} className="bg-surface">{o.label}</option>
              ))}
            </select>
          );
        } else {
          const type = f.type === "number" ? "number" : f.type === "datetime" ? "datetime-local" : f.type === "url" ? "text" : "text";
          control = (
            <input
              {...common}
              type={type}
              inputMode={f.type === "number" ? "numeric" : f.type === "url" ? "url" : undefined}
              maxLength={f.maxLength ? f.maxLength * 2 : undefined}
              placeholder={f.placeholder}
              autoComplete="off"
              onChange={(e) => onChange(f.name, e.target.value)}
            />
          );
        }

        return (
          <Field key={f.name} label={f.label} htmlFor={id} error={error} help={locked ?? f.help} required={f.required}>
            {control}
          </Field>
        );
      })}
    </div>
  );
}
