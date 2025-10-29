'use client'

import React from 'react'
import SignIn from '../components/SignIn'
import Link from 'next/link'

export default function Login() {
  return (
    <div className="relative flex justify-center items-center w-full " style={{ minHeight: '100vh' }}>
      <div className="bg-white rounded-xl shadow-xl border border-blue-100 w-full">
        <div>
          <div>
            <SignIn />
          </div>
        </div>
      </div>
    </div>
  )
}
