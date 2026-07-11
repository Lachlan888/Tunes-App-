"use client"

import { useMemo, useState } from "react"
import {
  formatKeyValue,
  KEY_ROOTS,
  parseKeyValue,
  type KeyRoot,
  type KeyTonality,
} from "@/lib/music/keys"

type KeyPickerFieldProps = {
  name: string
  label: string
  defaultValue?: string | null
  required?: boolean
  disabled?: boolean
  placeholder?: string
  helperText?: string
  className?: string
}

const tonalityOptions: Array<{ value: KeyTonality; label: string }> = [
  { value: "major", label: "Major" },
  { value: "minor", label: "Minor" },
  { value: "modal", label: "Modal" },
]

export default function KeyPickerField({
  name,
  label,
  defaultValue = null,
  required = false,
  disabled = false,
  placeholder = "Select key",
  helperText,
  className = "",
}: KeyPickerFieldProps) {
  const parsedDefault = useMemo(() => parseKeyValue(defaultValue), [defaultValue])
  const [root, setRoot] = useState<KeyRoot | "">(parsedDefault?.root ?? "")
  const [tonality, setTonality] = useState<KeyTonality>(
    parsedDefault?.tonality ?? "major"
  )

  const value = root ? formatKeyValue(root, tonality) : ""
  const hasUnsupportedDefault = Boolean(defaultValue) && !parsedDefault

  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>

      <input
        type="hidden"
        name={name}
        value={value}
        required={required}
        disabled={disabled}
      />

      <div className="rounded-2xl border border-border bg-background/70 p-3 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Root
            </span>
            <select
              value={root}
              disabled={disabled}
              onChange={(event) => setRoot(event.target.value as KeyRoot | "")}
              className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground outline-none transition focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">{placeholder}</option>
              {KEY_ROOTS.map((keyRoot) => (
                <option key={keyRoot} value={keyRoot}>
                  {keyRoot}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="grid gap-1.5" disabled={disabled || !root}>
            <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Tonality
            </legend>
            <div className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-card p-1">
              {tonalityOptions.map((option) => {
                const isSelected = tonality === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={disabled || !root}
                    onClick={() => setTonality(option.value)}
                    className={`min-h-9 rounded-lg px-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-50 ${
                      isSelected && root
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </fieldset>
        </div>

        {value ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <p className="text-sm font-medium text-foreground">{value}</p>
            {!required ? (
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  setRoot("")
                  setTonality("major")
                }}
                className="text-sm font-medium text-muted-foreground underline underline-offset-4 transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {hasUnsupportedDefault ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Current stored key: {defaultValue}. Choose a supported key to replace it.
        </p>
      ) : helperText ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
