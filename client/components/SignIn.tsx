'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-hot-toast'

const SignIn: React.FC = () => {
  const router = useRouter()
  const [showOtpForm, setShowOtpForm] = useState(false)
  const [showForgotPasswordForm, setShowForgotPasswordForm] = useState(false)
  const [showForgotOtpForm, setShowForgotOtpForm] = useState(false)
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false)

  // Mock user info from localStorage
  // const [userInfo] = useState(() => {
  //   if (typeof window !== 'undefined') {
  //     const stored = localStorage.getItem('userInfo')
  //     return stored ? JSON.parse(stored) : null
  //   }
  //   return null
  // })

  const [userEmail, setUserEmail] = useState('')
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', ''])
  const [forgotOtpValues, setForgotOtpValues] = useState<string[]>(['', '', '', '', '', ''])
  const otpRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null))
  const forgotOtpRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null))

  // useEffect(() => {
  //   if (userInfo && userInfo?.user) {
  //     router.push("/dashboard");
  //   }
  // }, []);

  const initialValues = {
    email: '',
    password: '',
  }

  const otpInitialValues = {
    otp: '',
  }

  const forgotPasswordInitialValues = {
    email: '',
  }

  const forgotOtpInitialValues = {
    otp: '',
  }

  const resetPasswordInitialValues = {
    password: '',
    confirmPassword: '',
  }

  const validationSchema = Yup.object({
    email: Yup.string().email().required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})/,
        'Must Contain 6 Characters, One Uppercase, One Number and One Special Case Character'
      ),
  })

  const otpValidationSchema = Yup.object({
    otp: Yup.string()
      .required('OTP is required')
      .length(6, 'OTP must be 6 digits')
      .matches(/^\d+$/, 'OTP must contain only numbers'),
  })

  const forgotPasswordValidationSchema = Yup.object({
    email: Yup.string().email().required('Email is required'),
  })

  const resetPasswordValidationSchema = Yup.object({
    password: Yup.string()
      .required('Password is required')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})/,
        'Must Contain 6 Characters, One Uppercase, One Number and One Special Case Character'
      ),
    confirmPassword: Yup.string()
      .required('Confirm Password is required')
      .oneOf([Yup.ref('password')], 'Passwords must match'),
  })

  const onSubmit = async (
    values: { email: string; password: string },
    actions: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    setUserEmail(values.email)
    setShowOtpForm(true)
    toast.success('OTP sent to your email!')
    actions.setSubmitting(false)
  }

  // Fixed handleOtpChange function
  const handleOtpChange = (
    index: number,
    value: string,
    setFieldValue: (field: string, value: string) => void,
    isForForgot = false
  ) => {
    // Only allow single digit
    if (value.length > 1) return

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const currentOtpValues = isForForgot ? forgotOtpValues : otpValues
    const setOtpValuesFunction = isForForgot ? setForgotOtpValues : setOtpValues // Fixed variable name

    const newOtpValues = [...currentOtpValues]
    newOtpValues[index] = value
    setOtpValuesFunction(newOtpValues) // Use the correct setter function

    // Update formik field
    setFieldValue('otp', newOtpValues.join(''))

    // Auto focus next input
    if (value && index < 5) {
      const refs = isForForgot ? forgotOtpRefs : otpRefs
      refs.current[index + 1]?.focus()
    }
  }

  // Fixed handleOtpKeyDown function
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: string) => void,
    isForForgot = false
  ) => {
    const currentOtpValues = isForForgot ? forgotOtpValues : otpValues
    const refs = isForForgot ? forgotOtpRefs : otpRefs
    const setOtpValuesFunction = isForForgot ? setForgotOtpValues : setOtpValues

    // Handle backspace
    if (e.key === 'Backspace' && !currentOtpValues[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }

    // Handle paste
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

        // Focus last filled input or first empty
        const lastIndex = Math.min(digits.length - 1, 5)
        refs.current[lastIndex]?.focus()
      })
    }
  }

  const onOtpSubmit = async (values: { otp: string }, actions: { setSubmitting: (isSubmitting: boolean) => void }) => {
    setTimeout(() => {
      if (values.otp === '123456') {
        localStorage.setItem('userInfo', JSON.stringify({ user: { email: userEmail } }))
        router.push('/dashboard')
        toast.success('Login successful!')
      } else {
        toast.error('Invalid OTP. Please try again.')
      }
      actions.setSubmitting(false)
    }, 1000)
  }

  const onForgotPasswordSubmit = async (
    values: { email: string },
    actions: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    setForgotPasswordEmail(values.email)
    setShowForgotOtpForm(true)
    toast.success('Reset OTP sent to your email!')
    actions.setSubmitting(false)
  }

  const onForgotOtpSubmit = async (
    values: { otp: string },
    actions: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    setTimeout(() => {
      if (values.otp === '654321') {
        setShowResetPasswordForm(true)
      } else {
        toast.error('Invalid OTP. Please try again.')
      }
      actions.setSubmitting(false)
    }, 1000)
  }

  // Improved handleBackToLogin function
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

  // Updated onResetPasswordSubmit function to match backend API
  const onResetPasswordSubmit = async (
    _values: { password: string; confirmPassword: string },
    actions: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    setTimeout(() => {
      toast.success('Password reset successfully!')
      handleBackToLogin()
      actions.setSubmitting(false)
    }, 1000)
  }

  const handleresendOtp = () => {
    const emailToSend = forgotPasswordEmail || userEmail
    if (!emailToSend) {
      toast.error('No email found to resend OTP. Please enter your email.')
      return
    }
    toast.success('OTP resent successfully!')
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
    <div className="signin-container" style={{ minHeight: '300px' }}>
      <div
        className={`form-flip-wrapper flex justify-center items-center ${
          getCurrentForm() !== 'login' ? 'flipped' : ''
        }`}
      >
        {/* Login Form Side */}
        <div className="form-side login-side">
          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ isSubmitting }) => {
              return (
                <>
                  <div className="flex mb-4">
                    <img src="/mini-logo.png" className="sign-favicon" style={{ width: '60px' }} alt="logo" />
                  </div>

                  <h2 className="text-blue font-semibold capitalize">Sign In</h2>
                  <h6 className="font-semibold mb-4">Please sign in to continue.</h6>

                  <Form>
                    <div className="form-group">
                      <label>Email</label>
                      <Field className="form-control" placeholder="Enter your email" type="email" name="email" />
                      <ErrorMessage name="email" render={(msg) => <small style={{ color: 'red' }}>{msg}</small>} />
                    </div>
                    <div className="form-group pt-3">
                      <label>Password</label>
                      <Field
                        className="form-control"
                        placeholder="Enter your password"
                        type="password"
                        name="password"
                      />
                      <ErrorMessage name="password" render={(msg) => <small style={{ color: 'red' }}>{msg}</small>} />
                    </div>

                    <div className="flex justify-end mb-3">
                      <button
                        type="button"
                        className="text-sky-500 hover:underline font-semibold p-0"
                        onClick={handleForgotPasswordClick}
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <div className="flex justify-end items-center">
                      <button
                        type="submit"
                        className="btn-blue-color w-full"
                        disabled={isSubmitting === true ? true : false}
                      >
                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                      </button>
                    </div>
                  </Form>
                </>
              )
            }}
          </Formik>
        </div>

        {/* Dynamic Form Side */}
        <div className="form-side otp-side pt-4">
          {/* Login OTP Form */}
          {getCurrentForm() === 'otp' && (
            <Formik
              enableReinitialize
              initialValues={otpInitialValues}
              validationSchema={otpValidationSchema}
              onSubmit={onOtpSubmit}
            >
              {({ isSubmitting, setFieldValue, values }) => {
                console.log('OTP Form Values:', values)
                return (
                  <Form>
                    <div className="otp-header text-center mb-4">
                      <h4>Verify Your Account</h4>
                      <p className="text-muted mb-0">We&apos;ve sent a 6-digit verification code to</p>
                      <strong className="text-primary">{userEmail}</strong>
                    </div>

                    <div className="form-group">
                      <label>Enter OTP</label>
                      <div className="otp-inputs-container">
                        {otpValues.map((value, index) => (
                          <input
                            key={index}
                            ref={(el) => {
                              if (el) {
                                otpRefs.current[index] = el
                              }
                            }}
                            type="text"
                            className="otp-input-box"
                            value={value}
                            onChange={(e) => handleOtpChange(index, e.target.value, setFieldValue, false)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e, setFieldValue, false)}
                            maxLength={1}
                            autoComplete="off"
                          />
                        ))}
                      </div>
                      <Field type="hidden" name="otp" value={otpValues.join('')} />
                      <ErrorMessage name="otp" render={(msg) => <small style={{ color: 'red' }}>{msg}</small>} />
                      <div className="text-center mt-3">
                        <small className="text-muted me-2">Didn&apos;t receive the email?</small>
                        <button
                          type="button"
                          className="btn btn-link p-0 align-baseline text-primary fw-semibold"
                          onClick={handleresendOtp}
                        >
                          Resend Email
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-column gap-2 my-4">
                      <button
                        type="submit"
                        className="btn-blue-color w-100"
                        disabled={isSubmitting === true ? true : false}
                      >
                        {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                      </button>

                      <button type="button" className="btn btn-outline-secondary w-100" onClick={handleBackToLogin}>
                        ← Back to Login
                      </button>
                    </div>
                  </Form>
                )
              }}
            </Formik>
          )}

          {/* Forgot Password Email Form */}
          {getCurrentForm() === 'forgot-password' && (
            <Formik
              enableReinitialize
              initialValues={forgotPasswordInitialValues}
              validationSchema={forgotPasswordValidationSchema}
              onSubmit={onForgotPasswordSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="text-center mb-4">
                    <h4>Forgot Password</h4>
                    <p className="text-muted">
                      Enter your email address and we&apos;ll send you an OTP to reset your password.
                    </p>
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <Field className="form-control" placeholder="Enter your email" type="email" name="email" />
                    <ErrorMessage name="email" render={(msg) => <small style={{ color: 'red' }}>{msg}</small>} />
                  </div>

                  <div className="flex flex-column gap-2 my-4">
                    <button
                      type="submit"
                      className="btn-blue-color w-100"
                      disabled={isSubmitting === true ? true : false}
                    >
                      {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary w-100" onClick={handleBackToLogin}>
                      ← Back to Login
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}

          {/* Forgot Password OTP Form */}
          {getCurrentForm() === 'forgot-otp' && (
            <Formik
              enableReinitialize
              initialValues={forgotOtpInitialValues}
              validationSchema={otpValidationSchema}
              onSubmit={onForgotOtpSubmit}
            >
              {({ isSubmitting, setFieldValue }) => (
                <Form>
                  <div className="otp-header text-center mb-4">
                    <h4>Verify OTP</h4>
                    <p className="text-muted mb-0">We&apos;ve sent a 6-digit verification code to</p>
                    <strong className="text-primary">{forgotPasswordEmail}</strong>
                  </div>

                  <div className="form-group">
                    <label>Enter OTP</label>
                    <div className="otp-inputs-container">
                      {forgotOtpValues.map((value, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            if (el) {
                              forgotOtpRefs.current[index] = el
                            }
                          }}
                          type="text"
                          className="otp-input-box"
                          value={value}
                          onChange={(e) => handleOtpChange(index, e.target.value, setFieldValue, true)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e, setFieldValue, true)}
                          maxLength={1}
                          autoComplete="off"
                        />
                      ))}
                    </div>
                    <Field type="hidden" name="otp" value={forgotOtpValues.join('')} />
                    <ErrorMessage name="otp" render={(msg) => <small style={{ color: 'red' }}>{msg}</small>} />
                    <div className="text-center mt-3">
                      <small className="text-muted me-2">Didn&apos;t receive the email?</small>
                      <button
                        type="button"
                        className="btn btn-link p-0 align-baseline text-primary fw-semibold"
                        onClick={handleresendOtp}
                      >
                        Resend Email
                      </button>
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-2 my-4">
                    <button
                      type="submit"
                      className="btn-blue-color w-100"
                      disabled={isSubmitting === true ? true : false}
                    >
                      {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary w-100" onClick={handleBackToLogin}>
                      ← Back to Login
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}

          {/* Reset Password Form */}
          {getCurrentForm() === 'reset-password' && (
            <Formik
              enableReinitialize
              initialValues={resetPasswordInitialValues}
              validationSchema={resetPasswordValidationSchema}
              onSubmit={onResetPasswordSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="text-center mb-4">
                    <h4>Reset Password</h4>
                    <p className="text-muted">Enter your new password below.</p>
                  </div>

                  <div className="form-group">
                    <label>New Password</label>
                    <Field className="form-control" placeholder="Enter new password" type="password" name="password" />
                    <ErrorMessage name="password" render={(msg) => <small style={{ color: 'red' }}>{msg}</small>} />
                  </div>

                  <div className="form-group pt-3">
                    <label>Confirm Password</label>
                    <Field
                      className="form-control"
                      placeholder="Confirm new password"
                      type="password"
                      name="confirmPassword"
                    />
                    <ErrorMessage
                      name="confirmPassword"
                      render={(msg) => <small style={{ color: 'red' }}>{msg}</small>}
                    />
                  </div>

                  <div className="d-flex flex-column gap-2 my-4">
                    <button
                      type="submit"
                      className="btn-blue-color w-100"
                      disabled={isSubmitting === true ? true : false}
                    >
                      {isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary w-100" onClick={handleBackToLogin}>
                      ← Back to Login
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </div>
  )
}

export default SignIn
