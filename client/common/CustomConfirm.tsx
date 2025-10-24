'use client'

import React from 'react'
import { BsXLg } from 'react-icons/bs'

type ButtonVariant = 'primary' | 'secondary' | 'danger'
type ButtonSize = 'sm' | 'md'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', className = '', ...props }) => {
  const base = 'rounded font-medium focus:outline-none transition-colors'
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  }
  const sizes: Record<ButtonSize, string> = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
  }
  return <button {...props} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} />
}

interface CustomConfirmProps {
  show: boolean
  setShow: (show: boolean) => void
  content?: string
  title?: string
  confirmButtonText?: string
  onConfirm?: () => void
  disableConfirm?: boolean
}

const CustomConfirm: React.FC<CustomConfirmProps> = ({
  show,
  setShow,
  content = "You won't be able to revert this!",
  title = 'Are you sure!',
  confirmButtonText = 'Confirm',
  onConfirm,
  disableConfirm,
}) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 relative animate-fadeIn">
        {/* Close button */}
        <div className="flex justify-end items-center cursor-pointer">
          <span
            onClick={() => setShow(false)}
            className="text-gray-500 hover:text-gray-700"
            role="button"
            aria-label="Close"
          >
            <BsXLg size={20} />
          </span>
        </div>

        {/* Title */}
        <div className="text-xl font-semibold text-center mt-2">{title}</div>

        {/* Content */}
        <div className="text-base text-center my-3">{content}</div>

        {/* Buttons */}
        <div className="flex justify-end items-center gap-2 pt-4">
          <Button variant="danger" onClick={onConfirm} disabled={disableConfirm}>
            {confirmButtonText}
          </Button>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CustomConfirm
