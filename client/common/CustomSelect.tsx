'use client'

import React from 'react'
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form'

type Primitive = string | number | boolean | null | undefined

// Generic props for the select component.
// TFieldValues: your form values shape used by react-hook-form
// TName: the field name within TFieldValues
// TOption: the shape of each option item
// TMatchKey: key from TOption used as the <option value> (typically an id)
export interface CustomSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOption extends Record<string, unknown> = { _id?: string; name?: Primitive } & Record<string, unknown>,
  TMatchKey extends keyof TOption = '_id' extends keyof TOption ? '_id' : keyof TOption,
> {
  name: TName
  label?: string
  placeholder?: string
  options?: TOption[]
  control: Control<TFieldValues>
  matchField?: TMatchKey
  // Either a key of TOption used for label, or a render function that returns JSX
  renderField?: keyof TOption | ((option: TOption) => React.JSX.Element)
  disabled?: boolean
}

function getOptionValue<TOption extends Record<string, unknown>, K extends keyof TOption>(
  option: TOption,
  matchField: K
): string {
  const raw = (option['_id' as keyof TOption] ?? option[matchField]) as unknown
  return String(raw ?? '')
}

function getOptionLabel<TOption extends Record<string, unknown>>(
  option: TOption,
  renderField?: keyof TOption | ((o: TOption) => React.JSX.Element)
): React.ReactNode {
  if (!renderField) return ''
  if (typeof renderField === 'function') return renderField(option)
  const val = option[renderField] as unknown
  return String(val ?? '')
}

const CustomSelect = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TOption extends Record<string, unknown>,
  TMatchKey extends keyof TOption = '_id' extends keyof TOption ? '_id' : keyof TOption,
>({
  name,
  label,
  placeholder = 'Select...',
  options = [],
  control,
  matchField,
  renderField = 'name',
  disabled = false,
}: CustomSelectProps<TFieldValues, TName, TOption, TMatchKey>) => {
  // Prefer '_id' when present, otherwise fall back to provided matchField, otherwise first key
  const resolvedMatchField =
    ('_id' in (options[0] ?? {})
      ? ('_id' as TMatchKey)
      : (matchField ?? (Object.keys(options[0] ?? {})[0] as TMatchKey))) ?? ('_id' as TMatchKey)

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className="mb-3">
          {label && (
            <label htmlFor={name} className="block font-medium mb-1">
              {label}
            </label>
          )}

          <select
            id={name as string}
            name={name as string}
            value={(value as string | number | undefined) ?? ''}
            onChange={(e) => {
              // By default, propagate the string value (id) to RHF
              onChange(e.target.value)
            }}
            disabled={disabled}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => {
              const key = getOptionValue(option, resolvedMatchField)
              return (
                <option key={key} value={key} className="capitalize">
                  {getOptionLabel(option, renderField)}
                </option>
              )
            })}
          </select>

          {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
        </div>
      )}
    />
  )
}

export default CustomSelect
