'use client'

import React, { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title: string
  description?: string
  btn?: boolean
  btnText?: string
  btnOnClick?: () => void
  children?: ReactNode
  className?: string
}

const Header: React.FC<HeaderProps> = ({
  title,
  description,
  btn = false,
  btnText = 'Add New',
  btnOnClick,
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
          className="bg-sky-800 hover:bg-sky-800/90 dark:bg-sky-700 dark:hover:bg-sky-700/90 dark:text-white mt-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          {btnText}
        </Button>
      ) : null}
    </div>
  )
}

export default Header
