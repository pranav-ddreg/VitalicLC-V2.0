'use client'

import React, { useState, useEffect } from 'react'
import { Controller, Control, FieldValues, Path, ControllerRenderProps } from 'react-hook-form'
import Select, { components, MultiValue, ActionMeta, GroupBase, MultiValueRemoveProps } from 'react-select'

// ------------------
// Shared option type
// ------------------
export type OptionType = {
  value: string
  label: React.ReactNode
  isFixed?: boolean
  [key: string]: unknown
}

// ------------------
// Props
// ------------------
interface CustomMultiSelectProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  label?: string
  placeholder?: string
  options?: OptionType[]
  control: Control<TFieldValues>
  matchField?: string
  renderField?: string | ((option: OptionType) => React.ReactNode)
  isClearable?: boolean
  closeMenuOnSelect?: boolean
  defaultValue?: string[]
}

// ------------------
// MultiValueRemove
// ------------------
const MultiValueRemove: React.FC<MultiValueRemoveProps<OptionType, true, GroupBase<OptionType>>> = (props) => {
  if (props.data.isFixed) return null
  return <components.MultiValueRemove {...props} />
}

// ------------------
// Component
// ------------------
function CustomMultiSelect<TFieldValues extends FieldValues>({
  name,
  label,
  placeholder = 'Select...',
  options = [],
  control,
  matchField = 'id',
  renderField = 'name',
  isClearable = true,
  closeMenuOnSelect = false,
}: CustomMultiSelectProps<TFieldValues>) {
  const [formattedOptions, setFormattedOptions] = useState<OptionType[]>([])

  useEffect(() => {
    const temp = options.map((option) => {
      const value = String(option[matchField] ?? '')
      const label =
        typeof renderField === 'function' ? renderField(option) : ((option[renderField ?? ''] as React.ReactNode) ?? '')

      return {
        ...option,
        value,
        label,
      }
    })
    setFormattedOptions(temp)
  }, [options, matchField, renderField])

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { onChange, value },
        fieldState: { error },
      }: {
        field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>
        fieldState: { error?: import('react-hook-form').FieldError }
      }) => {
        const selectedValues = Array.isArray(value) ? (value as string[]) : []

        return (
          <div className="mb-3">
            {label && <label className="block font-medium mb-1">{label}</label>}

            <Select<OptionType, true>
              isMulti
              isClearable={isClearable}
              isSearchable
              closeMenuOnSelect={closeMenuOnSelect}
              name={name}
              placeholder={placeholder}
              value={formattedOptions.filter((opt) => selectedValues.includes(opt.value))}
              onChange={(selectedOptions: MultiValue<OptionType>, actionMeta: ActionMeta<OptionType>) => {
                switch (actionMeta.action) {
                  case 'select-option':
                    onChange([...selectedValues, actionMeta.option?.value ?? ''])
                    break
                  case 'remove-value':
                    onChange(selectedValues.filter((v) => v !== actionMeta.removedValue?.value))
                    break
                  case 'clear':
                    onChange([])
                    break
                  default:
                    break
                }
              }}
              options={formattedOptions}
              components={{ MultiValueRemove }}
            />

            {error && <p className="text-red-500 text-sm mt-1">{String(error.message)}</p>}
          </div>
        )
      }}
    />
  )
}

export default CustomMultiSelect
