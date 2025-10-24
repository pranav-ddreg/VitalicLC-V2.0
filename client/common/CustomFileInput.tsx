import React from 'react'
import { Controller, Control, FieldValues, Path } from 'react-hook-form'
import { AiFillCloseCircle } from 'react-icons/ai'
import { BsCloudUploadFill, BsFileEarmarkPdfFill } from 'react-icons/bs'
import { GoDownload } from 'react-icons/go'
import { DownloadBlob } from '@/utils/DownloadBlob'

interface CustomFileInputProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  label?: string
  control: Control<TFieldValues>
  height?: string
}

function CustomFileInput<TFieldValues extends FieldValues>({
  name,
  label,
  control,
  height = '200px',
}: CustomFileInputProps<TFieldValues>) {
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

  const clearFile = (onChange: (file: File | null) => void) => {
    const input = document.getElementById(name) as HTMLInputElement | null
    if (input) input.value = ''
    onChange(null)
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
                onClick={() => clearFile(onChange)}
              >
                <AiFillCloseCircle />
              </span>
            )}

            <label
              htmlFor={name}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, onChange)}
              className={`relative flex flex-col justify-center items-center border rounded cursor-pointer ${
                value ? 'bg-gray-200' : 'bg-white'
              }`}
              style={{ height }}
            >
              <input
                id={name}
                type="file"
                className="hidden"
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                accept="application/pdf"
              />

              <div className="flex flex-col justify-center items-center text-gray-500">
                <div className="flex justify-center items-center">
                  {value ? <BsFileEarmarkPdfFill className="text-4xl" /> : <BsCloudUploadFill className="text-4xl" />}
                </div>

                {value ? (
                  <p className="mt-2 text-sm font-semibold text-gray-600">{label}</p>
                ) : (
                  <p className="mt-2 text-center text-sm text-gray-500">
                    <span className="font-semibold text-gray-700">Click to upload</span> or drag and drop
                  </p>
                )}
              </div>
            </label>

            {value?.Location && (
              <span
                onClick={() => DownloadBlob(value.Location, `${name}.pdf`)}
                className="mt-1 inline-flex items-center gap-1 text-gray-600 cursor-pointer"
              >
                <GoDownload size={16} />
                <span className="text-sm">download</span>
              </span>
            )}

            {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
          </div>
        </div>
      )}
    />
  )
}

export default CustomFileInput

// 'use client'

// import React from 'react'
// import { Controller, Control } from 'react-hook-form'
// import { AiFillCloseCircle } from 'react-icons/ai'
// import { BsCloudUploadFill, BsFileEarmarkPdfFill } from 'react-icons/bs'
// import { GoDownload } from 'react-icons/go'
// import { DownloadBlob } from '@/utils/DownloadBlob'

// interface CustomFileInputProps {
//   name: string
//   label?: string
//   control: Control<any>
//   height?: string
// }

// const CustomFileInput: React.FC<CustomFileInputProps> = ({ name, label, control, height = '200px' }) => {
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

//   const clearFile = (onChange: (file: File | null) => void) => {
//     const input = document.getElementById(name) as HTMLInputElement | null
//     if (input) input.value = ''
//     onChange(null)
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
//                 onClick={() => clearFile(onChange)}
//               >
//                 <AiFillCloseCircle />
//               </span>
//             )}

//             <label
//               htmlFor={name}
//               onDragEnter={handleDrag}
//               onDragLeave={handleDrag}
//               onDragOver={handleDrag}
//               onDrop={(e) => handleDrop(e, onChange)}
//               className={`relative flex flex-col justify-center items-center border rounded cursor-pointer ${
//                 value ? 'bg-gray-200' : 'bg-white'
//               }`}
//               style={{ height }}
//             >
//               <input
//                 id={name}
//                 type="file"
//                 className="hidden"
//                 onChange={(e) => onChange(e.target.files?.[0] ?? null)}
//                 accept="application/pdf"
//               />

//               <div className="flex flex-col justify-center items-center text-gray-500">
//                 <div className="flex justify-center items-center">
//                   {value ? <BsFileEarmarkPdfFill className="text-4xl" /> : <BsCloudUploadFill className="text-4xl" />}
//                 </div>

//                 {value ? (
//                   <p className="mt-2 text-sm font-semibold text-gray-600">{label}</p>
//                 ) : (
//                   <p className="mt-2 text-center text-sm text-gray-500">
//                     <span className="font-semibold text-gray-700">Click to upload</span> or drag and drop
//                   </p>
//                 )}
//               </div>
//             </label>

//             {value?.Location && (
//               <span
//                 onClick={() => DownloadBlob(value.Location, `${name}.pdf`)}
//                 className="mt-1 inline-flex items-center gap-1 text-gray-600 cursor-pointer"
//               >
//                 <GoDownload size={16} />
//                 <span className="text-sm">download</span>
//               </span>
//             )}

//             {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
//           </div>
//         </div>
//       )}
//     />
//   )
// }

// export default CustomFileInput
