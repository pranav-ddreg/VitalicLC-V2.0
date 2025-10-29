'use client'

import React from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { useForm, type UseFormReturn, type FieldValues } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import FormInput from '../../common/form-inputs/form-inputs'
import { Form } from '../ui/form'

const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      'Must contain uppercase, number and special character'
    ),
}) as z.ZodType<{
  email: string
  password: string
}>

type LoginFormValues = z.infer<typeof schema>

type LoginFormProps = {
  onSubmit: (values: LoginFormValues) => void
  showPassword: boolean
  setShowPassword: (val: boolean) => void
  onForgotPasswordClick: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, showPassword, setShowPassword, onForgotPasswordClick }) => {
  const methods: UseFormReturn<LoginFormValues> = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver<any>(schema),
    mode: 'onChange',
  })

  const {
    formState: { isSubmitting },
  } = methods

  const submit = (values: LoginFormValues) => {
    return Promise.resolve().then(() => onSubmit(values))
  }

  return (
    <div className="flex flex-col sm:w-1/2 w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Sign In</h1>
        <p className="text-slate-600">Enter your email and password to sign in</p>
      </div>

      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(submit)} className="space-y-4">
          <div>
            <FormInput
              control={methods.control}
              name="email"
              label="Email"
              placeholder="name@example.com"
              type="email"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Password</label>
            <div className="relative">
              <FormInput
                control={methods.control}
                name="password"
                label=""
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2/3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" />
              <span className="text-sm text-slate-600">Keep me logged in</span>
            </label>
            <button
              type="button"
              onClick={onForgotPasswordClick}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-6"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500">Protected by DDReg Pharma</span>
          </div>
        </div>

        <p className="text-xs mt-6 text-center text-slate-600 leading-relaxed">
          By clicking Continue, you agree to DDReg Pharma&apos;s{' '}
          <Link
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
            href="/legal/privacy-policy"
          >
            Privacy Policy
          </Link>
          {', '}
          <Link
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
            href="/legal/cookie-policy"
          >
            Cookie Policy
          </Link>{' '}
          and{' '}
          <Link
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
            href="/legal/terms"
          >
            Terms & Conditions
          </Link>
          .
        </p>
        <p className="text-xs text-slate-500 text-center mt-8 mb-2">
          &copy;{new Date().getFullYear()} DDReg Pharma | All rights reserved
        </p>
      </Form>
    </div>
  )
}

export default LoginForm
