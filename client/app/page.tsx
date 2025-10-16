'use client'

import React from 'react'
import SignIn from '../components/SignIn'
import Link from 'next/link'

export default function Login() {
  return (
    <div className="relative flex landingPage-gradient justify-center items-center w-full" style={{ height: '100vh' }}>
      <div className="bg-white rounded-lg shadow-lg" style={{ width: '24rem', padding: '2rem' }}>
        <div>
          <div>
            <SignIn />
          </div>
          <p style={{ fontSize: '12px' }} className="mb-0 mt-4 text-center">
            By clicking Continue, you agree to DDReg Pharma&apos;s{' '}
            <Link className="font-medium text-sky-500 hover:underline" href="/legal/privacy-policy">
              Privacy Policy
            </Link>
            {', '}
            <Link className="font-medium text-sky-500 hover:underline" href="/legal/cookie-policy">
              Cookie Policy
            </Link>{' '}
            and{' '}
            <Link className="font-medium text-sky-500 hover:underline" href="/legal/terms">
              Terms & Conditions
            </Link>
            .
          </p>
        </div>
      </div>
      <p style={{ fontSize: '12px' }} className="absolute bottom-0 text-white text-center w-full mt-6 mb-2">
        &copy;{new Date().getFullYear()} DDReg Pharma | All rights reserved
      </p>
    </div>
  )
}
