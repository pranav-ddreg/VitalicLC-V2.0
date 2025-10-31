'use client'

import './globals.css'
import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider, useTheme } from 'next-themes'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

function ToasterWithTheme() {
  const { resolvedTheme } = useTheme()
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style:
          resolvedTheme === 'dark'
            ? { background: '#363636', color: '#fff' }
            : { background: '#fff', color: '#363636' },
      }}
    />
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState<boolean>(true)

  // Hide layout (Header + Sidebar) for login page "/"
  const isLoginPage = pathname === '/'

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <ToasterWithTheme />

          {/* Show normal layout everywhere except "/" */}
          {isLoginPage ? (
            <main className="bg-white dark:bg-slate-800">{children}</main>
          ) : (
            <>
              {/* Header */}
              <div className="sticky top-0 z-50 bg-white shadow">
                <Header open={open} setOpen={setOpen} />
              </div>

              {/* Main layout with Sidebar + Content */}
              <div className="flex h-[calc(100vh-56px)]">
                {open && (
                  <div className="w-64 h-full shrink-0">
                    <Sidebar open={open} />
                  </div>
                )}
                <main className="flex-1 overflow-y-auto bg-white p-6">{children}</main>
              </div>
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  )
}
