import React, { useRef } from 'react'
import { Controller, Control, FieldValues, Path } from 'react-hook-form'
import { AiFillCloseCircle } from 'react-icons/ai'
import { BsCloudUpload } from 'react-icons/bs'
import Image from 'next/image'

interface CustomImageInputProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  label?: string
  control: Control<TFieldValues>
}

function CustomImageInput<TFieldValues extends FieldValues>({
  name,
  label,
  control,
}: CustomImageInputProps<TFieldValues>) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>, onChange: (file: File | null) => void) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange(e.dataTransfer.files[0])
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className="mb-3">
          {label && <label className="block font-medium mb-1">{label}</label>}

          <div className="relative">
            {value && (
              <span
                role="button"
                className="absolute top-0 left-0 text-gray-500 text-2xl z-10"
                onClick={() => {
                  if (inputRef.current) inputRef.current.value = ''
                  onChange(null)
                }}
              >
                <AiFillCloseCircle />
              </span>
            )}

            <label
              htmlFor={`dropzone-${name}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, onChange)}
              className={`relative flex justify-center items-center border border-dashed rounded cursor-pointer ${
                value ? 'bg-gray-200' : 'bg-white'
              }`}
              style={{ height: '200px' }}
            >
              <input
                ref={inputRef}
                id={`dropzone-${name}`}
                type="file"
                className="hidden"
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                accept="image/*"
              />

              {value ? (
                <Image
                  src={typeof value === 'string' ? value : URL.createObjectURL(value)}
                  alt="preview"
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="flex flex-col justify-center items-center text-gray-500">
                  <BsCloudUpload className="text-4xl" />
                  <p className="mt-2 text-center text-sm">
                    <span className="font-semibold text-gray-700">Click to upload</span> or drag and drop
                  </p>
                </div>
              )}
            </label>

            {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
          </div>
        </div>
      )}
    />
  )
}

export default CustomImageInput

// 'use client'

// import React, { useRef } from 'react'
// import { Controller, Control } from 'react-hook-form'
// import { AiFillCloseCircle } from 'react-icons/ai'
// import { BsCloudUpload } from 'react-icons/bs'

// interface CustomImageInputProps {
//   name: string
//   label?: string
//   control: Control<any>
// }

// const CustomImageInput: React.FC<CustomImageInputProps> = ({ name, label, control }) => {
//   const inputRef = useRef<HTMLInputElement | null>(null)

//   const handleDrop = (e: React.DragEvent<HTMLLabelElement>, onChange: (file: File | null) => void) => {
//     e.preventDefault()
//     e.stopPropagation()

//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       onChange(e.dataTransfer.files[0])
//     }
//   }

//   const handleDrag = (e: React.DragEvent<HTMLLabelElement>) => {
//     e.preventDefault()
//     e.stopPropagation()
//   }

//   return (
//     <Controller
//       name={name}
//       control={control}
//       render={({ field: { onChange, value }, fieldState: { error } }) => (
//         <div className="mb-3">
//           {label && <label className="block font-medium mb-1">{label}</label>}

//           <div className="relative">
//             {value && (
//               <span
//                 role="button"
//                 className="absolute top-0 left-0 text-gray-500 text-2xl z-10"
//                 onClick={() => {
//                   if (inputRef.current) inputRef.current.value = ''
//                   onChange(null)
//                 }}
//               >
//                 <AiFillCloseCircle />
//               </span>
//             )}

//             <label
//               htmlFor={`dropzone-${name}`}
//               onDragEnter={handleDrag}
//               onDragLeave={handleDrag}
//               onDragOver={handleDrag}
//               onDrop={(e) => handleDrop(e, onChange)}
//               className={`relative flex justify-center items-center border border-dashed rounded cursor-pointer ${
//                 value ? 'bg-gray-200' : 'bg-white'
//               }`}
//               style={{ height: '200px' }}
//             >
//               <input
//                 ref={inputRef}
//                 id={`dropzone-${name}`}
//                 type="file"
//                 className="hidden"
//                 onChange={(e) => onChange(e.target.files?.[0] ?? null)}
//                 accept="image/*"
//               />

//               {value ? (
//                 <img
//                   src={typeof value === 'string' ? value : URL.createObjectURL(value)}
//                   alt="preview"
//                   className="h-full w-auto object-contain"
//                 />
//               ) : (
//                 <div className="flex flex-col justify-center items-center text-gray-500">
//                   <BsCloudUpload className="text-4xl" />
//                   <p className="mt-2 text-center text-sm">
//                     <span className="font-semibold text-gray-700">Click to upload</span> or drag and drop
//                   </p>
//                 </div>
//               )}
//             </label>

//             {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
//           </div>
//         </div>
//       )}
//     />
//   )
// }

// export default CustomImageInput
