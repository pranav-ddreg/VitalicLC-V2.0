'use client'

import React from 'react'
import Link from 'next/link'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import FormInput from '../../common/form-inputs/form-inputs'
import { Form } from '../ui/form'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      'Must contain uppercase, number and special character'
    ),
  keepLoggedIn: z.boolean().optional(),
})

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

  const submit = async (values: LoginFormValues) => {
    await Promise.resolve()
    return onSubmit(values)
  }

  return (
    <div className="relative flex flex-col p-6 rounded-lg">
      <div className="absolute top-0 left-0"></div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Sign In</h1>
        <p className="text-slate-600 dark:text-slate-400">Enter your email and password to sign in</p>
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
            <FormInput
              control={methods.control}
              name="password"
              label="Password"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              hasIcon={true}
              showIcon={showPassword}
              onToggleIcon={() => setShowPassword(!showPassword)}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600"
                {...methods.register('keepLoggedIn')}
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">Keep me logged in</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={14} className="text-slate-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-slate-100 dark:bg-slate-800 text-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <div className="text-left">
                    <span className="text-green-600 dark:text-green-700 font-medium">
                      Checked: Account logged in for 30 days
                    </span>
                    <br />
                    <span className="text-red-600 dark:text-red-700 font-medium">
                      Unchecked: Account logged in for 1 day
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
            </label>
            <button
              type="button"
              onClick={onForgotPasswordClick}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
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

        <p className="text-xs mt-6 text-center text-slate-600 dark:text-slate-400 leading-relaxed">
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
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-8 mb-2">
          &copy;{new Date().getFullYear()} DDReg Pharma | All rights reserved
        </p>
      </Form>
    </div>
  )
}

export default LoginForm
