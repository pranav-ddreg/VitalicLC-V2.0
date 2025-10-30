'use client'

import React from 'react'
import { Control, FieldValues, FieldPath, SubmitHandler, UseFormHandleSubmit } from 'react-hook-form'
import CustomInput from './CustomInput'
import CustomImageInput from './CustomImageInput'
import CustomFileInput from './CustomFileInput'
import CustomSelect from './CustomSelect'
import CustomMultiSelect, { OptionType as MultiOptionType } from './CustomMultiSelect'

type Size = 'sm' | 'md' | 'lg' | 'xl'

interface Field<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues> | string
  label?: string
  placeholder?: string
  type?: string
  options?: Record<string, unknown>[] // raw options
  fieldType?: 'select' | 'multiselect' | 'image' | 'file' | 'textarea' | 'text' | 'date'
  matchField?: string
  renderField?: string | ((option: Record<string, unknown>) => React.ReactElement)
  defaultValue?: string[]
  isClearable?: boolean
  rows?: number
  fullWidth?: boolean
  height?: string
  display?: boolean
  disabled?: boolean
}

interface CustomFormProps<TFieldValues extends FieldValues> {
  onReset?: () => void
  onSubmit?: SubmitHandler<TFieldValues>
  handleSubmit?: UseFormHandleSubmit<TFieldValues>
  control: Control<TFieldValues>
  mode: 'add' | 'edit'
  isSubmitting?: boolean
  fields: Field<TFieldValues>[]
  showSubmitBtn?: boolean
  showResetBtn?: boolean
  size?: Size
}

function CustomForm<TFieldValues extends FieldValues>({
  onReset,
  onSubmit,
  handleSubmit,
  control,
  mode,
  isSubmitting = false,
  fields,
  showSubmitBtn = true,
  showResetBtn = false,
  size = 'lg',
}: CustomFormProps<TFieldValues>) {
  const sizeClass: Record<Size, string> = {
    xl: 'md:w-1/3',
    lg: 'md:w-1/2',
    md: 'md:w-1/1',
    sm: 'md:w-full',
  }

  const submitHandler = onSubmit && handleSubmit ? handleSubmit(onSubmit) : undefined

  return (
    <form onSubmit={submitHandler}>
      <div className="flex flex-wrap -mx-2">
        {fields?.map((field) =>
          field.display === false ? null : (
            <div key={String(field.name)} className={`px-2 w-full ${!field.fullWidth ? sizeClass[size] : ''}`}>
              {(() => {
                switch (field.fieldType) {
                  case 'select': {
                    const options: MultiOptionType[] | undefined = field.options?.map((opt) => ({
                      value: String(opt[field.matchField ?? 'value'] ?? ''),
                      label:
                        typeof field.renderField === 'function'
                          ? field.renderField(opt)
                          : ((opt[field.renderField as string] ?? '') as React.ReactNode),
                    }))

                    return (
                      <CustomSelect
                        name={field.name as FieldPath<TFieldValues>}
                        label={field.label}
                        control={control}
                        placeholder={field.placeholder}
                        options={options}
                        matchField={field.matchField ? String(field.matchField) : undefined}
                        renderField={field.renderField as string | ((option: MultiOptionType) => React.ReactElement)}
                        disabled={field.disabled}
                      />
                    )
                  }

                  case 'multiselect': {
                    const options: MultiOptionType[] | undefined = field.options?.map((opt) => ({
                      value: String(opt[field.matchField ?? 'value'] ?? ''),
                      label:
                        typeof field.renderField === 'function'
                          ? field.renderField(opt)
                          : ((opt[field.renderField as string] ?? '') as React.ReactNode),
                    }))

                    return (
                      <CustomMultiSelect
                        name={field.name as FieldPath<TFieldValues>}
                        label={field.label}
                        control={control}
                        placeholder={field.placeholder}
                        options={options}
                        matchField={field.matchField ? String(field.matchField) : undefined}
                        renderField={field.renderField as string | ((option: MultiOptionType) => React.ReactElement)}
                        defaultValue={field.defaultValue}
                        isClearable={field.isClearable}
                      />
                    )
                  }

                  case 'image':
                    return (
                      <CustomImageInput
                        name={field.name as FieldPath<TFieldValues>}
                        label={field.label}
                        control={control}
                      />
                    )

                  case 'file':
                    return (
                      <CustomFileInput
                        name={field.name as FieldPath<TFieldValues>}
                        label={field.label}
                        control={control}
                        height={field.height}
                      />
                    )

                  case 'textarea':
                    return (
                      <CustomInput
                        as="textarea"
                        rows={field.rows}
                        name={field.name as FieldPath<TFieldValues>}
                        label={field.label}
                        control={control}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                      />
                    )

                  case 'text':
                  default:
                    return (
                      <CustomInput
                        name={field.name as FieldPath<TFieldValues>}
                        label={field.label}
                        type={field.type}
                        control={control}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                      />
                    )
                }
              })()}
            </div>
          )
        )}
      </div>

      <div className="flex justify-end gap-2 mt-4">
        {showResetBtn && (
          <button type="button" onClick={onReset} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
            Reset
          </button>
        )}
        {showSubmitBtn && (
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {mode === 'add' ? 'Submit' : 'Update'}
          </button>
        )}
      </div>
    </form>
  )
}

export default CustomForm
