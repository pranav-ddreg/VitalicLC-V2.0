'use client'

import React from 'react'
import { ChevronLeft } from 'lucide-react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import FormInput from '../../common/form-inputs/form-inputs'
import { Form } from '../ui/form'

const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
}) as z.ZodType<{ email: string }>

type FormValues = z.infer<typeof schema>

type ForgotPasswordFormProps = {
  onSubmit: (values: FormValues) => void
  onBack: () => void
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSubmit, onBack }) => {
  const methods: UseFormReturn<FormValues> = useForm<FormValues>({
    resolver: zodResolver<any>(schema),
    defaultValues: { email: '' },
    mode: 'onChange',
  })

  const {
    formState: { isSubmitting },
  } = methods

  const submit = (values: { email: string }) => {
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
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Reset password</h2>
          <p className="text-slate-600 text-sm">Enter your email and we'll send you a code to reset your password</p>
        </div>

        <div>
          <FormInput control={methods.control} name="email" label="Email" placeholder="name@example.com" type="email" />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending...' : 'Send Code'}
        </button>
      </form>
    </Form>
  )
}

export default ForgotPasswordForm
