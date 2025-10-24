import React from 'react'
import { Controller, Control, FieldValues, Path } from 'react-hook-form'

interface CustomInputProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  label?: string
  placeholder?: string
  type?: string
  as?: 'input' | 'textarea'
  rows?: number
  control: Control<TFieldValues>
  disabled?: boolean
}

function CustomInput<TFieldValues extends FieldValues>({
  name,
  label,
  placeholder,
  type = 'text',
  as = 'input',
  rows,
  control,
  disabled = false,
}: CustomInputProps<TFieldValues>) {
  const openPickerIfDate = (el: HTMLInputElement | null) => {
    if (!el || el.type !== 'date') return
    if (typeof el.showPicker === 'function') {
      try {
        el.showPicker()
      } catch {
        // silently fail
      }
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (type === 'date') openPickerIfDate(e.currentTarget as HTMLInputElement)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (type === 'date') openPickerIfDate(e.currentTarget as HTMLInputElement)
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
        <div className="mb-3">
          {label && (
            <label htmlFor={name} className="block font-medium mb-1">
              {label}
            </label>
          )}

          {as === 'textarea' ? (
            <textarea
              id={name}
              ref={ref}
              rows={rows}
              placeholder={placeholder}
              value={value || ''}
              onChange={onChange}
              onClick={handleClick}
              onFocus={handleFocus}
              disabled={disabled}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          ) : (
            <input
              id={name}
              ref={ref}
              type={type}
              placeholder={placeholder}
              value={value || ''}
              onChange={onChange}
              onClick={handleClick}
              onFocus={handleFocus}
              disabled={disabled}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          )}

          {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
        </div>
      )}
    />
  )
}

export default CustomInput

// 'use client'

// import React from 'react'
// import { Controller, Control } from 'react-hook-form'

// interface CustomInputProps {
//   name: string
//   label?: string
//   placeholder?: string
//   type?: string
//   as?: 'input' | 'textarea'
//   rows?: number
//   control: Control<any>
//   disabled?: boolean
// }

// const CustomInput: React.FC<CustomInputProps> = ({
//   name,
//   label,
//   placeholder,
//   type = 'text',
//   as = 'input',
//   rows,
//   control,
//   disabled = false,
// }) => {
//   const openPickerIfDate = (el: HTMLInputElement | null) => {
//     if (!el || el.type !== 'date') return
//     if (typeof el.showPicker === 'function') {
//       try {
//         el.showPicker()
//       } catch {
//         // silently fail if not supported
//       }
//     }
//   }

//   const handleClick = (e: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     if (type === 'date') openPickerIfDate(e.currentTarget as HTMLInputElement)
//   }

//   const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     if (type === 'date') openPickerIfDate(e.currentTarget as HTMLInputElement)
//   }

//   return (
//     <Controller
//       name={name}
//       control={control}
//       render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
//         <div className="mb-3">
//           {label && (
//             <label htmlFor={name} className="block font-medium mb-1">
//               {label}
//             </label>
//           )}

//           {as === 'textarea' ? (
//             <textarea
//               id={name}
//               ref={ref}
//               rows={rows}
//               placeholder={placeholder}
//               value={value || ''}
//               onChange={onChange}
//               onClick={handleClick}
//               onFocus={handleFocus}
//               disabled={disabled}
//               className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
//                 error ? 'border-red-500' : 'border-gray-300'
//               }`}
//             />
//           ) : (
//             <input
//               id={name}
//               ref={ref}
//               type={type}
//               placeholder={placeholder}
//               value={value || ''}
//               onChange={onChange}
//               onClick={handleClick}
//               onFocus={handleFocus}
//               disabled={disabled}
//               className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring ${
//                 error ? 'border-red-500' : 'border-gray-300'
//               }`}
//             />
//           )}

//           {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
//         </div>
//       )}
//     />
//   )
// }

// export default CustomInput
