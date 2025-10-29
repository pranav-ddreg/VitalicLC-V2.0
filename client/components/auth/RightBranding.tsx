'use client'

import React from 'react'

const RightBranding: React.FC = () => (
  <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex-col items-center justify-center px-12 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-700 rounded-full blur-3xl opacity-20"></div>
    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-10"></div>

    <div className="relative z-10 text-center">
      <div className="mb-8 flex justify-center">
        <div className="w-20 h-20  rounded-2xl flex items-center justify-center">
          <img src="/mini-logo.png" className="w-12 h-12 object-contain" alt="logo" />
        </div>
      </div>
      <h2 className="text-4xl font-bold text-white mb-3">DDReg Pharma</h2>
      <p className="text-blue-200 text-lg">Regulatory Management System</p>
      <p className="text-blue-300 text-sm mt-4 max-w-sm">
        Streamline your pharmaceutical regulatory processes with our comprehensive platform
      </p>
    </div>
  </div>
)

export default RightBranding
