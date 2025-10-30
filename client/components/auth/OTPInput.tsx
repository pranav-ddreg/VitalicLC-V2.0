'use client'

import React, { useEffect, useRef } from 'react'

type OTPInputProps = {
  name: string
  values: string[]
  setFieldValue: (field: string, value: string) => void
  onChange: (index: number, value: string, setFieldValue: (field: string, value: string) => void) => void
  onKeyDown: (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: string) => void
  ) => void
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
}

const OTPInput: React.FC<OTPInputProps> = ({ name, values, setFieldValue, onChange, onKeyDown, inputRefs }) => {
  // ensure refs length equals values length
  const ensuredRefs = useRef(false)
  useEffect(() => {
    if (!ensuredRefs.current) {
      if (inputRefs.current.length !== values.length) {
        inputRefs.current = Array(values.length).fill(null)
      }
      ensuredRefs.current = true
    }
  }, [values.length, inputRefs])

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3 w-1/2">Enter code</label>
      <div className="grid grid-cols-6 gap-2">
        {values.map((value, index) => (
          <input
            key={index}
            ref={(el) => {
              if (el) inputRefs.current[index] = el
            }}
            type="text"
            className="w-full h-12 text-center text-lg font-bold border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 dark:bg-slate-800 dark:text-slate-100 transition-all"
            value={value}
            onChange={(e) => onChange(index, e.target.value, setFieldValue)}
            onKeyDown={(e) => onKeyDown(index, e, setFieldValue)}
            maxLength={1}
            autoComplete="off"
          />
        ))}
      </div>
    </div>
  )
}

export default OTPInput
