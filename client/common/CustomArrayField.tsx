'use client'

import React from 'react'
import { useFieldArray, Control, FieldValues, Path, PathValue, ArrayPath } from 'react-hook-form'
import CustomInput from './CustomInput'

interface Field {
  name: string
  label: string
  placeholder?: string
}

interface CustomArrayFieldProps<TFieldValues extends FieldValues, TArrayName extends ArrayPath<TFieldValues>> {
  fields: Field[]
  name: TArrayName // the path to the array
  control: Control<TFieldValues>
  addFields: PathValue<TFieldValues, TArrayName>[number] // type of a single item in the array
  col?: number
}

function CustomArrayField<TFieldValues extends FieldValues, TArrayName extends ArrayPath<TFieldValues>>({
  fields,
  name,
  control,
  addFields,
  col = 1,
}: CustomArrayFieldProps<TFieldValues, TArrayName>) {
  const {
    fields: inputFields,
    append,
    remove,
  } = useFieldArray<TFieldValues, TArrayName>({
    control,
    name,
  })

  return (
    <div className="space-y-3">
      {/* Add button */}
      <div className="flex justify-end">
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
          onClick={() => append(addFields)}
        >
          Add
        </button>
      </div>

      {/* Field array items */}
      {inputFields.map((item, index) => (
        <div key={item.id} className="flex gap-3 items-start">
          <div className={`grid grid-cols-${col} flex-1 gap-3`}>
            {fields.map((field, idx) => (
              <CustomInput
                key={idx}
                name={`${name}.${index}.${field.name}` as Path<TFieldValues>}
                label={`${field.label} ${index + 1}`}
                control={control}
                placeholder={field.placeholder}
              />
            ))}
          </div>

          <button
            type="button"
            className={`mt-3 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded ${
              inputFields.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => inputFields.length > 1 && remove(index)}
            disabled={!(inputFields.length > 1)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}

export default CustomArrayField
