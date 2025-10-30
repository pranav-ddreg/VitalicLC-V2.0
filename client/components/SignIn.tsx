'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import LoginBranding from './auth/LoginBranding'
import LoginForm from './auth/LoginForm'
import OtpForm from './auth/OtpForm'
import ForgotPasswordForm from './auth/ForgotPasswordForm'
import ResetPasswordForm from './auth/ResetPasswordForm'
import { POST } from '@/lib/http-methods'
import { ThemeToggleButton } from './ui/theme-toggle'

const SignIn: React.FC = () => {
  const router = useRouter()
  const [showOtpForm, setShowOtpForm] = useState(false)
  const [showForgotPasswordForm, setShowForgotPasswordForm] = useState(false)
  const [showForgotOtpForm, setShowForgotOtpForm] = useState(false)
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  console.log('Forgot Password Email:', forgotPasswordEmail) // Debugging line
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', ''])
  const [forgotOtpValues, setForgotOtpValues] = useState<string[]>(['', '', '', '', '', ''])
  const otpRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null))
  const forgotOtpRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null))
  const [resendDisabled, setResendDisabled] = useState(false)
  const [isResending, setIsResending] = useState(false)
  // const initialValues = { email: '', password: '' }
  // const otpInitialValues = { otp: '' }
  // const forgotPasswordInitialValues = { email: '' }
  // const forgotOtpInitialValues = { otp: '' }
  // const resetPasswordInitialValues = { password: '', confirmPassword: '' }

  const onSubmit = async (values: { email: string; password: string }) => {
    try {
      const response = await POST('/auth/login', values, '/api')
      const responseData = response as { data?: { user: unknown }; message?: string }

      if (!response) {
        throw new Error(responseData.message || 'Invalid login. Please try again.')
      }

      const has2FAEnabled = responseData?.data?.user

      if (!has2FAEnabled) {
        setUserEmail(values.email)
        setShowOtpForm(true)
        toast.success('OTP sent to your email!')
        return
      }

      router.push('/dashboard')
      toast.success('Login successful!')
    } catch (error) {
      toast.error((error as Error).message || 'An unexpected error occurred.')
    }
  }

  const handleOtpChange = (
    index: number,
    value: string,
    setFieldValue: (field: string, value: string) => void,
    isForForgot = false
  ) => {
    if (value.length > 1) return
    if (value && !/^\d$/.test(value)) return

    const currentOtpValues = isForForgot ? forgotOtpValues : otpValues
    const setOtpValuesFunction = isForForgot ? setForgotOtpValues : setOtpValues

    const newOtpValues = [...currentOtpValues]
    newOtpValues[index] = value
    setOtpValuesFunction(newOtpValues)
    setFieldValue('otp', newOtpValues.join(''))

    if (value && index < 5) {
      const refs = isForForgot ? forgotOtpRefs : otpRefs
      refs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: string) => void,
    isForForgot = false
  ) => {
    const currentOtpValues = isForForgot ? forgotOtpValues : otpValues
    const refs = isForForgot ? forgotOtpRefs : otpRefs
    const setOtpValuesFunction = isForForgot ? setForgotOtpValues : setOtpValues

    if (e.key === 'Backspace' && !currentOtpValues[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }

    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, '').slice(0, 6)
        const newOtpValues = [...currentOtpValues]
        for (let i = 0; i < 6; i++) {
          newOtpValues[i] = digits[i] || ''
        }
        setOtpValuesFunction(newOtpValues)
        setFieldValue('otp', newOtpValues.join(''))
        const lastIndex = Math.min(digits.length - 1, 5)
        refs.current[lastIndex]?.focus()
      })
    }
  }

  const onOtpSubmit = async (values: { otp: string }) => {
    try {
      localStorage.setItem('userInfo', JSON.stringify({ user: { email: userEmail } }))
      const response = await POST('/auth/verify-otp', { ...values, email: userEmail }, '/api')
      if (response && response) {
        router.push('/dashboard')
        toast.success('Login successful!')
      } else {
        toast.error('Invalid OTP. Please try again.')
      }
    } catch (error) {
      toast.error('Invalid OTP. Please try again.')
      console.error('OTP Verification Error:', error)
    }
  }

  const onForgotPasswordSubmit = async (values: { email: string }) => {
    try {
      const response = await POST('/auth/sent-otp', values, '/api')
      if (response) {
        const msg = (response as { message?: string })?.message ?? 'OTP sent to your email successfully.'
        toast.success(msg)
        setForgotPasswordEmail(values.email)
        setShowForgotOtpForm(true)
      } else {
        toast.error('Failed to send OTP. Try Again.')
      }
    } catch (error) {
      toast.error('Failed to send OTP. Try Again.')
      console.error('Forgot Password Error:', error)
    }
  }

  const onForgotOtpSubmit = async (values: { otp: string }) => {
    try {
      const payload = { ...values, email: forgotPasswordEmail }
      const response = await POST('/auth/forget-password/verify-otp', payload, '/api')
      if (response) {
        const msg = (response as { message?: string })?.message ?? 'OTP verified successfully.'
        toast.success(msg)
        setShowResetPasswordForm(true)
      } else {
        toast.error('Invalid OTP. Please try again.')
      }
    } catch (error) {
      toast.error('Invalid OTP. Please try again.')
      console.error('Forgot OTP Verification Error:', error)
    }
  }

  const handleBackToLogin = () => {
    setShowOtpForm(false)
    setShowForgotPasswordForm(false)
    setShowForgotOtpForm(false)
    setShowResetPasswordForm(false)
    setUserEmail('')
    setForgotPasswordEmail('')
    setOtpValues(['', '', '', '', '', ''])
    setForgotOtpValues(['', '', '', '', '', ''])
  }

  const onResetPasswordSubmit = async (values: { password: string; confirmPassword: string }) => {
    try {
      const payload = { newPassword: values.password, email: forgotPasswordEmail }
      const response = await POST('/auth/forget-password', payload, '/api')
      if (response) {
        const responseData = response as { message?: string; data?: { data?: string } }
        const msg = responseData?.message || responseData?.data?.data || 'Password reset successfully.'
        toast.success(msg)
        handleBackToLogin()
      } else {
        toast.error('Failed to reset password. Try Again.')
      }
    } catch (error) {
      toast.error('Failed to reset password. Try Again.')
      console.error('Reset Password Error:', error)
    }
  }

  const handleresendOtp = async () => {
    setIsResending(true)
    setResendDisabled(true)

    try {
      const emailToSend = forgotPasswordEmail || userEmail

      if (!emailToSend) {
        toast.error('No email found to resend OTP. Please enter your email.')
        setIsResending(false)
        setResendDisabled(false)
        return
      }

      const { data, status } = await POST<{ message?: string }>(
        '/auth/resend-otp',
        {
          email: emailToSend,
          subject: forgotPasswordEmail ? 'Password Reset OTP' : 'Login OTP',
        },
        '/api'
      )

      if (status === 200) {
        toast.success('OTP resent successfully!')
      } else {
        toast.error(data?.message || 'Failed to resend OTP. Please try again.')
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Something went wrong while resending OTP.')
      } else {
        toast.error('Something went wrong while resending OTP.')
      }
    }

    // Keep loader and disabled for 30 seconds
    setTimeout(() => {
      setIsResending(false)
      setResendDisabled(false)
    }, 30000)
  }

  const handleForgotPasswordClick = () => {
    setShowForgotPasswordForm(true)
  }

  const getCurrentForm = () => {
    if (showResetPasswordForm) return 'reset-password'
    if (showForgotOtpForm) return 'forgot-otp'
    if (showForgotPasswordForm) return 'forgot-password'
    if (showOtpForm) return 'otp'
    return 'login'
  }

  return (
    <div className="m-0 p-0 w-full h-screen flex bg-linear-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Left Side - Branding */}
      <LoginBranding />

      {/* Right Side - Enhanced Form Area with Visual Flair */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 pt-16 pb-8 overflow-y-auto relative min-h-screen">
        {/* Beautiful Background Effects with Enhanced Light Mode */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Enhanced Floating Elements for Light Mode */}
          <div
            className="absolute top-16 left-16 w-28 h-28 bg-linear-to-br from-blue-200/40 to-indigo-300/40 rounded-full blur-2xl animate-bounce"
            style={{ animationDuration: '6s' }}
          ></div>
          <div
            className="absolute top-1/4 right-12 w-24 h-24 bg-linear-to-br from-cyan-200/35 to-blue-300/35 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="absolute bottom-20 left-12 w-32 h-32 bg-linear-to-br from-violet-200/45 to-purple-300/45 rounded-full blur-3xl animate-bounce"
            style={{ animationDuration: '8s', animationDelay: '0.5s' }}
          ></div>
          <div
            className="absolute bottom-1/4 right-20 w-20 h-20 bg-linear-to-br from-indigo-100/50 to-blue-200/50 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: '3s' }}
          ></div>
          <div
            className="absolute top-2/3 left-1/3 w-16 h-16 bg-linear-to-br from-sky-200/60 to-blue-300/60 rounded-full blur-xl animate-bounce"
            style={{ animationDuration: '5s', animationDelay: '2s' }}
          ></div>

          {/* Light Mode Geometric Shapes */}
          <div
            className="absolute top-32 right-32 w-6 h-6 border-2 border-blue-200/40 rotate-45 animate-spin"
            style={{ animationDuration: '12s' }}
          ></div>
          <div
            className="absolute bottom-40 left-32 w-4 h-4 border border-indigo-300/50 rotate-12 animate-pulse"
            style={{ animationDelay: '1.5s' }}
          ></div>
          <div
            className="absolute top-1/2 left-16 w-8 h-8 border border-cyan-300/40 rounded-lg rotate-45 animate-spin"
            style={{ animationDuration: '10s', animationDelay: '0.8s' }}
          ></div>

          {/* Floating Dots for Dynamic Effect */}
          <div
            className="absolute top-24 left-1/2 w-2 h-2 bg-blue-400/60 rounded-full animate-ping"
            style={{ animationDelay: '0.5s' }}
          ></div>
          <div
            className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-indigo-400/70 rounded-full animate-ping"
            style={{ animationDelay: '2s' }}
          ></div>
          <div
            className="absolute bottom-1/3 left-24 w-1 h-1 bg-cyan-400/80 rounded-full animate-ping"
            style={{ animationDelay: '3.5s' }}
          ></div>

          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]">
            <svg width="100%" height="100%" className="text-slate-600 dark:text-slate-200">
              <defs>
                <pattern id="subtle-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <circle cx="5" cy="5" r="1" fill="currentColor" opacity="0.15" />
                  <circle cx="25" cy="15" r="0.8" fill="currentColor" opacity="0.1" />
                  <circle cx="15" cy="25" r="0.6" fill="currentColor" opacity="0.08" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#subtle-grid)" />
            </svg>
          </div>

          {/* Enhanced Corner Gradients */}
          <div className="absolute top-0 left-0 w-lg h-128 bg-linear-to-br from-blue-200/25 via-indigo-100/15 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-lg h-128 bg-linear-to-tl from-purple-200/20 via-blue-100/20 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-white/10 via-blue-50/5 to-transparent rounded-full"></div>
        </div>

        {/* Theme Toggle positioned above form with enhanced styling */}
        <div className="absolute top-6 right-6 z-20">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full p-2 shadow-lg border border-white/20 dark:border-slate-700/50">
            <ThemeToggleButton />
          </div>
        </div>

        {/* Welcome Header */}
        <div className="text-center mb-8 mt-8 relative z-10">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 drop-shadow-sm">
            Welcome to DDReg Pharma
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Sign in to access your dashboard</p>
        </div>

        {/* Form Container with Enhanced Styling */}
        <div className="relative z-10 w-full max-w-lg mx-auto">
          <div className="w-full bg-white/85 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/30">
            {/* Login Form */}
            {getCurrentForm() === 'login' && (
              <LoginForm
                onSubmit={onSubmit}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                onForgotPasswordClick={handleForgotPasswordClick}
              />
            )}
            {/* OTP Form */}
            {getCurrentForm() === 'otp' && (
              <OtpForm
                onSubmit={onOtpSubmit}
                onBack={handleBackToLogin}
                otpValues={otpValues}
                handleOtpChange={(i, v, setFieldValue) => handleOtpChange(i, v, setFieldValue, false)}
                handleOtpKeyDown={(i, e, setFieldValue) => handleOtpKeyDown(i, e, setFieldValue, false)}
                otpRefs={otpRefs}
                subtitle={
                  <>
                    We sent a code to <strong>{userEmail}</strong>
                  </>
                }
                onResend={handleresendOtp}
                resendDisabled={resendDisabled}
                isResending={isResending}
              />
            )}
            {/* Forgot Password Form */}
            {getCurrentForm() === 'forgot-password' && (
              <ForgotPasswordForm onSubmit={onForgotPasswordSubmit} onBack={handleBackToLogin} />
            )}
            {/* Forgot OTP Form */}
            {getCurrentForm() === 'forgot-otp' && (
              <OtpForm
                title="Verify code"
                onSubmit={onForgotOtpSubmit}
                onBack={handleBackToLogin}
                otpValues={forgotOtpValues}
                handleOtpChange={(i, v, setFieldValue) => handleOtpChange(i, v, setFieldValue, true)}
                handleOtpKeyDown={(i, e, setFieldValue) => handleOtpKeyDown(i, e, setFieldValue, true)}
                otpRefs={forgotOtpRefs}
                subtitle={
                  <>
                    We sent a code to <strong>{forgotPasswordEmail}</strong>
                  </>
                }
                onResend={handleresendOtp}
                resendDisabled={resendDisabled}
                isResending={isResending}
              />
            )}
            {/* Reset Password Form */}
            {getCurrentForm() === 'reset-password' && (
              <ResetPasswordForm onSubmit={onResetPasswordSubmit} onBack={handleBackToLogin} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn
