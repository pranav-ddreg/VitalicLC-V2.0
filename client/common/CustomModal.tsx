'use client'

import React from 'react'

interface CustomModalProps {
  show: boolean
  setShow: (show: boolean) => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullscreen?: boolean
  content?: React.ReactNode | string
  title?: string
  showSaveBtn?: boolean
  showResetBtn?: boolean
  onSave?: () => void
  onReset?: () => void
  saveBtnText?: string
  resetBtnText?: string
  isSubmitting?: boolean
  children?: React.ReactNode
}

const CustomModal: React.FC<CustomModalProps> = ({
  show,
  setShow,
  size = 'lg',
  fullscreen = false,
  content = '',
  title = '',
  showSaveBtn = false,
  showResetBtn = false,
  onSave,
  onReset,
  saveBtnText = 'Save',
  resetBtnText = 'Reset',
  isSubmitting = false,
  children,
}) => {
  if (!show) return null

  // Modal size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50`} role="dialog" aria-modal="true">
      <div
        className={`bg-white rounded-lg shadow-lg w-full mx-4 ${
          fullscreen ? 'h-full max-w-none' : sizeClasses[size]
        } overflow-hidden`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="flex items-center gap-2">
            {showResetBtn && (
              <button
                type="button"
                onClick={onReset}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-medium disabled:opacity-50"
              >
                {resetBtnText}
              </button>
            )}
            {showSaveBtn && (
              <button
                type="button"
                onClick={onSave}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-medium disabled:opacity-50"
              >
                {saveBtnText}
              </button>
            )}
            <button
              type="button"
              onClick={() => setShow(false)}
              className="text-gray-500 hover:text-gray-700 font-bold text-lg"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4">{children || content}</div>
      </div>
    </div>
  )
}

export default CustomModal
