'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import RightBranding from './auth/RightBranding'
import LoginForm from './auth/LoginForm'
import OtpForm from './auth/OtpForm'
import ForgotPasswordForm from './auth/ForgotPasswordForm'
import ResetPasswordForm from './auth/ResetPasswordForm'
import { POST } from '@/lib/http-methods'

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
      console.error('Error:', error)
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
      console.error('Error:', error)
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
        const msg = (response as { data?: string })?.data ?? 'Password reset successfully.'
        toast.success(msg)
        handleBackToLogin()
      } else {
        toast.error('Failed to reset password. Try Again.')
      }
    } catch (error) {
      toast.error('Failed to reset password. Try Again.')
      console.error('Error:', error)
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error((error as any)?.message || 'Something went wrong while resending OTP.')
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
    <div className="w-full h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 py-8 overflow-y-auto">
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

      {/* Right Side - Branding (Hidden on mobile) */}
      <RightBranding />
    </div>
  )
}

export default SignIn
