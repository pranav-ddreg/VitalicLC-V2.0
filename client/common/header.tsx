'use client'

import React, { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title: string
  description?: string
  btn?: boolean
  btnText?: string
  btnOnClick?: () => void
  btnColor?: string
  btnIcon?: LucideIcon
  children?: ReactNode
  className?: string
}

const Header: React.FC<HeaderProps> = ({
  title,
  description,
  btn = false,
  btnText = 'Add New',
  btnOnClick,
  btnColor,
  btnIcon: Icon = Plus,
  children,
  className,
}) => {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div>
        <h2 className="text-lg md:text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-xs md:text-base">{description}</p>}
      </div>
      {children ? (
        children
      ) : btn ? (
        <Button
          onClick={btnOnClick}
          className={cn(
            'mt-0 cursor-pointer',
            btnColor || 'bg-sky-800  hover:bg-sky-800/90 dark:bg-sky-700 dark:hover:bg-sky-700/90 dark:text-white'
          )}
        >
          <Icon className="mr-1 h-8 w-8" />
          {btnText}
        </Button>
      ) : null}
    </div>
  )
}

export default Header
