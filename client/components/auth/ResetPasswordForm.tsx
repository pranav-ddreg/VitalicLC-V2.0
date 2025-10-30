'use client'

import React from 'react'
import { ChevronLeft } from 'lucide-react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import FormInput from '../../common/form-inputs/form-inputs'
import { Form } from '../ui/form'

const schema = z
  .object({
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
        'Must contain uppercase, number and special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

type ResetPasswordFormProps = {
  onSubmit: (values: FormValues) => void
  onBack: () => void
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSubmit, onBack }) => {
  const methods: UseFormReturn<FormValues> = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange',
  })

  const {
    formState: { isSubmitting },
  } = methods

  const submit = (values: FormValues) => {
    return Promise.resolve().then(() => onSubmit(values))
  }

  return (
    <Form {...methods}>
      <form onSubmit={methods.handleSubmit(submit)} className="space-y-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-slate-700 text-sm font-medium mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </button>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Create new password</h2>
          <p className="text-slate-600 text-sm">Enter a strong password to secure your account</p>
        </div>

        <div>
          <FormInput
            control={methods.control}
            name="password"
            label="New Password"
            placeholder="••••••••"
            type="password"
          />
        </div>

        <div>
          <FormInput
            control={methods.control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="••••••••"
            type="password"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </Form>
  )
}

export default ResetPasswordForm
