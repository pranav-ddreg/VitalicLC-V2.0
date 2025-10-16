'use client'

import './globals.css'
import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
// import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// export const metadata: Metadata = {
//   title: 'VitalicLC - Sign In',
//   description: 'Sign in to your VitalicLC account',
// }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<boolean>(true)

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-white shadow">
          <Header open={open} setOpen={setOpen} />
        </div>

        {/* Main Layout */}
        <div className="flex h-[calc(100vh-56px)]">
          {/* Sidebar: fixed inside flex layout */}
          {open && (
            <div className="w-64 h-full flex-shrink-0">
              <Sidebar open={open} />
            </div>
          )}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          {/* Main content scrolls independently */}
          <main className="flex-1 overflow-y-auto bg-white p-6">{children}</main>
        </div>
      </body>
    </html>
  )
}
