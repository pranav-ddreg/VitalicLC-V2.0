'use client'

import React from 'react'
import { ChevronLeft } from 'lucide-react'
import OTPInput from './OTPInput'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

type OtpFormProps = {
  title?: string
  subtitle?: React.ReactNode
  onSubmit: (values: { otp: string }) => void
  onBack: () => void
  otpValues: string[]
  handleOtpChange: (index: number, value: string, setFieldValue: (field: string, value: string) => void) => void
  handleOtpKeyDown: (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: string) => void
  ) => void
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
  onResend?: () => void
  resendDisabled?: boolean
  isResending?: boolean
}

const schema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
})

type OtpFormValues = z.infer<typeof schema>

const OtpForm: React.FC<OtpFormProps> = ({
  title = 'Verify your email',
  subtitle,
  onSubmit,
  onBack,
  otpValues,
  handleOtpChange,
  handleOtpKeyDown,
  otpRefs,
  onResend,
  resendDisabled = false,
  isResending = false,
}) => {
  const { handleSubmit, setValue, formState } = useForm<OtpFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { otp: '' },
    mode: 'onChange',
  })

  const submit = (values: { otp: string }) => {
    return Promise.resolve().then(() => onSubmit(values))
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 text-sm font-medium mb-4 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back
      </button>

      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h2>
        {subtitle && <p className="text-slate-600 dark:text-slate-400 text-sm">{subtitle}</p>}
      </div>

      <OTPInput
        values={otpValues}
        setFieldValue={(field, value) => setValue('otp' as keyof OtpFormValues, value)}
        onChange={handleOtpChange}
        onKeyDown={handleOtpKeyDown}
        inputRefs={otpRefs}
      />

      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {formState.isSubmitting ? 'Verifying...' : 'Verify'}
      </button>

      {onResend && (
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Didn&apos;t receive the code?{' '}
          <button
            type="button"
            onClick={onResend}
            disabled={resendDisabled || isResending}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? 'Sending...' : 'Resend'}
          </button>
        </p>
      )}
    </form>
  )
}

export default OtpForm
