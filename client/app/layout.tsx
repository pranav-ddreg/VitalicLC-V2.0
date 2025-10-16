'use client'

import './globals.css'
import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<boolean>(true)

  return (
    <html lang="en">
      <body className="h-screen overflow-hidden">
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

          {/* Main content scrolls independently */}
          <main className="flex-1 overflow-y-auto bg-white p-6">{children}</main>
        </div>
      </body>
    </html>
  )
}
